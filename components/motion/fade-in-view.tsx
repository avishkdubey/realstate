"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { cn } from "@/lib/utils";

type FadeInViewProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Seconds of stagger before this element animates. Keep small. */
  delay?: number;
  /** Vertical travel in px. 16–24 reads as composure; more reads as a demo. */
  distance?: number;
};

/**
 * The default reveal for section content.
 *
 * Deliberately hand-rolled rather than built on Framer Motion. Pages here
 * carry a dozen or more of these, and each Framer instance brings its own
 * hydration and animation-frame cost — measured at roughly 150–300ms of extra
 * blocking time on the amenities and project pages. One IntersectionObserver
 * and a CSS transition do the same job for a fraction of it.
 *
 * Animates opacity and transform only, so it composites on the GPU; fires once
 * per element; resolves in 500ms, the ceiling set in CLAUDE.md §6.
 */
export function FadeInView({
  children,
  delay = 0,
  distance = 20,
  className,
  style,
  ...props
}: FadeInViewProps) {
  const reducedMotion = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      // Matches the -100px viewport margin the previous implementation used.
      { rootMargin: "0px 0px -100px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Reduced motion gets the final state immediately: same markup, same layout,
  // no movement and no observer.
  const hidden = !reducedMotion && !revealed;

  return (
    <div
      ref={ref}
      className={cn("motion-safe:will-change-[opacity,transform]", className)}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${distance}px)` : "none",
        transition: reducedMotion
          ? undefined
          : `opacity 500ms var(--ease-entrance) ${delay}s, transform 500ms var(--ease-entrance) ${delay}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
