import type { Project } from "@/lib/types";

export type Stage = NonNullable<Project["progress"][number]["stage"]>;

/**
 * The site's canonical construction ramp.
 *
 * This lived inside `progress-timeline.tsx` first, as the fill level for its
 * little stacked-floors glyph. It is hoisted here because the scroll-driven
 * hero now assembles a tower against the same numbers — so a visitor who
 * watches the hero build and then reads "Superstructure" against a 60%-full
 * glyph on a project page is looking at one scale, not two that happen to
 * resemble each other.
 */
export const STAGE_FILL: Record<Stage, number> = {
  excavation: 0.1,
  foundation: 0.3,
  structure: 0.6,
  finishing: 0.85,
  handover: 1,
};

export const STAGE_LABELS: Record<Stage, string> = {
  excavation: "Site works",
  foundation: "Foundation",
  structure: "Superstructure",
  finishing: "Finishing",
  handover: "Handover",
};

/** Stage boundaries as [start, end] windows over 0→1 scroll progress. */
export const STAGE_WINDOWS: { stage: Stage; start: number; end: number }[] = [
  { stage: "excavation", start: 0, end: STAGE_FILL.excavation },
  { stage: "foundation", start: STAGE_FILL.excavation, end: STAGE_FILL.foundation },
  { stage: "structure", start: STAGE_FILL.foundation, end: STAGE_FILL.structure },
  { stage: "finishing", start: STAGE_FILL.structure, end: STAGE_FILL.finishing },
  { stage: "handover", start: STAGE_FILL.finishing, end: 1 },
];

/** Which stage a given overall progress falls in. Drives the on-screen caption. */
export function stageAt(progress: number): Stage {
  for (const window of STAGE_WINDOWS) {
    if (progress <= window.end) return window.stage;
  }
  return "handover";
}

/**
 * How far through a single stage we are, 0→1.
 *
 * Every element in the tower animates against one of these local ramps rather
 * than against overall progress, so each stage reads as a complete beat instead
 * of everything creeping forward at once.
 */
export function stageProgress(progress: number, stage: Stage): number {
  const window = STAGE_WINDOWS.find((entry) => entry.stage === stage);
  if (!window) return 0;
  const span = window.end - window.start;
  if (span <= 0) return progress >= window.end ? 1 : 0;
  return clamp01((progress - window.start) / span);
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Hermite ease. Sharper than a lerp at the ends, which reads as deliberate. */
export function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

/**
 * A per-item reveal ramp with a stagger.
 *
 * Given N items and a 0→1 stage progress, returns how far item `index` should
 * be revealed. Items overlap rather than going strictly one at a time — a
 * building where each floor waits for the last to finish looks mechanical;
 * one where the next starts before the last settles looks like a site.
 */
export function staggeredReveal(
  progress: number,
  index: number,
  count: number,
  overlap = 2.5,
  /**
   * Delays the whole ramp, as a fraction of stage progress. Used where one
   * trade must trail another — slabs are poured after their columns are stood.
   * Expressed here rather than by subtracting from `progress` at the call site,
   * because subtracting means the last item's ramp runs past 1 and it can never
   * finish (see below).
   */
  lag = 0,
): number {
  if (count <= 0) return 0;
  const window = Math.min(overlap / count, 1);

  /**
   * The last item must *start* at `1 - window`, so that it *finishes* exactly
   * as the stage does.
   *
   * The original spacing was `index / count`, which is a real bug rather than a
   * rounding matter: with 18 floors and an overlap of 3, floor 17 started at
   * 0.944 and its ramp needed until 1.11 to complete. At full stage progress it
   * reached 0.26 and floor 16 reached 0.74 — so the top three storeys of the
   * tower were permanently unfinished, which showed up on screen as short
   * columns hanging in mid-air, connected to nothing.
   */
  const usable = Math.max(1 - window - lag, 0);
  const start = count > 1 ? lag + (index / (count - 1)) * usable : lag;

  return smoothstep((progress - start) / window);
}
