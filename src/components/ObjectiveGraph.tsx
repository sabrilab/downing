import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Project, Objective, Requirement } from '@/types';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'framer-motion';

interface Props {
  project: Project;
  onObjectiveHover?: (id: string | null) => void;
  onRequirementHover?: (id: string | null) => void;
}

const levelColors: Record<string, number> = {
  remembering: 0x4299e1,   // Blue
  understanding: 0x48bb78, // Green
  applying: 0xecc94b,     // Yellow
  analyzing: 0xed8936,    // Orange
  evaluating: 0xe53e3e,   // Red
  creating: 0x805ad5,     // Purple
};

const dimensionColors: Record<string, number> = {
  facts: 0x718096,      // Gray
  concepts: 0x4a5568,   // Dark Gray
  processes: 0x2d3748,  // Darker Gray
  procedures: 0x1a202c, // Almost Black
  principles: 0x2c5282, // Blue Gray
  metacognitive: 0x2b6cb0, // Blue
};

export default function ObjectiveGraph({ project, onObjectiveHover, onRequirementHover }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const spheresRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const linesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const frameRef = useRef<number>();
  const centralSphereRef = useRef<THREE.Mesh | null>(null);
  const { theme } = useTheme();
  const [isInteracting, setIsInteracting] = useState(false);

  const calculateObjectivePosition = (node: Objective, nodes: Objective[], parentPosition?: THREE.Vector3): THREE.Vector3 => {
    const baseRadius = 300;
    const childRadius = 150;
    const childSpread = Math.PI / 4;

    if (!node.parentId) {
      const rootNodes = nodes.filter(n => !n.parentId);
      const index = rootNodes.findIndex(n => n.id === node.id);
      const totalRoots = rootNodes.length;
      const angle = (index / totalRoots) * Math.PI * 2;
      
      return new THREE.Vector3(
        Math.cos(angle) * baseRadius,
        Math.sin(angle) * baseRadius * 0.5 + 200, // Move objectives up
        Math.sin(angle) * baseRadius
      );
    } else if (parentPosition) {
      const siblings = nodes.filter(n => n.parentId === node.parentId);
      const index = siblings.findIndex(n => n.id === node.id);
      const totalSiblings = siblings.length;
      
      const angleOffset = (index - (totalSiblings - 1) / 2) * childSpread;
      const parentDir = parentPosition.clone().normalize();
      
      const perpVector = new THREE.Vector3(1, 0, 0);
      if (Math.abs(parentDir.dot(perpVector)) > 0.9) {
        perpVector.set(0, 1, 0);
      }
      
      const rotationAxis = parentDir.clone().cross(perpVector).normalize();
      const childPos = parentPosition.clone()
        .normalize()
        .multiplyScalar(childRadius)
        .applyAxisAngle(rotationAxis, angleOffset);
      
      return parentPosition.clone().add(childPos);
    }
    
    return new THREE.Vector3();
  };

  const calculateRequirementPosition = (node: Requirement, nodes: Requirement[], parentPosition?: THREE.Vector3): THREE.Vector3 => {
    const baseRadius = 300;
    const childRadius = 150;
    const childSpread = Math.PI / 4;

    if (!node.parentId) {
      const rootNodes = nodes.filter(n => !n.parentId);
      const index = rootNodes.findIndex(n => n.id === node.id);
      const totalRoots = rootNodes.length;
      const angle = (index / totalRoots) * Math.PI * 2;
      
      return new THREE.Vector3(
        Math.cos(angle) * baseRadius,
        Math.sin(angle) * baseRadius * -0.5 - 200, // Move requirements down
        Math.sin(angle) * baseRadius
      );
    } else if (parentPosition) {
      const siblings = nodes.filter(n => n.parentId === node.parentId);
      const index = siblings.findIndex(n => n.id === node.id);
      const totalSiblings = siblings.length;
      
      const angleOffset = (index - (totalSiblings - 1) / 2) * childSpread;
      const parentDir = parentPosition.clone().normalize();
      
      const perpVector = new THREE.Vector3(1, 0, 0);
      if (Math.abs(parentDir.dot(perpVector)) > 0.9) {
        perpVector.set(0, 1, 0);
      }
      
      const rotationAxis = parentDir.clone().cross(perpVector).normalize();
      const childPos = parentPosition.clone()
        .normalize()
        .multiplyScalar(childRadius)
        .applyAxisAngle(rotationAxis, angleOffset);
      
      return parentPosition.clone().add(childPos);
    }
    
    return new THREE.Vector3();
  };

  const createGlowingConnection = (start: THREE.Vector3, end: THREE.Vector3, scene: THREE.Scene, isRequirement: boolean = false) => {
    const direction = end.clone().sub(start);
    const distance = direction.length();
    const midPoint = start.clone().add(end).multiplyScalar(0.5);
    
    const control = midPoint.clone().add(new THREE.Vector3(0, distance * 0.2, 0));
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    
    const points = curve.getPoints(50);
    const geometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      64,
      2,
      8,
      false
    );
    
    const material = new THREE.MeshPhongMaterial({
      color: isRequirement ? 0xff8866 : 0x88ccff,
      transparent: true,
      opacity: 0.3,
      emissive: isRequirement ? 0xaa4422 : 0x4477aa,
      emissiveIntensity: 0.5,
    });
    
    const tube = new THREE.Mesh(geometry, material);
    scene.add(tube);
    return tube;
  };

  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8);
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2);
    }
  };

  const handleReset = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(1000, 1000, 1000);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.reset();
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(1000, 1000, 1000);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.addEventListener('start', () => setIsInteracting(true));
    controls.addEventListener('end', () => setIsInteracting(false));
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1000, 0);
    scene.add(directionalLight);

    // Create central sphere (project)
    const centralGeometry = new THREE.IcosahedronGeometry(50, 2);
    const centralMaterial = new THREE.MeshPhysicalMaterial({
      color: theme === 'dark' ? 0xffffff : 0x000000,
      metalness: 0.9,
      roughness: 0.1,
      transmission: 0.2,
      thickness: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: new THREE.Color(project.color),
      emissiveIntensity: 0.5,
    });
    const centralSphere = new THREE.Mesh(centralGeometry, centralMaterial);
    centralSphere.userData.isProjectSphere = true;
    scene.add(centralSphere);
    centralSphereRef.current = centralSphere;

    // Create nodes maps
    const objectiveNodes = new Map<string, { position: THREE.Vector3; node: Objective }>();
    const requirementNodes = new Map<string, { position: THREE.Vector3; node: Requirement }>();

    // Position root objectives
    project.objectives
      .filter(obj => !obj.parentId)
      .forEach(obj => {
        const position = calculateObjectivePosition(obj, project.objectives);
        objectiveNodes.set(obj.id, { position, node: obj });
      });

    // Position child objectives
    project.objectives
      .filter(obj => obj.parentId)
      .forEach(obj => {
        const parentPos = objectiveNodes.get(obj.parentId)?.position;
        if (parentPos) {
          const position = calculateObjectivePosition(obj, project.objectives, parentPos);
          objectiveNodes.set(obj.id, { position, node: obj });
        }
      });

    // Position root requirements
    project.requirements
      .filter(req => !req.parentId)
      .forEach(req => {
        const position = calculateRequirementPosition(req, project.requirements);
        requirementNodes.set(req.id, { position, node: req });
      });

    // Position child requirements
    project.requirements
      .filter(req => req.parentId)
      .forEach(req => {
        const parentPos = requirementNodes.get(req.parentId)?.position;
        if (parentPos) {
          const position = calculateRequirementPosition(req, project.requirements, parentPos);
          requirementNodes.set(req.id, { position, node: req });
        }
      });

    // Create spheres and connections for objectives
    objectiveNodes.forEach(({ position, node }) => {
      const geometry = new THREE.SphereGeometry(25 - (node.parentId ? 5 : 0), 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: levelColors[node.level],
        metalness: 0.3,
        roughness: 0.7,
        transmission: 0.1,
        thickness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.5,
        emissive: new THREE.Color(dimensionColors[node.dimension]).multiplyScalar(0.5),
        emissiveIntensity: 0.3,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      sphere.userData.id = node.id;
      sphere.userData.type = 'objective';
      sphere.userData.number = node.number;
      scene.add(sphere);
      spheresRef.current.set(node.id, sphere);

      if (node.parentId) {
        const parentPos = objectiveNodes.get(node.parentId)?.position;
        if (parentPos) {
          const connection = createGlowingConnection(parentPos, position, scene);
          linesRef.current.set(`${node.parentId}-${node.id}`, connection);
        }
      } else {
        const connection = createGlowingConnection(new THREE.Vector3(), position, scene);
        linesRef.current.set(`center-${node.id}`, connection);
      }
    });

    // Create spheres and connections for requirements
    requirementNodes.forEach(({ position, node }) => {
      const geometry = new THREE.SphereGeometry(25 - (node.parentId ? 5 : 0), 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: levelColors[node.level],
        metalness: 0.3,
        roughness: 0.7,
        transmission: 0.1,
        thickness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.5,
        emissive: new THREE.Color(dimensionColors[node.dimension]).multiplyScalar(0.5),
        emissiveIntensity: 0.3,
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(position);
      sphere.userData.id = node.id;
      sphere.userData.type = 'requirement';
      sphere.userData.number = node.number;
      scene.add(sphere);
      spheresRef.current.set(node.id, sphere);

      if (node.parentId) {
        const parentPos = requirementNodes.get(node.parentId)?.position;
        if (parentPos) {
          const connection = createGlowingConnection(parentPos, position, scene, true);
          linesRef.current.set(`${node.parentId}-${node.id}`, connection);
        }
      } else {
        const connection = createGlowingConnection(new THREE.Vector3(), position, scene, true);
        linesRef.current.set(`center-${node.id}`, connection);
      }
    });

    const updateConnectionsOpacity = (hoveredId: string | null, type: 'objective' | 'requirement' | null) => {
      linesRef.current.forEach((connection, key) => {
        const [sourceId, targetId] = key.split('-');
        const material = connection.material as THREE.MeshPhongMaterial;
        
        if (!hoveredId) {
          material.opacity = 0.3;
          material.emissiveIntensity = 0.3;
          return;
        }
        
        const isConnected = sourceId === hoveredId || targetId === hoveredId;
        material.opacity = isConnected ? 0.8 : 0.1;
        material.emissiveIntensity = isConnected ? 0.8 : 0.1;
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (centralSphereRef.current) {
        centralSphereRef.current.rotation.y += 0.005;
        centralSphereRef.current.rotation.z += 0.002;
      }

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(spheresRef.current.values())
      );

      spheresRef.current.forEach((sphere) => {
        const material = sphere.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 0.3;
      });

      if (intersects.length > 0) {
        const hoveredSphere = intersects[0].object;
        const material = hoveredSphere.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 0.8;
        
        if (hoveredSphere.userData.type === 'objective') {
          onObjectiveHover?.(hoveredSphere.userData.id);
          onRequirementHover?.(null);
        } else {
          onRequirementHover?.(hoveredSphere.userData.id);
          onObjectiveHover?.(null);
        }
        
        updateConnectionsOpacity(hoveredSphere.userData.id, hoveredSphere.userData.type);
      } else {
        onObjectiveHover?.(null);
        onRequirementHover?.(null);
        updateConnectionsOpacity(null, null);
      }

      if (!isInteracting) {
        spheresRef.current.forEach((sphere) => {
          sphere.rotation.y += 0.01;
        });
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [project, theme, onObjectiveHover, onRequirementHover, isInteracting]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[600px] bg-transparent relative">
      <motion.div 
        className="absolute bottom-4 right-4 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-background/50 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-background/50 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-background/50 backdrop-blur-sm"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}