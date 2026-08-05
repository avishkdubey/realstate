"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

const ReducedMotionContext = createContext(false);

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Single source of truth for `prefers-reduced-motion`.
 *
 * Every motion decision in the app reads this: Lenis stays off, GSAP degrades
 * to fades, and the WebGL hero swaps for a static image. CSS handles its own
 * half via the media query in globals.css; this covers the JS half.
 *
 * Read through `useSyncExternalStore` rather than an effect, so the value is
 * correct on the first client render — no flash of motion before the
 * preference is detected.
 */
export function ReducedMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotionQuery();

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

function useReducedMotionQuery(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(QUERY);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // Server snapshot: assume motion is allowed, then correct on hydration.
    () => false,
  );
}

/** Read the visitor's motion preference from any client component. */
export function useReducedMotionPreference(): boolean {
  return useContext(ReducedMotionContext);
}
