"use client";

import { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { generateInterior } from "@/lib/interior-generator";
import { getFloorPlan } from "@/lib/floor-plans";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { SceneFrame } from "@/components/three/scene-frame";

type Props = {
  sectionRef: React.RefObject<HTMLElement | null>;
  bhk: string;
  carpetAreaSqFt: number;
};

// Scratch objects for useFrame
const dummy = new THREE.Object3D();
const vLook = new THREE.Vector3();
const vPos = new THREE.Vector3();
const WALL_HEIGHT = 3.0; // 3 meters tall

export function ApartmentInteriorScene({ sectionRef, bhk, carpetAreaSqFt }: Props) {
  const plan = getFloorPlan(bhk);
  
  const { walls, gridToMeters, waypoints, offsetX, offsetZ, width, height } = useMemo(
    () => generateInterior(plan, carpetAreaSqFt),
    [plan, carpetAreaSqFt]
  );

  const spline = useMemo(() => new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5), [waypoints]);
  const scrollProgress = useScrollProgress(sectionRef);

  // Instanced walls
  const wallMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!wallMesh.current) return;
    walls.forEach((wall, i) => {
      // Wall position
      const px = wall.x * gridToMeters - offsetX;
      const pz = wall.y * gridToMeters - offsetZ;
      const py = WALL_HEIGHT / 2;
      
      const sx = wall.w === 1 ? gridToMeters : 0.15; // 15cm thickness
      const sy = WALL_HEIGHT;
      const sz = wall.h === 1 ? gridToMeters : 0.15;

      dummy.position.set(px, py, pz);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      wallMesh.current!.setMatrixAt(i, dummy.matrix);
      
      const color = wall.isExterior ? new THREE.Color("#444") : new THREE.Color("#666");
      wallMesh.current!.setColorAt(i, color);
    });
    wallMesh.current.instanceMatrix.needsUpdate = true;
    if (wallMesh.current.instanceColor) wallMesh.current.instanceColor.needsUpdate = true;
  }, [walls, gridToMeters, offsetX, offsetZ]);

  useFrame(({ camera }) => {
    const t = scrollProgress.current;
    if (t < 0) return;
    
    // Evaluate spline at t
    spline.getPointAt(Math.max(0, Math.min(1, t)), vPos);
    camera.position.copy(vPos);

    // Look slightly ahead
    spline.getPointAt(Math.max(0, Math.min(1, t + 0.02)), vLook);
    // No roll ever: keep y the same for look target so the camera stays level
    vLook.y = vPos.y; 
    
    if (t >= 0.99) {
      // Look straight ahead at the end
      vLook.sub(vPos).normalize().add(vPos);
    }
    
    camera.lookAt(vLook);
  });

  return (
    <SceneFrame fog={{ near: 5, far: 50 }}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
        <meshStandardMaterial color="#2d2a26" />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, 0]}>
        <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Walls */}
      <instancedMesh ref={wallMesh} args={[undefined, undefined, walls.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>

      {/* Exterior Environment */}
      <Cityscape />
      
      {/* Internal lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff8f0" />
    </SceneFrame>
  );
}

function Cityscape() {
  const city = useGLTF("/glb/city_pack.glb");
  const block = useGLTF("/glb/modern_city_block.glb");
  
  return (
    <group position={[0, -2, -30]} scale={5}>
      <primitive object={city.scene.clone()} position={[-10, 0, 0]} />
      <primitive object={block.scene.clone()} position={[10, 0, 5]} />
      <primitive object={city.scene.clone()} position={[0, 0, 15]} rotation={[0, Math.PI/2, 0]} />
    </group>
  );
}
