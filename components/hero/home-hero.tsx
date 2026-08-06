"use client";

import Link from "next/link";

import { ScrollFrameSequence } from "@/components/hero/scroll-frame-sequence";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * The home hero.
 *
 * A scroll-scrubbed sequence over the building, with the headline pinned in
 * front of it. The copy and both calls to action are ordinary markup — the
 * sequence sits behind them and can fail completely without taking the hero
 * with it.
 */
const framePath = (index: number) =>
  `/frames/hero/${String(index).padStart(3, "0")}.webp`;

export function HomeHero() {
  return (
    <ScrollFrameSequence
      frameCount={36}
      framePath={framePath}
      poster="/frames/hero/001.webp"
      className="relative h-[250svh]"
    >
      {/* Scrim: the render is bright, the type is light. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-charcoal/75 via-charcoal/40 to-charcoal/85"
      />

      <div className="relative flex h-full items-end">
        <div className="container-page pb-[12vh]">
          <p className="eyebrow text-gold-soft animate-[rise_0.9s_var(--ease-entrance)_both]">
            Ahmedabad · Since {siteConfig.foundedYear}
          </p>

          <h1 className="text-ivory mt-6 max-w-[16ch] text-h2 leading-[1.02] md:text-h1">
            <span className="block animate-[rise_1s_var(--ease-entrance)_0.08s_both]">
              A trusted builder
            </span>
            <span className="block animate-[rise_1s_var(--ease-entrance)_0.16s_both]">
              in Ahmedabad.
            </span>
          </h1>

          <p className="measure text-lead text-ivory/70 mt-8 animate-[rise_1s_var(--ease-entrance)_0.28s_both]">
            {siteConfig.stats.yearsExperience} years, {siteConfig.stats.completedProjects}{" "}
            completed projects and {siteConfig.stats.happyFamilies.toLocaleString("en-IN")}{" "}
            families who live in something we built.
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

      {/* Scroll affordance — the hero is 250vh, so it has to invite the move. */}
      <div
        aria-hidden
        className="text-ivory/50 absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <span className="eyebrow block animate-[nudge_2.4s_ease-in-out_infinite]">
          Scroll
        </span>
      </div>
    </ScrollFrameSequence>
  );
}
