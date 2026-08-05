"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

/**
 * Weighted smooth scroll — the single cheapest signal that a site was built
 * rather than assembled.
 *
 * Deliberately skipped on two paths: when the visitor asks for reduced motion,
 * and on coarse pointers, where hijacking native momentum scroll costs INP on
 * the low-end Android hardware much of this audience browses on (CLAUDE.md §6).
 */
export function LenisProvider() {
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
