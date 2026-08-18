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
/* Same re-tune as SITE_SURROUNDS: these were authored against buildings that
   were buried to roughly half height, so standing them up honestly needs the
   numbers brought back down or the view from the flat becomes a wall. */
const SKYLINE: Placement[] = [
  { asset: "cityBlock", position: [8, 0, -46], height: 16, rotationY: -0.35 },
  { asset: "apartmentHouse", position: [-22, 0, -58], height: 21, rotationY: 0.2 },
  { asset: "apartmentHouse", position: [16, 0, -72], height: 27, rotationY: -1.1 },
  { asset: "apartmentHouse", position: [-6, 0, -86], height: 19, rotationY: 2.4 },
  { asset: "apartmentHouse", position: [38, 0, -95], height: 32, rotationY: 0.8 },
  { asset: "apartmentHouse", position: [-42, 0, -104], height: 24, rotationY: 1.7 },
];

/**
 * The city around the construction site, for the home hero.
 *
 * This is the difference between "a tower" and "a tower being built somewhere".
 * A massing model alone on a ground plane reads as a diagram no matter how well
 * it is lit — what makes it read as real is context: neighbours at varied
 * heights, set back at varied distances, receding into haze. The eye judges
 * scale by comparison, and with nothing to compare against there is no scale.
 *
 * The ring is deliberately open toward the camera's arc so the tower is never
 * occluded, and it leans on the untextured model for everything but the two
 * nearest slots, where detail is actually resolvable.
 */
/* Heights are re-tuned against honest grounding. Before the fix above, every
   building was sunk to roughly half its nominal height, so these numbers were
   authored ~2× too large to compensate. Standing them on the ground without
   re-tuning would have left the tower — 20.7 units — as the *shortest* thing
   in its own hero shot.

   The rule now: nothing in the near or middle ground exceeds ~16, so the
   subject is unambiguously the tallest thing in frame; the far skyline is
   allowed 22–28 because fog and distance already read it as smaller. */
/* Re-composed once the models stood up.
 *
 * Lying on their backs these sprawled across the frame and looked like a lot of
 * building. Upright and correctly grounded they are far smaller on screen —
 * `modern_apartment_house` is a squat block, ~32 × 34 in footprint for 26 of
 * height — so the previous ring, which sat 34 to 104 units out, put them beyond
 * the point where the eye registers them at all.
 *
 * So they come in: the nearest are now inside 30 units, where they read as
 * buildings rather than as texture, and the far rank is closer to the fog's
 * `near` of 45 so it stacks up in haze instead of dissolving entirely. Heights
 * stay under the tower's 20.7 in the near and middle ground — the subject has
 * to be the tallest thing in its own frame.
 */
const SITE_SURROUNDS: Placement[] = [
  // Near neighbours, flanking the camera's arc without crossing it.
  { asset: "cityBlock", position: [-26, 0, -20], height: 12, rotationY: 0.5 },
  { asset: "apartmentHouse", position: [27, 0, -24], height: 14, rotationY: -0.7 },
  // Middle distance.
  { asset: "apartmentHouse", position: [-30, 0, -38], height: 17, rotationY: 1.3 },
  { asset: "apartmentHouse", position: [30, 0, -44], height: 15, rotationY: 2.6 },
  { asset: "apartmentHouse", position: [-6, 0, -50], height: 19, rotationY: 0.15 },
  // Far skyline, stacking up in the haze.
  { asset: "apartmentHouse", position: [44, 0, -66], height: 26, rotationY: 1.9 },
  { asset: "apartmentHouse", position: [-48, 0, -74], height: 24, rotationY: 0.9 },
  { asset: "apartmentHouse", position: [12, 0, -84], height: 30, rotationY: 2.2 },
];

export function CitySurrounds({ tier }: { tier: QualityTier }) {
  const placements = useMemo(() => {
    if (tier === "low") return [];
    if (tier === "medium") {
      return SITE_SURROUNDS.filter((p) => p.asset === "apartmentHouse").slice(0, 5);
    }
    return SITE_SURROUNDS;
  }, [tier]);

  if (placements.length === 0) return null;
  return <Skyline placements={placements} />;
}

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
   * Stand the model up.
   *
   * **Both GLBs in use are authored Z-up**, and glTF is Y-up, so they were
   * being rendered lying on their backs. This is measurable, not a guess:
   * `modern_city_block`'s `terrain_5_0` mesh spans ±198 × ±192 but only ±2.8 in
   * Z, and its roads and kerb decals sit at z ≈ 0 — the ground plane is XY.
   * `modern_apartment_house` is the same story: `Box001_14` is a 1118 × 922 × 23
   * slab with `min.z = 0`, and most of its meshes start at z = 0.
   *
   * Sketchfab's exporter normally corrects this with a −90° X matrix on the
   * `Sketchfab_model` root, and it is present here — but the `.fbx` child node
   * directly beneath carries the exact inverse, so the two cancel to identity
   * and the correction never happens.
   *
   * That single missing rotation is what "you can see their back side" was:
   * a city block tipped onto its face, seen from underneath.
   *
   * Done as a pivot group rather than by swapping axes by hand so the bounding
   * box below is measured in the orientation the model is actually drawn in.
   */
  const upright = useMemo(() => {
    const pivot = new THREE.Group();
    pivot.rotation.x = -Math.PI / 2;
    pivot.add(graded);
    pivot.updateMatrixWorld(true);
    return pivot;
  }, [graded]);

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

/* Warm the two models the high tier will ask for, so the window is not empty
   while the interior is already walkable. */
useGLTF.preload(GLB_CATALOG.apartmentHouse.path);
useGLTF.preload(GLB_CATALOG.cityBlock.path);
