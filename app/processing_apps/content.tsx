import * as React from 'react';
import Container from '@mui/material/Container';
import ProcessingCanvas from './ProcessingCanvas';

export default function Content() {
  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 250px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProcessingCanvas />
      </div>
    </Container>
  );
}
