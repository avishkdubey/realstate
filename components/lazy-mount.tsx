"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Defers rendering a subtree until it is near the viewport.
 *
 * `next/dynamic` alone is not enough. It splits the chunk, but the import
 * still fires the moment the parent renders — which is during hydration — so
 * six deferred blocks on the project page meant six chunks downloading and
 * executing while the browser was trying to settle the first screen. That work
 * pushed LCP out to roughly where TTI landed, about 4.8s.
 *
 * Wrapping each block in this component moves the import to the point where
 * the visitor is actually approaching it. Nothing below the fold competes with
 * the paint above it.
 *
 * The placeholder must reserve the block's height, or deferring the mount
 * simply trades a slow LCP for a layout shift.
 */
export function LazyMount({
  children,
  placeholder,
  /** How far ahead to start loading. Enough to feel instant when scrolling. */
  rootMargin = "400px",
}: {
  children: React.ReactNode;
  placeholder: React.ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old browsers): render on the next tick
    // rather than leave the visitor looking at a skeleton forever. Deferred
    // by a timeout so it is a callback rather than a synchronous cascade.
    if (typeof IntersectionObserver === "undefined") {
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{mounted ? children : placeholder}</div>;
}

/** Height-reserving skeleton, so deferring a block costs no layout shift. */
export function Skeleton({ className }: { className: string }) {
  return <div className={`bg-card animate-pulse border border-border ${className}`} aria-hidden />;
}
