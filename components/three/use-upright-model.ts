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
 * **Up-axis.** Both models in use are authored Z-up while glTF is Y-up, so
 * without a correction they render lying on their backs. Sketchfab's exporter
 * writes a −90° X matrix onto the `Sketchfab_model` root to fix exactly this,
 * but in these files the `.fbx` node directly beneath carries the inverse and
 * the two cancel out. See `city-backdrop.tsx` for the measurements that
 * establish it.
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

  const upright = useMemo(() => {
    const pivot = new THREE.Group();
    pivot.rotation.x = -Math.PI / 2;
    pivot.add(graded);
    pivot.updateMatrixWorld(true);
    return pivot;
  }, [graded]);

  const measured = useMemo(() => {
    const box = new THREE.Box3().setFromObject(upright);
    const size = box.getSize(new THREE.Vector3());
    const unitScale = size.y > 0 ? 1 / size.y : 1;
    return {
      unitScale,
      footY: -box.min.y * unitScale,
      aspect: { x: size.x * unitScale, z: size.z * unitScale },
    };
  }, [upright]);

  return { upright, ...measured };
}
