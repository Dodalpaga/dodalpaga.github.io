import React from 'react';
import type { Cell } from './grid';
import type { ClassDef, FetchBatch, GlobeDataset, Head, Sample } from './types';

type Manifest = { files: string[]; acquisition?: string };
type NdviPoint = [lat: number, lon: number, value: number];

const CELL_DEG = [20, 10, 5, 2.5, 1, 0.5];
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

let pointsPromise: Promise<NdviPoint[]> | undefined;
const cellsCache = new Map<string, Map<string, Sample>>();

async function loadPoints(signal: AbortSignal): Promise<NdviPoint[]> {
  if (!pointsPromise) {
    pointsPromise = fetch('/data/modis/index.json', { signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`MODIS manifest responded ${response.status}`);
        return response.json() as Promise<Manifest>;
      })
      .then(async (manifest) => {
        const responses = await Promise.all(
          manifest.files.map((file) =>
            fetch(`/data/modis/${file}`, { signal }),
          ),
        );
        const documents = await Promise.all(
          responses.map((response) => {
            if (!response.ok)
              throw new Error(`MODIS tile responded ${response.status}`);
            return response.json() as Promise<{ points: NdviPoint[] }>;
          }),
        );
        return documents.flatMap((document) => document.points);
      });
  }
  return pointsPromise;
}

function cellsForPoints(
  points: NdviPoint[],
  level: number,
  degrees: number,
): Map<string, Sample> {
  const cacheKey = `${level}:${degrees}`;
  const cached = cellsCache.get(cacheKey);
  if (cached) return cached;
  const sums = new Map<string, [number, number]>();
  for (const [lat, lon, value] of points) {
    const row = Math.floor((lat + 90) / degrees);
    const column = Math.floor((lon + 180) / degrees);
    const id = `${level}:${row}:${column}`;
    const [sum, count] = sums.get(id) ?? [0, 0];
    sums.set(id, [sum + value, count + 1]);
  }
  const result = new Map(
    Array.from(sums, ([id, [sum, count]]) => [id, [sum / count]]),
  );
  cellsCache.set(cacheKey, result);
  return result;
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
    zoom < 1.6 ? 1 : zoom < 3.5 ? 2 : zoom < 6 ? 3 : zoom < 12 ? 4 : 5,
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
    const points = await loadPoints(signal);
    const values = cellsForPoints(points, level, CELL_DEG[level]);
    const samples = new Map<string, Sample>();
    for (const cell of cells) {
      const sample = values.get(cell.id);
      if (sample) samples.set(cell.id, sample);
    }
    onBatch({ samples, bytes: 0, requests: 0 });
  },
};
