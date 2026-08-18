"use client";

import Link from "next/link";
import { useRef } from "react";

import { DeferredHeroScene } from "@/components/hero/deferred-hero-scene";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { useVisitor } from "@/lib/visitor-storage";

/**
 * The home hero: a low-poly night skyline, flown past on scroll.
 *
 * **There is no photographic backdrop any more.** The scroll-scrubbed frame
 * sequence and its poster still exist in the tree — `scroll-frame-sequence.tsx`
 * and `public/frames/hero/` — but nothing imports them. They were removed
 * because the hero opened on a still image that then cross-faded to 3D, which
 * was the first thing anyone noticed about the page, and because inverting the
 * fade to hide the still left 36 frames (~4.7 MB) being fetched to sit behind
 * an opaque canvas.
 *
 * What is left in their place is a CSS gradient ground. It costs no request, is
 * painted with the first frame of HTML, and is a complete backdrop in its own
 * right — which is what makes the 3D safe to fail. If the scene never mounts,
 * never loads, or has its context dropped, the hero is still a hero.
 *
 * The foreground — eyebrow, H1, lead paragraph, both calls to action — is
 * ordinary server-rendered markup and never moves. `CLAUDE.md` §7 is blunt
 * about why: "bots read HTML, not WebGL pixels."
 */
export function HomeHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const visitor = useVisitor();

  return (
    <section ref={sectionRef} className="relative h-[350svh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* The ground the hero sits on, and the loading state.
            A warm-to-cool night wash with the glow low and central, where the
            skyline resolves. Deliberately close to the scene's own background
            (`NIGHT.sky`) so the canvas fading in over it is invisible. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(130%_85%_at_50%_105%,#1d2438_0%,#111726_38%,#0b1220_70%,#090d16_100%)]"
        />

        <DeferredHeroScene sectionRef={sectionRef} />

        {/* Scrim. Bottom-weighted, where the copy is — the skyline sits across
            the middle of the frame and must not be washed out. */}
        <div
          aria-hidden
          className="from-surface-0 via-surface-0/40 absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t to-transparent"
        />

        <div className="relative flex h-full items-end">
          <div className="container-page pb-[12vh]">
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
              {siteConfig.stats.happyFamilies.toLocaleString("en-IN")} families
              who live in something we built.
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

        {/* Scroll affordance — the hero is 350vh, so it has to invite the move. */}
        <div
          aria-hidden
          className="text-ivory/50 absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <span className="eyebrow block animate-[nudge_2.4s_ease-in-out_infinite]">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}
