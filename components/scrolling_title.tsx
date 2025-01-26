import React, { useEffect, useState, useRef } from 'react';

const ScrollingTitle = ({ title }: { title: string }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(titleRef);
    if (titleRef.current) {
      console.log('Title : ', title);
      console.log('Outside : ', titleRef.current.clientWidth);
      console.log('Inside : ', titleRef.current.scrollWidth);
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
