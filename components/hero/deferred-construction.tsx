"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type RefObject } from "react";

import { WebGLBoundary } from "@/components/webgl-boundary";
import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { shouldRenderShowcaseWebGL } from "@/lib/webgl";

/**
 * Decides whether the hero gets the 3D tower, and loads it out of band if so.
 *
 * Follows the `deferred-*` convention the rest of the codebase uses — a client
 * shim holding one `dynamic(..., { ssr: false })` — with the gating pattern from
 * `master-plan.tsx`: decide capability, then wait for idle so the decision
 * itself is not on the hydration critical path.
 *
 * Unlike `master-plan.tsx` there is no IntersectionObserver, because the hero is
 * the first thing on screen; waiting for it to scroll into view would mean
 * waiting forever.
 *
 * The gate here is `shouldRenderShowcaseWebGL`, not `shouldRenderWebGL` — see
 * the note in `lib/webgl.ts` for why phones are deliberately included.
 */
const ConstructionCanvas = dynamic(
  () =>
    import("@/components/hero/construction-canvas").then(
      (m) => m.ConstructionCanvas,
    ),
  { ssr: false, loading: () => null },
);

export function DeferredConstruction({
  sectionRef,
  onActive,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  /** Lets the hero cross-fade its static fallback out once 3D takes over. */
  onActive: (active: boolean) => void;
}) {
  const reducedMotion = useReducedMotionPreference();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!shouldRenderShowcaseWebGL(reducedMotion)) {
      onActive(false);
      return;
    }

    /* Reported *now*, not from inside the idle callback below.
       `onActive` is what tells the hero to drop the photographic backdrop, and
       deferring it meant the visitor saw a photograph for however long the idle
       queue took — then a cross-fade to 3D. That flash of an unrelated still is
       the first thing anyone notices on the page. The decision is already known
       synchronously here; only the *loading* needs to wait for idle. */
    onActive(true);

    const schedule =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 300));
    const handle = schedule(() => {
      setAllowed(true);
    });

    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, [reducedMotion, onActive]);

  if (!allowed) return null;

  return (
    <WebGLBoundary
      // A scene that dies should uncover the frame sequence underneath, not
      // leave a hole. Reporting inactive is what triggers that.
      fallback={<FallbackSignal onMount={() => onActive(false)} />}
    >
      <ConstructionCanvas sectionRef={sectionRef} />
    </WebGLBoundary>
  );
}

/** Renders nothing; exists so the boundary can tell the hero it failed. */
function FallbackSignal({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return null;
}
