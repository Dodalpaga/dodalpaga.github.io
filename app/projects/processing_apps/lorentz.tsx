// app/projects/simulations/lorentz.tsx
import React, { useRef, useEffect, useState } from 'react';

const LorentzCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<any | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    if (!isBrowser || !canvasRef.current) return;

    let cleanup: (() => void) | undefined;

    import('p5').then(({ default: p5 }) => {
      const sketch = (p: any) => {
        let x = 0.01,
          y = 0,
          z = 0;
        const a = 10,
          b = 28,
          c = 8 / 3;
        const points: any[] = [];

        let camAngleX = 0;
        let camAngleY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let isRotating = false;
        let dezoomFactor = 1;
        let maxDistance = 5.6;

        const resizeToParent = () => {
          const parent = p.canvas?.parentElement;
          if (!parent) return;
          const w = parent.offsetWidth;
          const h = parent.offsetHeight;
          p.resizeCanvas(w, h);
          dezoomFactor = w / 600;
        };

        p.setup = () => {
          const canvas = p.createCanvas(300, 220, p.WEBGL);
          canvas.style('display', 'block');
          resizeToParent();
          p.colorMode(p.HSB);
        };

        p.draw = () => {
          p.clear();
          const dt = 0.01;
          x += a * (y - x) * dt;
          y += (x * (b - z) - y) * dt;
          z += (x * y - c * z) * dt;

          const pt = p.createVector(x, y, z);
          if (points.length > 0) {
            const prev = points[points.length - 1];
            const dist = p.dist(prev.x, prev.y, prev.z, pt.x, pt.y, pt.z);
            if (dist > maxDistance) maxDistance = dist;
            pt.hue = p.map(dist, 0, maxDistance, 240, 0);
          } else {
            pt.hue = 240;
          }
          points.push(pt);
          if (points.length > 1500) points.shift();

          const radius = 600;
          const eyeX = radius * Math.cos(camAngleX) * Math.sin(camAngleY);
          const eyeY = radius * Math.sin(camAngleX);
          const eyeZ = radius * Math.cos(camAngleX) * Math.cos(camAngleY);
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
          // p.mouseX/Y in WEBGL mode are relative to the canvas (0 → width)
          if (
            p.mouseX >= 0 &&
            p.mouseX <= p.width &&
            p.mouseY >= 0 &&
            p.mouseY <= p.height &&
            p.mouseButton === p.LEFT
          ) {
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
            isRotating = true;
          }
        };

        p.mouseReleased = () => {
          isRotating = false;
        };

        p.mouseDragged = () => {
          if (!isRotating) return;
          const sensitivity = 0.01;
          const maxX = p.HALF_PI - 0.01;
          camAngleX = p.constrain(
            camAngleX - (p.mouseY - lastMouseY) * sensitivity,
            -maxX,
            maxX,
          );
          camAngleY =
            (camAngleY - (p.mouseX - lastMouseX) * sensitivity) % p.TWO_PI;
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
        };

        p.windowResized = resizeToParent;
      };

      p5InstanceRef.current = new p5(sketch, canvasRef.current!);

      const ro = new ResizeObserver(() => {
        const parent = canvasRef.current;
        if (parent) {
          p5InstanceRef.current?.resizeCanvas(
            parent.offsetWidth,
            parent.offsetHeight,
          );
        }
      });
      if (canvasRef.current) ro.observe(canvasRef.current);

      cleanup = () => {
        p5InstanceRef.current?.remove();
        p5InstanceRef.current = null;
        ro.disconnect();
      };
    });

    return () => cleanup?.();
  }, [isBrowser]);

  if (!isBrowser) return null;

  return (
    <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
      <div
        ref={canvasRef}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      />
    </div>
  );
};

export default LorentzCanvas;
