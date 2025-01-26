'use client';
import './media_player.css';
import Playlist from './media_player/Playlist/playlist';
import Player from './media_player/Player';
import Container from '@mui/material/Container';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';

const MediaPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <Container className={`media-player ${isFullscreen ? 'fullscreen' : ''}`}>
      <IconButton
        color="primary"
        onClick={toggleFullscreen}
        className="fullscreen-button"
      >
        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
      </IconButton>
      <Player />
      <Playlist />
    </Container>
  );
};

export default MediaPlayer;
