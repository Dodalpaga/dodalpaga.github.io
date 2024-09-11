// content.tsx

import * as React from 'react';
import Container from '@mui/material/Container';
import { keyframes } from '@mui/system';
import EditorComponent from './EditorComponent';
import { Padding } from 'maplibre-gl';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function Content() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        padding: 4,
      }}
    >
      <EditorComponent />
    </div>
  );
}
