// app/projects/json_explorer/content.tsx
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useThemeContext } from '@/context/ThemeContext';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const SHORTCUTS = [
  { key: 'Ctrl/Cmd + Click', desc: 'Enter edit mode' },
  { key: 'Ctrl/Cmd + Enter', desc: 'Submit change' },
  { key: 'Escape', desc: 'Cancel edit / new key' },
  { key: 'Enter', desc: 'Submit new key' },
];

export default function Content() {
  const { theme } = useThemeContext();

  const sampleJSON = {
    name: 'John Doe',
    age: 30,
    quantity: NaN,
    hobbies: ['reading', 'coding', 'hiking'],
    address: {
      street: '123 Main St',
      city: 'Anytown',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    more: Array.from({ length: 50 }, (_, i) => ({ id: i, value: `Item ${i}` })),
  };

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
      <Box
        sx={{
          mb: 2.5,
          pb: 2,
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <span className="section-label">Dev Tool · Utility</span>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            JSON Explorer
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--foreground-muted)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Interactively explore and edit complex JSON structures
          </Typography>
        </Box>

        {/* Keyboard shortcuts */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {SHORTCUTS.map((s) => (
            <Box
              key={s.key}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
            >
              <Box
                sx={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.68rem',
                  letterSpacing: '0.04em',
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  backgroundColor: 'var(--background-2)',
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.key}
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.75rem',
                  color: 'var(--foreground-muted)',
                }}
              >
                {s.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* JSON viewer */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '14px',
          p: 2,
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <ReactJson
          src={sampleJSON}
          name={false}
          collapsed={2}
          collapseStringsAfterLength={20}
          enableClipboard
          displayDataTypes
          displayObjectSize
          indentWidth={4}
          iconStyle="triangle"
          theme={theme === 'dark' ? 'google' : 'summerfruit:inverted'}
          style={{
            backgroundColor: 'transparent',
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.85rem',
          }}
          onEdit={(e) => console.log('Edit:', e)}
          onAdd={(e) => console.log('Add:', e)}
          onDelete={(e) => console.log('Delete:', e)}
        />
      </Box>
    </Container>
  );
}
