"use client";

import type { RefObject } from "react";

import { HouseGrade, SceneFrame } from "@/components/three/scene-frame";
import { TowerConstruction } from "@/components/three/tower-construction";
import { useScrollProgress } from "@/components/three/use-scroll-progress";

/**
 * Mounts the construction scene against the scroll of the hero section.
 *
 * Kept separate from `TowerConstruction` because the progress hook measures a
 * DOM element while the scene has to live inside a `<Canvas>` — so one owns the
 * div and the other the R3F tree.
 *
 * Absolutely positioned to fill whatever the hero gives it, and `aria-hidden`
 * throughout: this is scenery behind content that already reads without it.
 * That is also what keeps the hero's server-rendered H1 and CTAs untouched.
 */
export function ConstructionCanvas({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollProgress(sectionRef);

  return (
    <div className="absolute inset-0" aria-hidden>
      <SceneFrame
        camera={{ position: [11, 5, 16], fov: 46 }}
        /* Fog now has to reach past the neighbourhood, whose furthest buildings
           sit ~100 units out. Starting it at 45 keeps the tower itself crisp
           while the surrounds stack up in haze behind it — which is what gives
           the site depth rather than a row of cut-outs. */
        fog={{ near: 45, far: 190 }}
        effects={(tier) => <HouseGrade tier={tier} />}
      >
        {(tier) => <TowerConstruction progress={progress} tier={tier} />}
      </SceneFrame>
    </div>
  );
}
