import React, { useEffect } from 'react';
import { Container, List } from '@mui/material';

import player, { usePlayerState } from '../libs/player';
import { tracks } from '../consts';
import Track from '../Playlist/track';

const Playlist = () => {
  const state = usePlayerState();

  useEffect(() => {
    player.setQueue(tracks);
  }, []);

  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '0px !important',
        width: '100%',
        background: 'var(--background)',
      }}
    >
      <List
        sx={{
          overflowY: 'auto', // Enable vertical scroll
          maxHeight: '100%', // Make it fit the container's height
          width: '100%',
        }}
      >
        {state.tracks.map((track, index) => (
          <Track index={index} key={track.url} />
        ))}
      </List>
    </Container>
  );
};

export default Playlist;
