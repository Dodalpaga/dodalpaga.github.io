// app/projects/simulations/content.tsx
'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { Maximize2, Minimize2 } from 'lucide-react';
import IconButton from '@mui/material/IconButton';

import LorentzCanvas from './lorentz';
import FourrierCanvas from './fourrier';
import BifurcationCanvas from './bifurcation';
import PiApproximationCanvas from './pi';

// ── Simulation metadata ───────────────────────────────────────────────────────
const SIMULATIONS = [
  {
    key: 'lorentz',
    title: 'Lorenz Attractor',
    label: 'Chaos · 3D',
    description: 'Strange attractor from deterministic chaos — dx/dt = σ(y−x)',
    Component: LorentzCanvas,
  },
  {
    key: 'fourrier',
    title: 'Fourier Series',
    label: 'Signal · Math',
    description: 'Decomposing periodic functions into harmonic sines',
    Component: FourrierCanvas,
  },
  {
    key: 'bifurcation',
    title: 'Bifurcation Diagram',
    label: 'Chaos · Logistic Map',
    description: 'Period-doubling route to chaos: xₙ₊₁ = r · xₙ(1 − xₙ)',
    Component: BifurcationCanvas,
  },
  {
    key: 'pi',
    title: 'π Approximation',
    label: 'Monte Carlo · Stats',
    description: 'Estimating π by sampling random points inside a unit square',
    Component: PiApproximationCanvas,
  },
] as const;

// ── Single simulation card ────────────────────────────────────────────────────
function SimCard({
  title,
  label,
  description,
  Component,
  index,
}: {
  title: string;
  label: string;
  description: string;
  Component: React.ComponentType;
  index: number;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 500,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        '&:hover': {
          boxShadow: 'var(--card-shadow-hover)',
          transform: 'translateY(-2px)',
        },
        animation: 'fadeInUp 0.5s ease both',
        animationDelay: `${index * 0.08}s`,
        ...(expanded && {
          position: 'fixed',
          inset: '5vh 5vw',
          zIndex: 1300,
          width: 'auto',
          height: '90vh',
          transform: 'none',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }),
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: 2,
          pt: 2,
          pb: 1.5,
          borderBottom: '1px solid var(--card-border)',
          flexShrink: 0,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                px: 1,
                py: 0.2,
                borderRadius: '100px',
                backgroundColor: 'var(--accent-muted)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                textTransform: 'uppercase',
                lineHeight: 1.4,
              }}
            >
              {label}
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '-0.02em',
              color: 'var(--foreground)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.72rem',
              color: 'var(--foreground-muted)',
              mt: 0.3,
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              flexShrink: 0,
              ml: 1,
              mt: 0.25,
              color: 'var(--foreground-muted)',
              borderRadius: '8px',
              border: '1px solid var(--card-border)',
              '&:hover': {
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
                backgroundColor: 'var(--accent-muted)',
              },
              transition: 'all 0.15s ease',
            }}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Canvas area — no overflow clip here; the card's fixed height handles it */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <Component />
      </Box>
    </Box>
  );
}

// ── Backdrop for expanded card ────────────────────────────────────────────────
function ExpandBackdrop({
  active,
  onClose,
}: {
  active: boolean;
  onClose: () => void;
}) {
  if (!active) return null;
  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1299,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }}
    />
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────
export default function Content() {
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid var(--card-border)' }}>
        <span className="section-label">Math · Interactive</span>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            mb: 0.75,
          }}
        >
          Simulations
        </Typography>
        <Typography
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: 520,
          }}
        >
          Live mathematical simulations — chaos theory, signal analysis, and
          stochastic methods, all rendered in real time.
        </Typography>
      </Box>

      {/* Grid */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Grid container spacing={2.5} sx={{ height: '100%' }}>
          {SIMULATIONS.map(
            ({ key, title, label, description, Component }, i) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={key}
                sx={{ display: 'flex', minHeight: 300 }}
              >
                <Box sx={{ width: '100%', position: 'relative' }}>
                  {/* Backdrop only for this card's expand */}
                  <ExpandBackdrop
                    active={expandedKey === key}
                    onClose={() => setExpandedKey(null)}
                  />
                  <SimCard
                    title={title}
                    label={label}
                    description={description}
                    Component={Component}
                    index={i}
                  />
                </Box>
              </Grid>
            ),
          )}
        </Grid>
      </Box>
    </Container>
  );
}
