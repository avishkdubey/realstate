"use client";

import { m, type HTMLMotionProps } from "framer-motion";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

type FadeInViewProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  /** Seconds of stagger before this element animates. Keep small. */
  delay?: number;
  /** Vertical travel in px. 16–24 reads as composure; more reads as a demo. */
  distance?: number;
};

/**
 * The default reveal for section content.
 *
 * Built on Framer Motion's `m` primitive rather than `motion`: `m` carries no
 * features of its own and draws them from the single `LazyMotion` boundary in
 * the root layout, which is what keeps a page of a dozen reveals affordable.
 *
 * Animates opacity and transform only, so it composites on the GPU and holds
 * 60fps; fires once per element; resolves in 500ms, the ceiling set in
 * CLAUDE.md §6.
 *
 * When the visitor prefers reduced motion the element renders in its final
 * state: same markup, same layout, no movement.
 */
export function FadeInView({
  children,
  delay = 0,
  distance = 20,
  ...props
}: FadeInViewProps) {
  const reducedMotion = useReducedMotionPreference();
  const hidden = reducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: distance };

  return (
    <m.div
      initial={hidden}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }
      }
      {...props}
    >
      {children}
    </m.div>
  );
}
