import React, { useEffect } from 'react';
import { Container, List } from '@mui/material';

import player, { usePlayerState } from '../libs/player';
import { tracks } from './consts';
import Track from './track';

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
        width: '100%',
      }}
    >
      <List>
        {state.tracks.map((track, index) => (
          <Track index={index} key={track.url} />
        ))}
      </List>
    </Container>
  );
};

export default Playlist;
