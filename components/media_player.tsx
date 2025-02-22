'use client';
import './media_player.css';
import Playlist from './media_player/Playlist/playlist';
import Image from 'next/image';
import Player from './media_player/Player';
import Container from '@mui/material/Container';
import { useThemeContext } from '@/context/ThemeContext';
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

  const { theme } = useThemeContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Container
      className={`media-player ${isFullscreen ? 'fullscreen' : ''}`}
      style={{
        opacity: isPageLoaded ? 1 : 0,
      }}
    >
      {/* Music icon that shows when folded */}

      <div className="music-icon">
        <Image
          src="/assets/music-logo.png"
          width={200}
          height={150}
          style={{
            filter: isClient
              ? theme === 'dark'
                ? 'invert(1)'
                : 'invert(0)'
              : 'none',
          }}
          alt="Music Player"
        />
      </div>

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
