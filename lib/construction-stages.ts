import type { Project } from "@/lib/types";

export type Stage = NonNullable<Project["progress"][number]["stage"]>;

/**
 * The site's canonical construction ramp, and two easing helpers.
 *
 * `STAGE_FILL` began life inside `progress-timeline.tsx` as the fill level for
 * its little stacked-floors glyph, and was hoisted here when the scroll-driven
 * hero assembled a tower against the same numbers — so that a visitor reading
 * "Superstructure" against a 60%-full glyph was looking at one scale rather
 * than two that happened to resemble each other.
 *
 * That hero is gone, and with it went `STAGE_WINDOWS`, `stageAt`,
 * `stageProgress` and `staggeredReveal`, which had no other consumer. The
 * timeline glyph still uses the ramp, and `clamp01`/`smoothstep` are used by
 * the city-block tour, so what is left here is what is actually called.
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

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Hermite ease. Sharper than a lerp at the ends, which reads as deliberate. */
export function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}
