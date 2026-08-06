/**
 * Framer Motion feature bundle, loaded lazily.
 *
 * Importing `motion` pulls in every feature — layout animation, drag, gestures,
 * SVG path morphing — whether a page uses them or not. This site only ever
 * animates opacity and transform, so it loads `domAnimation` (the smallest
 * feature set) asynchronously through `LazyMotion`, and components use the `m`
 * primitive rather than `motion`.
 *
 * That combination is roughly a third of the full package, and it is what makes
 * Framer affordable on pages carrying a dozen reveals (CLAUDE.md §4, §15).
 */
export default async function loadDomAnimation() {
  const { domAnimation } = await import("framer-motion");
  return domAnimation;
}
