"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { useScrollProgress } from "@/components/three/use-scroll-progress";

/**
 * "What we build for you" — a horizontal track pulled sideways by vertical
 * scroll.
 *
 * The panels are laid out in a normal flex row and translated as a single
 * element, so the browser only ever composites one transform. Reading the
 * scroll position from the shared rAF loop in `use-scroll-progress` rather than
 * from a scroll event is what keeps it in step with Lenis — a `scroll`
 * listener runs a frame behind Lenis' own loop and the track visibly lags the
 * page.
 *
 * Reduced motion and narrow viewports get the same panels as an ordinary
 * swipeable row with scroll snapping. That is not a downgrade: on a phone a
 * native horizontal scroll is better than a hijacked vertical one, and it means
 * the section costs nothing on the devices least able to afford it.
 */

type Panel = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
};

const PANELS: Panel[] = [
  {
    eyebrow: "Apartments",
    title: "3 & 4 BHK homes",
    body: "Efficient plans with real balconies, cross ventilation and storage that was drawn in rather than added later.",
    image: "/images/projects/two20-slider.webp",
  },
  {
    eyebrow: "Penthouses",
    title: "Top-floor duplexes",
    body: "Double-height living, private terraces and a staircase that is part of the room rather than an afterthought.",
    image: "/images/projects/day-corner-new.webp",
  },
  {
    eyebrow: "Redevelopment",
    title: "Rebuilding older societies",
    body: "Existing members rehoused first, with the same carpet area written into the agreement before demolition starts.",
    image: "/images/projects/residency.webp",
  },
  {
    eyebrow: "Land & plotting",
    title: "Plotted development",
    body: "Titled, RERA-registered plots with roads, drainage and power in the ground before a single one is sold.",
    image: "/images/projects/bird-view.webp",
  },
  {
    eyebrow: "Commercial",
    title: "Offices and retail",
    body: "Ground-floor retail and upper-floor offices sized for businesses that actually exist in this city.",
    image: "/images/projects/kautilya-99.webp",
  },
];

export function WhatWeBuild() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progress = useScrollProgress(sectionRef);
  const reducedMotion = useReducedMotionPreference();

  /* The pinned version needs a wide viewport and a pointer that can scroll
     without hijacking. Resolved on the client so the server and the browser
     agree on the first render — a media query read during render would not. */
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
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last = -1;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progress.current;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;
      /* Travel is measured every frame rather than cached: the panels contain
         images, and a late-decoding image changes the track width after the
         first measurement. */
      const travel = track.scrollWidth - track.clientWidth;
      track.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      track.style.transform = "";
    };
  }, [pinned, progress]);

  return (
    <section
      ref={sectionRef}
      className={pinned ? "relative h-[320svh]" : "section"}
      aria-labelledby="what-we-build-heading"
    >
      <div
        className={
          pinned
            ? "sticky top-0 flex h-svh flex-col justify-center overflow-hidden"
            : ""
        }
      >
        <div className="container-page">
          <p className="eyebrow text-accent">What we build</p>
          <h2 id="what-we-build-heading" className="measure mt-6 text-h3">
            What we build for you.
          </h2>
        </div>

        <div
          className={
            pinned
              ? "mt-14 overflow-hidden"
              : "mt-14 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }
        >
          <div
            ref={trackRef}
            className={`flex gap-6 px-6 will-change-transform sm:px-8 ${
              pinned ? "" : "snap-x snap-mandatory"
            }`}
          >
            {PANELS.map((panel) => (
              <article
                key={panel.title}
                className="border-border bg-surface-1 w-[78vw] shrink-0 snap-start border sm:w-[52vw] lg:w-[30vw]"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={panel.image}
                    alt={panel.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 52vw, 78vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <p className="eyebrow text-gold-soft">{panel.eyebrow}</p>
                  <h3 className="mt-4 text-h5">{panel.title}</h3>
                  <p className="text-small text-muted-foreground mt-3">
                    {panel.body}
                  </p>
                </div>
              </article>
            ))}

            {/* The track ends on an action rather than trailing off. */}
            <div className="flex w-[78vw] shrink-0 snap-start items-center sm:w-[52vw] lg:w-[24vw]">
              <Link
                href="/projects"
                className="eyebrow text-foreground border-b border-current pb-1"
              >
                See every project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
