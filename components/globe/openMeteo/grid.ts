import { makeProjector, RAD, type View } from './projection';

export type Cell = {
  id: string;
  level: number;
  lat0: number;
  lat1: number;
  lon0: number;
  lon1: number;
  lat: number;
  lon: number; // centre
};

export function makeCell(
  level: number,
  deg: number,
  row: number,
  column: number,
): Cell {
  const lat0 = -90 + row * deg;
  const lon0 = -180 + column * deg;
  return {
    id: `${level}:${row}:${column}`,
    level,
    lat0,
    lat1: lat0 + deg,
    lon0,
    lon1: lon0 + deg,
    lat: lat0 + deg / 2,
    lon: lon0 + deg / 2,
  };
}

// Grids finer than this have millions of cells (0.1° is already 1800x3600 =
// 6.48M). visibleCells() below never needs the full grid materialized — it
// only ever builds the handful of cells actually on screen — so gridCells()
// is just a convenience for callers that genuinely want an eager, complete
// grid at a coarse resolution, and refuses to build anything unreasonably
// large rather than faking one with a Proxy.
const SAFE_MAX_CELLS = 300_000;
const cache = new Map<string, Cell[]>();

/** Regular lat/lon grid of `deg`-degree cells, eagerly built. */
export function gridCells(level: number, deg: number): Cell[] {
  const key = `${level}:${deg}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = Math.round(180 / deg);
  const cols = Math.round(360 / deg);
  const total = rows * cols;
  if (total > SAFE_MAX_CELLS) {
    throw new Error(
      `gridCells: ${deg}\u00b0 cells would materialize ${total} entries, ` +
        `above the safe limit of ${SAFE_MAX_CELLS}. Use visibleCells(level, deg, view, max) ` +
        `instead, which computes only the on-screen cells without building the full grid.`,
    );
  }

  const out: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(makeCell(level, deg, r, c));
    }
  }
  cache.set(key, out);
  return out;
}

export type ViewInfo = View & { w: number; h: number };

/**
 * Cells whose centre is on screen (or just past the limb), nearest to the
 * view centre first. Builds only the candidate cells it actually needs, so
 * it stays cheap even at very fine grid levels (e.g. 0.05°) where the full
 * lat/lon grid would have tens of millions of entries.
 */
export function visibleCells(
  level: number,
  deg: number,
  v: ViewInfo,
  max: number,
): Cell[] {
  const P = makeProjector(v, v.w, v.h);
  const margin = P.R * deg * RAD * 1.2 + 8;
  const minC = -Math.sin(deg * RAD * 0.75);
  const out: { c: Cell; d: number }[] = [];
  const rows = Math.round(180 / deg);
  const cols = Math.round(360 / deg);
  const angularRadius = Math.min(
    90,
    Math.asin(Math.min(1, Math.hypot(v.w / 2, v.h / 2) / P.R)) / RAD + deg * 2,
  );
  const rowStart = Math.max(0, Math.floor((v.lat0 - angularRadius + 90) / deg));
  const rowEnd = Math.min(
    rows - 1,
    Math.ceil((v.lat0 + angularRadius + 90) / deg),
  );
  const lonRadius = Math.min(
    180,
    angularRadius / Math.max(0.15, Math.cos(v.lat0 * RAD)) + deg * 2,
  );
  const colOffsets = Math.ceil(lonRadius / deg);
  const centerColumn = Math.floor((v.lon0 + 180) / deg);
  const candidateColumns =
    lonRadius >= 180
      ? Array.from({ length: cols }, (_, column) => column)
      : Array.from(
          { length: colOffsets * 2 + 1 },
          (_, offset) =>
            (((centerColumn - colOffsets + offset) % cols) + cols) % cols,
        );

  for (let row = rowStart; row <= rowEnd; row++) {
    for (const column of candidateColumns) {
      const c = makeCell(level, deg, row, column);
      const [x, y, cc] = P.proj(c.lon, c.lat);
      if (cc < minC) continue;
      if (x < -margin || x > v.w + margin || y < -margin || y > v.h + margin)
        continue;
      out.push({ c, d: (x - P.cx) ** 2 + (y - P.cy) ** 2 });
    }
  }
  out.sort((a, b) => a.d - b.d);
  return out.slice(0, max).map((o) => o.c);
}
