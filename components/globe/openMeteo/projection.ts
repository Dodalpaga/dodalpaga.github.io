export const RAD = Math.PI / 180;
export type View = { lon0: number; lat0: number; zoom: number };

/** Orthographic projection helpers shared by the renderer and the cell picker. */
export function makeProjector(view: View, w: number, h: number) {
  const R = Math.min(w, h) * 0.44 * view.zoom;
  const cx = w / 2;
  const cy = h / 2 + 8;
  const l0 = view.lon0 * RAD;
  const p0 = view.lat0 * RAD;
  const sp0 = Math.sin(p0);
  const cp0 = Math.cos(p0);

  /** returns [x, y, cosc]; cosc > 0 means the point faces the viewer */
  const proj = (lon: number, lat: number): [number, number, number] => {
    const l = lon * RAD - l0;
    const p = lat * RAD;
    const cosc = sp0 * Math.sin(p) + cp0 * Math.cos(p) * Math.cos(l);
    const x = R * Math.cos(p) * Math.sin(l);
    const y = R * (cp0 * Math.sin(p) - sp0 * Math.cos(p) * Math.cos(l));
    return [cx + x, cy - y, cosc];
  };

  /** push a hidden point radially onto the limb */
  const clamp = (x: number, y: number): [number, number] => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [cx + (dx / d) * R, cy + (dy / d) * R];
  };

  return { R, cx, cy, proj, clamp };
}
