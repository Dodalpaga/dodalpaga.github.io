import React, { useState } from 'react';
import { PlayArrow, Pause, VolumeUp } from '@mui/icons-material';
import { Box, Typography, IconButton, Slider } from '@mui/material';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import player, { usePlayerState } from '../libs/player';
import Progress from './Progress';
import Video from './Video';

const Player = () => {
  const { currentTrack, playing } = usePlayerState();
  const [volume, setVolume] = useState(player.volume());

  if (!currentTrack) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <KeyboardDoubleArrowDownIcon />
        <Box
          mt={2}
          flexGrow={1}
          style={{
            display: 'flex',
            overflow: 'hidden',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            width: 'max-content',
            margin: 0,
          }}
        >
          Select a track
        </Box>
        <KeyboardDoubleArrowDownIcon />
      </div>
    );
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
      {/.mp4$/.test(currentTrack.url) && (
        <Box mt={2} flexGrow={1} className="cover">
          <Video />
        </Box>
      )}

      {!/.mp4$/.test(currentTrack.url) && currentTrack.coverUrl && (
        <Box mt={2} flexGrow={1} className="cover">
          <img
            src={currentTrack.coverUrl}
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </Box>
      )}

      <Progress />

      <Box display="flex" alignItems="center">
        <Box flexGrow={1} mr={2}>
          <Typography>{currentTrack.title}</Typography>
        </Box>

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
    </Box>
  );
};

export default Player;
