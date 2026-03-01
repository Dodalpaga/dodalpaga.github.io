// app/projects/clustering/content.tsx
'use client';

import * as React from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import Container from '@mui/material/Container';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import DrawIcon from '@mui/icons-material/Draw';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

interface Dot {
  x: number;
  y: number;
  color: string;
}
interface Centroid {
  x: number;
  y: number;
  cluster: number;
}
interface Ellipse {
  x: number;
  y: number;
  rx: number;
  ry: number;
  cluster: number;
  angle: number;
}

const MAX_DOTS = 60;
const ERASER_RADIUS = 22;

const CLUSTER_COLORS = [
  '#6B8EFF',
  '#FF6B8E',
  '#6BFFB8',
  '#FFD56B',
  '#C46BFF',
  '#6BFFF0',
  '#FF9A6B',
  '#B8FF6B',
  '#FF6BDA',
  '#6BB8FF',
];

type Mode = 'pointer' | 'eraser';

export default function Content() {
  const { theme } = useThemeContext();
  const [dots, setDots] = React.useState<Dot[]>([]);
  const [clusters, setClusters] = React.useState(3);
  const [centroids, setCentroids] = React.useState<Centroid[]>([]);
  const [ellipses, setEllipses] = React.useState<Ellipse[]>([]);
  const [mode, setMode] = React.useState<Mode>('pointer');
  const [isErasing, setIsErasing] = React.useState(false);
  const [eraserPos, setEraserPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const bgColor = theme === 'dark' ? '#0e0e10' : '#f8f7f4';
  const dotDefaultColor = theme === 'dark' ? '#e8e8ec' : '#18181b';
  const gridColor =
    theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Ellipses
    ellipses.forEach((e) => {
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.rx, e.ry, e.angle, 0, 2 * Math.PI);
      ctx.strokeStyle =
        CLUSTER_COLORS[e.cluster % CLUSTER_COLORS.length] + '80';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Fill
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = CLUSTER_COLORS[e.cluster % CLUSTER_COLORS.length];
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Dots
    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = dot.color;
      ctx.fill();
      ctx.strokeStyle =
        theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Centroids
    centroids.forEach((c) => {
      const color = CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length];
      const s = 9;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(c.x - s, c.y - s);
      ctx.lineTo(c.x + s, c.y + s);
      ctx.moveTo(c.x + s, c.y - s);
      ctx.lineTo(c.x - s, c.y + s);
      ctx.stroke();
      // Circle around centroid
      ctx.beginPath();
      ctx.arc(c.x, c.y, s + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Eraser preview
    if (mode === 'eraser' && eraserPos) {
      ctx.beginPath();
      ctx.arc(eraserPos.x, eraserPos.y, ERASER_RADIUS, 0, 2 * Math.PI);
      ctx.strokeStyle = 'var(--foreground-muted)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [dots, centroids, ellipses, mode, eraserPos, theme, gridColor]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const addDot = (x: number, y: number) => {
    if (dots.length >= MAX_DOTS) return;
    setDots((prev) => [...prev, { x, y, color: dotDefaultColor }]);
  };

  const eraseDots = (x: number, y: number) => {
    setDots((prev) =>
      prev.filter((d) => Math.hypot(d.x - x, d.y - y) > ERASER_RADIUS),
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    if (mode === 'pointer') addDot(x, y);
    else {
      setIsErasing(true);
      setEraserPos({ x, y });
      eraseDots(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    if (mode === 'eraser') {
      setEraserPos({ x, y });
      if (isErasing) eraseDots(x, y);
    }
  };

  const handleMouseUp = () => {
    if (mode === 'eraser') setIsErasing(false);
  };

  const handleReset = () => {
    setDots([]);
    setCentroids([]);
    setEllipses([]);
  };

  const handleGenerate = () => {
    if (dots.length < clusters) return;
    const iters = 20;
    let cs = [...dots]
      .sort(() => Math.random() - 0.5)
      .slice(0, clusters)
      .map((d, i) => ({ x: d.x, y: d.y, cluster: i }));

    let assignments: number[] = new Array(dots.length).fill(0);
    for (let iter = 0; iter < iters; iter++) {
      assignments = dots.map((d) => {
        let minD = Infinity,
          best = 0;
        cs.forEach((c, i) => {
          const dist = (d.x - c.x) ** 2 + (d.y - c.y) ** 2;
          if (dist < minD) {
            minD = dist;
            best = i;
          }
        });
        return best;
      });
      cs = cs.map((c, i) => {
        const pts = dots.filter((_, j) => assignments[j] === i);
        if (!pts.length) return c;
        return {
          x: pts.reduce((s, d) => s + d.x, 0) / pts.length,
          y: pts.reduce((s, d) => s + d.y, 0) / pts.length,
          cluster: i,
        };
      });
    }

    setDots(
      dots.map((d, j) => ({
        ...d,
        color: CLUSTER_COLORS[assignments[j] % CLUSTER_COLORS.length],
      })),
    );
    setCentroids(cs);

    const newEllipses: Ellipse[] = [];
    for (let i = 0; i < clusters; i++) {
      const pts = dots.filter((_, j) => assignments[j] === i);
      if (!pts.length) continue;
      const cx = cs[i].x,
        cy = cs[i].y,
        n = pts.length;
      let sXX = 0,
        sYY = 0,
        sXY = 0;
      pts.forEach((d) => {
        const dx = d.x - cx,
          dy = d.y - cy;
        sXX += dx * dx;
        sYY += dy * dy;
        sXY += dx * dy;
      });
      const cXX = sXX / n,
        cYY = sYY / n,
        cXY = sXY / n;
      const common = Math.sqrt(((cXX - cYY) / 2) ** 2 + cXY ** 2);
      const l1 = (cXX + cYY) / 2 + common;
      const l2 = (cXX + cYY) / 2 - common;
      newEllipses.push({
        x: cx,
        y: cy,
        rx: Math.sqrt(Math.abs(l1)) + 14,
        ry: Math.sqrt(Math.abs(l2)) + 14,
        cluster: i,
        angle: 0.5 * Math.atan2(2 * cXY, cXX - cYY),
      });
    }
    setEllipses(newEllipses);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 1.5 }}>
        <span className="section-label">ML · Interactive</span>
        <Typography
          variant="h5"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          K-Means Clustering
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.82rem',
          }}
        >
          Click to place dots · Run clustering · Adjust k
        </Typography>
      </Box>

      {/* Canvas + Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          gap: 0,
          overflow: 'hidden',
          borderRadius: '14px',
          border: '1px solid var(--card-border)',
          backgroundColor: bgColor,
        }}
      >
        {/* Canvas */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              cursor: mode === 'eraser' ? 'crosshair' : 'cell',
              display: 'block',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {/* Dot counter badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 12,
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.7rem',
              color: 'var(--foreground-muted)',
              backgroundColor: 'var(--background-transparent)',
              backdropFilter: 'blur(8px)',
              padding: '3px 10px',
              borderRadius: '100px',
              border: '1px solid var(--card-border)',
            }}
          >
            {dots.length} / {MAX_DOTS} dots
          </Box>
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 6px',
            gap: 1,
            borderLeft: '1px solid var(--card-border)',
            backgroundColor: 'var(--background-elevated)',
          }}
        >
          <Tooltip title="Draw" placement="left">
            <IconButton
              size="small"
              onClick={() => setMode('pointer')}
              sx={{
                borderRadius: '8px',
                color:
                  mode === 'pointer'
                    ? 'var(--accent)'
                    : 'var(--foreground-muted)',
                backgroundColor:
                  mode === 'pointer' ? 'var(--accent-muted)' : 'transparent',
                border: `1px solid ${mode === 'pointer' ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              <DrawIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Erase" placement="left">
            <IconButton
              size="small"
              onClick={() => setMode('eraser')}
              sx={{
                borderRadius: '8px',
                color:
                  mode === 'eraser'
                    ? 'var(--accent)'
                    : 'var(--foreground-muted)',
                backgroundColor:
                  mode === 'eraser' ? 'var(--accent-muted)' : 'transparent',
                border: `1px solid ${mode === 'eraser' ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider
            sx={{ width: '100%', borderColor: 'var(--card-border)', my: 0.5 }}
          />
          <Tooltip title="Reset" placement="left">
            <IconButton
              size="small"
              onClick={handleReset}
              sx={{
                borderRadius: '8px',
                color: 'var(--foreground-muted)',
                '&:hover': { color: 'var(--text-color-2)' },
              }}
            >
              <RotateLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mt: 1.5,
          px: 2,
          py: 1.5,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 180,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.72rem',
              color: 'var(--foreground-muted)',
              mb: 0.5,
            }}
          >
            k = {clusters} clusters
          </Typography>
          <Slider
            value={clusters}
            onChange={(_, v) => setClusters(v as number)}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={2}
            max={10}
            sx={{
              color: 'var(--accent)',
              '& .MuiSlider-mark': { backgroundColor: 'var(--card-border)' },
              '& .MuiSlider-valueLabel': {
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.75rem',
                backgroundColor: 'var(--accent)',
              },
            }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={dots.length < clusters}
          startIcon={<ScatterPlotIcon />}
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            textTransform: 'none',
            borderRadius: '10px',
            padding: '8px 20px',
            backgroundColor: 'var(--accent)',
            '&:hover': {
              backgroundColor: 'var(--accent-hover)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px var(--accent-muted)',
            },
            '&:disabled': {
              backgroundColor: 'var(--background-2)',
              color: 'var(--foreground-muted)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Cluster
        </Button>
        {centroids.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {centroids.map((c, i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor:
                    CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length],
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
