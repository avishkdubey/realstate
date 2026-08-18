"use client";

import type { RefObject } from "react";

import { HouseGrade, SceneFrame } from "@/components/three/scene-frame";
import { CityBlockTour } from "@/components/three/city-block-tour";
import { useScrollProgress } from "@/components/three/use-scroll-progress";

/**
 * Mounts the city-block tour against the scroll of its own section.
 *
 * The progress hook measures a DOM element while the scene has to live inside a
 * `<Canvas>`, so one component owns the div and another owns the R3F tree.
 */
export function CityTour({
  sectionRef,
  onReady,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /** Forwarded to the scene; fires once the 24 MB model has actually loaded. */
  onReady?: () => void;
}) {
  const progress = useScrollProgress(sectionRef);

  return (
    <div className="absolute inset-0" aria-hidden>
      <SceneFrame
        /* Matches ROUTE[0] in city-block-tour.tsx (3.6, 2.6, 4.4 × the block's
           18-unit height), so the first painted frame is already the
           establishing shot rather than a lurch toward it. */
        camera={{ position: [65, 47, 79], fov: 38 }}
        /* Starts past the near rank of buildings, and `far` matches
           SceneFrame's 200-unit far plane exactly — so the ground plane is
           fully hazed out by the time it is clipped and the cut never shows as
           an edge. The establishing shot sits ~112 units out with the block's
           far corner around 171, which is the range this has to grade across. */
        fog={{ near: 70, far: 200 }}
        effects={(tier) => <HouseGrade tier={tier} />}
      >
        {(tier) => (
          <CityBlockTour progress={progress} tier={tier} onReady={onReady} />
        )}
      </SceneFrame>
    </div>
  );
}
