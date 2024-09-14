// components/ProcessingCanvas.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const sketch = (p: p5) => {
  let iterationNum = 200;
  let stepSize = 0.005;
  let initialValue = 0.1;
  let a = 2;
  let maxA = 4.0;
  let x: number;
  let px: number, py: number;
  let isAnimating = true;

  const updateZoomFactor = () => {
    const parent = p.canvas.parentElement;
    if (parent) {
      const parentWidth = parent.offsetWidth;
      const parentHeight = parent.offsetHeight;

      // Update zoom factor based on parent dimensions
      p.resizeCanvas(parentWidth, parentHeight);
    }
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    updateZoomFactor();
    p.colorMode(p.HSB);
    p.background('#E4E8E8');
  };

  p.draw = () => {
    if (isAnimating) {
      x = initialValue;

      for (let i = 0; i < iterationNum; i++) {
        x = logistic(a, x);
        if (i > 100 && a > 2) {
          px = (a * (p.width / 4) - p.width / 2) * 2;
          py = p.height - x * p.height;
          p.point(px, py);
        }
      }

      a += stepSize; // Increment the parameter a

      if (a > maxA) {
        p.noLoop(); // Stop the animation when done
        isAnimating = false;
      }
    }
  };

  p.windowResized = () => {
    updateZoomFactor();
  };

  // Logistic function
  const logistic = (a: number, x: number) => {
    return a * x * (1 - x);
  };
};

const BifurcationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new p5 instance
    p5InstanceRef.current = new p5(sketch, canvasRef.current);

    // Resize canvas when parent container resizes
    const resizeObserver = new ResizeObserver(() => {
      p5InstanceRef.current?.resizeCanvas(
        canvasRef.current?.offsetWidth || 0,
        canvasRef.current?.offsetHeight || 0
      );
    });

    resizeObserver.observe(canvasRef.current);

    // Cleanup function to remove p5 instance and observer
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden', // Prevent scrollbars
      }}
    ></div>
  );
};

export default BifurcationCanvas;
