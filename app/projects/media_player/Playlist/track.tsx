import React, { FC } from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

import player, { usePlayerState } from '../libs/player';

type Props = {
  index: number;
};

const Track: FC<Props> = ({ index }) => {
  const state = usePlayerState();
  const track = state.tracks[index];

  const handlePlay = () => {
    if (state.currentTrackIndex === index) {
      if (state.playing) {
        player.pause();
      } else {
        player.play();
      }
    } else {
      player.playTrack(index);
    }
  };

  return (
    <ListItem>
      <ListItemText primary={track.title} />
      <ListItemSecondaryAction>
        <IconButton edge="end" color="primary" onClick={() => handlePlay()}>
          {state.currentTrackIndex === index && state.playing ? (
            <Pause />
          ) : (
            <PlayArrow />
          )}
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default Track;
