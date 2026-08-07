"use client";

import { useEffect, useRef, useState } from "react";
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
  const wrapper = useRef<HTMLDivElement>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!shouldRenderWebGL(reducedMotion)) return;

    // Two gates, not one. Idle keeps the decision off the hydration critical
    // path; the intersection check keeps the Three.js chunk from downloading
    // until the visitor is actually approaching the massing model.
    const node = wrapper.current;
    if (!node) return;

    let idleHandle: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const schedule =
          window.requestIdleCallback ??
          ((cb: IdleRequestCallback) => setTimeout(cb, 200));
        idleHandle = schedule(() => setAllowed(true)) as number;
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (window.cancelIdleCallback && typeof idleHandle === "number") {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [reducedMotion]);

  if (towers.length === 0) return null;

  return (
    <div ref={wrapper}>
      {allowed ? (
        <WebGLBoundary fallback={<PlanFallback towers={towers} />}>
          <div className="mb-16">
            <MasterPlan3D towers={towers} />
          </div>
        </WebGLBoundary>
      ) : (
        <PlanFallback towers={towers} />
      )}
    </div>
  );
}

function PlanFallback({ towers }: { towers: Tower[] }) {
  return (
    <div className="bg-surface-1 w-full border border-border mb-16 p-10 flex flex-col items-center justify-center min-h-[300px]">
      <div className="flex flex-wrap justify-center gap-6">
        {towers.map(tower => (
          <div key={tower.id} className="bg-surface-2 border border-border p-6 rounded-sm text-center min-w-[140px]">
             <h3 className="text-ivory eyebrow">{tower.name}</h3>
             <p className="text-caption text-muted-foreground mt-2">{tower.floors} floors</p>
          </div>
        ))}
      </div>
      <p className="text-caption text-muted-foreground mt-8 text-center max-w-sm">
        Interactive 3D model is unavailable. The availability table below carries all unit information in full.
      </p>
    </div>
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
