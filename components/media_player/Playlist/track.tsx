// acomponents/media_player/Playlist/track.tsx

import React, { FC } from 'react';
import { ListItem, ListItemSecondaryAction, IconButton } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

import player, { usePlayerState } from '../libs/player';
import ScrollingTitle from '@/components/scrolling_title'; // Import the ScrollingTitle component

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
      {/* Replacing ListItemText with ScrollingTitle */}
      <ScrollingTitle title={track.title} />
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
