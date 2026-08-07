"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  applyLook,
  LOOK_LIMITS,
  useBlinkTimer,
  useRestPose,
  useSaccade,
} from "@/components/onboarding/agent-rig";
import { usePointerLook } from "@/components/three/use-pointer-look";
import { HEX } from "@/lib/three-palette";

/**
 * A stand-in agent, built from primitives.
 *
 * Deliberately stylised rather than a bad attempt at a person: a smooth figure
 * with clear eyes reads as a considered placeholder, whereas a crude humanoid
 * reads as a broken one. It sits well inside the safe side of the uncanny
 * valley, which also makes it a usable fallback if the real GLB never lands.
 *
 * Crucially it drives the *same* behaviour as the real avatar will —
 * head/neck/spine split, eye tracking with saccades, irregular blinking,
 * amplitude-driven mouth. So the gate, the audio pipeline and the tracking are
 * all exercised for real now, and swapping in the Ready Player Me GLB is a
 * change of geometry, not of logic.
 */
export function AgentPlaceholder({
  mouth,
  attention,
}: {
  /** 0→1 mouth openness, from the lip-sync analyser. */
  mouth: RefObject<number>;
  /**
   * Where she should be looking, when it is not the cursor. Used to make her
   * glance at the name field while the visitor is typing.
   */
  attention: RefObject<THREE.Vector2 | null>;
}) {
  const pointer = usePointerLook({ lambda: 4, strength: 1 });
  const restOf = useRestPose();
  const tickBlink = useBlinkTimer();
  const tickSaccade = useSaccade();

  const root = useRef<THREE.Group>(null);
  const spine = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyeL = useRef<THREE.Mesh>(null);
  const eyeR = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const jaw = useRef<THREE.Mesh>(null);

  const target = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    const ms = delta * 1000;
    const t = state.clock.elapsedTime;

    // Look at the input field when it has focus, otherwise at the cursor.
    const focus = attention.current;
    const aim = target.current;
    aim.copy(focus ?? pointer.current);
    tickSaccade(ms, aim);
    aim.x = THREE.MathUtils.clamp(aim.x, -1, 1);
    aim.y = THREE.MathUtils.clamp(aim.y, -1, 1);

    if (spine.current) {
      applyLook(spine.current, restOf(spine.current), aim, LOOK_LIMITS.spine.yaw, LOOK_LIMITS.spine.pitch);
      // Breathing. 0.22Hz is a resting rate; faster reads as anxious.
      spine.current.position.y = Math.sin(t * 1.4) * 0.004;
    }
    if (neck.current) {
      applyLook(neck.current, restOf(neck.current), aim, LOOK_LIMITS.neck.yaw, LOOK_LIMITS.neck.pitch);
    }
    if (head.current) {
      applyLook(head.current, restOf(head.current), aim, LOOK_LIMITS.head.yaw, LOOK_LIMITS.head.pitch);
    }

    // Eyes lead the head — that ordering is what sells the glance.
    const eyeYaw = aim.x * LOOK_LIMITS.eye * 0.34;
    const eyePitch = -aim.y * LOOK_LIMITS.eye * 0.22;
    for (const eye of [eyeL.current, eyeR.current]) {
      if (eye) eye.rotation.set(eyePitch, eyeYaw, 0);
    }

    const closed = tickBlink(ms);
    for (const lid of [lidL.current, lidR.current]) {
      if (lid) lid.scale.y = Math.max(closed, 0.0001);
    }

    if (jaw.current) {
      const open = THREE.MathUtils.clamp(mouth.current, 0, 1);
      jaw.current.scale.y = 0.32 + open * 0.85;
      jaw.current.position.y = -0.17 - open * 0.035;
    }

    // A slow weight shift, on two incommensurate periods so it never loops
    // visibly.
    if (root.current) {
      root.current.position.x = Math.sin(t * 0.44) * 0.012;
      root.current.rotation.y = Math.sin(t * 0.69) * 0.02;
    }
  });

  return (
    <group ref={root} position={[0, -1.3, 0]}>
      {/* Torso */}
      <group ref={spine} position={[0, 1.05, 0]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <capsuleGeometry args={[0.26, 0.5, 8, 24]} />
          <meshStandardMaterial color={0x2b3a45} roughness={0.75} metalness={0.05} />
        </mesh>
        {/* Shoulders. The rotation lays the capsule on its side and belongs on
            the mesh — a geometry has no transform of its own. */}
        <mesh position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.1, 0.52, 6, 16]} />
          <meshStandardMaterial color={0x2b3a45} roughness={0.75} metalness={0.05} />
        </mesh>

        <group ref={neck} position={[0, 0.42, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <capsuleGeometry args={[0.062, 0.1, 6, 16]} />
            <meshStandardMaterial color={0xc9a68a} roughness={0.62} />
          </mesh>

          <group ref={head} position={[0, 0.2, 0]}>
            {/* Skull */}
            <mesh castShadow>
              <sphereGeometry args={[0.155, 40, 40]} />
              <meshStandardMaterial color={0xc9a68a} roughness={0.58} metalness={0} />
            </mesh>
            {/* Hair, as a simple shell — enough to read as a silhouette. */}
            <mesh position={[0, 0.03, -0.015]} scale={[1.06, 1.04, 1.06]}>
              <sphereGeometry args={[0.155, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              <meshStandardMaterial color={0x1d1815} roughness={0.85} />
            </mesh>

            {[-1, 1].map((side) => (
              <group key={side} position={[0.052 * side, 0.022, 0.128]}>
                <mesh ref={side === -1 ? eyeL : eyeR}>
                  <sphereGeometry args={[0.026, 20, 20]} />
                  <meshStandardMaterial color={0xf6f3ee} roughness={0.25} />
                </mesh>
                {/* Iris, parented to the eye so it rotates with it. */}
                <mesh position={[0, 0, 0.023]}>
                  <sphereGeometry args={[0.012, 16, 16]} />
                  <meshStandardMaterial color={0x3b2a1c} roughness={0.3} />
                </mesh>
                {/* Lid: a scaled cap rather than real geometry. */}
                <mesh
                  ref={side === -1 ? lidL : lidR}
                  position={[0, 0.004, 0.006]}
                  scale={[1, 0.0001, 1]}
                >
                  <sphereGeometry args={[0.0285, 16, 12]} />
                  <meshStandardMaterial color={0xc9a68a} roughness={0.6} />
                </mesh>
              </group>
            ))}

            {/* Mouth. Scaled on Y by the analyser — the same channel the real
                rig will route into `jawOpen`. */}
            <mesh ref={jaw} position={[0, -0.17, 0.132]} scale={[1, 0.32, 1]}>
              <sphereGeometry args={[0.035, 20, 12]} />
              <meshStandardMaterial color={0x6d3b3b} roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* A plinth, so she is standing on something rather than floating. */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.04, 48]} />
        <meshStandardMaterial color={HEX.surface} roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}
