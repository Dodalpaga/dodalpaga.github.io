import React, { useRef, useEffect, useState } from 'react';

const FourrierCanvas = () => {
  const canvasRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // Dynamically import p5
  const loadP5 = async () => {
    const p5 = (await import('p5')).default; // Access default export
    return p5;
  };

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');

    if (isBrowser) {
      loadP5().then((p5) => {
        p5InstanceRef.current = new p5(sketch, canvasRef.current);
      });

      const resizeObserver = new ResizeObserver(() => {
        p5InstanceRef.current?.resizeCanvas(
          canvasRef.current?.offsetWidth || 0,
          canvasRef.current?.offsetHeight || 0
        );
      });

      resizeObserver.observe(canvasRef.current);

      return () => {
        if (p5InstanceRef.current) {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        }
        resizeObserver.disconnect();
      };
    }
  }, [isBrowser]);

  // Sketch function
  const sketch = (p) => {
    let time = 0;
    let wave = [];
    let n1 = 5;
    let zoomFactor = 1;
    let canvasParent = null;

    const resizeCanvasToParent = () => {
      if (canvasParent) {
        const parentWidth = canvasParent.offsetWidth;
        const parentHeight = canvasParent.offsetHeight;
        p.resizeCanvas(parentWidth, parentHeight);
        zoomFactor = parentWidth / 600;
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvasParent = canvas.elt.parentElement;
      resizeCanvasToParent();
      p.colorMode(p.HSB);
      p.background('#E4E8E8');
    };

    p.draw = () => {
      p.clear();
      const cx = p.width / 4;
      const cy = p.height / 2;
      p.translate(cx, cy);
      p.scale(zoomFactor);

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

      time += 0.05;

      if (wave.length > 250) {
        wave.splice(250);
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
          backgroundColor: '#f0f0f0',
          textAlign: 'center',
        }}
      >
        <p>Fourrier Epicycle</p>
      </div>
    </div>
  );
};

export default FourrierCanvas;
