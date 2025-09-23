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
  modelPath: string; // Chemin vers votre fichier FBX
  minDistance?: number; // Zoom minimum (distance caméra)
  maxDistance?: number; // Zoom maximum (distance caméra)
  ambientLightIntensity?: number; // Intensité lumière ambiante
  mainDirectionalLightIntensity?: number; // Intensité lumière directionnelle principale
  fillLightIntensity?: number; // Intensité lumière de remplissage
  pointLightIntensity?: number; // Intensité lumière ponctuelle
  planeYPosition: number; // Position Y du plan pour les ombres
  secondPlaneYPosition?: number; // Position Y du second plan pour les ombres
}

// Données d'exemple - remplacez par vos vraies créations
const creations: Creation[] = [
  {
    id: 1,
    title: 'Bass Pedalboard',
    description:
      "Un pedalboard personnalisé conçu spécifiquement pour les bassistes. Cette création combine fonctionnalité et esthétisme avec un design épuré permettant une organisation optimale des pédales d'effets. Chaque détail a été pensé pour faciliter les changements d'effets en live tout en maintenant une stabilité parfaite. Le châssis robuste garantit une durabilité à toute épreuve lors des concerts et répétitions.",
    modelPath: '/models/Pedalboard.fbx',
    minDistance: 2,
    maxDistance: 5,
    ambientLightIntensity: 3.0,
    mainDirectionalLightIntensity: 4.0,
    fillLightIntensity: 2.0,
    pointLightIntensity: 2.4,
    planeYPosition: 0,
    secondPlaneYPosition: -0.7,
  },
  {
    id: 2,
    title: 'Custom Arcade Machine',
    description:
      "Une borne d'arcade entièrement personnalisée qui marie le charme rétro des années 80 avec les technologies modernes. Cette création unique propose une expérience de jeu immersive avec son écran haute définition, ses contrôles précis et son design authentique. L'esthétique vintage rencontre l'innovation technique pour créer un objet à la fois fonctionnel et décoratif, parfait pour les passionnés de gaming rétro.",
    modelPath: '/models/Borne.fbx',
    minDistance: 6, // Plus loin pour un modèle potentiellement plus grand
    maxDistance: 10, // Zoom out plus important
    ambientLightIntensity: 2.5, // Légèrement réduit pour éviter le sur-éclairage
    mainDirectionalLightIntensity: 3.5, // Réduit pour balance
    fillLightIntensity: 1.5, // Réduit
    pointLightIntensity: 2.0, // Réduit
    planeYPosition: -1.5, // Plus bas pour un modèle plus grand
    secondPlaneYPosition: -0.7,
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
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Configuration des contrôles TrackballControls pour une rotation libre
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noRotate = false;
    controls.noZoom = false;
    controls.noPan = true; // Pan désactivé
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.05;
    controls.minDistance = creation.minDistance ?? 1; // Zoom minimum spécifique
    controls.maxDistance = creation.maxDistance ?? 5; // Zoom maximum spécifique
    controlsRef.current = controls;

    // Chargement du modèle FBX
    loader.load(
      creation.modelPath,
      (fbx: THREE.Group) => {
        fbx.scale.setScalar(0.01); // Ajustez selon la taille de vos modèles

        // Rotation de 90° en arrière autour de l'axe X pour aligner le "front" vers l'avant (positif Z)
        fbx.rotation.x = -Math.PI / 2;

        // Configuration des ombres pour tous les meshes
        fbx.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(fbx);

        // Centrage automatique du modèle pour ajuster le centre de rotation
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        fbx.position.sub(center); // Centre le modèle à l'origine

        // Ajuste la position Y pour que le bas du modèle touche le plan
        const minY = box.min.y; // Bas du modèle après rotation et centrage
        fbx.position.y -= minY - creation.planeYPosition;

        // Calculer la position finale réelle du bas du modèle
        const finalModelBox = new THREE.Box3().setFromObject(fbx);
        const actualBottomY = finalModelBox.min.y;

        // Créer les plans APRÈS avoir positionné le modèle, à la position réelle du bas du modèle
        // Premier plan de sol invisible pour recevoir les ombres
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = actualBottomY; // Position réelle du bas du modèle
        plane.receiveShadow = true;
        scene.add(plane);

        // Second plan de sol invisible pour recevoir les ombres (même position)
        const planeGeometry2 = new THREE.PlaneGeometry(20, 20);
        const planeMaterial2 = new THREE.ShadowMaterial({ opacity: 0.3 });
        const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
        plane2.rotation.x = -Math.PI / 2;
        plane2.position.y = actualBottomY; // Même position que plane
        plane2.receiveShadow = true;
        scene.add(plane2);

        // Ajuste la position initiale de la caméra en fonction de la taille du modèle
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2; // Légère marge
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);

        // Définit le centre de rotation (target) des contrôles à l'origine
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
        mb: 6,
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
            color: '#333',
            fontWeight: 600,
            mb: 2,
          }}
        >
          {creation.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#666',
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
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            mb: 2,
            color: '#333',
            fontWeight: 700,
          }}
        >
          Mes Créations 3D
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: '#666',
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
