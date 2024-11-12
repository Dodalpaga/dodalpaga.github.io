import React from 'react';
import { Box, Slider, Typography } from '@mui/material';

import player, { usePlayerState, useCurrentTime } from '../../libs/player';
import { formatTime } from './utils';

const Progress = () => {
  const state = usePlayerState();
  const currentTime = useCurrentTime();

  return (
    <Box display="flex" alignItems="center" width={'100%'} mt={2}>
      <Typography>{formatTime(currentTime)}</Typography>

      <Box clone mx={2} width={'100%'}>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={currentTime / state.duration}
          onChange={(event, value) =>
            player.seek(state.duration * (value as number))
          }
        />
      </Box>

      <Typography>{formatTime(state.duration)}</Typography>
    </Box>
  );
};

export default Progress;
