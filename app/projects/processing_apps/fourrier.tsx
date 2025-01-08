import React, { useRef, useEffect, useState } from 'react';

const FourrierCanvas = () => {
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
    let time = 0;
    let wave: number[] = [];
    let n1 = 5;
    let number_of_points = 500;
    let zoomFactor = 1;
    const baseAmount = 0.02; // Base amount
    const oscillationAmplitude = 0.08; // Oscillation amplitude
    const oscillationFrequency = 0.003; // Frequency of oscillation

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
      p.clear();
      const cx = -p.width / 2;
      const cy = 0;
      p.translate(cx, cy);
      p.scale(zoomFactor);

      // Calculate oscillating amount based on time
      const amount =
        baseAmount +
        oscillationAmplitude *
          p.abs(p.sin(oscillationFrequency * p.frameCount));

      let x = 0;
      let y = 0;

      for (let i = 0; i < n1; i++) {
        let prevx = x;
        let prevy = y;

        let n = i * 2 + 1;
        let radius = 75 * (4 / (n * p.PI));
        x += radius * p.cos(n * time);
        y += radius * p.sin(n * time);

        p.stroke(0);
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

      // Increment time by the oscillating amount
      time += amount;

      if (wave.length > number_of_points) {
        wave.splice(number_of_points);
      }
    };

    p.windowResized = () => {
      resizeCanvasToParent();
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
        <p>Fourrier Epicycle</p>
      </div>
    </div>
  );
};

export default FourrierCanvas;
