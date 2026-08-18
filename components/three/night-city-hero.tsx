"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Clone } from "@react-three/drei";
import * as THREE from "three";

import { usePointerLook } from "@/components/three/use-pointer-look";
import { useUprightModel } from "@/components/three/use-upright-model";
import { clamp01, smoothstep } from "@/lib/construction-stages";
import { GLB_CATALOG } from "@/lib/glb-catalog";
import { NIGHT } from "@/lib/three-palette";
import type { QualityTier } from "@/lib/webgl";

/**
 * The hero: a low-poly night skyline, flown past on scroll.
 *
 * Replaces the procedural construction sequence and the GLB surrounds that
 * stood behind it. Both are still in the tree — `tower-construction.tsx` and
 * `city-backdrop.tsx` — but nothing on the home page imports them now.
 *
 * The camera never touches a hardcoded distance. The model is measured at
 * runtime and the route is expressed as multiples of two derived quantities:
 * `H`, its height, and `D`, the standoff that exactly frames its width at the
 * current field of view *and the current viewport aspect*. That last part
 * matters — a route authored against a 16:9 laptop crops badly on a 21:9
 * monitor and on a phone in portrait, and this is the whole reason the previous
 * scene had to be re-framed by hand twice.
 */

/* Scratch. Module scope, recycled, never reallocated (CLAUDE.md §7). */
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

/**
 * The route, in polar form: how far out, how high, and around by how much.
 *
 * Polar rather than cartesian on purpose. A skyline is a wide, shallow object,
 * so what a shot needs to specify is its standoff and its bearing — writing
 * x/y/z triples means every tweak to one silently changes the other, which is
 * how a camera ends up inside a building.
 *
 * `dist` is in multiples of the fitted framing distance, `y` in multiples of
 * model height, `angle` in radians around the model's centre.
 */
const ROUTE: {
  at: number;
  dist: number;
  y: number;
  angle: number;
  targetY: number;
}[] = [
  /* The sweep is kept narrow — about 45° in total, all of it near the +Z face.
     The asset is named `Background_Night_Buildings` and is a single 6k-triangle
     mesh with one baked texture, which is the signature of something authored
     to be seen from the front. A full orbit would find whatever it has instead
     of a back. */
  // Wide and low: the skyline against the sky, near the horizon.
  { at: 0.0, dist: 1.2, y: 0.5, angle: -0.35, targetY: 0.35 },
  // Rising, and coming in.
  { at: 0.35, dist: 0.9, y: 0.8, angle: -0.12, targetY: 0.4 },
  // The closest pass, dropped back down among the towers.
  { at: 0.7, dist: 0.62, y: 0.45, angle: 0.16, targetY: 0.5 },
  // Lifts away for the closing frame.
  { at: 1.0, dist: 1.0, y: 1.1, angle: 0.42, targetY: 0.35 },
];

function sampleRoute(progress: number) {
  let lower = ROUTE[0];
  let upper = ROUTE[ROUTE.length - 1];

  for (let i = 0; i < ROUTE.length - 1; i++) {
    if (progress >= ROUTE[i].at && progress <= ROUTE[i + 1].at) {
      lower = ROUTE[i];
      upper = ROUTE[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const t = span <= 0 ? 0 : smoothstep((progress - lower.at) / span);
  const mix = (a: number, b: number) => a + (b - a) * t;

  return {
    dist: mix(lower.dist, upper.dist),
    y: mix(lower.y, upper.y),
    angle: mix(lower.angle, upper.angle),
    targetY: mix(lower.targetY, upper.targetY),
  };
}

/** World height the skyline's tallest point is fitted to. */
const SKYLINE_HEIGHT = 22;

export function NightCityHero({
  progress,
  tier,
}: {
  /** 0→1 scroll position, sampled in the frame that draws it. */
  progress: RefObject<number>;
  tier: QualityTier;
}) {
  const { camera, size } = useThree();
  const look = usePointerLook({ lambda: 2.5, strength: 1 });

  /* Ungraded, and emissives left alone.
     Everywhere else in this codebase models get pulled toward the page ground
     because they arrive lit for daylight. This one is authored for night and
     its glowing windows are the entire reason it is here — muting them, which
     is the hook's default, would throw away the asset. */
  const { upright, unitScale, footY, centerXZ, aspect } = useUprightModel(
    GLB_CATALOG.nightCity.path,
    { nightMix: 0, envMapIntensity: 0.35, emissiveScale: 1 },
  );

  /**
   * The standoff that frames the model's width, for this viewport.
   *
   * Horizontal half-angle is derived from the vertical one, because three.js
   * `fov` is vertical and a wide object is constrained by the horizontal field.
   * The 1.12 leaves a little air at the edges rather than framing flush.
   */
  const fitDistance = useMemo(() => {
    const perspective = camera as THREE.PerspectiveCamera;
    const viewportAspect = size.width / Math.max(size.height, 1);
    const halfV = (perspective.fov * Math.PI) / 360;
    const halfH = Math.atan(Math.tan(halfV) * viewportAspect);
    // Widest horizontal extent the model presents as it turns.
    const halfWidth = (Math.max(aspect.x, aspect.z) * SKYLINE_HEIGHT) / 2;
    return (halfWidth / Math.tan(halfH)) * 1.12;
  }, [camera, size.width, size.height, aspect.x, aspect.z]);

  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const p = clamp01(progress.current);
    const shot = sampleRoute(p);

    const radius = shot.dist * fitDistance;
    _camTarget.set(
      Math.sin(shot.angle) * radius,
      shot.y * SKYLINE_HEIGHT,
      Math.cos(shot.angle) * radius,
    );
    _lookTarget.set(0, shot.targetY * SKYLINE_HEIGHT, 0);

    // Parallax rides on the authored path, never replaces it.
    const pointer = look.current;
    _camTarget.x += pointer.x * SKYLINE_HEIGHT * 0.08;
    _camTarget.y += pointer.y * SKYLINE_HEIGHT * 0.05;

    /* ~110ms settle. Matches the other scenes so the site feels like one
       camera operator, and close enough to the scroll to feel driven by it. */
    const k = 1 - Math.exp(-9 * delta);
    camera.position.lerp(_camTarget, k);
    camera.lookAt(_lookTarget);

    /* The city glow breathes very slightly. Constant emissive light reads as a
       flat render; a slow drift reads as a living city without ever becoming a
       flicker anyone consciously notices. */
    if (glowRef.current) {
      glowRef.current.intensity =
        SKYLINE_HEIGHT * 6 * (0.9 + Math.sin(p * 6.2) * 0.1);
    }
  });

  const shadows = tier === "high";

  return (
    <group>
      {/* Moonlight. Cool, high, and weak — at night the key light's job is to
          separate silhouettes, not to illuminate. The windows do the lighting. */}
      <directionalLight
        position={[-SKYLINE_HEIGHT, SKYLINE_HEIGHT * 2, SKYLINE_HEIGHT * 0.8]}
        intensity={0.85}
        color={NIGHT.moon}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SKYLINE_HEIGHT * 2}
        shadow-camera-right={SKYLINE_HEIGHT * 2}
        shadow-camera-top={SKYLINE_HEIGHT * 2}
        shadow-camera-bottom={-SKYLINE_HEIGHT}
        shadow-bias={-0.0005}
      />

      {/* Sky above, sodium-lit street below. One hemisphere light does more for
          a low-poly night set than any number of directionals — flat facets
          need their tint to come from which way they face. */}
      <hemisphereLight args={[NIGHT.sky, NIGHT.streetBounce, 0.75]} />

      {/* Ambient, kept very low so the emissive windows stay the brightest
          thing in frame. Lift this and the whole scene goes grey. */}
      <ambientLight intensity={0.18} color={NIGHT.sky} />

      {/* City glow, sitting low in the middle of the block and warm — the light
          that a city throws up onto its own undersides. */}
      <pointLight
        ref={glowRef}
        position={[0, SKYLINE_HEIGHT * 0.12, 0]}
        color={NIGHT.glow}
        intensity={SKYLINE_HEIGHT * 6}
        distance={SKYLINE_HEIGHT * 6}
        decay={2}
      />

      {/* Ground. Near-black with a little sheen, so the skyline sits on
          something and the glow has a surface to catch. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow={shadows}
      >
        <planeGeometry args={[SKYLINE_HEIGHT * 40, SKYLINE_HEIGHT * 40]} />
        <meshStandardMaterial
          color={NIGHT.ground}
          roughness={0.55}
          metalness={0.25}
        />
      </mesh>

      {/* Centred on the origin in x/z, standing on y = 0.
          This model runs x −121 → +74 about its own origin, so without the
          recentring the camera would orbit a point 23 units outside it and
          swing the skyline out of frame on one side. */}
      <group
        scale={unitScale * SKYLINE_HEIGHT}
        position={[
          -centerXZ.x * SKYLINE_HEIGHT,
          footY * SKYLINE_HEIGHT,
          -centerXZ.z * SKYLINE_HEIGHT,
        ]}
      >
        <Clone object={upright} castShadow={shadows} receiveShadow={shadows} />
      </group>
    </group>
  );
}
