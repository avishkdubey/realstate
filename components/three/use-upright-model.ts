"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { COLORS } from "@/lib/three-palette";

/**
 * Loads a GLB, stands it up, grades it, and measures it.
 *
 * Every model in `public/glb` needs all four of these before it can be placed,
 * and getting any one of them wrong is invisible in code and glaring on screen.
 * They are collected here so a scene author never has to remember them.
 *
 * **Up-axis: none needed. Do not add one.** Both models arrive correctly Y-up
 * and this was verified by transforming every primitive's bounding box through
 * its full node chain: `modern_city_block`'s `roads_5_0` mesh is flat in Y and
 * sits at the bottom of the model's world bounds, and
 * `modern_apartment_house`'s world `min.y` is exactly 0 — already standing on
 * the ground.
 *
 * A −90° X correction was applied here at one point, on the theory that the
 * files were Z-up. They are not, and it turned every building upside down. The
 * mistake came from reading raw accessor `min`/`max` — which are *local* to
 * each primitive, before its node transforms — and concluding from a
 * flat-in-Z terrain mesh that the ground plane was XY. It is only XY in that
 * mesh's own local space; the node chain above it rotates it into place.
 *
 * If a future asset genuinely is Z-up, correct it with a pivot group here and
 * measure the bounding box *after* the pivot — but confirm it first by
 * transforming the corners through the node chain, not by reading accessors.
 *
 * **Grading.** `useGLTF` caches the loaded scene globally, so any material
 * change has to happen on a clone or it silently re-grades every other use of
 * the same file.
 *
 * **Scale.** The files disagree about units by four orders of magnitude, so
 * nothing may hardcode a multiplier. The returned `unitScale` fits the model to
 * one world unit tall, measured *after* the up-axis correction — measuring
 * before it would return the footprint as the height.
 *
 * **Grounding.** These models are modelled about their own centre, so placing
 * one at y = 0 buries its bottom half. `footY` is how far to lift it so its base
 * rests on the ground, expressed per unit of height.
 */
export type UprightModel = {
  /** Ready to `<Clone>`. Carries the up-axis correction in its own transform. */
  upright: THREE.Object3D;
  /** Multiply by a desired height in world units to get the group scale. */
  unitScale: number;
  /** Multiply by the desired height and add to y to stand the model on y = 0. */
  footY: number;
  /**
   * Where the model's horizontal centre sits relative to its own origin, per
   * unit of height. Negate, multiply by the desired height, and add to x/z to
   * bring it onto the origin.
   *
   * Not every asset is modelled about its centre — `low_poly_night_city` runs
   * x −121 → +74, so its true centre is 23 units off. A camera that orbits the
   * origin, as ours does, would then swing around a point outside the model and
   * push it out of frame on one side.
   */
  centerXZ: { x: number; z: number };
  /** Footprint after correction, per unit of height. For framing a camera. */
  aspect: { x: number; z: number };
};

export function useUprightModel(
  path: string,
  {
    /** 0 = leave the model's own colours alone, 1 = fully the night ground. */
    nightMix = 0,
    /** Reflection strength. Distant massing wants far less than a hero model. */
    envMapIntensity = 0.35,
    /** Emissive maps on these assets are daytime signage; usually worth muting. */
    emissiveScale = 0.25,
  }: { nightMix?: number; envMapIntensity?: number; emissiveScale?: number } = {},
): UprightModel {
  const { scene } = useGLTF(path);

  const graded = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = source.map((m) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        if (mat.color && nightMix > 0) mat.color.lerp(COLORS.ground, nightMix);
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.envMapIntensity = envMapIntensity;
        /* Several of these are single-sided shells whose normals were authored
           for one hero angle. Once a camera moves past that angle the near
           faces cull and you look into a hollow box. */
        mat.side = THREE.DoubleSide;
        mat.shadowSide = THREE.DoubleSide;
        if (mat.emissive) mat.emissive.multiplyScalar(emissiveScale);
        mat.needsUpdate = true;
        return mat;
      });
      if (mesh.material.length === 1) mesh.material = mesh.material[0];
    });
    return copy;
  }, [scene, nightMix, envMapIntensity, emissiveScale]);

  /* No transform of our own — see the up-axis note above. Kept as a named
     binding so the measurement below and every call site refer to one object,
     and so a genuine correction has an obvious place to live. */
  const upright = graded;

  const measured = useMemo(() => {
    const box = new THREE.Box3().setFromObject(upright);
    const size = box.getSize(new THREE.Vector3());
    const unitScale = size.y > 0 ? 1 / size.y : 1;
    const center = box.getCenter(new THREE.Vector3());
    return {
      unitScale,
      footY: -box.min.y * unitScale,
      centerXZ: { x: center.x * unitScale, z: center.z * unitScale },
      aspect: { x: size.x * unitScale, z: size.z * unitScale },
    };
  }, [upright]);

  return { upright, ...measured };
}
