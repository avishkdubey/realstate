"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * The hero scene.
 *
 * Atmosphere, not spectacle. A slow parallax over an abstract massing of
 * towers, lit like an architectural model — the point is that the page feels
 * expensive, not that anyone examines the geometry (CLAUDE.md §7).
 *
 * Budget discipline: well under 100k triangles and 30 draw calls, DPR capped
 * at 1.5, no allocation inside the frame loop, and the whole canvas is mounted
 * only by a wrapper that has already decided the device can afford it.
 */

/** Deterministic massing, so server and client agree and builds are stable. */
const BLOCKS = [
  { x: -3.2, z: -1.4, w: 0.9, h: 3.4, d: 0.9 },
  { x: -2.0, z: 0.6, w: 1.1, h: 2.2, d: 1.0 },
  { x: -0.6, z: -0.8, w: 1.0, h: 4.6, d: 1.0 },
  { x: 0.8, z: 0.9, w: 1.2, h: 2.9, d: 1.1 },
  { x: 2.2, z: -1.1, w: 0.9, h: 3.9, d: 0.9 },
  { x: 3.5, z: 0.4, w: 1.0, h: 2.4, d: 1.0 },
];

export function HeroScene() {
  return (
    <Canvas
      // Capping DPR is the single most effective mobile GPU saving available.
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 3.4, 9], fov: 38 }}
      // Nothing animates on its own except our drift, so frameloop stays on
      // demand-free but the renderer still parks when the tab is hidden.
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={["#141414"]} />
      <fog attach="fog" args={["#141414", 9, 20]} />

      {/* Architectural studio lighting: soft ambient, one keyed directional. */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.6}
        color="#f5f1e8"
        castShadow={false}
      />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} color="#b99c6b" />

      <Environment preset="dawn" />

      <Massing />
      <Ground />
    </Canvas>
  );
}

function Massing() {
  const group = useRef<THREE.Group>(null);

  // Materials are created once and shared across every block, which keeps the
  // draw-call count down and avoids per-frame allocation.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2622",
        roughness: 0.35,
        metalness: 0.6,
      }),
    [],
  );

  const accent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b99c6b",
        roughness: 0.25,
        metalness: 0.85,
      }),
    [],
  );

  useFrame((state) => {
    if (!group.current) return;
    // A very slow drift keyed to the pointer. No new objects per frame.
    const t = state.clock.elapsedTime;
    group.current.rotation.y = Math.sin(t * 0.08) * 0.12 + state.pointer.x * 0.08;
    group.current.position.y = Math.sin(t * 0.25) * 0.04;
  });

  return (
    <group ref={group}>
      {BLOCKS.map((block, index) => (
        <mesh
          key={index}
          position={[block.x, block.h / 2, block.z]}
          material={index === 2 ? accent : material}
        >
          <boxGeometry args={[block.w, block.h, block.d]} />
        </mesh>
      ))}
    </group>
  );
}

function Ground(props: ThreeElements["mesh"]) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} {...props}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}
