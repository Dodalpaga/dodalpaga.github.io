import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function HDRSceneWithControls() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    const { clientWidth, clientHeight } = containerRef.current;
    renderer.setSize(clientWidth, clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    // OrbitControls for camera rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false; // can be toggled in GUI if desired

    // Geometry
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 128, 1, 3);
    const material = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0,
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    // GUI parameters
    const params = {
      metalness: 1,
      roughness: 0,
      exposure: 5,
      autoRotate: true,
    };

    // Apply them to material and renderer
    material.metalness = params.metalness;
    material.roughness = params.roughness;
    renderer.toneMappingExposure = params.exposure;
    controls.autoRotate = params.autoRotate;

    // GUI overlay
    const gui = new GUI({ container: containerRef.current });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '1';
    gui
      .add(params, 'metalness', 0, 1, 0.01)
      .onChange((v) => (material.metalness = v));
    gui
      .add(params, 'roughness', 0, 1, 0.01)
      .onChange((v) => (material.roughness = v));
    gui
      .add(params, 'exposure', 1, 5, 0.01)
      .onChange((v) => (renderer.toneMappingExposure = v));
    gui.add(params, 'autoRotate').onChange((v) => (controls.autoRotate = v));

    // HDR Loader
    const loader = new HDRLoader();
    loader.load('/hdri/HDR_silver_and_gold_nebulae.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });

    // Animation loop
    const animate = () => {
      controls.update(); // required for damping & autoRotate
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const onResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gui.destroy();
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        position: 'relative', // keep relative for GUI overlay
      }}
    >
      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%', // or '100%' if parent controls width
          height: '100%', // set an explicit height or parent-controlled
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </Container>
  );
}
