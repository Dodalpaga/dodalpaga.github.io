// components/media_player/Playlist/playlist.tsx

import React, { useEffect } from 'react';
import { Container, List } from '@mui/material';

import player, { usePlayerState } from '../libs/player';
import { tracks } from '../consts';
import Track from './track';

const Playlist = () => {
  const state = usePlayerState();

  useEffect(() => {
    player.setQueue(tracks);
  }, []);

  return (
    <Container className="playlist-container">
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
