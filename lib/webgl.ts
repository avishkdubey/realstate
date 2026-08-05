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
