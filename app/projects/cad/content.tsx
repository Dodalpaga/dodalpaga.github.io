import * as React from 'react';
import { useRef, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

const loader: FBXLoader = new FBXLoader();

// Interface pour les données de vos créations
interface Creation {
  id: number;
  title: string;
  description: string;
  modelPath: string;
  minDistance?: number;
  maxDistance?: number;
  ambientLightIntensity?: number;
  mainDirectionalLightIntensity?: number;
  fillLightIntensity?: number;
  pointLightIntensity?: number;
  xOffset?: number; // Décalage en X (défaut: 0)
  yOffset?: number; // Décalage en Y (défaut: 0)
  zOffset?: number; // Décalage en Z (défaut: 0)
}

// Données d'exemple - remplacez par vos vraies créations
const creations: Creation[] = [
  {
    id: 1,
    title: 'Bass Pedalboard',
    description:
      "Un pedalboard personnalisé conçu spécifiquement pour les bassistes. Cette création combine fonctionnalité et esthétisme avec un design épuré permettant une organisation optimale des pédales d'effets. Chaque détail a été pensé pour faciliter les changements d'effets en live tout en maintenant une stabilité parfaite. Le châssis robuste garantit une durabilité à toute épreuve lors des concerts et répétitions. Fait à partir de découpes de bois et d'impression 3D plastique.",
    modelPath: '/models/Pedalboard.fbx',
    minDistance: 3,
    maxDistance: 4,
    ambientLightIntensity: 1.0,
    mainDirectionalLightIntensity: 2.0,
    fillLightIntensity: 1.0,
    pointLightIntensity: 0.4,
    xOffset: 0, // Décalage par défaut
    yOffset: 0.5, // Décalage par défaut
    zOffset: 0, // Décalage par défaut
  },
  {
    id: 2,
    title: 'Custom Arcade Machine',
    description:
      "Une borne d'arcade entièrement personnalisée qui marie le charme rétro des années 80 avec les technologies modernes. Cette création unique propose une expérience de jeu immersive avec son écran haute définition, ses contrôles précis et son design authentique. L'esthétique vintage rencontre l'innovation technique pour créer un objet à la fois fonctionnel et décoratif, parfait pour les passionnés de gaming rétro.",
    modelPath: '/models/Borne.fbx',
    minDistance: 6,
    maxDistance: 10,
    ambientLightIntensity: 1.0,
    mainDirectionalLightIntensity: 2.0,
    fillLightIntensity: 1.0,
    pointLightIntensity: 0.4,
    xOffset: 0, // Décalage par défaut
    yOffset: 0, // Décalage par défaut
    zOffset: 0, // Décalage par défaut
  },
];

// Composant pour afficher un modèle 3D
const Model3D: React.FC<{
  creation: Creation;
  width: number;
  height: number;
}> = ({ creation, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<TrackballControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration de la scène
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Configuration de la caméra
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Configuration du renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Éclairage avec intensités spécifiques à la création
    const ambientLight = new THREE.AmbientLight(
      0x404040,
      creation.ambientLightIntensity ?? 3.0
    );
    scene.add(ambientLight);

    const mainDirectionalLight = new THREE.DirectionalLight(
      0xffffff,
      creation.mainDirectionalLightIntensity ?? 4.0
    );
    mainDirectionalLight.position.set(10, 10, 5);
    mainDirectionalLight.castShadow = true;
    mainDirectionalLight.shadow.mapSize.width = 2048;
    mainDirectionalLight.shadow.mapSize.height = 2048;
    scene.add(mainDirectionalLight);

    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      creation.fillLightIntensity ?? 2.0
    );
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(
      0xffffff,
      creation.pointLightIntensity ?? 2.4,
      100
    );
    pointLight.position.set(0, 5, 3);
    // pointLight.castShadow = true;
    scene.add(pointLight);

    // Configuration des contrôles TrackballControls
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noRotate = false;
    controls.noZoom = false;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.05;
    controls.minDistance = creation.minDistance ?? 1;
    controls.maxDistance = creation.maxDistance ?? 5;
    controlsRef.current = controls;

    // Chargement du modèle FBX
    loader.load(
      creation.modelPath,
      (fbx: THREE.Group) => {
        fbx.scale.setScalar(0.01);
        fbx.rotation.x = -Math.PI / 2;

        fbx.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(fbx);

        // Centrage automatique du modèle
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        fbx.position.sub(center);

        // Ajuste la position Y pour que le bas du modèle touche le plan
        const minY = box.min.y;

        // Appliquer les décalages X, Y, Z depuis la configuration
        fbx.position.x += creation.xOffset ?? 0;
        fbx.position.y += creation.yOffset ?? 0;
        fbx.position.z += creation.zOffset ?? 0;

        // Calculer la position finale réelle du bas du modèle
        const finalModelBox = new THREE.Box3().setFromObject(fbx);
        const actualBottomY = finalModelBox.min.y;

        // Créer les plans pour les ombres
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = actualBottomY;
        plane.receiveShadow = true;
        scene.add(plane);

        const planeGeometry2 = new THREE.PlaneGeometry(20, 20);
        const planeMaterial2 = new THREE.ShadowMaterial({ opacity: 0.3 });
        const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
        plane2.rotation.x = -Math.PI / 2;
        plane2.position.y = actualBottomY;
        plane2.receiveShadow = true;
        scene.add(plane2);

        // Ajouter l'AxesHelper pour afficher les axes X, Y, Z
        // const axesHelper = new THREE.AxesHelper(
        //   Math.max(size.x, size.y, size.z) * 0.5
        // );
        // axesHelper.position.set(0, 0, 0); // Axes à l'origine pour référence
        // scene.add(axesHelper);

        // Ajuste la position initiale de la caméra
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2;
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);

        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error: unknown) => {
        console.error('Erreur de chargement du modèle:', error);
      }
    );

    // Boucle d'animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Nettoyage
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (controlsRef.current) {
        (controlsRef.current as any).dispose();
        controlsRef.current.removeEventListener('start', () => {});
        controlsRef.current.removeEventListener('end', () => {});
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [creation, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    />
  );
};

// Composant pour une ligne de création
const CreationRow: React.FC<{ creation: Creation; isReversed: boolean }> = ({
  creation,
  isReversed,
}) => {
  const modelWidth = 600;
  const modelHeight = 400;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isReversed ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 4,
        mb: 2,
        width: '100%',
        '@media (max-width: 1000px)': {
          flexDirection: 'column',
          gap: 2,
        },
      }}
    >
      {/* Modèle 3D */}
      <Box sx={{ flexShrink: 0 }}>
        <Model3D creation={creation} width={modelWidth} height={modelHeight} />
      </Box>

      {/* Contenu textuel */}
      <Box
        sx={{
          flex: 1,
          px: 2,
          '@media (max-width: 768px)': {
            px: 0,
            textAlign: 'center',
          },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          {creation.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.6,
            fontSize: '1.1rem',
          }}
        >
          {creation.description}
        </Typography>
      </Box>
    </Box>
  );
};

// Composant principal
export default function Content() {
  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      {/* En-tête */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
          }}
        >
          Mes Créations 3D
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '1.2rem',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Découvrez mes créations réalisées avec Fusion 360. Chaque projet
          reflète ma passion pour la conception 3D et l&#39;innovation.
        </Typography>
      </Box>

      {/* Grille des créations */}
      <Box>
        {creations.map((creation, index) => (
          <CreationRow
            key={creation.id}
            creation={creation}
            isReversed={index % 2 === 1}
          />
        ))}
      </Box>
    </Container>
  );
}
