// components/media_player/Player/index.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import { PlayArrow, Pause, VolumeUp } from '@mui/icons-material';
import { Box, IconButton, Slider } from '@mui/material';
import ScrollingTitle from '@/components/scrolling_title';

import player, { usePlayerState } from '../libs/player';
import Progress from './Progress';
import Video from './Video';

const Player = () => {
  const { currentTrack, playing } = usePlayerState();
  const [volume, setVolume] = useState(player.volume());

  if (!currentTrack) {
    return <></>;
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
    <Box mt={4} className="player-container">
      <Box className="cover">
        {/.mp4$/.test(currentTrack.url) ? (
          <Video />
        ) : currentTrack.coverUrl ? (
          <Image
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            style={{
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            width={60}
            height={60}
          />
        ) : null}
      </Box>

      {/* Right side player controls */}
      <Box className="player-controls">
        <Progress />

        <Box display="flex" alignItems="center" width={'100%'}>
          <ScrollingTitle title={currentTrack.title} />

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
    </Box>
  );
};

export default Player;
