"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { useVisitor } from "@/lib/visitor-storage";

/**
 * The home hero: one photograph, held for a full viewport.
 *
 * **There is no WebGL here any more.** The night-skyline model, the procedural
 * construction sequence before it and the scroll-scrubbed frame sequence before
 * that have all been removed. What replaced three iterations of scene code is a
 * 379 KB image and a gradient — which is also, straightforwardly, the fastest
 * and most reliable hero this page has had: no chunk to fetch, no capability
 * gate, no context to lose, and a real LCP element that is painted from the
 * first frame of HTML rather than several seconds later.
 *
 * The section is one viewport tall rather than the 350vh the 3D versions
 * needed. A tall sticky container exists to give a camera somewhere to travel;
 * with a still image it would be three screens of scrolling past something that
 * does not change.
 *
 * The foreground — eyebrow, H1, lead paragraph, both calls to action — is
 * ordinary markup, as it was throughout the 3D versions, for the reason
 * `CLAUDE.md` §7 gives: "bots read HTML, not WebGL pixels."
 */
/** How much the photograph grows across the hero's exit. 1.0 → 1.16. */
const SCROLL_ZOOM = 0.16;

export function HomeHero() {
  const visitor = useVisitor();
  const reducedMotion = useReducedMotionPreference();

  const sectionRef = useRef<HTMLElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  /**
   * Scroll-linked zoom.
   *
   * Replaces a time-based CSS loop that drifted whether or not anyone was
   * looking at it. Tying the scale to scroll instead makes the movement the
   * visitor's own, which is the difference between a page that responds and a
   * page that merely animates.
   *
   * Three decisions worth stating:
   *
   * **A rAF loop, not a `scroll` listener.** Lenis drives scrolling from its own
   * loop, so anything listening to the native event runs a frame behind it and
   * the image visibly lags the page. Same reasoning as
   * `components/three/use-scroll-progress.ts`.
   *
   * **It cannot use that shared hook.** The hook measures how far a *tall*
   * section has travelled through the viewport and returns 0 when
   * `height - innerHeight <= 0`. This hero is exactly one viewport tall, so its
   * travel is zero and the hook would report 0 forever. What is measured here is
   * different: how far the hero has scrolled *out of* the top of the screen.
   *
   * **The transform is written straight to the node.** Scroll must never
   * re-render React — going through state here would run the whole hero, and
   * everything under it, on every frame of a scroll.
   *
   * One thing to know before debugging this: Chrome suspends
   * `requestAnimationFrame` entirely in a backgrounded tab, so the scale freezes
   * at its last value and no inline transform appears at all if the tab was
   * never visible. That is correct behaviour — but it makes the zoom look
   * broken when inspected through automation, which drives a tab that is
   * usually hidden. Check `document.visibilityState` before concluding
   * anything.
   */
  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const layer = zoomRef.current;
    if (!section || !layer) return;

    let frame = 0;
    let painted = -1;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const rect = section.getBoundingClientRect();
      // 0 while the hero fills the screen, 1 once it has fully left the top.
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(rect.height, 1)),
      );
      if (Math.abs(progress - painted) < 0.001) return;
      painted = progress;
      layer.style.transform = `scale(${1 + progress * SCROLL_ZOOM})`;
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      layer.style.transform = "";
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative h-svh min-h-[600px] w-full overflow-hidden"
    >
      {/* Scaled from its centre, so growing never uncovers an edge. The wrapper
          carries the transform rather than the <img> itself, because next/image
          owns that element's className and style. */}
      <div ref={zoomRef} className="absolute inset-0 will-change-transform">
        {/* The LCP element. `priority` so it is discovered in the initial HTML
            rather than after hydration, and `sizes="100vw"` so a phone is not
            handed the 2560px variant. */}
        <Image
          src="/images/hero-city-night.webp"
          alt="A city skyline at dusk, towers lit against a monsoon sky"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Scrim. Weighted to the foot, where the copy sits, and only light at
          the top so the skyline itself is not washed out. Two stops rather than
          one full-height gradient — a single wash flattens the sky. */}
      <div
        aria-hidden
        className="from-surface-0 via-surface-0/45 absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t to-transparent"
      />
      <div
        aria-hidden
        className="from-surface-0/60 absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent"
      />

      <div className="relative flex h-full items-end">
        <div className="container-page pb-[14vh]">
          {visitor?.name ? (
            <p className="eyebrow text-gold-soft animate-[rise_0.9s_var(--ease-entrance)_both]">
              Welcome back, {visitor.name}
            </p>
          ) : (
            <p className="eyebrow text-gold-soft animate-[rise_0.9s_var(--ease-entrance)_both]">
              Ahmedabad · Since {siteConfig.foundedYear}
            </p>
          )}

          <h1 className="text-ivory mt-6 max-w-[16ch] text-h2 leading-[1.02] md:text-h1">
            <span className="block animate-[rise_1s_var(--ease-entrance)_0.08s_both]">
              A trusted builder
            </span>
            <span className="block animate-[rise_1s_var(--ease-entrance)_0.16s_both]">
              in Ahmedabad.
            </span>
          </h1>

          <p className="measure text-lead text-ivory/70 mt-8 animate-[rise_1s_var(--ease-entrance)_0.28s_both]">
            {siteConfig.stats.yearsExperience} years,{" "}
            {siteConfig.stats.completedProjects} completed projects and{" "}
            {siteConfig.stats.happyFamilies.toLocaleString("en-IN")} families who
            live in something we built.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 animate-[rise_1s_var(--ease-entrance)_0.36s_both]">
            <Link
              href="/projects"
              className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              View Projects
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow text-ivory hover:bg-ivory hover:text-charcoal rounded-sm border border-ivory/30 px-8 py-4 transition-colors duration-300"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="text-ivory/50 absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <span className="eyebrow block animate-[nudge_2.4s_ease-in-out_infinite]">
          Scroll
        </span>
      </div>
    </section>
  );
}
