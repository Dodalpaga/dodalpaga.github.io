import React, { useState } from 'react';
import { PlayArrow, Pause, OndemandVideo, VolumeUp } from '@mui/icons-material';
import { Box, Typography, IconButton, Slider } from '@mui/material';

import player, { usePlayerState } from '../libs/player';
import Progress from './Progress';
import Video from './Video';

const Player = () => {
  const { currentTrack, playing } = usePlayerState();
  const [isShowVideo, setIsShowVideo] = useState(false);
  const [volume, setVolume] = useState(player.volume());

  if (!currentTrack) {
    return null;
  }

  const handlePlay = () => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleVolumeChange = (event: any, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    player.volume(newVolume);
  };

  return (
    <Box
      mt={4}
      style={{
        margin: 'auto',
        width: '100%',
        height: '100%', // Set to full viewport height
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Progress />

      <Box display="flex" alignItems="center">
        <Box flexGrow={1} mr={2}>
          <Typography>{currentTrack.title}</Typography>
        </Box>

        {/.mp4$/.test(currentTrack.url) && (
          <IconButton
            color={isShowVideo ? 'primary' : 'default'}
            onClick={() => setIsShowVideo(!isShowVideo)}
          >
            <OndemandVideo />
          </IconButton>
        )}

        <IconButton color="primary" onClick={handlePlay}>
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Box display="flex" alignItems="center" ml={2} width={100}>
          <VolumeUp />
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            aria-labelledby="volume-slider"
          />
        </Box>
      </Box>

      {isShowVideo && (
        <Box mt={2} flexGrow={1} style={{ flex: 1, overflow: 'hidden' }}>
          <Video />
        </Box>
      )}
    </Box>
  );
};

export default Player;
