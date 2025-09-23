import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import Container from '@mui/material/Container';

export default function HDRSceneWithControls() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
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
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Scene
    const scene = new THREE.Scene();
    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      clientWidth / clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);
    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false;
    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const lensingShader = {
      uniforms: {
        tDiffuse: { value: null },
        rs: { value: 0.1 },
        strength: { value: 0.025 },
        exposure: { value: 1.0 },
        aspect: { value: clientWidth / clientHeight }, // Add aspect ratio
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float rs;
        uniform float strength;
        uniform float exposure;
        uniform float aspect;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          p.x *= aspect; // Adjust for canvas aspect ratio
          float r = length(p);
          if (r < rs) {
            vec4 color = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(color.rgb * exposure * 0.1, 1.0); // Dimmed center
          } else {
            float factor = 1.0 - strength / (r * r);
            vec2 dp = p * factor;
            dp.x /= aspect; // Reverse aspect correction for texture lookup
            vec2 duv = 0.5 + dp;
            vec4 color = texture2D(tDiffuse, duv);
            gl_FragColor = vec4(color.rgb * exposure, 1.0); // Apply exposure
          }
        }
      `,
    };
    const lensingPass = new ShaderPass(lensingShader);
    composer.addPass(lensingPass);
    // GUI parameters
    const params = {
      rs: 0.1,
      strength: 0.025,
      exposure: 5.0,
      autoRotate: false,
    };
    // Apply initial parameters
    lensingPass.uniforms.rs.value = params.rs;
    lensingPass.uniforms.strength.value = params.strength;
    lensingPass.uniforms.exposure.value = params.exposure;
    lensingPass.uniforms.aspect.value = clientWidth / clientHeight;
    renderer.toneMappingExposure = params.exposure;
    controls.autoRotate = params.autoRotate;
    // GUI overlay
    const gui = new GUI({ container: containerRef.current });
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '1';
    gui
      .add(params, 'rs', 0, 0.2, 0.01)
      .name('Black Hole Radius')
      .onChange((v) => (lensingPass.uniforms.rs.value = v));
    gui
      .add(params, 'strength', 0, 0.05, 0.001)
      .name('Lensing Strength')
      .onChange((v) => (lensingPass.uniforms.strength.value = v));
    gui
      .add(params, 'exposure', 2, 10, 0.01)
      .name('Exposure')
      .onChange((v) => {
        lensingPass.uniforms.exposure.value = v;
        renderer.toneMappingExposure = v;
      });
    gui.add(params, 'autoRotate').onChange((v) => (controls.autoRotate = v));
    // HDR Loader
    const loader = new RGBELoader();
    loader.load('/hdri/HDR_silver_and_gold_nebulae.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.LinearSRGBColorSpace;
      scene.background = texture;
      scene.environment = texture;
    });
    // Animation loop
    const animate = () => {
      controls.update();
      composer.render();
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
      composer.setSize(clientWidth, clientHeight);
      lensingPass.uniforms.aspect.value = clientWidth / clientHeight; // Update aspect ratio
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
        position: 'relative',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
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
