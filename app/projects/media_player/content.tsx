import React from 'react';
import Container from '@mui/material/Container';
import Playlist from './Playlist';
import Player from './Player';

export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: '100vh',
      }}
    >
      {/* Wrapper for Playlist */}
      <div style={{ width: '30%' }}>
        <Playlist />
      </div>

      {/* Wrapper for Player */}
      <div style={{ width: '70%' }}>
        <Player />
      </div>
    </Container>
  );
}
