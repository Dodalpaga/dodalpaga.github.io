'use client';

import React, { useRef, useEffect, useState } from 'react';

const BifurcationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // Dynamically import p5
  const loadP5 = async () => {
    const p5 = (await import('p5')).default; // Access default export
    return p5;
  };

  const sketch = (p: any) => {
    let iterationNum = 200;
    let stepSize = 0.005;
    let initialValue = 0.1;
    let a = 2;
    let maxA = 4.0;
    let x: number;
    let px: number, py: number;
    let isAnimating = true;
    let zoomFactor = 1;
    let canvasParent: HTMLElement | null = null;

    // Adjust canvas size to the parent element
    const resizeCanvasToParent = () => {
      if (canvasParent) {
        const parentWidth = canvasParent.offsetWidth;
        const parentHeight = canvasParent.offsetHeight;

        // Resize canvas and adjust zoom factor based on the parent width
        p.resizeCanvas(parentWidth, parentHeight);
        zoomFactor = parentWidth / 600; // Scale according to the new width
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvasParent = canvas.elt.parentElement; // Get the parent element of the canvas
      resizeCanvasToParent();
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
      resizeCanvasToParent();
    };

    // Logistic function
    const logistic = (a: number, x: number) => {
      return a * x * (1 - x);
    };
  };

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');

    if (isBrowser && canvasRef.current) {
      loadP5().then((p5) => {
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
      });
    }
  }, [isBrowser]);

  if (!isBrowser) {
    return null; // Or a loading indicator
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden', // Prevent scrollbars
        }}
      ></div>

      {/* Display Bifurcation Diagram */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f0f0f0',
          textAlign: 'center',
        }}
      >
        <p>Bifurcation Diagram</p>
      </div>
    </div>
  );
};

export default BifurcationCanvas;
