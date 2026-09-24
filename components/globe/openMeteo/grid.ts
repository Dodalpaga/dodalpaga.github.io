import { makeProjector, RAD, type View } from './projection';

export type Cell = {
  id: string;
  level: number;
  lat0: number; lat1: number;
  lon0: number; lon1: number;
  lat: number; lon: number; // centre
};

const cache = new Map<string, Cell[]>();

/** Regular lat/lon grid of `deg`-degree cells. */
export function gridCells(level: number, deg: number): Cell[] {
  const key = `${level}:${deg}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rows = Math.round(180 / deg);
  const cols = Math.round(360 / deg);
  const out: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lat0 = -90 + r * deg;
      const lon0 = -180 + c * deg;
      out.push({
        id: `${level}:${r}:${c}`, level,
        lat0, lat1: lat0 + deg, lon0, lon1: lon0 + deg,
        lat: lat0 + deg / 2, lon: lon0 + deg / 2,
      });
    }
  }
  cache.set(key, out);
  return out;
}

export type ViewInfo = View & { w: number; h: number };

/** Cells whose centre is on screen (or just past the limb), nearest to the view centre first. */
export function visibleCells(cells: Cell[], deg: number, v: ViewInfo, max: number): Cell[] {
  const P = makeProjector(v, v.w, v.h);
  const margin = P.R * deg * RAD * 1.2 + 8;
  const minC = -Math.sin(deg * RAD * 0.75);
  const out: { c: Cell; d: number }[] = [];
  for (const c of cells) {
    const [x, y, cc] = P.proj(c.lon, c.lat);
    if (cc < minC) continue;
    if (x < -margin || x > v.w + margin || y < -margin || y > v.h + margin) continue;
    out.push({ c, d: (x - P.cx) ** 2 + (y - P.cy) ** 2 });
  }
  out.sort((a, b) => a.d - b.d);
  return out.slice(0, max).map((o) => o.c);
}
