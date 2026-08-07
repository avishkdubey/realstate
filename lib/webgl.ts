/**
 * Decides whether a device should be given a WebGL scene at all.
 *
 * Every 3D surface on this site is decoration layered over content that
 * already works, so the bar for mounting one is deliberately high: a real GL
 * context, a pointer device, a wide viewport, enough cores, and no
 * reduced-motion preference (CLAUDE.md §7).
 */

/**
 * Actually creates a context rather than sniffing for support. Browsers report
 * WebGL as available in situations where context creation still fails —
 * blocklisted drivers, exhausted context limits, headless environments — and a
 * canvas that mounts without a context is worse than no canvas at all.
 */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    if (!gl) return false;

    // Release the probe context immediately; browsers cap how many can exist.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();

    return true;
  } catch {
    return false;
  }
}

/** True when the device looks too small or too weak to be worth the GPU cost. */
export function isLowCapabilityDevice(): boolean {
  if (typeof window === "undefined") return true;

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1023px)").matches;

  // deviceMemory is Chromium-only; its absence is not evidence of weakness.
  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  const lowMemory = memory !== undefined && memory < 4;
  const fewCores = navigator.hardwareConcurrency < 4;

  return coarse || narrow || lowMemory || fewCores;
}

/** The full gate. `reducedMotion` comes from the app-wide provider. */
export function shouldRenderWebGL(reducedMotion: boolean): boolean {
  return !reducedMotion && !isLowCapabilityDevice() && hasWebGL();
}

/* -------------------------------------------------------------------------- */
/* The showcase tier                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The gate for scenes that ARE the content rather than decoration over it.
 *
 * `shouldRenderWebGL` refuses every coarse pointer and every viewport under
 * 1024px, and for the surfaces it guards that is right: they sit over content
 * that already works, so refusing costs the visitor nothing. The onboarding
 * agent, the construction hero and the interior walkthrough are different —
 * they are the reason the page exists, and a phone visitor watching a static
 * image while desktop gets the scene defeats the point.
 *
 * So the question here is "can this device hold a GL context at all", not "is
 * this device comfortable". Comfort is handled by `qualityTier` turning the
 * scene down instead of off. Reduced motion is still an absolute refusal —
 * that is a stated preference, not a capability.
 */
export function shouldRenderShowcaseWebGL(reducedMotion: boolean): boolean {
  if (reducedMotion) return false;
  if (typeof window === "undefined") return false;

  // Data Saver is an explicit "do not spend my bandwidth" instruction, and
  // these scenes are the most expensive thing on the page.
  const connection = (
    navigator as { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;

  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 2) return false;
  if (navigator.hardwareConcurrency < 2) return false;

  return hasWebGL();
}

export type QualityTier = "high" | "medium" | "low";

/**
 * How much scene a device should be asked to draw.
 *
 * Drives DPR, shadow-map size, instance counts and whether postprocessing
 * mounts at all. Framing this as tiers rather than a perf budget is deliberate:
 * a scene that stutters is an *aesthetic* failure, so turning it down on weak
 * hardware serves the look, not a Lighthouse number.
 */
export function qualityTier(): QualityTier {
  if (typeof window === "undefined") return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory;
  const narrow = window.matchMedia("(max-width: 767px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  // deviceMemory is Chromium-only. Its absence is not evidence of weakness, so
  // it can only ever demote — never promote.
  if ((memory !== undefined && memory <= 2) || cores <= 2) return "low";
  if (narrow || coarse || cores <= 4 || (memory !== undefined && memory <= 4)) {
    return "medium";
  }
  return "high";
}

/** Device-pixel-ratio ceiling per tier. `CLAUDE.md` §7 caps this at 1.5. */
export function dprRange(tier: QualityTier): [number, number] {
  if (tier === "low") return [1, 1];
  if (tier === "medium") return [1, 1.25];
  return [1, 1.5];
}
