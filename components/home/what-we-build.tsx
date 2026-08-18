"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { clamp01, smoothstep } from "@/lib/construction-stages";

/**
 * "What we build for you" — six full-bleed panels that slide up and stack.
 *
 * Each category rises from the bottom of the viewport and comes to rest over
 * the one before it, which sinks back very slightly and dims. That parallax
 * between the arriving panel and the departing one is the whole effect: without
 * it the panels read as a slideshow, with it they read as depth.
 *
 * Everything animated here is `transform` and `opacity`, written straight to
 * the nodes from one rAF loop — never through React state. Six full-screen
 * panels re-rendering on every frame of a scroll would be the most expensive
 * thing on the page by a wide margin (`CLAUDE.md` §6: composite properties
 * only).
 *
 * Narrow viewports and `prefers-reduced-motion` get the same six panels as an
 * ordinary vertical stack. That is not a lesser version — hijacking scroll on a
 * phone to drive a pinned sequence is worse than the plain document flow it
 * replaces, and it costs nothing to skip on the devices least able to afford it.
 *
 * ── IMAGERY ────────────────────────────────────────────────────────────────
 * Every `image` below is a **stand-in taken from the client's own existing
 * project photography**, chosen for resolution rather than subject — the villa
 * panel is not a villa, and the plots panel is an aerial of a completed
 * scheme.
 *
 * They are deliberately not stock or web images. `CLAUDE.md` §6 rules out
 * "cheap staged stock" on craft grounds, but the binding reason is legal: this
 * is a live builder's marketing site, so an image lifted from a search result
 * is a copyright exposure, and under RERA §12 a photograph that implies the
 * promoter built something they did not is a misleading statement they are
 * liable for — a disclaimer does not waive it.
 *
 * To swap: drop six images into `public/images/categories/` and change the one
 * `image` field on each entry. Nothing else needs to move.
 * ───────────────────────────────────────────────────────────────────────────
 */

type Panel = {
  /** Two-digit index, shown as a counter. */
  index: string;
  title: string;
  tagline: string;
  body: string;
  image: string;
  href: string;
};

const PANELS: Panel[] = [
  {
    index: "01",
    title: "Elite Residences",
    tagline: "Where luxury meets legacy",
    body: "Larger floor plates, deeper balconies and specification published down to the make of the fittings — in the corridors where an address still means something.",
    image: "/images/projects/two20-slider.webp",
    href: "/projects",
  },
  {
    index: "02",
    title: "Villas",
    tagline: "Private sanctuaries, crafted for you",
    body: "Ground-plus-one living with your own garden, your own gate and no shared wall — planned for joint families who want proximity without compromise.",
    image: "/images/projects/day-corner-new.webp",
    href: "/projects",
  },
  {
    index: "03",
    title: "Value Residences",
    tagline: "Thoughtful living, smartly priced",
    body: "Efficient 2 and 3 BHK plans where every rupee is visible in the home rather than the brochure. Carpet area as RERA defines it, and a price published before you call.",
    image: "/images/projects/one54-slider.webp",
    href: "/projects",
  },
  {
    index: "04",
    title: "Commercial Offices & Retail",
    tagline: "Spaces that mean business",
    body: "Ground-floor retail and upper-floor offices sized for businesses that actually exist in this city — with parking counted honestly and power that holds.",
    image: "/images/projects/kautilya-99.webp",
    href: "/projects",
  },
  {
    index: "05",
    title: "Weekend Homes",
    tagline: "Your escape, closer than you think",
    body: "An hour out, on land with water and old trees, built to be shut up on a Sunday evening and opened again on a Friday without a caretaker's list of repairs.",
    image: "/images/projects/nilay-balcony.webp",
    href: "/projects",
  },
  {
    index: "06",
    title: "Residential Plots",
    tagline: "Your land, your beginning",
    body: "Titled, RERA-registered plots with roads, drainage and power in the ground before a single one is sold — so you build when you are ready, not when we are.",
    image: "/images/projects/bird-view.webp",
    href: "/projects",
  },
];

/** How far a covered panel sinks back, and how far it dims. */
const SINK = 0.07;
const DIM = 0.6;

export function WhatWeBuild() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useScrollProgress(sectionRef);
  const reducedMotion = useReducedMotionPreference();

  /* Element refs, one per panel. `slide` moves the whole panel up; `inner`
     carries the sink so the two transforms never fight for one node. */
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement | null>(null);

  /* The pinned version needs a wide viewport. Resolved on the client so the
     server and the browser agree on the first render — a media query read
     during render would not. */
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setPinned(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [reducedMotion]);

  useEffect(() => {
    if (!pinned) return;

    let frame = 0;
    let painted = -1;
    const steps = PANELS.length - 1;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const p = clamp01(progress.current);
      if (Math.abs(p - painted) < 0.0004) return;
      painted = p;

      // Position along the deck, in panels: 0 → the first, `steps` → the last.
      const seg = p * steps;

      for (let i = 0; i < PANELS.length; i++) {
        // How far panel `i` has slid in. The first panel is always in place.
        const arrive = i === 0 ? 1 : smoothstep(clamp01(seg - (i - 1)));
        // How far panel `i` has been covered by the one after it.
        const covered = i === PANELS.length - 1 ? 0 : smoothstep(clamp01(seg - i));

        const slide = slideRefs.current[i];
        if (slide) {
          slide.style.transform = `translate3d(0, ${(1 - arrive) * 100}%, 0)`;
          /* Panels still fully below the fold are taken out of paint entirely.
             Six stacked full-screen images with blurred edges is real
             compositing work on an integrated GPU, and only two are ever
             visible at once. */
          slide.style.visibility = arrive <= 0 ? "hidden" : "visible";
        }

        const inner = innerRefs.current[i];
        if (inner) inner.style.transform = `scale(${1 - SINK * covered})`;

        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = String(DIM * covered);
      }

      if (counterRef.current) {
        const active = Math.min(PANELS.length - 1, Math.round(seg));
        const label = PANELS[active].index;
        if (counterRef.current.textContent !== label) {
          counterRef.current.textContent = label;
        }
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pinned, progress]);

  /**
   * One `<section>`, always — never two branches returning different elements.
   *
   * `pinned` starts false, so an early `return` for the static case would mean
   * the first render produced a section carrying no ref. `useScrollProgress`
   * registers `sectionRef.current` from an effect keyed on the ref *object*,
   * which is stable, so that effect runs once, finds `null`, and never runs
   * again when `pinned` flips. The scroll position would then read 0 forever
   * and every panel would sit at `translateY(100%)`, invisible — which is
   * exactly what it did.
   *
   * Keeping the element type and position identical across the flip lets React
   * reuse the same DOM node, so the registration made on the first render stays
   * valid for the pinned one.
   *
   * Six panels: one at rest plus five transitions, at roughly 70svh of scroll
   * each. Long enough that a panel is readable before the next arrives, short
   * enough that it never feels like being held hostage.
   */
  return (
    <section
      ref={sectionRef}
      className={pinned ? "relative h-[440svh]" : "section"}
      aria-labelledby="what-we-build-heading"
    >
      {!pinned ? (
        <>
          <div className="container-page">
            <p className="eyebrow text-accent">What we build</p>
            <h2 id="what-we-build-heading" className="measure mt-6 text-h3">
              What we build for you.
            </h2>
          </div>

          <ul className="container-page mt-14 space-y-6">
            {PANELS.map((panel) => (
              <li key={panel.title}>
                <PanelCard panel={panel} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="sticky top-0 h-svh w-full overflow-hidden">
        {PANELS.map((panel, i) => (
          <div
            key={panel.title}
            ref={(node) => void (slideRefs.current[i] = node)}
            className="absolute inset-0 will-change-transform"
            style={{
              zIndex: i,
              // Pre-positioned so the first paint matches frame one of the loop.
              transform: i === 0 ? undefined : "translate3d(0, 100%, 0)",
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            <div
              ref={(node) => void (innerRefs.current[i] = node)}
              className="relative h-full w-full origin-center will-change-transform"
            >
              <Image
                src={panel.image}
                alt=""
                aria-hidden
                fill
                sizes="100vw"
                className="object-cover"
              />
              {/* Panel scrim, so the copy holds over any photograph. */}
              <div
                aria-hidden
                className="from-surface-0 via-surface-0/55 absolute inset-0 bg-gradient-to-t to-transparent"
              />
              {/* The dimmer, driven as this panel is covered. */}
              <div
                ref={(node) => void (shadeRefs.current[i] = node)}
                aria-hidden
                className="bg-surface-0 absolute inset-0 opacity-0"
              />

              <div className="relative flex h-full items-end">
                <div className="container-page pb-[12vh]">
                  <p className="eyebrow text-gold-soft">{panel.tagline}</p>
                  <h3 className="text-ivory mt-5 max-w-[14ch] text-h3 leading-[1.05] md:text-h2">
                    {panel.title}
                  </h3>
                  <p className="measure text-ivory/70 mt-6">{panel.body}</p>
                  <Link
                    href={panel.href}
                    className="eyebrow text-ivory mt-9 inline-block border-b border-current pb-1"
                  >
                    See these projects
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

          {/* Top scrim, under the heading layer and over every panel.
              Each panel's own scrim runs bottom-up for its copy, which leaves
              the top of the frame bare — and against a bright sky the fixed
              heading and counter simply vanished. This is the one gradient that
              cannot live on a panel, because it has to cover whichever panel
              happens to be arriving. */}
          <div
            aria-hidden
            className="from-surface-0/80 pointer-events-none absolute inset-x-0 top-0 z-40 h-56 bg-gradient-to-b to-transparent"
          />

          {/* Heading and counter ride above the deck and never move. Pushed
              clear of the site header, which is fixed and would otherwise sit
              on top of the counter. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="container-page flex items-start justify-between pt-[16vh]">
              <div>
                <p className="eyebrow text-gold-soft">What we build</p>
                <h2
                  id="what-we-build-heading"
                  className="text-ivory measure mt-4 text-h4"
                >
                  What we build for you.
                </h2>
              </div>
              {/* Bright enough to read against a sunlit photograph — at
                  ivory/50 it disappeared into the render behind it. */}
              <p className="eyebrow text-ivory/80 tabular-nums drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                <span ref={counterRef}>01</span>
                <span className="text-ivory/45">
                  {" "}
                  / {PANELS[PANELS.length - 1].index}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** The stacked-list rendering, used on narrow viewports and for reduced motion. */
function PanelCard({ panel }: { panel: Panel }) {
  return (
    <article className="border-border bg-surface-1 border">
      <div className="relative aspect-16/9 overflow-hidden">
        <Image
          src={panel.image}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 640px) 90vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-8">
        <p className="eyebrow text-gold-soft">{panel.tagline}</p>
        <h3 className="mt-4 text-h5">{panel.title}</h3>
        <p className="text-small text-muted-foreground measure mt-3">{panel.body}</p>
        <Link
          href={panel.href}
          className="eyebrow text-foreground mt-6 inline-block border-b border-current pb-1"
        >
          See these projects
        </Link>
      </div>
    </article>
  );
}
