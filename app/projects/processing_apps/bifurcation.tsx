import React, { useRef, useEffect, useState } from 'react';

const BifurcationCanvas = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  const loadP5 = async () => {
    const p5 = (await import('p5')).default; // Access default export
    return p5;
  };

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');

    if (isBrowser && canvasRef.current) {
      loadP5().then((p5) => {
        p5InstanceRef.current = new p5(sketch, canvasRef.current!); // Use non-null assertion

        // Resize canvas when parent container resizes
        const resizeObserver = new ResizeObserver(() => {
          p5InstanceRef.current?.resizeCanvas(
            canvasRef.current?.offsetWidth || 0,
            canvasRef.current?.offsetHeight || 0
          );
        });

        // Check if canvasRef.current is not null before observing
        if (canvasRef.current) {
          resizeObserver.observe(canvasRef.current);
        }

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

    // Store the canvas element
    let canvasParent: HTMLElement | null = null;

    const resizeCanvasToParent = () => {
      if (canvasParent) {
        const parentWidth = canvasParent.offsetWidth;
        const parentHeight = canvasParent.offsetHeight;

        // Set canvas width to 1/3 of the parent's width and full height
        p.resizeCanvas(parentWidth, parentHeight);

        // Adjust dezoom factor based on the canvas width
        zoomFactor = parentWidth / 600; // Assuming 600 was the original fixed width
      }
    };

    p.setup = () => {
      // Create the canvas and set its size to 1/3 of parent's width and full height
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      canvasParent = canvas.elt.parentElement; // Get the parent element of the canvas
      p.colorMode(p.RGB);
    };

    p.draw = () => {
      const cx = -p.width / 2;
      const cy = -p.height / 2;
      p.translate(cx, cy);
      p.scale(zoomFactor);
      p.strokeWeight(0.2);
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

  if (!isBrowser) {
    return null; // Or a loading indicator
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={canvasRef}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      ></div>
      <div
        style={{
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <p>Bifurcation Diagram</p>
      </div>
    </div>
  );
};

export default BifurcationCanvas;
