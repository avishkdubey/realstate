"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { SceneFrame } from "@/components/three/scene-frame";
import { AgentPlaceholder } from "./agent-placeholder";
import type { RefObject } from "react";
import type * as THREE from "three";

export type AgentSceneProps = {
  mouth: RefObject<number>;
  attention: RefObject<THREE.Vector2 | null>;
};

export function AgentScene({ mouth, attention }: AgentSceneProps) {
  return (
    <SceneFrame
      transparent
      fog={false}
      // fov ≤ 30 to avoid wide-lens distortion on a portrait
      camera={{ position: [0, 1.45, 3.8], fov: 25 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 3]} intensity={1.5} color="#fff1e8" />
      <directionalLight position={[-3, 1, 2]} intensity={0.4} color="#e6f2ff" />
      <directionalLight position={[0, 3, -4]} intensity={2.0} color="#ffffff" />
      
      {/* 
        A bright strip camera-right for the eye catchlight. 
        It sits in front of the default SceneFrame studio environment.
      */}
      <Environment>
        <Lightformer
          form="rect"
          intensity={8}
          color="#ffffff"
          position={[3, 2, 4]}
          scale={[0.5, 4, 1]}
          target={[0, 1.4, 0]}
        />
      </Environment>

      {/* Pose her ~12° off-axis so she is not perfectly frontal */}
      <group rotation={[0, -0.21, 0]}>
        <AgentPlaceholder mouth={mouth} attention={attention} />
      </group>
    </SceneFrame>
  );
}
