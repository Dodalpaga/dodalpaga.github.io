'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   SatellitePass — left side background animation
   Slower pass (~9s), repeats every 8–14s
───────────────────────────────────────────────────────────────────────── */
function SatellitePass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runPass = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const startX = W * 0.05;
    const startY = H * 1.05;
    const cp1X = W * 0.15;
    const cp1Y = H * 0.6;
    const cp2X = W * 0.5;
    const cp2Y = H * 0.25;
    const endX = W * 0.82;
    const endY = -H * 0.05;

    const DURATION = 9000; // slower: 9s per pass
    let startTime: number | null = null;

    const trail: { x: number; y: number }[] = [];
    const MAX_TRAIL = 140;

    function bezier(t: number) {
      const u = 1 - t;
      return {
        x:
          u * u * u * startX +
          3 * u * u * t * cp1X +
          3 * u * t * t * cp2X +
          t * t * t * endX,
        y:
          u * u * u * startY +
          3 * u * u * t * cp1Y +
          3 * u * t * t * cp2Y +
          t * t * t * endY,
      };
    }

    function getAccent() {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? 'rgba(37,99,180,' : 'rgba(99,179,237,';
    }

    function drawSatelliteBody(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      alpha: number,
    ) {
      const accent = getAccent();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;

      ctx.strokeStyle = `${accent}0.95)`;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = `${accent}0.08)`;
      ctx.beginPath();
      ctx.rect(-7, -4, 14, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `${accent}0.12)`;
      ctx.beginPath();
      ctx.rect(-22, -2.5, 12, 5);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(10, -2.5, 12, 5);
      ctx.fill();
      ctx.stroke();

      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-16, -2.5);
      ctx.lineTo(-16, 2.5);
      ctx.moveTo(-10, -2.5);
      ctx.lineTo(-10, 2.5);
      ctx.moveTo(14, -2.5);
      ctx.lineTo(14, 2.5);
      ctx.moveTo(18, -2.5);
      ctx.lineTo(18, 2.5);
      ctx.stroke();

      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -9, 3, Math.PI, 0);
      ctx.stroke();

      const blink = Math.sin(Date.now() / 400) > 0;
      if (blink) {
        ctx.fillStyle = '#68d391';
        ctx.shadowColor = '#68d391';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(6, 0, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawSignalRings(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      alpha: number,
      t: number,
    ) {
      const accent = getAccent();
      const ringPulse = (t * 1.8) % 1;
      for (let i = 0; i < 2; i++) {
        const rPhase = (ringPulse + i * 0.5) % 1;
        const r = rPhase * 32;
        const rAlpha = (1 - rPhase) * 0.3 * alpha;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `${accent}${rAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    function draw(timestamp: number) {
      if (!ctx) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, W, H);

      const pos = bezier(t);
      const alpha = t < 0.08 ? t / 0.08 : t > 0.88 ? (1 - t) / 0.12 : 1;

      const tDelta = Math.min(t + 0.005, 1);
      const pos2 = bezier(tDelta);
      const angle = Math.atan2(pos2.y - pos.y, pos2.x - pos.x);

      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > MAX_TRAIL) trail.shift();

      const accent = getAccent();

      for (let i = 1; i < trail.length; i++) {
        const prog = i / trail.length;
        const trailAlpha = prog * 0.5 * alpha;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `${accent}${trailAlpha.toFixed(3)})`;
        ctx.lineWidth = prog * 1.8;
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 36);
      grad.addColorStop(0, `${accent}${(0.2 * alpha).toFixed(3)})`);
      grad.addColorStop(1, `${accent}0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 36, 0, Math.PI * 2);
      ctx.fill();

      drawSignalRings(ctx, pos.x, pos.y, alpha, t);
      drawSatelliteBody(ctx, pos.x, pos.y, angle, alpha);

      if (t < 1) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        // More frequent: 8–14s between passes
        timeoutRef.current = setTimeout(runPass, 8000 + Math.random() * 6000);
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // First pass after 2–4s
    timeoutRef.current = setTimeout(runPass, 2000 + Math.random() * 2000);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [runPass]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '40vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   NeuralNetwork — right side
   • Continuous left-to-right signal flow (staggered per layer)
   • Neurons drift gently around their origin point
   • Edges draw to current drifted positions each frame
───────────────────────────────────────────────────────────────────────── */
function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Node = {
      ox: number;
      oy: number;
      x: number;
      y: number;
      layer: number;
      idx: number;
      pulsePhase: number;
      driftAmpX: number;
      driftAmpY: number;
      driftFreqX: number;
      driftFreqY: number;
      driftOffX: number;
      driftOffY: number;
      fireTime: number;
    };

    type Edge = {
      from: number;
      to: number;
      weight: number;
      flowOffset: number;
      flowSpeed: number;
    };

    let nodes: Node[] = [];
    let edges: Edge[] = [];

    function build() {
      nodes = [];
      edges = [];
      const W = canvas!.width;
      const H = canvas!.height;

      const layers = [4, 6, 7, 6, 5, 3];
      const layerXs = layers.map(
        (_, li) => W * 0.06 + (li / (layers.length - 1)) * W * 0.88,
      );

      let idx = 0;
      layers.forEach((count, li) => {
        for (let i = 0; i < count; i++) {
          const ox = layerXs[li] + (Math.random() - 0.5) * 16;
          const oy =
            H * 0.13 +
            (i / (count - 1 || 1)) * H * 0.74 +
            (Math.random() - 0.5) * 10;
          nodes.push({
            ox,
            oy,
            x: ox,
            y: oy,
            layer: li,
            idx: idx++,
            pulsePhase: Math.random() * Math.PI * 2,
            // Independent drift per axis per node
            driftAmpX: 4 + Math.random() * 9,
            driftAmpY: 4 + Math.random() * 9,
            driftFreqX: 0.1 + Math.random() * 0.18,
            driftFreqY: 0.09 + Math.random() * 0.17,
            driftOffX: Math.random() * Math.PI * 2,
            driftOffY: Math.random() * Math.PI * 2,
            fireTime: 0,
          });
        }
      });

      // Connect adjacent layers, ~72% density
      for (let li = 0; li < layers.length - 1; li++) {
        const fromNodes = nodes.filter((n) => n.layer === li);
        const toNodes = nodes.filter((n) => n.layer === li + 1);
        fromNodes.forEach((fn) => {
          toNodes.forEach((tn) => {
            if (Math.random() > 0.72) return;
            edges.push({
              from: fn.idx,
              to: tn.idx,
              weight: 0.3 + Math.random() * 0.7,
              // Stagger starting phase by layer → wave moves left-to-right
              flowOffset:
                (li / (layers.length - 1)) * 0.8 + Math.random() * 0.18,
              // Each edge slightly different speed for organic feel
              flowSpeed: 0.00016 + Math.random() * 0.00016,
            });
          });
        });
      }
    }

    const resize = () => {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      build();
    };
    resize();
    window.addEventListener('resize', resize);

    const getAccentRgb = () =>
      document.documentElement.getAttribute('data-theme') === 'light'
        ? '37,99,180'
        : '99,179,237';
    const fireRgb = '100,140,255';

    let lastTs = 0;

    function draw(timestamp: number) {
      const dt = Math.min(timestamp - lastTs, 50); // clamp for tab-blur spikes
      lastTs = timestamp;
      const t = timestamp / 1000;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const accentRgb = getAccentRgb();

      // 1. Update drift positions
      nodes.forEach((node) => {
        node.x =
          node.ox +
          Math.sin(t * node.driftFreqX * Math.PI * 2 + node.driftOffX) *
            node.driftAmpX;
        node.y =
          node.oy +
          Math.sin(t * node.driftFreqY * Math.PI * 2 + node.driftOffY) *
            node.driftAmpY;
      });

      // 2. Edges + continuous travelling signals
      edges.forEach((edge) => {
        const fn = nodes[edge.from];
        const tn = nodes[edge.to];
        if (!fn || !tn) return;

        // Advance flow (wraps 0→1 forever)
        edge.flowOffset = (edge.flowOffset + edge.flowSpeed * dt) % 1;
        const sT = edge.flowOffset;

        // Base static edge
        ctx!.beginPath();
        ctx!.moveTo(fn.x, fn.y);
        ctx!.lineTo(tn.x, tn.y);
        ctx!.strokeStyle = `rgba(${accentRgb},${edge.weight * 0.11})`;
        ctx!.lineWidth = edge.weight * 0.65;
        ctx!.stroke();

        // Signal visible in 0→0.85 window, fades in/out at ends
        if (sT < 0.85) {
          const sigAlpha =
            sT < 0.08 ? sT / 0.08 : sT > 0.7 ? 1 - (sT - 0.7) / 0.15 : 1;

          const sx = fn.x + (tn.x - fn.x) * sT;
          const sy = fn.y + (tn.y - fn.y) * sT;

          // Lit trailing segment
          const trailStart = Math.max(0, sT - 0.22);
          const tx0 = fn.x + (tn.x - fn.x) * trailStart;
          const ty0 = fn.y + (tn.y - fn.y) * trailStart;
          const trailGrad = ctx!.createLinearGradient(tx0, ty0, sx, sy);
          trailGrad.addColorStop(0, `rgba(${fireRgb},0)`);
          trailGrad.addColorStop(
            1,
            `rgba(${fireRgb},${(0.6 * sigAlpha).toFixed(3)})`,
          );
          ctx!.beginPath();
          ctx!.moveTo(tx0, ty0);
          ctx!.lineTo(sx, sy);
          ctx!.strokeStyle = trailGrad;
          ctx!.lineWidth = 1.4;
          ctx!.stroke();

          // Signal head
          const dotGrad = ctx!.createRadialGradient(sx, sy, 0, sx, sy, 5);
          dotGrad.addColorStop(
            0,
            `rgba(${fireRgb},${(0.9 * sigAlpha).toFixed(3)})`,
          );
          dotGrad.addColorStop(1, `rgba(${fireRgb},0)`);
          ctx!.fillStyle = dotGrad;
          ctx!.beginPath();
          ctx!.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx!.fill();

          // Flash destination node as signal arrives
          if (sT > 0.8 && sT < 0.85) {
            const dn = nodes[edge.to];
            if (dn) dn.fireTime = timestamp;
          }
        }
      });

      // 3. Nodes
      nodes.forEach((node) => {
        const idlePulse = Math.sin(t * 0.9 + node.pulsePhase) * 0.5 + 0.5;
        const fired = timestamp - node.fireTime < 500;
        const fp = fired ? (timestamp - node.fireTime) / 500 : 0;
        const r = 3.5 + (fired ? (1 - fp) * 4 : idlePulse * 1.5);

        if (fired) {
          const glowR = r + fp * 18;
          const glowGrad = ctx!.createRadialGradient(
            node.x,
            node.y,
            r,
            node.x,
            node.y,
            glowR,
          );
          glowGrad.addColorStop(
            0,
            `rgba(${fireRgb},${(0.5 * (1 - fp)).toFixed(3)})`,
          );
          glowGrad.addColorStop(1, `rgba(${fireRgb},0)`);
          ctx!.fillStyle = glowGrad;
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx!.fill();
        }

        const coreGrad = ctx!.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          r,
        );
        if (fired) {
          coreGrad.addColorStop(
            0,
            `rgba(${fireRgb},${(0.95 * (1 - fp * 0.4)).toFixed(3)})`,
          );
          coreGrad.addColorStop(1, `rgba(${fireRgb},0.1)`);
        } else {
          coreGrad.addColorStop(
            0,
            `rgba(${accentRgb},${(0.35 + idlePulse * 0.45).toFixed(3)})`,
          );
          coreGrad.addColorStop(1, `rgba(${accentRgb},0.05)`);
        }
        ctx!.fillStyle = coreGrad;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.strokeStyle = fired
          ? `rgba(${fireRgb},${(0.9 * (1 - fp * 0.5)).toFixed(3)})`
          : `rgba(${accentRgb},${(0.28 + idlePulse * 0.42).toFixed(3)})`;
        ctx!.lineWidth = 0.8;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx!.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: '-20vh',
        right: '-20vw',
        width: '55vw',
        height: '140vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BackgroundAnimations — only mounts on screens > 1700px (client-side check)
───────────────────────────────────────────────────────────────────────── */
export default function BackgroundAnimations() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    setShouldRender(window.innerWidth > 1700);
  }, []);

  if (!shouldRender) return null;

  return (
    <>
      <SatellitePass />
      <NeuralNetwork />
    </>
  );
}
