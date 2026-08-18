"use client";

import type { RefObject } from "react";

import { HouseGrade, SceneFrame } from "@/components/three/scene-frame";
import { NightCityHero } from "@/components/three/night-city-hero";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { NIGHT } from "@/lib/three-palette";

/**
 * Mounts the night skyline against the scroll of the hero section.
 *
 * Replaces `construction-canvas.tsx`, which is no longer imported by anything.
 * Same split as every other scene here: the progress hook measures a DOM
 * element, the scene lives inside a `<Canvas>`, so one component owns the div
 * and another owns the R3F tree.
 *
 * `aria-hidden` throughout — this is scenery behind an H1, a paragraph and two
 * calls to action that are all server-rendered and read perfectly without it.
 */
export function NightCityCanvas({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollProgress(sectionRef);

  return (
    <div className="absolute inset-0" aria-hidden>
      <SceneFrame
        /* Overridden every frame by the route; this is only what the first
           painted frame looks like, so it is set wide rather than close. */
        camera={{ position: [-30, 12, 70], fov: 42 }}
        /* Night sky, not the page ground. Distant towers fading to #0d0d0d
           read as the model being cut off; fading to this reads as a sky. */
        background={NIGHT.sky}
        /* Deliberately shallow. Haze between the near and far ranks of towers
           is most of what makes a skyline read as deep rather than as a strip
           of cardboard cut-outs. */
        fog={{ near: 40, far: 200 }}
        effects={(tier) => <HouseGrade tier={tier} />}
      >
        {(tier) => <NightCityHero progress={progress} tier={tier} />}
      </SceneFrame>
    </div>
  );
}
