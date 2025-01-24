// components/media_player.tsx
'use client';
import './media_player.css';
import Playlist from './media_player/Playlist/playlist';
import Player from './media_player/Player';
import Container from '@mui/material/Container';

const MediaPlayer = () => {
  return (
    <Container maxWidth="xs" className="media-player" sx={{ margin: '10px' }}>
      <div className="player-container">
        <Player />
      </div>
      <div className="playlist-container">
        <Playlist />
      </div>
    </Container>
  );
};

export default MediaPlayer;
