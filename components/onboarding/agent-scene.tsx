"use client";

import { SceneFrame } from "@/components/three/scene-frame";
import { AgentPlaceholder } from "./agent-placeholder";
import type { RefObject } from "react";
import type * as THREE from "three";

export type AgentSceneProps = {
  mouth: RefObject<number>;
  attention: RefObject<THREE.Vector2 | null>;
};

/**
 * The greeting agent, lit as a portrait.
 *
 * There is deliberately **no `<Environment>` here**. SceneFrame already
 * provides one, and a second nested inside the children boundary is what was
 * keeping her invisible: drei's Environment suspends while it bakes, and
 * anything suspending in that boundary holds every sibling — including the
 * avatar — unmounted. The canvas sized correctly, the root built, and not one
 * mesh appeared. The catchlight it was there to provide is a single small
 * emissive plane instead, which is cheaper and easier to aim.
 */
export function AgentScene({ mouth, attention }: AgentSceneProps) {
  return (
    <SceneFrame
      transparent
      fog={false}
      /* A portrait lens, framed on where her head actually is. SceneFrame does
         not aim the camera — it looks straight down -Z at its own height — so
         the camera's Y is the subject's eye line. At 2.6m and fov 30 the frame
         runs roughly 0.8–2.2m: head, shoulders and upper torso. */
      camera={{ position: [0, 1.3, 3.0], fov: 30 }}
    >
      {/* Key: warm, high and camera-right. */}
      <directionalLight position={[2.5, 3, 2.5]} intensity={2.6} color="#fff1e2" />
      {/* Fill: cool, opposite side, weak enough to keep the modelling. */}
      <directionalLight position={[-3, 1.2, 1.5]} intensity={0.7} color="#bcd4f0" />
      {/* Rim from behind, which is what lifts her off a near-black ground. */}
      <directionalLight position={[-1, 2.2, -3]} intensity={2.2} color="#c9ae7c" />
      <ambientLight intensity={0.7} />

      {/* The catchlight. A face without a specular glint in the eye reads as
          dead, and this is the cheapest possible way to put one there. */}
      <mesh position={[1.5, 1.85, 1.6]} rotation={[0, -0.6, 0]}>
        <planeGeometry args={[0.35, 1.1]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      {/* Posed ~12° off-axis — perfectly frontal reads as a mugshot — and
          dropped 0.3m so the crop lands on her face rather than her chest.
          The offset is empirical: SceneFrame gives the camera no explicit aim,
          so it looks straight down -Z, and nudging the subject is more reliable
          than trying to predict where that ray lands. */}
      <group position={[0, -0.3, 0]} rotation={[0, -0.21, 0]}>
        <AgentPlaceholder mouth={mouth} attention={attention} />
      </group>
    </SceneFrame>
  );
}
