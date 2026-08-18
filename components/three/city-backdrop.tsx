"use client";

import { useMemo } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { GLB_CATALOG } from "@/lib/glb-catalog";
import { COLORS } from "@/lib/three-palette";
import type { QualityTier } from "@/lib/webgl";

/**
 * The city outside the window.
 *
 * Replaces an earlier version that put `city_pack.glb` — extent 1.25 million
 * units — inside a `<group scale={5}>` in a camera with a 200-unit far plane.
 * Nothing could have rendered from that, and it was pulling 37 MB over the wire
 * to do it.
 *
 * Two rules here, both learned from that:
 *
 * **Scale is measured, never guessed.** Every model is fitted to a target
 * height in metres from its own bounding box, computed at runtime. The files in
 * `public/glb` disagree about units by four orders of magnitude, so a hardcoded
 * multiplier is only ever correct for one of them, and silently wrong the day
 * someone swaps an asset.
 *
 * **Distance decides the budget.** These buildings are seen through a window,
 * fifty-odd metres away and behind fog. Texture detail is invisible at that
 * range, so the untextured 2.4 MB model does most of the work and the textured
 * 24 MB one appears once, nearest the glass. That is a fifteen-fold saving for
 * a difference nobody can see.
 */

/** What the surrounds are pulled toward. Matches the page ground so distant
    buildings dissolve into it rather than ending at a visible edge. */
const NIGHT = COLORS.ground;

/** Where each building sits, in metres, relative to the flat. */
type Placement = {
  asset: keyof typeof GLB_CATALOG;
  position: [number, number, number];
  /** Real-world height to fit the model to. */
  height: number;
  rotationY: number;
};

/**
 * A skyline, hand-placed rather than scattered.
 *
 * Randomly positioned buildings read as noise; a composed row with varied
 * heights and a gap for sky reads as a city. Depths are staggered so the
 * silhouettes overlap, which is what creates the sense of a place continuing
 * past what you can see.
 */
/* Heights are set against honest grounding. They were once authored ~2× too
   large to compensate for every building being buried to roughly half its
   nominal height; once the grounding was fixed they had to come back down or
   the view from the flat becomes a wall. */
const SKYLINE: Placement[] = [
  { asset: "cityBlock", position: [8, 0, -46], height: 16, rotationY: -0.35 },
  { asset: "apartmentHouse", position: [-22, 0, -58], height: 21, rotationY: 0.2 },
  { asset: "apartmentHouse", position: [16, 0, -72], height: 27, rotationY: -1.1 },
  { asset: "apartmentHouse", position: [-6, 0, -86], height: 19, rotationY: 2.4 },
  { asset: "apartmentHouse", position: [38, 0, -95], height: 32, rotationY: 0.8 },
  { asset: "apartmentHouse", position: [-42, 0, -104], height: 24, rotationY: 1.7 },
];

export function CityBackdrop({ tier }: { tier: QualityTier }) {
  /* Nothing outside the window on the weakest hardware. The interior is the
     product; the skyline is atmosphere, and atmosphere is what you drop first. */
  const placements = useMemo(() => {
    if (tier === "low") return [];
    // Medium keeps the cheap untextured silhouettes and loses the 24 MB block.
    if (tier === "medium") return SKYLINE.filter((p) => p.asset === "apartmentHouse");
    return SKYLINE;
  }, [tier]);

  if (placements.length === 0) return null;
  return <Skyline placements={placements} />;
}

function Skyline({ placements }: { placements: Placement[] }) {
  /* Only the models this tier actually placed get fetched. `useGLTF` is a
     Suspense resource, so calling it for an unused asset would still download
     it — hence the set rather than a fixed pair of calls. */
  const needed = useMemo(
    () => [...new Set(placements.map((p) => p.asset))],
    [placements],
  );

  return (
    <group>
      {needed.map((key) => (
        <AssetGroup
          key={key}
          assetKey={key}
          placements={placements.filter((p) => p.asset === key)}
        />
      ))}
    </group>
  );
}

function AssetGroup({
  assetKey,
  placements,
}: {
  assetKey: keyof typeof GLB_CATALOG;
  placements: Placement[];
}) {
  const asset = GLB_CATALOG[assetKey];
  const { scene } = useGLTF(asset.path);

  /**
   * Grade the models into the night before they are ever placed.
   *
   * These arrive lit for daylight — bright concrete, white render, mid-grey
   * glass. Dropped into this scene untouched they came out brighter than the
   * tower they are meant to sit behind, which inverts the composition: the eye
   * goes to the neighbours and the subject recedes. In a night set the subject
   * has to be the brightest thing in frame, so everything else is pulled down
   * and cooled toward the page ground.
   *
   * Materials are cloned first. `useGLTF` caches the loaded scene globally, so
   * mutating the originals would quietly re-grade every other use of the same
   * file — including the view from inside the flat.
   */
  const graded = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = source.map((m) => {
        const mat = (m as THREE.MeshStandardMaterial).clone();
        /* 0.45, not the 0.72 this started at.
           At 0.72 these are pulled to within a few percent of the page ground,
           and once they were also standing upright — half the silhouette area
           of the same model lying on its back — they stopped being visible at
           all. They still must not out-read the tower, but a neighbour the eye
           cannot find is not context, it is nothing. */
        if (mat.color) mat.color.lerp(NIGHT, 0.45);
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.envMapIntensity = 0.6;
        /* These are Sketchfab exports, and several of them are modelled as
           single-sided shells with the normals authored for one hero angle.
           Seen from any other side — which is every side, once a drone camera
           orbits past — the near faces cull away and you look straight into a
           hollow, inside-out box. Rendering both faces costs nothing at this
           distance and is the difference between "a building" and "the back of
           a building". */
        mat.side = THREE.DoubleSide;
        /* Backface lighting on a double-sided mesh is only correct if the
           normal is flipped for the far face; without this the interior walls
           read as flat black holes. */
        mat.shadowSide = THREE.DoubleSide;
        // Emissive maps on these models are daytime signage; muting them stops
        // random panels glowing brighter than the tower's own lit windows.
        if (mat.emissive) mat.emissive.multiplyScalar(0.25);
        mat.needsUpdate = true;
        return mat;
      });
      if (mesh.material.length === 1) mesh.material = mesh.material[0];
    });
    return copy;
  }, [scene]);

  /**
   * No up-axis correction, deliberately. **Do not add one.**
   *
   * These models arrive correctly Y-up. Verified by transforming every
   * primitive's bounding box through its full node chain: `modern_city_block`'s
   * `roads_5_0` is flat in Y and sits at the bottom of the model's world
   * bounds, and `modern_apartment_house`'s world `min.y` is exactly 0.
   *
   * A −90° X rotation lived here briefly, on the mistaken reading that the
   * files were Z-up, and it turned every building upside down. The error was
   * concluding an up-axis from raw accessor `min`/`max`, which are local to
   * each primitive and say nothing about where its node chain puts it.
   *
   * See `use-upright-model.ts` for the same note and how to test properly if an
   * asset is ever swapped.
   */
  const upright = graded;

  /**
   * Fit the model to one metre tall, and record where its feet are.
   *
   * Two things were wrong here, and together they are most of why the skyline
   * sat badly.
   *
   * **The fit used the largest of x/y/z, not the height.** That is only ever
   * correct for a model that happens to be taller than it is wide, and it is a
   * coincidence when it holds: `modern_apartment_house` measures
   * 1280 × 1351 × 1030, so it survived by 5%. Any asset swapped in that is
   * wider than it is tall would have been scaled by its width and come out
   * squat. Fit to `size.y`, which is what `height` on a placement actually means.
   *
   * **Nothing was grounded.** Both models are modelled about their own centre —
   * `modern_city_block` runs y −213.8 → +213.8 — so placing them at y = 0 buried
   * the bottom half of every building in the ground plane and left the visible
   * part looking half the height it was asked for. The old
   * `- 0.4 - jitter() * 0.6` sink was compensating in the wrong direction for a
   * problem two orders of magnitude larger.
   *
   * `footY` is the model's own y-minimum in unit-height space, so a placement
   * lifts by `footY * height` to stand its base exactly on the ground.
   */
  const { unitScale, footY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(upright);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0 ? 1 / size.y : 1;
    return { unitScale: scale, footY: -box.min.y * scale };
  }, [upright]);

  return (
    <>
      {placements.map((p, index) => {
        const s = unitScale * p.height;
        return (
          <group
            key={`${assetKey}-${index}`}
            position={[
              p.position[0],
              // Feet on the ground, then the placement's own offset on top.
              p.position[1] + footY * p.height,
              p.position[2],
            ]}
            rotation={[0, p.rotationY, 0]}
            scale={s}
          >
            {/* drei's Clone shares geometry and materials across instances —
                `scene.clone()` would deep-copy 24 MB of buffers per placement.
                Cloning the pivot rather than the raw scene carries the
                up-axis correction with it. */}
            <Clone object={upright} />
          </group>
        );
      })}
    </>
  );
}

/* Warm the light model only.
   `cityBlock` is 24 MB and is now used by exactly one scene, which lazy-loads
   it on approach — preloading it here would put that 24 MB back on the hero's
   critical path through the back door, which is the bug this module just spent
   a paragraph explaining. */
useGLTF.preload(GLB_CATALOG.apartmentHouse.path);
