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
        height: 'calc(100vh - 80px)', // Ajustez "80px" à la hauteur de votre pied de page
        overflow: 'auto',
      }}
    >
      {/* Wrapper for Playlist */}
      <div style={{ width: '30%', height: '100%' }}>
        <Playlist />
      </div>

      {/* Wrapper for Player */}
      <div style={{ width: '70%', height: '100%' }}>
        <Player />
      </div>
    </Container>
  );
}
