// components/ProcessingCanvas.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const sketch = (p: p5) => {
  let x = 0.01;
  let y = 0;
  let z = 0;

  // Parameters for the Lorenz system
  const a = 10;
  const b = 28;
  const c = 8.0 / 3.0;

  // Array to store points
  const points: p5.Vector[] = [];

  // Camera properties
  let camAngleX = 0;
  let camAngleY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let isRotating = false;
  let dezoomFactor = 1; // Initialize dezoom factor

  // Store the canvas element
  let canvasParent: HTMLElement | null = null;

  const resizeCanvasToParent = () => {
    if (canvasParent) {
      const parentWidth = canvasParent.offsetWidth;
      const parentHeight = canvasParent.offsetHeight;

      // Set canvas width to 1/3 of the parent's width and full height
      p.resizeCanvas(parentWidth, parentHeight);

      // Adjust dezoom factor based on the canvas width
      dezoomFactor = parentWidth / 600; // Assuming 600 was the original fixed width
    }
  };

  p.setup = () => {
    // Create the canvas and set its size to 1/3 of parent's width and full height
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    canvasParent = canvas.elt.parentElement; // Get the parent element of the canvas

    resizeCanvasToParent();

    p.colorMode(p.HSB);
    p.background('#E4E8E8');
    p.noCursor(); // Hide the cursor
  };

  p.draw = () => {
    p.clear();
    const dt = 0.01;
    const dx = a * (y - x) * dt;
    const dy = (x * (b - z) - y) * dt;
    const dz = (x * y - c * z) * dt;
    x += dx;
    y += dy;
    z += dz;

    points.push(p.createVector(x, y, z));

    // Camera position using spherical coordinates
    const radius = 600; // Fixed distance from the origin
    const eyeX = radius * Math.sin(camAngleY) * Math.cos(camAngleX);
    const eyeY = radius * Math.sin(camAngleX);
    const eyeZ = radius * Math.cos(camAngleY) * Math.cos(camAngleX);

    p.camera(
      eyeX,
      eyeY,
      eyeZ, // Camera position
      0,
      0,
      0, // LookAt position
      0,
      1,
      0 // Up vector
    );

    p.translate(0, 0, -150);
    p.scale(5 * dezoomFactor);
    p.stroke(255);
    p.noFill();

    let hu = 0;
    p.beginShape();
    for (const v of points) {
      p.stroke(hu, 255, 255);
      p.vertex(v.x, v.y, v.z);
      hu += 0.1;
      if (hu > 255) {
        hu = 0;
      }
    }
    p.endShape();
  };

  p.mousePressed = () => {
    lastMouseX = p.mouseX;
    lastMouseY = p.mouseY;

    // Check which mouse button is pressed
    if (p.mouseButton === p.LEFT) {
      isRotating = true;
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

const LorentzCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a new p5 instance
    p5InstanceRef.current = new p5(sketch, canvasRef.current);

    // Resize canvas when parent container resizes
    const resizeObserver = new ResizeObserver(() => {
      p5InstanceRef.current?.resizeCanvas(
        canvasRef.current?.offsetWidth ? canvasRef.current?.offsetWidth : 0,
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

export default LorentzCanvas;
