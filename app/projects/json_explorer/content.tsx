'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useThemeContext } from '@/context/ThemeContext';

// 👇 dynamically import ReactJson
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

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
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    more: Array.from({ length: 50 }, (_, i) => ({ id: i, value: `Item ${i}` })),
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 4,
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          💡 Keyboard Shortcuts
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>
              <strong>Ctrl / Cmd + Click</strong>: Enter edit mode
            </li>
            <li>
              <strong>Ctrl / Cmd + Enter</strong>: Submit change
            </li>
            <li>
              <strong>Escape</strong>: Cancel edit
            </li>
            <li>
              <strong>Enter</strong>: Submit new key
            </li>
            <li>
              <strong>Escape</strong>: Cancel new key
            </li>
          </ul>
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxHeight: '60vh',
          overflow: 'auto',
          border: '1px solid #ccc',
          borderRadius: 2,
          padding: 2,
        }}
      >
        <ReactJson
          src={sampleJSON}
          name={false}
          collapsed={2}
          collapseStringsAfterLength={15}
          enableClipboard={true}
          displayDataTypes={true}
          displayObjectSize={true}
          indentWidth={6}
          iconStyle="triangle"
          theme={theme === 'dark' ? 'google' : 'summerfruit:inverted'}
          style={{ backgroundColor: 'transparent' }}
          onEdit={(e) => console.log('Edit:', e)}
          onAdd={(e) => console.log('Add:', e)}
          onDelete={(e) => console.log('Delete:', e)}
        />
      </Box>
    </Container>
  );
}
