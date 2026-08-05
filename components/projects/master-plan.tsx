"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { WebGLBoundary } from "@/components/webgl-boundary";
import type { Tower } from "@/lib/types";
import { shouldRenderWebGL } from "@/lib/webgl";

const MasterPlan3D = dynamic(
  () => import("@/components/projects/master-plan-3d").then((m) => m.MasterPlan3D),
  { ssr: false, loading: () => <PlanSkeleton /> },
);

/**
 * Gates the 3D master plan behind the same capability check as the hero.
 *
 * On mobile, low-power devices, browsers without a working WebGL context, and
 * for anyone who has asked for reduced motion, this renders nothing at all —
 * the availability table underneath is the real interface and always has been.
 */
export function MasterPlan({ towers }: { towers: Tower[] }) {
  const reducedMotion = useReducedMotionPreference();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!shouldRenderWebGL(reducedMotion)) return;

    // Deferred to idle so the decision — and the chunk fetch it triggers —
    // never competes with hydration on the site's heaviest page.
    const schedule =
      window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(cb, 800));
    const handle = schedule(() => setAllowed(true));

    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, [reducedMotion]);

  if (!allowed || towers.length === 0) return null;

  return (
    <WebGLBoundary>
      <div className="mb-16">
        <MasterPlan3D towers={towers} />
      </div>
    </WebGLBoundary>
  );
}

function PlanSkeleton() {
  return (
    <div
      className="bg-card mb-16 aspect-[4/3] w-full animate-pulse border border-border lg:aspect-[16/9]"
      aria-hidden
    />
  );
}
