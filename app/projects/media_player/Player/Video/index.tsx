import React, { useRef, useEffect, FC } from 'react';

import player from '../../libs/player';
import { useStyles } from './styles';

const Video: FC = () => {
  const classes = useStyles();
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoWrapperElement = videoWrapperRef.current!;
    const video = player.getElement();

    video.remove();
    video.classList.remove('visuallyhidden');
    videoWrapperElement.append(video);

    return () => {
      videoWrapperElement.removeChild(video);
      video.classList.add('visuallyhidden');
      document.body.append(video);
    };
  }, []);

  return <div ref={videoWrapperRef} className={classes.root} />;
};

export default Video;
