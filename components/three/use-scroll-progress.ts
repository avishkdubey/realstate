"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * How far a tall section has travelled through the viewport, as 0→1.
 *
 * The maths and the sampling strategy are lifted from `scroll-frame-sequence.tsx`,
 * which worked them out first and documents why: progress is read inside a
 * requestAnimationFrame loop rather than from a scroll listener, so it stays in
 * step with Lenis — which drives scrolling from its own loop and would otherwise
 * be a frame ahead of anything listening to the native event.
 *
 * Returns a **ref, not state**. Scrolling must never re-render React; the
 * consumer is a `useFrame` callback that reads `.current` on the same frame it
 * draws. That is also why this is preferred over GSAP ScrollTrigger for feeding
 * a 3D scene: R3F already runs a rAF loop, so the value lands in the exact
 * frame that uses it, with no scrub lag and no ScrollTrigger↔Lenis↔R3F
 * three-way sync to keep honest. ScrollTrigger stays for DOM text reveals,
 * where pinning and staggering are genuinely better handled by a timeline.
 *
 * One loop is shared by every registered element, so N sections cost one rAF.
 */

type Entry = { node: HTMLElement; target: { current: number } };

const registry = new Set<Entry>();
let frame = 0;

function sample() {
  for (const { node, target } of registry) {
    const rect = node.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    // A section shorter than the viewport can never scrub. Leave it at 0
    // rather than dividing by zero or snapping to 1.
    target.current = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
  }
  frame = requestAnimationFrame(sample);
}

function register(entry: Entry) {
  registry.add(entry);
  if (frame === 0) frame = requestAnimationFrame(sample);
  return () => {
    registry.delete(entry);
    if (registry.size === 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
): RefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return register({ node, target: progress });
  }, [ref]);

  return progress;
}
