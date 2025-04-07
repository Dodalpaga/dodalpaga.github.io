'use client';

import * as React from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import Container from '@mui/material/Container';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DrawIcon from '@mui/icons-material/Draw';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import './styles.css';

interface Dot {
  x: number;
  y: number;
  color: string; // "black" by default or the assigned cluster color
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
  angle: number; // tilt angle in radians
}

const MAX_DOTS = 30;
const ERASER_RADIUS = 20;

// Predefined colors for clusters (up to 10)
const CLUSTER_COLORS = [
  '#e6194B',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
];

type Mode = 'pointer' | 'eraser';

export default function Content() {
  const { theme } = useThemeContext();

  const [dots, setDots] = React.useState<Dot[]>([]);
  const [clusters, setClusters] = React.useState<number>(2);
  const [centroids, setCentroids] = React.useState<Centroid[]>([]);
  const [ellipses, setEllipses] = React.useState<Ellipse[]>([]);
  const [mode, setMode] = React.useState<Mode>('pointer');
  const [isErasing, setIsErasing] = React.useState<boolean>(false);
  const [eraserPos, setEraserPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Draw canvas contents
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();

    // Resize canvas drawing buffer
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each ellipse (cluster outline) with tilt
    ellipses.forEach((ellipse) => {
      ctx.beginPath();
      ctx.ellipse(
        ellipse.x,
        ellipse.y,
        ellipse.rx,
        ellipse.ry,
        ellipse.angle,
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = CLUSTER_COLORS[ellipse.cluster % CLUSTER_COLORS.length];
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw each dot
    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = dot.color;
      ctx.fill();
    });

    // Draw an "X" for each centroid
    centroids.forEach((centroid) => {
      const size = 8;
      ctx.strokeStyle =
        CLUSTER_COLORS[centroid.cluster % CLUSTER_COLORS.length];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centroid.x - size, centroid.y - size);
      ctx.lineTo(centroid.x + size, centroid.y + size);
      ctx.moveTo(centroid.x + size, centroid.y - size);
      ctx.lineTo(centroid.x - size, centroid.y + size);
      ctx.stroke();
    });

    // If in eraser mode and hovering, draw a preview circle
    if (mode === 'eraser' && eraserPos) {
      ctx.beginPath();
      ctx.arc(eraserPos.x, eraserPos.y, ERASER_RADIUS, 0, 2 * Math.PI);
      ctx.strokeStyle = 'gray';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]); // reset dash
    }
  }, [dots, centroids, ellipses, mode, eraserPos]);

  // Add a new dot when clicking in pointer mode
  const addDot = (x: number, y: number) => {
    if (dots.length >= MAX_DOTS) return;
    const newDot: Dot = { x, y, color: theme === 'dark' ? 'white' : 'black' };
    setDots([...dots, newDot]);
  };

  // Remove dots within the eraser circle
  const eraseDots = (x: number, y: number) => {
    const filteredDots = dots.filter((dot) => {
      const dx = dot.x - x;
      const dy = dot.y - y;
      return Math.sqrt(dx * dx + dy * dy) > ERASER_RADIUS;
    });
    setDots(filteredDots);
  };

  // Canvas mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'pointer') {
      addDot(x, y);
    } else if (mode === 'eraser') {
      setIsErasing(true);
      setEraserPos({ x, y });
      eraseDots(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'eraser') {
      setEraserPos({ x, y });
      if (isErasing) {
        eraseDots(x, y);
      }
    }
  };

  const handleMouseUp = () => {
    if (mode === 'eraser') {
      setIsErasing(false);
    }
  };

  // Reset dots and cluster visualization
  const handleReset = () => {
    setDots([]);
    setCentroids([]);
    setEllipses([]);
  };

  // K-means clustering with tilted ellipse calculation
  const handleGenerate = () => {
    if (dots.length === 0) return;
    if (dots.length < clusters) {
      alert('Not enough dots for the selected number of clusters.');
      return;
    }
    const maxIterations = 10;
    let centroidsTemp = [...dots]
      .sort(() => Math.random() - 0.5)
      .slice(0, clusters)
      .map((dot, i) => ({ x: dot.x, y: dot.y, cluster: i }));

    let assignments: number[] = new Array(dots.length).fill(0);

    for (let iter = 0; iter < maxIterations; iter++) {
      assignments = dots.map((dot) => {
        let minDist = Infinity;
        let assignedCluster = 0;
        centroidsTemp.forEach((centroid, i) => {
          const dx = dot.x - centroid.x;
          const dy = dot.y - centroid.y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            assignedCluster = i;
          }
        });
        return assignedCluster;
      });
      centroidsTemp = centroidsTemp.map((centroid, i) => {
        const clusterDots = dots.filter((_, index) => assignments[index] === i);
        if (clusterDots.length === 0) return centroid;
        const avgX =
          clusterDots.reduce((sum, dot) => sum + dot.x, 0) / clusterDots.length;
        const avgY =
          clusterDots.reduce((sum, dot) => sum + dot.y, 0) / clusterDots.length;
        return { x: avgX, y: avgY, cluster: i };
      });
    }

    const updatedDots = dots.map((dot, index) => ({
      ...dot,
      color: CLUSTER_COLORS[assignments[index] % CLUSTER_COLORS.length],
    }));
    setDots(updatedDots);
    setCentroids(centroidsTemp);

    // Calculate ellipses with tilt using covariance
    const newEllipses: Ellipse[] = [];
    for (let i = 0; i < clusters; i++) {
      const clusterDots = dots.filter((_, index) => assignments[index] === i);
      if (clusterDots.length === 0) continue;
      const cx = centroidsTemp[i].x;
      const cy = centroidsTemp[i].y;
      const n = clusterDots.length;
      let sumXX = 0,
        sumYY = 0,
        sumXY = 0;
      clusterDots.forEach((dot) => {
        const dx = dot.x - cx;
        const dy = dot.y - cy;
        sumXX += dx * dx;
        sumYY += dy * dy;
        sumXY += dx * dy;
      });
      const covXX = sumXX / n;
      const covYY = sumYY / n;
      const covXY = sumXY / n;

      // Eigenvalue decomposition for the covariance matrix
      const common = Math.sqrt(
        Math.pow((covXX - covYY) / 2, 2) + covXY * covXY
      );
      const lambda1 = (covXX + covYY) / 2 + common;
      const lambda2 = (covXX + covYY) / 2 - common;
      const rx = Math.sqrt(lambda1) + 10; // margin for visibility
      const ry = Math.sqrt(lambda2) + 10; // margin for visibility
      const angle = 0.5 * Math.atan2(2 * covXY, covXX - covYY);

      newEllipses.push({ x: cx, y: cy, rx, ry, cluster: i, angle });
    }
    setEllipses(newEllipses);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 2,
        boxSizing: 'border-box', // include padding in the height calculation
      }}
    >
      {/* Canvas area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1, // allows it to take up remaining vertical space
          overflow: 'hidden', // prevent overflow from children
          width: '100%',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #ccc',
              cursor: mode === 'eraser' ? 'crosshair' : 'pointer',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </Box>

        {/* Tools area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 1,
            gap: 1,
            // No fixed width – it'll shrink to fit the buttons
          }}
        >
          <Tooltip title="Draw" placement="left">
            <IconButton
              color={mode === 'pointer' ? 'primary' : 'default'}
              onClick={() => setMode('pointer')}
              aria-label="pointer tool"
            >
              <DrawIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Erase" placement="left">
            <IconButton
              color={mode === 'eraser' ? 'primary' : 'default'}
              onClick={() => setMode('eraser')}
              aria-label="eraser tool"
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Tooltip>
          {/* Divider with added styles */}
          <Divider sx={{ width: '100%', marginY: 1 }} />
          <Tooltip title="Reset" placement="left">
            <IconButton onClick={handleReset} aria-label="reset tool">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Grid container spacing={4} sx={{ margin: 0 }}>
        {/* Controls on top of canvas */}
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5px 20px !important',
          }}
        >
          <Slider
            value={clusters}
            onChange={(e, newValue) => setClusters(newValue as number)}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={2}
            max={10}
          />
          <div style={{ textAlign: 'center' }}>Clusters: {clusters}</div>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5px !important',
          }}
        >
          <Button variant="contained" color="primary" onClick={handleGenerate}>
            Generate
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
