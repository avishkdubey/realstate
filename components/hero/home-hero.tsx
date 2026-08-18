"use client";

import Image from "next/image";
import Link from "next/link";

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
export function HomeHero() {
  const visitor = useVisitor();
  const reducedMotion = useReducedMotionPreference();

  return (
    <section className="relative h-svh min-h-[600px] w-full overflow-hidden">
      {/* The LCP element. `priority` so it is discovered in the initial HTML
          rather than after hydration, and `sizes="100vw"` so a phone is not
          handed the 2560px variant. */}
      <Image
        src="/images/hero-city-night.webp"
        alt="A city skyline at dusk, towers lit against a monsoon sky"
        fill
        priority
        sizes="100vw"
        className={`object-cover ${
          reducedMotion ? "" : "animate-[drift_36s_ease-in-out_infinite_alternate]"
        }`}
      />

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
