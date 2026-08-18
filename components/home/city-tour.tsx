"use client";

import type { RefObject } from "react";

import { HouseGrade, SceneFrame } from "@/components/three/scene-frame";
import { CityBlockTour } from "@/components/three/city-block-tour";
import { useScrollProgress } from "@/components/three/use-scroll-progress";

/**
 * Mounts the city-block tour against the scroll of its own section.
 *
 * Same split as `construction-canvas.tsx`: the progress hook measures a DOM
 * element, the scene lives inside a `<Canvas>`, so one component owns the div
 * and another owns the R3F tree.
 */
export function CityTour({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollProgress(sectionRef);

  return (
    <div className="absolute inset-0" aria-hidden>
      <SceneFrame
        camera={{ position: [31, 21, 40], fov: 38 }}
        /* Starts past the block's far corner rather than through the middle of
           it. At near 60 the back half of the block was already half-dissolved
           into the background, which on a near-black ground reads as "nothing
           rendered" rather than as depth. */
        /* `far` matches SceneFrame's 200-unit far plane exactly, so the ground
           plane is fully hazed out by the time it is clipped and the cut never
           shows as an edge. */
        fog={{ near: 70, far: 200 }}
        effects={(tier) => <HouseGrade tier={tier} />}
      >
        {(tier) => <CityBlockTour progress={progress} tier={tier} />}
      </SceneFrame>
    </div>
  );
}
