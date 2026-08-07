"use client";

import { useRef, useMemo, useLayoutEffect, Suspense, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { generateInterior } from "@/lib/interior-generator";
import { getFloorPlan } from "@/lib/floor-plans";
import { CityBackdrop } from "@/components/three/city-backdrop";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { SceneFrame } from "@/components/three/scene-frame";

type Props = {
  sectionRef: React.RefObject<HTMLElement | null>;
  bhk: string;
  carpetAreaSqFt: number;
};

/* Scratch objects. Module scope, recycled every frame — CLAUDE.md §7. */
const dummy = new THREE.Object3D();
const vLook = new THREE.Vector3();
const vPos = new THREE.Vector3();
const WALL_EXTERIOR = new THREE.Color("#444");
const WALL_INTERIOR = new THREE.Color("#666");
const WALL_HEIGHT = 3.0; // metres

export function ApartmentInteriorScene({ sectionRef, bhk, carpetAreaSqFt }: Props) {
  const plan = getFloorPlan(bhk);

  const { walls, gridToMeters, waypoints, offsetX, offsetZ, width, height } = useMemo(
    () => generateInterior(plan, carpetAreaSqFt),
    [plan, carpetAreaSqFt],
  );

  const spline = useMemo(
    () => new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.5),
    [waypoints],
  );
  const scrollProgress = useScrollProgress(sectionRef);

  const wallMesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!wallMesh.current) return;
    walls.forEach((wall, i) => {
      const px = wall.x * gridToMeters - offsetX;
      const pz = wall.y * gridToMeters - offsetZ;

      dummy.position.set(px, WALL_HEIGHT / 2, pz);
      dummy.scale.set(
        wall.w === 1 ? gridToMeters : 0.15, // 15cm partitions
        WALL_HEIGHT,
        wall.h === 1 ? gridToMeters : 0.15,
      );
      dummy.updateMatrix();
      wallMesh.current!.setMatrixAt(i, dummy.matrix);
      wallMesh.current!.setColorAt(i, wall.isExterior ? WALL_EXTERIOR : WALL_INTERIOR);
    });
    wallMesh.current.instanceMatrix.needsUpdate = true;
    if (wallMesh.current.instanceColor) wallMesh.current.instanceColor.needsUpdate = true;
  }, [walls, gridToMeters, offsetX, offsetZ]);

  return (
    /* Fog has to clear the room but still reach the skyline: nothing within 20m
       is touched, so the interior stays crisp, and the furthest buildings at
       ~105m sit deep in it. The previous far plane of 50 hid the view entirely. */
    <SceneFrame fog={{ near: 20, far: 165 }}>
      {(tier) => (
        <>
          {/* The camera rig has to be its own component. R3F hooks only work
              *inside* the Canvas, and this component is the one that renders it
              — a useFrame up there throws "Hooks can only be used within the
              Canvas component" and takes the whole page down to the error
              boundary. */}
          <CameraRig spline={spline} progress={scrollProgress} />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
            <meshStandardMaterial color="#2d2a26" />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, 0]}>
            <planeGeometry args={[width * gridToMeters, height * gridToMeters]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>

          <instancedMesh ref={wallMesh} args={[undefined, undefined, walls.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial roughness={0.9} />
          </instancedMesh>

          {/* The city outside. Tier-gated, and scaled from measured bounding
              boxes — see components/three/city-backdrop.tsx for why that matters. */}
          <Suspense fallback={null}>
            <CityBackdrop tier={tier} />
          </Suspense>

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff8f0" />
        </>
      )}
    </SceneFrame>
  );
}

/** Walks the camera along the path on scroll. Level, damped, never rolling. */
function CameraRig({
  spline,
  progress,
}: {
  spline: THREE.CatmullRomCurve3;
  progress: RefObject<number>;
}) {
  useFrame(({ camera }) => {
    const t = Math.max(0, Math.min(1, progress.current));

    spline.getPointAt(t, vPos);
    camera.position.copy(vPos);

    // Look a little further along the path than we stand.
    spline.getPointAt(Math.min(1, t + 0.02), vLook);
    // Pin the target to eye level. Any vertical component here reads as the
    // camera tilting through a floor, which is the fastest way to make an
    // interior walkthrough nauseating (CLAUDE.md §7).
    vLook.y = vPos.y;

    // At the very end the look-ahead sample collapses onto the position, which
    // would make lookAt() undefined. Push it forward along the last direction.
    if (t >= 0.99) vLook.sub(vPos).normalize().add(vPos);

    camera.lookAt(vLook);
  });

  return null;
}
