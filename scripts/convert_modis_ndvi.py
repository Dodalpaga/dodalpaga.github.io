"""Convert MODIS MOD13Q1 HDF4 NDVI layers to compact globe JSON files."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date, timedelta
from pathlib import Path

import numpy as np
from pyhdf.SD import SD, SDC

HDF_PATTERN = re.compile(r'MOD13Q1\.A(?P<year>\d{4})(?P<doy>\d{3})\.h(?P<h>\d{2})v(?P<v>\d{2})\.')
RADIUS = 6371007.181
TILE_SIZE = 1111950.5196666666
PIXELS_PER_TILE = 4800
NDVI_DATASET = '250m 16 days NDVI'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=Path('data/raw/modis'))
    parser.add_argument('--output', type=Path, default=Path('data/processed/modis'))
    parser.add_argument('--block-size', type=int, default=20)
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
    pixel_size = TILE_SIZE / PIXELS_PER_TILE
    x = -20015109.354 + h * TILE_SIZE + (column + 0.5) * pixel_size
    y = 10007554.677 - v * TILE_SIZE - (row + 0.5) * pixel_size
    latitude = np.degrees(y / RADIUS)
    longitude = np.degrees(
        x / (RADIUS * np.cos(np.radians(latitude)))
    )
    return latitude, longitude


def convert(path: Path, output: Path, block_size: int) -> bool:
    # Skip conversion if the JSON already exists.
    target = output / f'{path.stem}.json'
    if target.exists():
        print(f'{path.name}: already converted -> skipping')
        return False

    acquisition, tile, h, v = metadata(path)

    source = SD(str(path), SDC.READ).select(NDVI_DATASET)
    raw = np.asarray(source.get(), dtype=np.float32)
    attributes = source.attributes()

    fill = attributes.get('_FillValue', -3000)
    scale = float(attributes.get('scale_factor', 10000.0))

    height, width = raw.shape
    points: list[list[float]] = []

    for row_start in range(0, height, block_size):
        for column_start in range(0, width, block_size):
            block = raw[
                row_start:row_start + block_size,
                column_start:column_start + block_size,
            ]

            valid = block[
                (block != fill)
                & (block >= -10000)
                & (block <= 10000)
            ]

            if valid.size == 0:
                continue

            row = np.array([
                row_start + min(block.shape[0], block_size) / 2 - 0.5
            ])
            column = np.array([
                column_start + min(block.shape[1], block_size) / 2 - 0.5
            ])

            latitude, longitude = pixel_coordinates(
                row,
                column,
                h,
                v,
            )

            points.append([
                round(float(latitude[0]), 5),
                round(float(longitude[0]), 5),
                round(float(valid.mean() / scale), 5),
            ])

    output.mkdir(parents=True, exist_ok=True)

    target.write_text(
        json.dumps(
            {
                'format': 'modis-ndvi-v1',
                'source': 'MOD13Q1 Collection 6.1',
                'tile': tile,
                'acquisition': acquisition,
                'sourcePixels': [height, width],
                'blockSize': block_size,
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

    if args.block_size < 1:
        raise SystemExit('--block-size must be positive')

    files = sorted(args.input.glob('MOD13Q1*.hdf'))

    if not files:
        raise SystemExit(f'No MOD13Q1 HDF files found in {args.input}')

    args.output.mkdir(parents=True, exist_ok=True)

    converted = 0
    skipped = 0

    for path in files:
        if convert(path, args.output, args.block_size):
            converted += 1
        else:
            skipped += 1

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
        f'{len(manifest["files"])} tile(s) in manifest '
        f'-> {args.output / "index.json"}'
    )


if __name__ == '__main__':
    main()