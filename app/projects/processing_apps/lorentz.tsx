import React, { useRef, useEffect, useState } from 'react';

const LorentzCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  const loadP5 = async () => {
    const p5 = (await import('p5')).default;
    return p5;
  };

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');

    if (isBrowser && canvasRef.current) {
      loadP5().then((p5) => {
        p5InstanceRef.current = new p5(sketch, canvasRef.current!);

        const resizeObserver = new ResizeObserver(() => {
          p5InstanceRef.current?.resizeCanvas(
            canvasRef.current?.offsetWidth || 0,
            canvasRef.current?.offsetHeight || 0
          );
        });

        if (canvasRef.current) {
          resizeObserver.observe(canvasRef.current);
        }

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
    let x = 0.01;
    let y = 0;
    let z = 0;

    const a = 10;
    const b = 28;
    const c = 8.0 / 3.0;

    const points: any[] = [];

    let camAngleX = 0;
    let camAngleY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isRotating = false;
    let dezoomFactor = 1;

    let canvasParent: HTMLElement | null = null;

    const resizeCanvasToParent = () => {
      if (canvasParent) {
        const parentWidth = canvasParent.offsetWidth;
        const parentHeight = canvasParent.offsetHeight;

        p.resizeCanvas(parentWidth, parentHeight);

        dezoomFactor = parentWidth / 600;
      }
    };

    p.setup = () => {
      const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      canvasParent = canvas.elt.parentElement;

      resizeCanvasToParent();

      p.colorMode(p.HSB);
    };
    let maxDistance = 5.6;

    p.draw = () => {
      p.clear();
      const dt = 0.01;
      const dx = a * (y - x) * dt;
      const dy = (x * (b - z) - y) * dt;
      const dz = (x * y - c * z) * dt;
      x += dx;
      y += dy;
      z += dz;
      const newPoint = p.createVector(x, y, z);
      if (points.length > 0) {
        const prevPoint = points[points.length - 1];
        const distance = p.dist(
          prevPoint.x,
          prevPoint.y,
          prevPoint.z,
          newPoint.x,
          newPoint.y,
          newPoint.z
        );

        if (distance > maxDistance) {
          maxDistance = distance;
        }

        newPoint.hue = p.map(distance, 0, maxDistance, 240, 0); // 240 (blue) to 0 (red)
      } else {
        newPoint.hue = 240; // Default to blue for the first point
      }

      points.push(newPoint);

      if (points.length > 1500) {
        points.shift();
      }

      const radius = 600;
      const eyeX = radius * Math.sin(camAngleY) * Math.cos(camAngleX);
      const eyeY = radius * Math.sin(camAngleX);
      const eyeZ = radius * Math.cos(camAngleY) * Math.cos(camAngleX);

      p.camera(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);

      p.translate(0, 0, -150);
      p.scale(5 * dezoomFactor);
      p.noFill();

      p.beginShape();
      for (const v of points) {
        p.stroke(v.hue, 255, 255);
        p.vertex(v.x, v.y, v.z);
      }
      p.endShape();
    };

    p.mousePressed = () => {
      const rect = canvasParent?.getBoundingClientRect();
      if (
        rect &&
        p.mouseX >= rect.left &&
        p.mouseX <= rect.right &&
        p.mouseY >= rect.top &&
        p.mouseY <= rect.bottom
      ) {
        lastMouseX = p.mouseX;
        lastMouseY = p.mouseY;

        if (p.mouseButton === p.LEFT) {
          isRotating = true;
        }
      }
    };

    p.mouseReleased = () => {
      isRotating = false;
    };

    p.mouseDragged = () => {
      if (isRotating) {
        const sensitivity = 0.01;
        camAngleX -= (p.mouseY - lastMouseY) * sensitivity;
        camAngleY -= (p.mouseX - lastMouseX) * sensitivity;
        lastMouseX = p.mouseX;
        lastMouseY = p.mouseY;
      }
    };

    p.windowResized = () => {
      resizeCanvasToParent();
    };
  };

  if (!isBrowser) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'grab',
      }}
    >
      <div
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      ></div>

      <div
        style={{
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <p>Lorentz Attractor</p>
      </div>
    </div>
  );
};

export default LorentzCanvas;
