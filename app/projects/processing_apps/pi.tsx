'use client';

import React, { useRef, useEffect, useState } from 'react';

const PiApproximationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const [approximatedPi, setApproximatedPi] = useState(0);
  const [isBrowser, setIsBrowser] = useState(false);

  // Dynamically import p5
  const loadP5 = async () => {
    const p5 = (await import('p5')).default; // Access default export
    return p5;
  };

  const sketch = (p: any, updatePiCallback: (approxPi: number) => void) => {
    const r = 200;
    let total = 0;
    let circle = 0;
    let recordPI = 0;
    let dezoomFactor = 1;
    let canvasParent: HTMLElement | null = null;

    // Adjust canvas size to the parent element
    const resizeCanvasToParent = () => {
      if (canvasParent) {
        const parentWidth = canvasParent.offsetWidth;
        const parentHeight = canvasParent.offsetHeight;

        // Resize canvas and adjust dezoom factor based on the parent width
        p.resizeCanvas(parentWidth, parentHeight);
        dezoomFactor = parentWidth / 600; // Scale according to the new width
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvasParent = canvas.elt.parentElement; // Get the parent element of the canvas
      resizeCanvasToParent();

      p.background(0);
      p.translate(p.width / 2, p.height / 2);
      p.stroke(255);
      p.strokeWeight(4);
      p.noFill();
      p.ellipse(0, 0, r * 2, r * 2); // Draw the circle
      p.rectMode(p.CENTER);
      p.rect(0, 0, r * 2, r * 2); // Draw the square
    };

    p.draw = () => {
      p.translate(p.width / 2, p.height / 2); // Center the origin

      for (let i = 0; i < 250; i++) {
        const x = p.random(-r, r) * dezoomFactor; // Apply scaling
        const y = p.random(-r, r) * dezoomFactor; // Apply scaling
        total++;

        const d = x * x + y * y;
        if (d < r * r * dezoomFactor * dezoomFactor) {
          // Adjust circle boundary
          circle++;
          p.stroke(66, 135, 245);
        } else {
          p.stroke(108, 66, 245);
        }
        p.strokeWeight(1);
        p.point(x, y); // Draw the point

        // Calculate Pi approximation
        const pi = 4 * (circle / total);
        const recordDiff = Math.abs(Math.PI - recordPI);
        const diff = Math.abs(Math.PI - pi);

        if (diff < recordDiff) {
          recordPI = pi;
          // Update the parent component with the new approximated Pi value
          updatePiCallback(recordPI);
        }
      }
    };

    p.windowResized = () => {
      resizeCanvasToParent();
    };
  };

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');

    if (isBrowser && canvasRef.current) {
      loadP5().then((p5) => {
        p5InstanceRef.current = new p5((p: any) => {
          // Call the sketch with the updatePiCallback as an argument
          sketch(p, (approxPi: number) => {
            setApproximatedPi(approxPi);
          });
        }, canvasRef.current);

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
      });
    }
  }, [isBrowser]);

  if (!isBrowser) {
    return null; // Or a loading indicator
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Canvas Element */}
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden', // Prevent scrollbars
        }}
      ></div>

      {/* Display Approximated Pi */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f0f0f0',
          textAlign: 'center',
        }}
      >
        <p>Approximated Value of PI: {approximatedPi.toFixed(8)}</p>
      </div>
    </div>
  );
};

export default PiApproximationCanvas;
