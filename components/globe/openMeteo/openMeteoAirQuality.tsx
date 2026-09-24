import React from 'react';
import type { Cell } from './grid';
import type { ClassDef, FetchBatch, GlobeDataset, Head, Sample } from './types';

const ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const CELL_DEG = [20, 10, 5, 2.5, 1, 0.5];
const BATCH = 100; // coordinates per request
const CONCURRENCY = 2;
const TTL_MS = 60 * 60 * 1000;
const CACHE_KEY = 'openmeteo-aq:v2';
const MAX_CACHE_ENTRIES = 6000;

// European Air Quality Index bands (EEA, 2024) - hourly concentrations, µg/m³
const BANDS: Omit<ClassDef, 'note'>[] = [
  { id: 'good', label: 'Good', color: '#50f0e6' },
  { id: 'fair', label: 'Fair', color: '#50ccaa' },
  { id: 'moderate', label: 'Moderate', color: '#f0e641' },
  { id: 'poor', label: 'Poor', color: '#ff5050' },
  { id: 'very-poor', label: 'Very poor', color: '#960032' },
  { id: 'extreme', label: 'Extremely poor', color: '#7d2181' },
];
const PM25_EDGES = [5, 15, 50, 90, 140, Infinity];
const PM10_EDGES = [15, 45, 120, 195, 270, Infinity];

function classesFor(edges: number[]): ClassDef[] {
  return BANDS.map((b, i) => ({
    ...b,
    note:
      i === 0
        ? `< ${edges[0]}`
        : i === edges.length - 1
          ? `> ${edges[i - 1]}`
          : `${edges[i - 1]}–${edges[i]}`,
  }));
}

function makeHead(
  id: string,
  label: string,
  channel: number,
  edges: number[],
  description: string,
): Head {
  return {
    id,
    label,
    scope: 'current',
    badge: 'µg/m³',
    description,
    classes: classesFor(edges),
    classOf: (s) => {
      const v = s[channel];
      if (!Number.isFinite(v)) return -1;
      return edges.findIndex((e) => v < e);
    },
  };
}

// ---- tiny localStorage cache (per cell, 1h) -------------------------------
type CacheEntry = { t: number; s: (number | null)[] };
type Cache = Record<string, CacheEntry>;

function loadCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as Cache;
  } catch {
    return {};
  }
}
function saveCache(c: Cache) {
  try {
    let keys = Object.keys(c);
    if (keys.length > MAX_CACHE_ENTRIES) {
      keys = keys
        .sort((a, b) => c[a].t - c[b].t)
        .slice(0, keys.length - MAX_CACHE_ENTRIES / 2);
      keys.forEach((k) => delete c[k]);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* storage full or unavailable: ignore */
  }
}

// ---- network ---------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchChunk(
  cells: Cell[],
  signal: AbortSignal,
  timeOffsetHours: number,
): Promise<{ samples: Sample[]; bytes: number }> {
  const lat = cells.map((c) => c.lat.toFixed(2)).join(',');
  const lon = cells.map((c) => c.lon.toFixed(2)).join(',');
  const target = new Date(Date.now() + timeOffsetHours * 60 * 60 * 1000);
  target.setUTCMinutes(0, 0, 0);
  const targetKey = target.toISOString().slice(0, 13) + ':00';
  const url = `${ENDPOINT}?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10&past_days=2&forecast_days=1`;

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { signal });
    if (res.status === 429) {
      throw new Error(
        'Open-Meteo rate limit reached; existing cached data was kept.',
      );
    }
    if (res.status >= 500) {
      await sleep(800 * 2 ** attempt);
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      continue;
    }
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const text = await res.text();
    const json = JSON.parse(text);
    const arr: any[] = Array.isArray(json) ? json : [json];
    const samples = cells.map((_, i) => {
      const hourly = arr[i]?.hourly;
      const times: string[] = hourly?.time ?? [];
      let timeIndex = times.findIndex((time) => time === targetKey);
      if (timeIndex < 0) {
        timeIndex = times.reduce(
          (best, time, index) =>
            Math.abs(Date.parse(time) - target.getTime()) <
            Math.abs(Date.parse(times[best] ?? time) - target.getTime())
              ? index
              : best,
          0,
        );
      }
      const a = hourly?.pm2_5?.[timeIndex];
      const b = hourly?.pm10?.[timeIndex];
      return [typeof a === 'number' ? a : NaN, typeof b === 'number' ? b : NaN];
    });
    return { samples, bytes: text.length };
  }
  throw new Error('Open-Meteo is rate-limiting requests, try again shortly');
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

export const openMeteoAirQuality: GlobeDataset = {
  id: 'openmeteo-aq',
  title: 'Air Quality',
  description:
    'Current PM2.5 and PM10 concentrations near the ground, from the Copernicus atmospheric composition forecast. ' +
    'Sampled on a grid and coloured by European air quality bands. Zoom in for finer cells.',
  footnote: 'Live · modelled, not sensor readings',
  classesLabel: 'Bands',
  attribution: (
    <>
      Data by{' '}
      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
      >
        Open-Meteo.com
      </a>{' '}
      (CC BY 4.0), based on CAMS{' '}
      <a
        href="https://atmosphere.copernicus.eu/"
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
      >
        Copernicus Atmosphere Monitoring Service
      </a>{' '}
      forecasts.
    </>
  ),

  heads: [
    makeHead(
      'pm25',
      'PM2.5',
      0,
      PM25_EDGES,
      'Fine particles under 2.5 µm, 10 m above ground. Bands follow the European Environment Agency index.',
    ),
    makeHead(
      'pm10',
      'PM10',
      1,
      PM10_EDGES,
      'Particles under 10 µm, 10 m above ground. Bands follow the European Environment Agency index.',
    ),
  ],
  defaultHeadId: 'pm25',

  cellDegrees: CELL_DEG,
  baseLevel: 0,
  levelForZoom: (z) => (z < 1.6 ? 1 : z < 3.5 ? 2 : z < 6 ? 3 : z < 12 ? 4 : 5),
  describeLevel: (level) => {
    const d = CELL_DEG[level];
    return {
      title: `Grid level ${level}`,
      subtitle: `≈${Math.round(d * 111)} km cells · now`,
    };
  },

  timeOptions: [
    { id: 'now', label: 'Now', offsetHours: 0 },
    { id: '6h', label: '6 hours ago', offsetHours: -6 },
    { id: '12h', label: '12 hours ago', offsetHours: -12 },
    { id: '24h', label: 'Yesterday', offsetHours: -24 },
    { id: '48h', label: '2 days ago', offsetHours: -48 },
  ],
  defaultTimeId: 'now',

  async fetchCells(level, cells, signal, onBatch, options) {
    if (!cells.length) return;
    const timeOffsetHours = options?.timeOffsetHours ?? 0;
    const cache = loadCache();
    const cachePrefix = `${CACHE_KEY}:${timeOffsetHours}:`;
    const now = Date.now();
    const hits = new Map<string, Sample>();
    const miss: Cell[] = [];
    for (const c of cells) {
      const e = cache[`${cachePrefix}${c.id}`];
      if (e && now - e.t < TTL_MS)
        hits.set(
          c.id,
          e.s.map((v) => (v == null ? NaN : v)),
        );
      else miss.push(c);
    }
    if (hits.size) onBatch({ samples: hits, bytes: 0, requests: 0 });

    const chunks: Cell[][] = [];
    for (let i = 0; i < miss.length; i += BATCH)
      chunks.push(miss.slice(i, i + BATCH));

    try {
      await pool(chunks, CONCURRENCY, async (chunk) => {
        const { samples, bytes } = await fetchChunk(
          chunk,
          signal,
          timeOffsetHours,
        );
        const out = new Map<string, Sample>();
        chunk.forEach((c, i) => {
          out.set(c.id, samples[i]);
          cache[`${cachePrefix}${c.id}`] = {
            t: now,
            s: samples[i].map((v) => (Number.isFinite(v) ? v : null)),
          };
        });
        const batch: FetchBatch = { samples: out, bytes, requests: 1 };
        onBatch(batch);
      });
    } finally {
      saveCache(cache);
    }
  },
  // no `embedding`: the embedding panel is hidden for this dataset
};
