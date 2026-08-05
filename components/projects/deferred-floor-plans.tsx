"use client";

import dynamic from "next/dynamic";

import type { Facing } from "@/lib/types";

/**
 * Keeps the floor-plan viewer's interaction code off the project page's
 * critical path. The page is the heaviest in the site and already sits at the
 * edge of its performance budget, so anything interactive below the fold
 * loads on mount rather than in the initial bundle (CLAUDE.md §15).
 */
const FloorPlanViewer = dynamic(
  () =>
    import("@/components/projects/floor-plan-viewer").then(
      (m) => m.FloorPlanViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="bg-card aspect-[3/2] w-full animate-pulse border border-border"
        aria-hidden
      />
    ),
  },
);

export function DeferredFloorPlans({
  options,
}: {
  options: { bhk: string; carpetArea: number; facing: Facing }[];
}) {
  return <FloorPlanViewer options={options} />;
}
