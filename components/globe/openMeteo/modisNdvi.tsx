import React from 'react';
import type { Cell } from './grid';
import type { ClassDef, FetchBatch, GlobeDataset, Head, Sample } from './types';

type Manifest = { files: string[]; acquisition?: string };
type NdviPoint = [lat: number, lon: number, value: number];

const CELL_DEG = [20, 10, 5, 2.5, 1, 0.5, 0.25, 0.1, 0.045];
const NDVI_BANDS: ClassDef[] = [
  { id: 'bare', label: 'Bare / water', color: '#c8b89a', note: '< 0.1' },
  {
    id: 'sparse',
    label: 'Sparse vegetation',
    color: '#d8c94d',
    note: '0.1–0.3',
  },
  {
    id: 'moderate',
    label: 'Moderate vegetation',
    color: '#86b84f',
    note: '0.3–0.6',
  },
  { id: 'dense', label: 'Dense vegetation', color: '#26734d', note: '≥ 0.6' },
];

const NDVI_HEAD: Head = {
  id: 'ndvi',
  label: 'NDVI',
  scope: '16-day composite',
  badge: 'index',
  description:
    'MODIS Terra vegetation index. Values are scaled to the [-1, 1] NDVI range; empty areas have no valid vegetation observation.',
  classes: NDVI_BANDS,
  classOf: ([value]) =>
    value < 0.1 ? 0 : value < 0.3 ? 1 : value < 0.6 ? 2 : 3,
};

// MODIS sinusoidal tiles are ~10° x 10° at these latitudes; used as an
// approximate lat/lon bounding box for spatial filtering (not exact at the
// poles, but plenty good for deciding which tiles to fetch).
const TILE_SPAN = 10;
// Cap how many tile requests are in flight at once so a big pan/zoom doesn't
// fire dozens of parallel fetches and stall the network + main thread.
const TILE_CONCURRENCY = 6;

type ManifestTile = { file: string; lat: number; lon: number };
let manifestPromise: Promise<ManifestTile[]> | undefined;

async function loadManifest(signal: AbortSignal): Promise<ManifestTile[]> {
  if (!manifestPromise) {
    manifestPromise = fetch('/data/modis/index.json', { signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`MODIS manifest responded ${response.status}`);
        return response.json() as Promise<Manifest>;
      })
      .then((manifest) =>
        manifest.files.map((file) => {
          const match = file.match(/\.h(\d{2})v(\d{2})\./);
          if (!match) return { file, lat: 0, lon: 0 };
          const h = Number(match[1]);
          const v = Number(match[2]);
          return { file, lat: 75 - v * 10, lon: -175 + h * 10 };
        }),
      )
      .catch((error) => {
        manifestPromise = undefined; // allow retry on next call
        throw error;
      });
  }
  return manifestPromise;
}

// --- Tile fetch cache: a tile is downloaded at most once, ever, then reused
// forever (no per-view AbortSignal on the fetch itself, so a superseded view
// doesn't cancel work that a later view would have wanted anyway). ---
const tileCache = new Map<string, Promise<NdviPoint[]>>();

function fetchTile(file: string): Promise<NdviPoint[]> {
  let cached = tileCache.get(file);
  if (cached) return cached;
  cached = fetch(`/data/modis/${file}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`MODIS tile responded ${response.status}`);
      return response.json() as Promise<{ points: NdviPoint[] }>;
    })
    .then((doc) => doc.points)
    .catch((error) => {
      tileCache.delete(file); // don't poison the cache; allow retry later
      throw error;
    });
  tileCache.set(file, cached);
  return cached;
}

// --- Bin cache: once a tile's points have been aggregated into cells for a
// given grid level, keep the full result (not just the cells a particular
// view needed) so revisiting that area later — or zooming back to the same
// level — is free. ---
const binCache = new Map<string, Map<string, Sample>>(); // key: `${level}:${file}`

function binTile(
  file: string,
  points: NdviPoint[],
  level: number,
  degrees: number,
): Map<string, Sample> {
  const key = `${level}:${file}`;
  const cached = binCache.get(key);
  if (cached) return cached;
  const sums = new Map<string, [number, number]>();
  for (const [lat, lon, value] of points) {
    const row = Math.floor((lat + 90) / degrees);
    const column = Math.floor((lon + 180) / degrees);
    const id = `${level}:${row}:${column}`;
    const entry = sums.get(id);
    if (entry) {
      entry[0] += value;
      entry[1] += 1;
    } else {
      sums.set(id, [value, 1]);
    }
  }
  const binned = new Map<string, Sample>(
    Array.from(sums, ([id, [sum, count]]) => [id, [sum / count]]),
  );
  binCache.set(key, binned);
  return binned;
}

function normalizeLonDiff(a: number, b: number): number {
  return ((((a - b + 180) % 360) + 360) % 360) - 180;
}

/**
 * Tiles overlapping `cells`, nearest-first. `cells` arrives already sorted by
 * distance to the view centre (see `visibleCells`), so using it as the
 * reference point means the tiles most likely to be on screen right now are
 * requested — and therefore render — first.
 */
function tilesForCells(
  manifest: ManifestTile[],
  cells: Cell[],
): ManifestTile[] {
  if (!cells.length) return [];
  const minLat = Math.min(...cells.map((cell) => cell.lat0)) - TILE_SPAN;
  const maxLat = Math.max(...cells.map((cell) => cell.lat1)) + TILE_SPAN;
  const ref = cells[0].lon;
  let minD = 0;
  let maxD = 0;
  for (const cell of cells) {
    const d = normalizeLonDiff(cell.lon, ref);
    if (d < minD) minD = d;
    if (d > maxD) maxD = d;
  }
  const candidates = manifest.filter((tile) => {
    if (tile.lat + TILE_SPAN < minLat || tile.lat - TILE_SPAN > maxLat)
      return false;
    const d = normalizeLonDiff(tile.lon, ref);
    return d >= minD - TILE_SPAN && d <= maxD + TILE_SPAN;
  });
  candidates.sort(
    (a, b) =>
      Math.abs(normalizeLonDiff(a.lon, ref)) -
      Math.abs(normalizeLonDiff(b.lon, ref)),
  );
  return candidates;
}

export const modisNdvi: GlobeDataset = {
  id: 'modis-ndvi',
  category: 'Vegetation',
  title: 'NDVI',
  description:
    'MODIS Terra 16-day vegetation index, converted locally from MOD13Q1 Collection 6.1 granules.',
  footnote:
    'Snapshot du 19 décembre 2019 · pixels source 250 m · composite 16 jours',
  classesLabel: 'NDVI bands',
  heads: [NDVI_HEAD],
  defaultHeadId: 'ndvi',
  cellDegrees: CELL_DEG,
  baseLevel: 0,
  levelForZoom: (zoom) =>
    zoom < 1.6
      ? 1
      : zoom < 3.5
        ? 2
        : zoom < 6
          ? 3
          : zoom < 12
            ? 4
            : zoom < 20
              ? 5
              : zoom < 30
                ? 6
                : zoom < 36
                  ? 7
                  : 8, // 0.045° (~5 km) sits close to the source point spacing
  describeLevel: (level) => {
    const degrees = CELL_DEG[level];
    return {
      title: `Grid level ${level}`,
      subtitle: `≈${Math.round(degrees * 111)} km cells · MODIS`,
    };
  },
  attribution: (
    <>
      MODIS MOD13Q1 Collection 6.1 via{' '}
      <a
        href="https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod13q1-061"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
      >
        NASA Earthdata
      </a>
      .
    </>
  ),
  async fetchCells(level, cells, signal, onBatch) {
    if (!cells.length) return;
    const degrees = CELL_DEG[level];
    const cellIds = new Set(cells.map((cell) => cell.id));

    const manifest = await loadManifest(signal);
    if (signal.aborted) return;

    const tiles = tilesForCells(manifest, cells);
    let cursor = 0;

    const worker = async () => {
      while (cursor < tiles.length) {
        if (signal.aborted) return;
        const tile = tiles[cursor++];
        let points: NdviPoint[];
        try {
          points = await fetchTile(tile.file);
        } catch {
          continue; // one bad tile shouldn't stop the others
        }
        if (signal.aborted) return;

        const binned = binTile(tile.file, points, level, degrees);
        if (binned.size === 0) continue;

        // Only forward the cells this particular view actually asked for;
        // the full bin stays cached for next time regardless.
        const samples = new Map<string, Sample>();
        binned.forEach((sample, id) => {
          if (cellIds.has(id)) samples.set(id, sample);
        });
        if (samples.size > 0) {
          onBatch({ samples, bytes: 0, requests: 1 });
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(TILE_CONCURRENCY, tiles.length) }, worker),
    );
  },
};
