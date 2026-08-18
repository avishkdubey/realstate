"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type RefObject } from "react";

import { WebGLBoundary } from "@/components/webgl-boundary";
import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { shouldRenderShowcaseWebGL } from "@/lib/webgl";

/**
 * Decides whether the hero gets the 3D skyline, and loads it out of band.
 *
 * Replaces `deferred-construction.tsx`. There is no IntersectionObserver
 * because the hero is the first thing on screen — waiting for it to scroll into
 * view would mean waiting forever.
 *
 * The gate is `shouldRenderShowcaseWebGL`, not `shouldRenderWebGL`: phones are
 * deliberately included, because this scene *is* the hero rather than
 * decoration over one. Comfort is handled by `qualityTier` turning the scene
 * down, not off. See `lib/webgl.ts`.
 */
const NightCityCanvas = dynamic(
  () =>
    import("@/components/hero/night-city-canvas").then((m) => m.NightCityCanvas),
  { ssr: false, loading: () => null },
);

export function DeferredHeroScene({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const reducedMotion = useReducedMotionPreference();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!shouldRenderShowcaseWebGL(reducedMotion)) return;

    /* Idle, so the capability check and the chunk fetch are not on the
       hydration critical path. The hero's copy is already painted by now and
       does not depend on any of this. */
    const schedule =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 200));
    const handle = schedule(() => setAllowed(true));

    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, [reducedMotion]);

  if (!allowed) return null;

  /* No fallback element. The hero's gradient ground sits underneath and is a
     complete backdrop on its own, so a scene that fails or never mounts simply
     uncovers it — there is nothing to swap in and nothing to signal. */
  return (
    <WebGLBoundary>
      <NightCityCanvas sectionRef={sectionRef} />
    </WebGLBoundary>
  );
}
