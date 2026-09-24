"""Convert MODIS MOD13Q1 HDF4 NDVI layers to compact globe JSON files.

Points are resampled onto a fixed lat/lon degree grid (see --cell-degrees)
rather than fixed-size pixel blocks. The sinusoidal MODIS grid has pixels at
a constant *physical* spacing, which — once converted to degrees of
longitude — grows with 1 / cos(latitude). Binning by pixel blocks therefore
spaced output points farther apart in longitude at high latitude than near
the equator, so at fine zoom levels some grid cells never received a point,
showing up as periodic vertical gaps. Binning directly onto the target
degree grid guarantees a point for every cell that contains at least one
valid MODIS pixel, at any latitude.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import date, timedelta
from pathlib import Path

import numpy as np
from pyhdf.SD import SD, SDC

HDF_PATTERN = re.compile(r'MOD13Q1\.A(?P<year>\d{4})(?P<doy>\d{3})\.h(?P<h>\d{2})v(?P<v>\d{2})\.')
RADIUS = 6371007.181
TILE_SIZE = 1111950.5196666666
PIXELS_PER_TILE = 4800
NDVI_DATASET = '250m 16 days NDVI'

# Matches the finest level in modisNdvi.tsx's CELL_DEG table (level 8,
# ~5 km cells). Points land on the centre of this grid, so the app's own
# runtime binning (which floors lat/lon at whatever level is on screen)
# reproduces the same cells exactly, with no latitude-dependent gaps.
DEFAULT_CELL_DEGREES = 0.045


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=Path('data/raw/modis'))
    parser.add_argument('--output', type=Path, default=Path('data/processed/modis'))
    parser.add_argument(
        '--cell-degrees',
        type=float,
        default=DEFAULT_CELL_DEGREES,
        help=(
            'Size (in degrees) of the lat/lon grid points are resampled onto. '
            'Should match the finest CELL_DEG level used by the globe renderer '
            f'(default {DEFAULT_CELL_DEGREES}).'
        ),
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=os.cpu_count() or 1,
        help=(
            'Number of HDF files to convert in parallel (separate processes; '
            'HDF4/pyhdf is not thread-safe). Each worker holds one tile in '
            'memory (roughly a few hundred MB) — lower this if you hit memory '
            f'pressure. Default: all detected cores ({os.cpu_count() or 1}).'
        ),
    )
    return parser.parse_args()


def metadata(path: Path) -> tuple[str, str, int, int]:
    match = HDF_PATTERN.search(path.name)
    if not match:
        raise ValueError(f'Unexpected MODIS filename: {path.name}')
    year = int(match.group('year'))
    acquisition = date(year, 1, 1) + timedelta(days=int(match.group('doy')) - 1)
    return (
        acquisition.isoformat(),
        f"h{match.group('h')}v{match.group('v')}",
        int(match.group('h')),
        int(match.group('v')),
    )


def pixel_coordinates(
    row: np.ndarray,
    column: np.ndarray,
    h: int,
    v: int,
) -> tuple[np.ndarray, np.ndarray]:
    """Lat/lon (degrees) for arbitrary-shaped row/column pixel arrays."""
    pixel_size = TILE_SIZE / PIXELS_PER_TILE
    x = -20015109.354 + h * TILE_SIZE + (column + 0.5) * pixel_size
    y = 10007554.677 - v * TILE_SIZE - (row + 0.5) * pixel_size
    latitude = np.degrees(y / RADIUS)
    longitude = np.degrees(
        x / (RADIUS * np.cos(np.radians(latitude)))
    )
    return latitude, longitude


def bin_onto_degree_grid(
    lat: np.ndarray,
    lon: np.ndarray,
    values: np.ndarray,
    cell_degrees: float,
) -> list[list[float]]:
    """Average `values` into cells of a regular lat/lon grid.

    Returns one [lat_centre, lon_centre, mean_value] point per grid cell that
    contains at least one input sample. Cell centres line up exactly with
    `makeCell()` in grid.ts (lat0 + deg/2, lon0 + deg/2), so re-binning the
    same points at runtime floors back into the same cell they came from.
    """
    if lat.size == 0:
        return []

    n_rows_grid = round(180 / cell_degrees)
    n_cols_grid = round(360 / cell_degrees)
    row_bin = np.clip(
        np.floor((lat + 90) / cell_degrees).astype(np.int64), 0, n_rows_grid - 1
    )
    col_bin = np.clip(
        np.floor((lon + 180) / cell_degrees).astype(np.int64), 0, n_cols_grid - 1
    )

    # Work in a local (tile-sized) index space rather than the full global
    # grid, so bincount() doesn't have to allocate an array sized for the
    # whole planet just to hold one ~10x10 degree tile's worth of bins.
    row_min = int(row_bin.min())
    col_min = int(col_bin.min())
    local_row = row_bin - row_min
    local_col = col_bin - col_min
    local_width = int(local_col.max()) + 1
    local_id = local_row * local_width + local_col

    sums = np.bincount(local_id, weights=values)
    counts = np.bincount(local_id)
    occupied = np.nonzero(counts)[0]

    out_row = occupied // local_width + row_min
    out_col = occupied % local_width + col_min
    means = sums[occupied] / counts[occupied]

    lat_centre = -90 + (out_row + 0.5) * cell_degrees
    lon_centre = -180 + (out_col + 0.5) * cell_degrees

    return [
        [round(float(la), 5), round(float(lo), 5), round(float(val), 5)]
        for la, lo, val in zip(lat_centre, lon_centre, means)
    ]


def convert_one(path: Path, output: Path, cell_degrees: float) -> bool:
    """Convert a single HDF granule. Runs in its own process when --workers > 1,
    so it must not depend on any state from main() other than its arguments."""
    target = output / f'{path.stem}.json'

    try:
        acquisition, tile, h, v = metadata(path)
        source = SD(str(path), SDC.READ).select(NDVI_DATASET)
        raw = np.asarray(source.get(), dtype=np.float32)
        attributes = source.attributes()
    except Exception as exc:  # a corrupt/partial download, or a bad filename, shouldn't kill the batch
        print(f'{path.name}: FAILED to read HDF ({exc}) -> skipping')
        return False

    fill = attributes.get('_FillValue', -3000)
    scale = float(attributes.get('scale_factor', 10000.0))

    height, width = raw.shape

    valid = (raw != fill) & (raw >= -10000) & (raw <= 10000)
    rows, cols = np.nonzero(valid)
    values = raw[valid].astype(np.float64) / scale

    latitude, longitude = pixel_coordinates(
        rows.astype(np.float64),
        cols.astype(np.float64),
        h,
        v,
    )

    points = bin_onto_degree_grid(latitude, longitude, values, cell_degrees)

    target.write_text(
        json.dumps(
            {
                'format': 'modis-ndvi-v2',
                'source': 'MOD13Q1 Collection 6.1',
                'tile': tile,
                'acquisition': acquisition,
                'sourcePixels': [height, width],
                'cellDegrees': cell_degrees,
                'points': points,
            },
            separators=(',', ':'),
        ),
        encoding='utf-8',
    )

    print(f'{path.name}: {len(points)} points -> {target}')
    return True


def main() -> None:
    args = parse_args()

    if args.cell_degrees <= 0:
        raise SystemExit('--cell-degrees must be positive')
    if args.workers < 1:
        raise SystemExit('--workers must be at least 1')

    files = sorted(args.input.glob('MOD13Q1*.hdf'))

    if not files:
        raise SystemExit(f'No MOD13Q1 HDF files found in {args.input}')

    args.output.mkdir(parents=True, exist_ok=True)

    # Cheap check, done up front in the main process: no point spinning up a
    # worker just to have it immediately discover the target already exists.
    to_convert = []
    skipped = 0
    for path in files:
        if (args.output / f'{path.stem}.json').exists():
            print(f'{path.name}: already converted -> skipping')
            skipped += 1
        else:
            to_convert.append(path)

    converted = 0
    failed = 0

    if args.workers == 1 or len(to_convert) <= 1:
        for path in to_convert:
            if convert_one(path, args.output, args.cell_degrees):
                converted += 1
            else:
                failed += 1
    else:
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = {
                executor.submit(convert_one, path, args.output, args.cell_degrees): path
                for path in to_convert
            }
            for future in as_completed(futures):
                path = futures[future]
                try:
                    if future.result():
                        converted += 1
                    else:
                        failed += 1
                except Exception as exc:
                    failed += 1
                    print(f'{path.name}: FAILED ({exc})')

    manifest = {
        'format': 'modis-ndvi-v1',
        'files': sorted(
            path.name
            for path in args.output.glob('MOD13Q1*.json')
        ),
    }

    (args.output / 'index.json').write_text(
        json.dumps(manifest, separators=(',', ':')),
        encoding='utf-8',
    )

    print(
        f'Finished: {converted} converted, '
        f'{skipped} skipped, '
        f'{failed} failed, '
        f'{len(manifest["files"])} tile(s) in manifest '
        f'-> {args.output / "index.json"}'
    )


if __name__ == '__main__':
    main()