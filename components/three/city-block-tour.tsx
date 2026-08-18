"use client";

import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Clone } from "@react-three/drei";
import * as THREE from "three";

import { usePointerLook } from "@/components/three/use-pointer-look";
import { useUprightModel } from "@/components/three/use-upright-model";
import { clamp01, smoothstep } from "@/lib/construction-stages";
import { GLB_CATALOG, type GlbAsset } from "@/lib/glb-catalog";
import { HEX } from "@/lib/three-palette";
import type { QualityTier } from "@/lib/webgl";

/**
 * A scroll-driven tour of `modern_city_block.glb`.
 *
 * The hero builds one tower; this is the neighbourhood it stands in — a whole
 * block of apartments, roads, kerbs and courtyards, which is what the asset
 * actually contains once it is standing the right way up (it is Z-up, and was
 * previously rendered on its back — see `use-upright-model.ts`).
 *
 * The camera does four things across one page of scroll: a high establishing
 * orbit, a descent toward the rooftops, a push down into the street between the
 * buildings, and a slow lift back out. Zoom is done by moving the camera, not by
 * changing the field of view — an animated fov reads as a lens artefact rather
 * than as travel, and it distorts the architecture at the extremes.
 *
 * The block is 24 MB and 61k triangles across 7 materials, so it is one of the
 * heaviest things on the site. It is deliberately mounted behind an
 * IntersectionObserver, well below the fold, and skipped entirely on the low
 * tier.
 */

/* Scratch. Module scope, recycled every frame, never reallocated —
   `CLAUDE.md` §7 on GC stutter inside useFrame. */
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

/**
 * The route, in units of block height.
 *
 * Authored against a block normalised to 1.0 tall so the numbers survive the
 * model being swapped — everything is multiplied by `BLOCK_HEIGHT` below.
 */
const ROUTE: {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}[] = [
  /* Distances were roughly halved after the first pass. At 2.6 heights out the
     block — which is ~3.6 × 3.9 its own height in footprint — sat small and
     centred with a lot of empty sky above it, which is what a diagram looks
     like. Coming in fills the frame and lets the individual buildings resolve,
     which is the entire reason for using this asset rather than a photograph. */
  // 1. Establishing. High and wide, but close enough to read.
  { at: 0.0, position: [1.7, 1.15, 2.2], target: [0, 0.3, 0] },
  // 2. Descent. Rooftops resolving.
  { at: 0.34, position: [1.05, 0.72, 1.35], target: [0.1, 0.32, 0] },
  // 3. Street level. Inside the block, looking along it.
  { at: 0.68, position: [0.34, 0.22, 0.6], target: [-0.2, 0.4, -0.35] },
  // 4. Lift out. Pulls back to a composed three-quarter view.
  { at: 1.0, position: [-1.35, 0.95, 1.75], target: [0, 0.32, 0] },
];

function sampleRoute(
  progress: number,
  out: THREE.Vector3,
  key: "position" | "target",
  scale: number,
) {
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
  const a = lower[key];
  const b = upper[key];
  out.set(
    (a[0] + (b[0] - a[0]) * t) * scale,
    (a[1] + (b[1] - a[1]) * t) * scale,
    (a[2] + (b[2] - a[2]) * t) * scale,
  );
}

/**
 * World height the block's tallest point is fitted to. Sets the scale of the
 * whole scene, so it is also what keeps the far corner inside `SceneFrame`'s
 * 200-unit far plane: the model is ~3.6 × 3.9 its own height in footprint, and
 * the establishing shot sits ~4.7 heights out, so 18 leaves comfortable margin
 * where 26 did not.
 */
const BLOCK_HEIGHT = 18;

export function CityBlockTour({
  progress,
  tier,
}: {
  /** 0→1 scroll position, sampled in the frame that draws it. */
  progress: RefObject<number>;
  tier: QualityTier;
}) {
  const { camera } = useThree();
  const look = usePointerLook({ lambda: 2.5, strength: 1 });
  const asset: GlbAsset = GLB_CATALOG.cityBlock;

  /* Graded only lightly. Unlike the hero's distant surrounds, this model *is*
     the subject here, so its own materials should carry the shot rather than
     being flattened into the page ground. */
  const { upright, unitScale, footY } = useUprightModel(asset.path, {
    /* Barely graded. This model *is* the subject of its section, so unlike the
       hero's distant surrounds it has to carry the shot on its own materials —
       pulling it toward the page ground here just makes a dark rectangle. */
    nightMix: 0.12,
    envMapIntensity: 1.1,
    emissiveScale: 0.8,
  });

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const p = clamp01(progress.current);

    sampleRoute(p, _camTarget, "position", BLOCK_HEIGHT);
    sampleRoute(p, _lookTarget, "target", BLOCK_HEIGHT);

    // Parallax rides on top of the authored path, never replaces it.
    const pointer = look.current;
    _camTarget.x += pointer.x * BLOCK_HEIGHT * 0.06;
    _camTarget.y += pointer.y * BLOCK_HEIGHT * 0.04;

    /* Same damping constant as the hero (~110ms), so the two scenes feel like
       one camera operator rather than two. */
    const k = 1 - Math.exp(-9 * delta);
    camera.position.lerp(_camTarget, k);
    camera.lookAt(_lookTarget);

    /* A very slow turntable underneath the route. It is what stops the block
       reading as a still photograph during the pauses between route keys, and
       at this rate it is felt rather than seen. */
    if (groupRef.current) groupRef.current.rotation.y = p * 0.5;
  });

  const shadows = tier === "high";

  return (
    <group>
      {/* Late-afternoon key, low and warm — long shadows down the streets are
          what give a block of this size its depth. */}
      <directionalLight
        position={[BLOCK_HEIGHT * 0.8, BLOCK_HEIGHT * 1.1, BLOCK_HEIGHT * 0.5]}
        intensity={2.8}
        color={HEX.ivory}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-BLOCK_HEIGHT}
        shadow-camera-right={BLOCK_HEIGHT}
        shadow-camera-top={BLOCK_HEIGHT}
        shadow-camera-bottom={-BLOCK_HEIGHT}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[-BLOCK_HEIGHT, BLOCK_HEIGHT * 0.4, -BLOCK_HEIGHT * 0.6]}
        intensity={0.9}
        color={0x6f86a8}
      />
      <ambientLight intensity={0.6} />

      {/* Ground, matched to the page so the block dissolves into it rather than
          ending on a visible disc. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow={shadows}
      >
        <planeGeometry args={[BLOCK_HEIGHT * 20, BLOCK_HEIGHT * 20]} />
        <meshStandardMaterial color={0x141310} roughness={0.6} metalness={0.15} />
      </mesh>

      <group ref={groupRef}>
        <group
          scale={unitScale * BLOCK_HEIGHT}
          position={[0, footY * BLOCK_HEIGHT, 0]}
        >
          <Clone object={upright} castShadow={shadows} receiveShadow={shadows} />
        </group>
      </group>
    </group>
  );
}
