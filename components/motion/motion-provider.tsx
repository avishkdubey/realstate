"use client";

import { LazyMotion } from "framer-motion";

import loadDomAnimation from "@/components/motion/motion-features";

/**
 * Wraps the app in a single LazyMotion boundary.
 *
 * One boundary means the `domAnimation` feature bundle is fetched once and
 * shared by every `m.*` element on the page, instead of each reveal dragging
 * its own copy of the animation runtime into the initial chunk.
 *
 * `strict` makes the tree throw if anyone reaches for the full `motion`
 * component by mistake — which is exactly the regression this guards against.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}
