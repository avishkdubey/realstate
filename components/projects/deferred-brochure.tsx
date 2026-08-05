"use client";

import dynamic from "next/dynamic";

import type { Project } from "@/lib/types";

/**
 * The brochure block sits at the bottom of the project page, so its form state
 * loads on mount rather than in the initial bundle.
 */
const BrochureDownload = dynamic(
  () =>
    import("@/components/projects/brochure-download").then(
      (m) => m.BrochureDownload,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse border border-border" aria-hidden />
    ),
  },
);

export function DeferredBrochure({ project }: { project: Project }) {
  return <BrochureDownload project={project} />;
}
