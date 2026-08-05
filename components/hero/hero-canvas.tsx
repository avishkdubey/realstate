"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { WebGLBoundary } from "@/components/webgl-boundary";
import { shouldRenderWebGL } from "@/lib/webgl";

const HeroScene = dynamic(
  () => import("@/components/hero/hero-scene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

/**
 * Decides whether this device gets the WebGL hero at all.
 *
 * The scene is decoration layered behind real, server-rendered text — it never
 * carries content and it must never delay the LCP. So it mounts only once the
 * capability gate in `lib/webgl.ts` passes and the browser has gone idle.
 * Everyone else keeps the gradient hero, which is what the page renders
 * anyway (CLAUDE.md §7).
 */
export function HeroCanvas() {
  const reducedMotion = useReducedMotionPreference();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!shouldRenderWebGL(reducedMotion)) return;

    // Wait for the main thread to go quiet so the scene never competes with
    // hydration or the LCP paint.
    const schedule =
      window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(cb, 1200));
    const handle = schedule(() => setAllowed(true));

    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, [reducedMotion]);

  if (!allowed) return null;

  return (
    <WebGLBoundary>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 [animation:fade-in-canvas_1.2s_ease-out_forwards]"
        aria-hidden
      >
        <HeroScene />
      </div>
    </WebGLBoundary>
  );
}
