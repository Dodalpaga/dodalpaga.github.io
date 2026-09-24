'use client';
import React from 'react';
import { T } from './theme';
import { gridCells, visibleCells, type ViewInfo } from './openMeteo/grid';
import { makeProjector } from './openMeteo/projection';
import type { GlobeDataset, Head, Sample } from './openMeteo';

type Ring = [number, number][];
type Feature = {
  name: string;
  rings: Ring[];
  cx: number;
  cy: number;
  size: number;
};
type GlobeData = { land: Feature[]; countries: Feature[] };
const BASE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';
const LAND_URL = `${BASE}/ne_110m_land.geojson`;
const COUNTRIES_URL = `${BASE}/ne_110m_admin_0_countries.geojson`;

function toFeatures(json: any): Feature[] {
  return (json.features ?? []).map((feature: any) => {
    const geometry = feature.geometry;
    const rings: Ring[] = !geometry
      ? []
      : geometry.type === 'Polygon'
        ? geometry.coordinates
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates.flat()
          : [];
    let best = rings[0] ?? [];
    let size = 0;
    for (const ring of rings) {
      const xs = ring.map((point) => point[0]);
      const ys = ring.map((point) => point[1]);
      const area =
        (Math.max(...xs) - Math.min(...xs)) *
        (Math.max(...ys) - Math.min(...ys));
      if (area > size) {
        size = area;
        best = ring;
      }
    }
    const xs = best.map((point) => point[0]);
    const ys = best.map((point) => point[1]);
    return {
      name: feature.properties?.NAME ?? '',
      rings,
      cx: xs.length ? (Math.max(...xs) + Math.min(...xs)) / 2 : 0,
      cy: ys.length ? (Math.max(...ys) + Math.min(...ys)) / 2 : 0,
      size,
    };
  });
}

export type GlobeStats = {
  drawn: number;
  cells: number;
  level: number;
  classCounts: number[];
  ready: boolean;
  ms: number;
};
type GlobeOptions = {
  dataset?: GlobeDataset;
  headId?: string;
  timeOffsetHours?: number;
  onStats?: (stats: GlobeStats) => void;
};

export function useOrthographicGlobe(options?: GlobeOptions) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const view = React.useRef({ lon0: 15, lat0: 25, zoom: 1 });
  const data = React.useRef<GlobeData>({ land: [], countries: [] });
  const samples = React.useRef(new Map<number, Map<string, Sample>>());
  const generation = React.useRef(0);
  const raf = React.useRef(0);
  const datasetId = React.useRef<string | undefined>(undefined);
  const [viewRevision, setViewRevision] = React.useState(0);
  const dataset = options?.dataset;
  const headId = options?.headId;
  const timeOffsetHours = options?.timeOffsetHours ?? 0;
  const onStats = React.useRef(options?.onStats);
  onStats.current = options?.onStats;

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const started = performance.now();
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (
      canvas.width !== Math.round(width * dpr) ||
      canvas.height !== Math.round(height * dpr)
    ) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const currentView = view.current;
    const projector = makeProjector(currentView, width, height);
    let drawn = 0;
    let cellsDrawn = 0;
    const head: Head | undefined =
      dataset?.heads.find((item) => item.id === headId) ?? dataset?.heads[0];
    const classCounts = head?.classes.map(() => 0) ?? [];
    const project = (lon: number, lat: number) => {
      const [x, y, cosc] = projector.proj(lon, lat);
      return [x, y, cosc > 0] as [number, number, boolean];
    };

    ctx.save();
    ctx.shadowColor = 'rgba(60,50,30,0.22)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    ctx.beginPath();
    ctx.arc(projector.cx, projector.cy, projector.R, 0, Math.PI * 2);
    ctx.fillStyle = T.ocean;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(projector.cx, projector.cy, projector.R, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = T.grid;
    ctx.lineWidth = 0.7;
    const drawLine = (points: [number, number][]) => {
      ctx.beginPath();
      let pen = false;
      for (const [lon, lat] of points) {
        const [x, y, visible] = project(lon, lat);
        if (!visible) {
          pen = false;
          continue;
        }
        if (!pen) {
          ctx.moveTo(x, y);
          pen = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      drawn++;
    };
    for (let lon = -180; lon < 180; lon += 15) {
      const points: [number, number][] = [];
      for (let lat = -90; lat <= 90; lat += 3) points.push([lon, lat]);
      drawLine(points);
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      const points: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 3) points.push([lon, lat]);
      drawLine(points);
    }

    ctx.fillStyle = T.land;
    for (const feature of data.current.land)
      for (const ring of feature.rings) {
        let anyVisible = false;
        ctx.beginPath();
        ring.forEach(([lon, lat], index) => {
          const [x, y, visible] = project(lon, lat);
          anyVisible ||= visible;
          const [px, py] = visible ? [x, y] : projector.clamp(x, y);
          if (index === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        if (anyVisible) {
          ctx.fill();
          ctx.stroke();
          drawn++;
        }
      }
    if (dataset && head) {
      const level = dataset.levelForZoom(currentView.zoom);
      const values = samples.current.get(level);
      if (values) {
        const degrees = dataset.cellDegrees[level];
        const cells = visibleCells(
          gridCells(level, degrees),
          degrees,
          { ...currentView, w: width, h: height } as ViewInfo,
          1400,
        );
        for (const cell of cells) {
          const sample = values.get(cell.id);
          const classIndex = sample ? head.classOf(sample) : -1;
          if (classIndex < 0 || !head.classes[classIndex]) continue;
          const corners = [
            [cell.lon0, cell.lat0],
            [cell.lon1, cell.lat0],
            [cell.lon1, cell.lat1],
            [cell.lon0, cell.lat1],
          ] as [number, number][];
          const points = corners.map(([lon, lat]) => project(lon, lat));
          if (!points.some(([, , visible]) => visible)) continue;
          ctx.beginPath();
          points.forEach(([x, y, visible], index) => {
            const [px, py] = visible ? [x, y] : projector.clamp(x, y);
            if (index === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = head.classes[classIndex].color;
          ctx.globalAlpha = 0.72;
          ctx.fill();
          ctx.globalAlpha = 1;
          drawn++;
          cellsDrawn++;
          classCounts[classIndex]++;
        }
      }
    }
    ctx.strokeStyle = T.border2;
    ctx.lineWidth = 0.6;
    ctx.setLineDash([2, 2]);
    for (const feature of data.current.countries)
      for (const ring of feature.rings) {
        ctx.beginPath();
        let pen = false;
        for (const [lon, lat] of ring) {
          const [x, y, visible] = project(lon, lat);
          if (!visible) {
            pen = false;
            continue;
          }
          if (!pen) {
            ctx.moveTo(x, y);
            pen = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        drawn++;
      }
    ctx.setLineDash([]);
    ctx.font = `500 ${Math.max(9, 11 * Math.sqrt(currentView.zoom))}px ${T.sans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const feature of data.current.countries) {
      if (!feature.name || feature.size < 12 / currentView.zoom) continue;
      const [x, y, visible] = project(feature.cx, feature.cy);
      if (
        !visible ||
        Math.hypot(x - projector.cx, y - projector.cy) > projector.R * 0.92
      )
        continue;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeText(feature.name, x, y);
      ctx.fillStyle = '#4a4740';
      ctx.fillText(feature.name, x, y);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(projector.cx, projector.cy, projector.R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(60,55,45,0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
    onStats.current?.({
      drawn,
      cells: cellsDrawn,
      level: dataset?.levelForZoom(currentView.zoom) ?? 0,
      classCounts,
      ready: data.current.land.length > 0,
      ms: Math.round(performance.now() - started),
    });
  }, [dataset, headId]);

  const schedule = React.useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(draw);
  }, [draw]);

  React.useEffect(() => {
    if (!dataset) {
      schedule();
      return;
    }
    const id = ++generation.current;
    const controller = new AbortController();
    if (datasetId.current !== dataset.id) {
      samples.current.clear();
      datasetId.current = dataset.id;
    }
    const load = async () => {
      const level = dataset.levelForZoom(view.current.zoom);
      for (const currentLevel of Array.from(
        new Set([dataset.baseLevel, level]),
      )) {
        const canvas = canvasRef.current;
        const degrees = dataset.cellDegrees[currentLevel];
        const cells = visibleCells(
          gridCells(currentLevel, degrees),
          degrees,
          {
            ...view.current,
            w: canvas?.clientWidth ?? 0,
            h: canvas?.clientHeight ?? 0,
          } as ViewInfo,
          1400,
        );
        const values =
          samples.current.get(currentLevel) ?? new Map<string, Sample>();
        samples.current.set(currentLevel, values);
        await dataset.fetchCells(
          currentLevel,
          cells,
          controller.signal,
          (batch) => {
            if (generation.current !== id) return;
            batch.samples.forEach((sample, cellId) =>
              values.set(cellId, sample),
            );
            schedule();
          },
          { timeOffsetHours },
        );
      }
    };
    load().catch((error) => {
      if (error?.name !== 'AbortError') schedule();
    });
    return () => controller.abort();
  }, [dataset, schedule, timeOffsetHours, viewRevision]);

  React.useEffect(() => {
    let dead = false;
    Promise.all([
      fetch(LAND_URL).then((response) => response.json()),
      fetch(COUNTRIES_URL).then((response) => response.json()),
    ])
      .then(([land, countries]) => {
        if (!dead) {
          data.current = {
            land: toFeatures(land),
            countries: toFeatures(countries),
          };
          schedule();
        }
      })
      .catch(() => schedule());
    return () => {
      dead = true;
    };
  }, [schedule]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let drag: { x: number; y: number } | null = null;
    const down = (event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const move = (event: PointerEvent) => {
      if (!drag) return;
      const factor = 0.35 / view.current.zoom;
      view.current.lon0 -= (event.clientX - drag.x) * factor;
      view.current.lat0 = Math.max(
        -89,
        Math.min(89, view.current.lat0 + (event.clientY - drag.y) * factor),
      );
      drag = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const up = (event: PointerEvent) => {
      drag = null;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = 'grab';
      setViewRevision((revision) => revision + 1);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      view.current.zoom = Math.max(
        0.6,
        Math.min(40, view.current.zoom * Math.exp(-event.deltaY * 0.0015)),
      );
      setViewRevision((revision) => revision + 1);
      schedule();
    };
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(canvas);
    schedule();
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('wheel', wheel);
      resizeObserver.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [schedule]);

  return { canvasRef, view };
}
