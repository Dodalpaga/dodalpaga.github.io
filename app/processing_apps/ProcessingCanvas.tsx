// components/ProcessingCanvas.tsx
'use client';

import React, { useRef, useState } from 'react';
import p5 from 'p5';

const ProcessingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [p5Instance, setP5Instance] = useState<p5 | null>(null);

  const runSketch = () => {
    if (typeof window === 'undefined' || !canvasRef.current) return;

    // Remove existing p5 instance before creating a new one
    if (p5Instance) {
      p5Instance.remove();
    }

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(400, 400); // Set canvas size
      };

      p.draw = () => {
        p.background(220); // Draw a light gray background
        p.ellipse(p.mouseX, p.mouseY, 50, 50); // Draw an ellipse following the mouse
      };
    };

    // Initialize the new p5 instance
    const newP5Instance = new p5(sketch, canvasRef.current!);
    setP5Instance(newP5Instance);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '30%',
        height: '100%',
      }}
    >
      <button onClick={runSketch} style={{ marginTop: '10px' }}>
        Update Drawing
      </button>
      <div
        style={{
          width: '100%',
          height: '100%',
        }}
        ref={canvasRef}
      ></div>
    </div>
  );
};

export default ProcessingCanvas;
