'use client';
import './media_player.css';
import Playlist from './media_player/Playlist/playlist';
import Player from './media_player/Player';
import Container from '@mui/material/Container';
import { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';

const MediaPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => setIsPageLoaded(true);

    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <Container
      className={`media-player ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        opacity: isPageLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
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
