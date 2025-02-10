import React, { useEffect, useState, useRef } from 'react';
import './scrolling_title.css';

const ScrollingTitle = ({ title }: { title: string }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const isOverflow =
        titleRef.current.scrollWidth > titleRef.current.clientWidth;
      setIsOverflowing(isOverflow);
    }
  }, [title]);

  return (
    <div
      className={`scrolling-title-container ${isOverflowing ? 'scrolling' : ''}`}
      ref={titleRef}
    >
      <span className={`scrolling-title ${isOverflowing ? 'animate' : ''}`}>
        {title}
      </span>
    </div>
  );
};

export default ScrollingTitle;
