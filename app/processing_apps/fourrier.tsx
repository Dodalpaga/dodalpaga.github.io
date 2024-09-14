// components/ProcessingCanvas.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const sketch = (p: p5) => {
  let time = 0;
  let wave: number[] = [];

  let n1 = 10;

  let zoomFactor = 1; // Dynamic zoom factor

  const updateZoomFactor = () => {
    const parent = p.canvas.parentElement;
    if (parent) {
      const parentWidth = parent.offsetWidth;
      const parentHeight = parent.offsetHeight;

      // Update zoom factor based on parent dimensions
      zoomFactor = Math.min(parentWidth, parentHeight) / 600; // Adjust the base size (600) as needed
      p.resizeCanvas(parentWidth, parentHeight);
    }
  };

  p.setup = () => {
    // Create the canvas and set its size
    p.createCanvas(p.windowWidth, p.windowHeight);
    updateZoomFactor();
    p.colorMode(p.HSB);
    p.background('#E4E8E8');
  };

  p.draw = () => {
    p.clear();
    const cx = p.width / 4;
    const cy = p.height / 2;

    p.translate(cx, cy); // Center the drawing
    p.scale(zoomFactor); // Apply dynamic scaling

    let x = 0;
    let y = 0;

    for (let i = 0; i < n1; i++) {
      let prevx = x;
      let prevy = y;

      let n = i * 2 + 1;
      let radius = 75 * (4 / (n * p.PI));
      x += radius * p.cos(n * time);
      y += radius * p.sin(n * time);

      p.stroke(0); // Black color for ellipses and lines
      p.noFill();
      p.ellipse(prevx, prevy, radius * 2, radius * 2);

      p.line(prevx, prevy, x, y);
    }

    wave.unshift(y);

    p.translate(200, 0);
    p.line(x - 200, y, 0, wave[0]);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < wave.length; i++) {
      p.vertex(i, wave[i]);
    }
    p.endShape();

    time += 0.05;

    if (wave.length > 250) {
      wave.splice(250);
    }
  };

  p.windowResized = () => {
    updateZoomFactor();
  };
};

const FourrierCanvas: React.FC = () => {
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

export default FourrierCanvas;
