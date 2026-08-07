"use client";

import { useMemo } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { GLB_CATALOG } from "@/lib/glb-catalog";
import { seededRandom } from "@/lib/tower-geometry";
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
const SKYLINE: Placement[] = [
  { asset: "cityBlock", position: [8, 0, -46], height: 26, rotationY: -0.35 },
  { asset: "apartmentHouse", position: [-22, 0, -58], height: 34, rotationY: 0.2 },
  { asset: "apartmentHouse", position: [16, 0, -72], height: 44, rotationY: -1.1 },
  { asset: "apartmentHouse", position: [-6, 0, -86], height: 30, rotationY: 2.4 },
  { asset: "apartmentHouse", position: [38, 0, -95], height: 52, rotationY: 0.8 },
  { asset: "apartmentHouse", position: [-42, 0, -104], height: 38, rotationY: 1.7 },
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
   * Fit the model to one metre tall, once, so each placement only has to
   * multiply by the height it wants.
   *
   * Measured from the loaded scene rather than read from the catalogue: the
   * catalogue records what the file claimed, but node transforms can change the
   * effective size, and this is the number that is actually true.
   */
  const unitScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const tallest = Math.max(size.x, size.y, size.z);
    return tallest > 0 ? 1 / tallest : 1;
  }, [scene]);

  /** Sink each building slightly so none appears to float on the fog line. */
  const jitter = useMemo(() => seededRandom(0x5eed), []);

  return (
    <>
      {placements.map((p, index) => {
        const s = unitScale * p.height;
        return (
          <group
            key={`${assetKey}-${index}`}
            position={[p.position[0], p.position[1] - 0.4 - jitter() * 0.6, p.position[2]]}
            rotation={[0, p.rotationY, 0]}
            scale={s}
          >
            {/* drei's Clone shares geometry and materials across instances —
                `scene.clone()` would deep-copy 24 MB of buffers per placement. */}
            <Clone object={scene} />
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
