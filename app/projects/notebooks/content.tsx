// app/projects/notebooks/content.tsx
'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Loading from '@/components/loading';
import '../../globals.css';
import { useThemeContext } from '@/context/ThemeContext';

const notebooks: Record<string, { name: string; path: string }[]> = {
  CVRP: [
    { name: 'README', path: 'CVRP/README.html' },
    { name: 'Cluster First', path: 'CVRP/Cluster first.html' },
    { name: 'Route First', path: 'CVRP/Route first.html' },
  ],
  MeteoNet: [
    { name: 'EDA', path: 'meteonet/EDA.html' },
    { name: 'Modelling', path: 'meteonet/Modelling.html' },
  ],
  Random: [
    { name: 'DQN', path: 'random/dqn.html' },
    { name: 'ECG', path: 'random/ecg.html' },
    { name: 'Frozen Lake', path: 'random/frozen_lake.html' },
    { name: 'Machine Learning', path: 'random/ml.html' },
    { name: 'Ozone', path: 'random/ozone.html' },
    { name: 'Persistence Multiplicative', path: 'random/persistence.html' },
    { name: 'Taxi', path: 'random/taxi.html' },
  ],
  Kaggle: [
    { name: 'Covid 19 Vaccines', path: 'kaggle/covid-19.html' },
    { name: 'Fish Recognition', path: 'kaggle/fish.html' },
    { name: 'Heart Attacks', path: 'kaggle/heart-1.html' },
    { name: 'Heart Attacks 2', path: 'kaggle/heart-2.html' },
    { name: 'Holiday Packages', path: 'kaggle/holiday.html' },
    { name: 'Mice Trisomy', path: 'kaggle/mice.html' },
    { name: 'Pokemon Stats', path: 'kaggle/pokemon.html' },
    { name: 'Road Accidents', path: 'kaggle/road-injuries.html' },
    { name: 'Stroke Detection', path: 'kaggle/stroke.html' },
    { name: 'Weather Forecasting', path: 'kaggle/weather-forecasting.html' },
  ],
};

const FOLDER_COLORS: Record<string, string> = {
  CVRP: 'var(--text-color-4)',
  MeteoNet: 'var(--text-color-3)',
  Random: 'var(--text-color-1)',
  Kaggle: 'var(--text-color-2)',
};

export default function Content() {
  const { theme } = useThemeContext();
  const [selected, setSelected] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [iframeReady, setIframeReady] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const resizeIframe = (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentWindow?.document.documentElement;
    if (doc) {
      iframe.style.height = doc.scrollHeight + 'px';
      setIframeReady(true);
    }
  };

  const injectStyles = (iframe: HTMLIFrameElement, t: 'light' | 'dark') => {
    const style = document.createElement('style');
    const color = t === 'dark' ? 'white' : 'black';
    style.textContent = `
      thead, caption, div.text_cell_render, p, h1, h2, h3, h4, h5, h6, li { color: ${color} !important; }
      .jp-OutputArea-output pre { color: ${color} !important; }
      body { background: transparent !important; }
    `;
    iframe.contentDocument?.head.appendChild(style);
  };

  React.useEffect(() => {
    if (iframeRef.current) injectStyles(iframeRef.current, theme);
  }, [theme]);

  const handleSelect = (path: string) => {
    setLoading(true);
    setIframeReady(false);
    setSelected('/notebooks/' + path);
    setExpanded(false);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        padding: '0 !important',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Notebook browser */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--background-transparent)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--card-border)',
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          <span className="section-label">AI · Notebooks</span>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Jupyter Notebooks
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(notebooks).map(([folder, files]) => (
            <Accordion
              key={folder}
              expanded={expanded === folder}
              onChange={() => setExpanded(expanded === folder ? false : folder)}
              disableGutters
              sx={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '10px !important',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                minWidth: 140,
                '& .MuiAccordionSummary-root': {
                  borderRadius: '10px',
                  minHeight: 36,
                  px: 1.5,
                  py: 0,
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{ fontSize: '1rem', color: 'var(--foreground-muted)' }}
                  />
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: FOLDER_COLORS[folder] || 'var(--accent)',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: 'var(--foreground)',
                    }}
                  >
                    {folder}
                  </Typography>
                  <Box
                    sx={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.65rem',
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '100px',
                      backgroundColor: 'var(--background-2)',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    {files.length}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1, pt: 0 }}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}
                >
                  {files.map((f) => (
                    <Box
                      key={f.path}
                      onClick={() => handleSelect(f.path)}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.82rem',
                        color: selected.endsWith(f.path)
                          ? 'var(--accent)'
                          : 'var(--foreground-muted)',
                        backgroundColor: selected.endsWith(f.path)
                          ? 'var(--accent-muted)'
                          : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: 'var(--background-2)',
                          color: 'var(--foreground)',
                        },
                      }}
                    >
                      {f.name}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 2 } }}>
        {selected ? (
          loading ? (
            <Loading />
          ) : (
            <Box
              sx={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <iframe
                ref={iframeRef}
                src={selected}
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  resizeIframe(iframe);
                  injectStyles(iframe, theme);
                }}
                title="Notebook"
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  visibility: iframeReady ? 'visible' : 'hidden',
                  opacity: iframeReady ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
            </Box>
          )
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              gap: 2,
              color: 'var(--foreground-muted)',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '2.5rem' }}>📓</Typography>
            <Typography
              sx={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.85rem',
                opacity: 0.6,
              }}
            >
              Select a notebook to display
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
