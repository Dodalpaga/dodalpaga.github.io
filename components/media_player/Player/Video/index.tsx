// components/media_player/Player/Video/index.tsx

import React, { useRef, useEffect, FC } from 'react';
import player from '../../libs/player';
import { useStyles } from './styles';

const Video: FC = () => {
  const classes = useStyles();
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoWrapperElement = videoWrapperRef.current!;
    const video = player.getElement();

    if (video) {
      video.remove();
      // Set video to fill the container while maintaining aspect ratio
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'contain'; // Ensures video scales and keeps aspect ratio
      videoWrapperElement.append(video);

      return () => {
        videoWrapperElement.removeChild(video);
        document.body.append(video);
      };
    }
  }, []);

  return (
    <div
      ref={videoWrapperRef}
      className={classes.root}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Video;
