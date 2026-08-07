"use client";

import { useEffect, useSyncExternalStore } from "react";
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
 *
 * The instance is now published, because two things need it that did not
 * before: the onboarding gate has to stop and restart scrolling while it is
 * open, and GSAP's ScrollTrigger has to be told when Lenis moves or its
 * triggers drift out of step.
 *
 * Published through a module-scope store read with `useSyncExternalStore`
 * rather than through context — the same shape `reduced-motion-provider.tsx`
 * uses. Lenis genuinely is a singleton, so a store models it more honestly than
 * a provider, and it keeps `useLenis()` callable from anywhere without needing
 * to sit inside a subtree.
 */

let instance: Lenis | null = null;
const subscribers = new Set<() => void>();

function publish(next: Lenis | null) {
  instance = next;
  for (const notify of subscribers) notify();
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => void subscribers.delete(notify);
}

/**
 * The live Lenis instance, or null.
 *
 * Null is the normal case on touch devices and under reduced motion, not an
 * error — every caller has to handle it.
 */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    subscribe,
    () => instance,
    () => null,
  );
}

export function LenisProvider() {
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    publish(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /* ScrollTrigger reads native scroll position on its own schedule. Lenis
       drives window.scrollTo from a separate rAF loop, so without this the two
       sit a frame or more apart — which shows up as scrubbed animations that
       lag the page. `scroll-reveal.tsx` gets away with it today only because it
       fires once and never scrubs.

       Imported lazily so GSAP stays off the critical path. If the import fails
       we keep the smooth scroll and lose the sync, which is the right way round. */
    let detach: (() => void) | undefined;
    void import("gsap/ScrollTrigger")
      .then(({ ScrollTrigger }) => {
        const update = () => ScrollTrigger.update();
        lenis.on("scroll", update);
        detach = () => lenis.off("scroll", update);
      })
      .catch(() => {
        /* Optional. Smooth scroll still works without it. */
      });

    return () => {
      detach?.();
      cancelAnimationFrame(frame);
      lenis.destroy();
      publish(null);
    };
  }, [reducedMotion]);

  return null;
}
