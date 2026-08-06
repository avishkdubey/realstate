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
    let safety: number | undefined;

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
          const reveal = gsap.from(lines, {
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

          // Fail-safe. `gsap.from` hides the text immediately and only reveals
          // it when ScrollTrigger fires — so if the trigger never fires the
          // headline stays invisible for good. That can happen on a tab that
          // loads in the background (rAF is paused, so ScrollTrigger never
          // ticks) or if a layout change leaves the start position unreachable.
          // Copy is not something to gamble on an animation library.
          safety = window.setTimeout(() => {
            if (!reveal.scrollTrigger?.isActive && reveal.progress() === 0) {
              reveal.progress(1);
            }
          }, 2500);
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
      if (safety) window.clearTimeout(safety);
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
