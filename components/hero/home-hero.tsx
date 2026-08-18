"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { DeferredConstruction } from "@/components/hero/deferred-construction";
import { ScrollFrameSequence } from "@/components/hero/scroll-frame-sequence";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";
import { useVisitor } from "@/lib/visitor-storage";

/**
 * The home hero.
 *
 * Two possible backdrops behind one unchanging foreground. Capable devices get
 * a tower assembling itself from pile caps to lit windows as you scroll;
 * everyone else gets the scroll-scrubbed photo sequence that was here before.
 *
 * The foreground — eyebrow, H1, lead paragraph, both calls to action — is
 * ordinary server-rendered markup in both cases and never moves. `CLAUDE.md` §7
 * is blunt about why: "bots read HTML, not WebGL pixels". It is also what makes
 * the 3D safe to fail; if the canvas dies the hero is still a hero.
 *
 * The frame sequence is not dead weight in the 3D path — it is the poster the
 * visitor looks at while the Three.js chunk loads, and the thing that comes
 * back if the GPU drops the context.
 */
const framePath = (index: number) =>
  `/frames/hero/${String(index).padStart(3, "0")}.webp`;

export function HomeHero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  /**
   * Starts `true` — assume the 3D backdrop until told otherwise.
   *
   * The photographic sequence used to be the default and was faded out once the
   * scene took over, which meant every visit opened on a still photograph and
   * then cross-faded to a construction site. That flash was the first thing
   * anyone noticed about the page.
   *
   * Inverting it costs one paint in the other direction: a device that cannot
   * run WebGL sees a dark hero for a single frame before `onActive(false)`
   * brings the photography in. The H1, the paragraph and both calls to action
   * are server-rendered and never depend on either backdrop, so the hero is
   * complete throughout — which is the property that makes this safe to invert.
   */
  const [sceneActive, setSceneActive] = useState(true);

  // Stable identity: DeferredConstruction has this in an effect dependency
  // list, and an inline arrow would re-run the capability check every render.
  const handleActive = useCallback((active: boolean) => setSceneActive(active), []);

  const visitor = useVisitor();

  return (
    <ScrollFrameSequence
      frameCount={36}
      framePath={framePath}
      poster="/frames/hero/001.webp"
      className="relative h-[350svh]"
      sectionRef={sectionRef}
      // Once the tower is up, the photo sequence behind it is wasted bandwidth
      // and a muddled image. Fade it out rather than unmounting, so a context
      // loss can bring it straight back.
      dimmed={sceneActive}
    >
      {/* The ground the hero sits on while the scene streams in.
          With the photographic backdrop suppressed, a cold load previously left
          flat #0d0d0d behind the copy until Three.js and the models arrived —
          which reads as a page that has failed rather than one that is
          arriving. A warm vertical wash with a low glow where the tower will
          stand costs nothing, needs no request, and makes the wait look
          deliberate. It stays underneath the canvas afterwards, so there is
          never a hard edge if the scene is slow or dies. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_60%_100%,#1c1913_0%,#131210_45%,#0d0d0d_100%)]"
      />

      <DeferredConstruction sectionRef={sectionRef} onActive={handleActive} />

      {/* Scrim: the render is bright, the type is light. Lighter over the 3D,
          which is already dark and does not need holding down. */}
      <div
        aria-hidden
        className={
          sceneActive
            ? "absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-0"
            : "absolute inset-0 bg-gradient-to-b from-charcoal/75 via-charcoal/40 to-charcoal/85"
        }
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
