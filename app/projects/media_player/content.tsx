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
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Playlist />
      <Player />
    </Container>
  );
}
