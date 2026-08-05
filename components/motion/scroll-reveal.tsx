"use client";

import { useEffect, useRef } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

/**
 * GSAP-driven scroll choreography for headline sections.
 *
 * Framer Motion covers component-level reveals; this handles the scroll-linked
 * work it is not built for — a word-by-word headline reveal tied to scroll
 * position, plus a parallax drift on the block behind it.
 *
 * GSAP and ScrollTrigger load on demand rather than in the page bundle, and
 * only after the reduced-motion and viewport checks pass, so visitors who will
 * never see the effect never download it either.
 */
export function ScrollReveal({
  children,
  parallax = false,
}: {
  children: React.ReactNode;
  /** Adds a slow vertical drift as the section passes through the viewport. */
  parallax?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (reducedMotion || !container.current) return;

    const element = container.current;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const lines = element.querySelectorAll("[data-reveal-line]");

        if (lines.length > 0) {
          gsap.from(lines, {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: element,
              start: "top 78%",
              once: true,
            },
          });
        }

        if (parallax) {
          const target = element.querySelector("[data-parallax]");
          if (target) {
            gsap.to(target, {
              yPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            });
          }
        }
      }, element);

      cleanup = () => context.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion, parallax]);

  return <div ref={container}>{children}</div>;
}

/**
 * Wraps a line of a headline for the staggered reveal. The text is always in
 * the server-rendered HTML; only the transform is added.
 */
export function RevealLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden">
      <span data-reveal-line className="block">
        {children}
      </span>
    </span>
  );
}
