// app/projects/cad/content.tsx
'use client';

import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { useThemeContext } from '@/context/ThemeContext';

interface Creation {
  id: number;
  title: string;
  description: string;
  modelPath: string;
  tags?: string[];
  minDistance?: number;
  maxDistance?: number;
  ambientLightIntensity?: number;
  mainDirectionalLightIntensity?: number;
  fillLightIntensity?: number;
  pointLightIntensity?: number;
  xOffset?: number;
  yOffset?: number;
  zOffset?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  cameraX?: number;
  cameraY?: number;
  cameraZ?: number;
}

const creations: Creation[] = [
  {
    id: 1,
    title: 'Bass Pedalboard',
    tags: ['Wood', '3D Print'],
    description:
      'A custom pedalboard designed specifically for bassists. Combines functionality and aesthetics with a clean design for optimal pedal organization. Robust chassis guarantees durability during concerts and rehearsals. Made from wood cuts and PLA 3D prints.',
    modelPath: '/models/Bass Pedalboard.fbx',
    minDistance: 3,
    maxDistance: 4,
    ambientLightIntensity: 1.0,
    mainDirectionalLightIntensity: 2.0,
    fillLightIntensity: 1.0,
    pointLightIntensity: 0.4,
    xOffset: 0,
    yOffset: -0.3,
    zOffset: 0,
    rotationX: -Math.PI / 2,
    rotationY: 0,
    rotationZ: 0,
    cameraX: 5,
    cameraY: 5,
    cameraZ: 5,
  },
  {
    id: 2,
    title: 'Custom Arcade Machine',
    tags: ['Wood', '3D Print', 'Electronics'],
    description:
      'A fully custom arcade cabinet blending retro 80s charm with modern tech. Features an HD display, precise controls, and authentic design. Vintage aesthetics meets technical innovation. Built from wood cuts, custom stickers, 3D-printed edge trims and plexiglass screen guard.',
    modelPath: '/models/Borne.glb',
    minDistance: 6,
    maxDistance: 10,
    ambientLightIntensity: 1.0,
    mainDirectionalLightIntensity: 2.0,
    fillLightIntensity: 1.0,
    pointLightIntensity: 0.4,
    xOffset: 0,
    yOffset: 0,
    zOffset: 0,
    rotationX: -Math.PI / 2,
    rotationY: 0,
    rotationZ: 0,
    cameraX: -5,
    cameraY: 1,
    cameraZ: 0.7,
  },
  {
    id: 3,
    title: 'Branch Cutter',
    tags: ['Mechanical', 'Fusion 360'],
    description:
      'A mechanical engineering project: modelling, study and virtual realization of a manual branch-cutting tool, with a full kinematic and force dynamics analysis.',
    modelPath: '/models/Coupe Branches.fbx',
    minDistance: 1,
    maxDistance: 2,
    ambientLightIntensity: 1.0,
    mainDirectionalLightIntensity: 2.0,
    fillLightIntensity: 1.0,
    pointLightIntensity: 0.4,
    xOffset: 0,
    yOffset: 0,
    zOffset: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    cameraX: 0.2,
    cameraY: 0.2,
    cameraZ: 2,
  },
];

const useContainerSize = (ref: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState({ width: 600, height: 400 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.round(e.contentRect.width);
        setSize({ width: w, height: Math.round(w * (2 / 3)) });
      }
    });
    ro.observe(ref.current);
    const w = ref.current.offsetWidth;
    setSize({ width: w, height: Math.round(w * (2 / 3)) });
    return () => ro.disconnect();
  }, [ref]);
  return size;
};

const Model3D: React.FC<{ creation: Creation }> = ({ creation }) => {
  const { theme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { width, height } = useContainerSize(containerRef);

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(
      creation.cameraX ?? 0,
      creation.cameraY ?? 0,
      creation.cameraZ ?? 5,
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    canvasContainerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(
      new THREE.AmbientLight(0x808080, creation.ambientLightIntensity ?? 3),
    );
    const dirLight = new THREE.DirectionalLight(
      0xffffff,
      creation.mainDirectionalLightIntensity ?? 4,
    );
    dirLight.position.set(10, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      creation.fillLightIntensity ?? 2,
    );
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);
    const pointLight = new THREE.PointLight(
      0xffffff,
      creation.pointLightIntensity ?? 2.4,
      100,
    );
    pointLight.position.set(0, 5, 3);
    scene.add(pointLight);

    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.08;
    controls.minDistance = creation.minDistance ?? 1;
    controls.maxDistance = creation.maxDistance ?? 5;

    const loadModel = (object: THREE.Object3D, scalarScale: number) => {
      object.scale.setScalar(scalarScale);
      object.rotation.set(
        creation.rotationX ?? 0,
        creation.rotationY ?? 0,
        creation.rotationZ ?? 0,
      );
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(object);
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      object.position.x += creation.xOffset ?? 0;
      object.position.y += creation.yOffset ?? 0;
      object.position.z += creation.zOffset ?? 0;
      const finalBox = new THREE.Box3().setFromObject(object);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.25 }),
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = finalBox.min.y;
      plane.receiveShadow = true;
      scene.add(plane);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    const ext = creation.modelPath.split('.').pop()?.toLowerCase();
    if (ext === 'fbx') {
      new FBXLoader().load(
        creation.modelPath,
        (fbx) => loadModel(fbx, 0.01),
        undefined,
        console.error,
      );
    } else if (ext === 'glb' || ext === 'gltf') {
      new GLTFLoader().load(
        creation.modelPath,
        (gltf) => loadModel(gltf.scene, 10),
        undefined,
        console.error,
      );
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      (controls as any).dispose?.();
      canvasContainerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [creation, width, height]);

  useEffect(() => {
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [width, height]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 600 }}>
      <div
        ref={canvasContainerRef}
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
          backgroundColor: theme === 'dark' ? '#0a0a0c' : '#f0ede8',
        }}
      />
      <Typography
        sx={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.65rem',
          color: 'var(--foreground-muted)',
          textAlign: 'center',
          mt: 0.75,
          letterSpacing: '0.06em',
        }}
      >
        Drag to rotate · Scroll to zoom
      </Typography>
    </div>
  );
};

export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
        <span className="section-label">Design · Fusion 360</span>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 1,
          }}
        >
          3D Creations
        </Typography>
        <Typography
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Physical projects designed with Fusion 360 — from CAD to real-world
          builds.
        </Typography>
      </Box>

      {/* Creations */}
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        {creations.map((creation, index) => (
          <Box
            key={creation.id}
            sx={{
              display: 'flex',
              flexDirection: index % 2 === 1 ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 4,
              py: 5,
              borderBottom:
                index < creations.length - 1
                  ? '1px solid var(--card-border)'
                  : 'none',
              '@media (max-width: 900px)': {
                flexDirection: 'column',
                gap: 2.5,
              },
              animation: 'fadeInUp 0.6s ease both',
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {/* 3D Viewer */}
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: '55%' },
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Model3D creation={creation} />
            </Box>

            {/* Text */}
            <Box sx={{ flex: 1 }}>
              {/* Tags */}
              {creation.tags && (
                <Box
                  sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}
                >
                  {creation.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </Box>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  mb: 1.5,
                }}
              >
                {creation.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.7,
                  color: 'var(--foreground-2)',
                  fontSize: '0.95rem',
                }}
              >
                {creation.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
