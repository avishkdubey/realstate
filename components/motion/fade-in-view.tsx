"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

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
 * Animates opacity and transform only, so it composites on the GPU and holds
 * 60fps; fires once per element; and resolves in 500ms, the ceiling set in
 * CLAUDE.md §6 — slower than that and the interface feels like it is making
 * the visitor wait.
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
    <motion.div
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
    </motion.div>
  );
}
