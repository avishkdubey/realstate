"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { useScrollProgress } from "@/components/three/use-scroll-progress";
import { clamp01, smoothstep } from "@/lib/construction-stages";

/**
 * "What we build for you" — six landscape cards dealt onto a 3D stack.
 *
 * Each card rises from below the fold, tilted forward, and lands flat on the
 * deck. The cards already there are pushed back in Z and nudged up, so their
 * top edges stay visible behind the current one — the section reads as a
 * physical stack being dealt rather than as a slideshow.
 *
 * The 3D is real perspective, not a fake: the stage carries
 * `perspective: 1600px` and every card is transformed on the Z axis, so the
 * foreshortening between the front card and the one three back is computed by
 * the compositor. `rotateX` on the arriving card is what sells it — a card that
 * slides up without tilting reads as flat no matter what else is happening.
 *
 * Everything animated is `transform` and `opacity`, written straight to the
 * nodes from a single rAF loop, never through React state. Six cards
 * re-rendering on every frame of a scroll would be the most expensive thing on
 * the page (`CLAUDE.md` §6: composite properties only).
 *
 * Narrow viewports and `prefers-reduced-motion` get the same six as a plain
 * vertical list. Hijacking scroll on a phone to drive a pinned sequence is
 * worse than the document flow it replaces.
 *
 * ── IMAGERY ────────────────────────────────────────────────────────────────
 * Five of the six are Pexels photographs, in `public/images/categories/`. The
 * Pexels licence permits commercial use and modification and requires no
 * attribution, which is the only reason they are usable here — an image lifted
 * from a search result is a copyright exposure on a live builder's site.
 *
 * Each was downloaded and *looked at* before being chosen, which is not
 * ceremony: the search results included a Toronto skyline with the CN Tower
 * in it, a rustic wooden shack, a bridge construction site filed under "land
 * development", and a worn apartment block with laundry hanging off the
 * balconies. A recognisable foreign landmark on an Ahmedabad builder's page is
 * worse than a generic stand-in, not better. Portrait-orientation images were
 * rejected outright — these cards are 16:9, and a portrait photo crops to a
 * meaningless horizontal band.
 *
 * **Elite Residences deliberately keeps the client's own render.** It is a real
 * Kautilya project, it is higher quality than anything the stock search turned
 * up for that category, and it carries no third-party licence and no §12
 * question at all. Swapping it for generic European stock would be a downgrade
 * on every axis that matters.
 *
 * None of the other five depicts a Kautilya building, which is why the section
 * carries a representational-purpose line. Under RERA §12 a photograph implying
 * the promoter built something they did not is a misleading statement they are
 * liable for; the line does not waive that, it stops the page asserting
 * something untrue in the first place. Replace these with real project
 * photography as it becomes available and the line can go.
 *
 * To swap: replace the file at the `image` path. Nothing else moves.
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
    image: "/images/categories/villas.webp",
    href: "/projects",
  },
  {
    index: "03",
    title: "Value Residences",
    tagline: "Thoughtful living, smartly priced",
    body: "Efficient 2 and 3 BHK plans where every rupee is visible in the home rather than the brochure. Carpet area as RERA defines it, and a price published before you call.",
    image: "/images/categories/value-residences.webp",
    href: "/projects",
  },
  {
    index: "04",
    title: "Commercial Offices & Retail",
    tagline: "Spaces that mean business",
    body: "Ground-floor retail and upper-floor offices sized for businesses that actually exist in this city — with parking counted honestly and power that holds.",
    image: "/images/categories/commercial.webp",
    href: "/projects",
  },
  {
    index: "05",
    title: "Weekend Homes",
    tagline: "Your escape, closer than you think",
    body: "An hour out, on land with water and old trees, built to be shut up on a Sunday evening and opened again on a Friday without a caretaker's list of repairs.",
    image: "/images/categories/weekend-homes.webp",
    href: "/projects",
  },
  {
    index: "06",
    title: "Residential Plots",
    tagline: "Your land, your beginning",
    body: "Titled, RERA-registered plots with roads, drainage and power in the ground before a single one is sold — so you build when you are ready, not when we are.",
    image: "/images/categories/plots.webp",
    href: "/projects",
  },
];

/** How the deck behaves. Tuned against a 1600px perspective. */
const DECK = {
  /** How far back each covered card is pushed, in px of Z. */
  depth: 110,
  /** How far each covered card peeks up, as a % of card height. */
  peek: 5,
  /** Forward tilt of a card still on its way in, in degrees. */
  tilt: 11,
  /** How many cards stay in the stack behind the front one. */
  visibleBehind: 3,
  /** Dimming applied per step back. */
  dim: 0.26,
};

export function WhatWeBuild() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useScrollProgress(sectionRef);
  const reducedMotion = useReducedMotionPreference();

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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

      // Position along the deck, in cards: 0 → the first, `steps` → the last.
      const seg = p * steps;

      for (let i = 0; i < PANELS.length; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        // How far this card has been dealt in. The first is always down.
        const arrive = i === 0 ? 1 : smoothstep(clamp01(seg - (i - 1)));
        // How many cards have landed on top of it, as a continuous value.
        const behind = Math.min(Math.max(seg - i, 0), DECK.visibleBehind);

        const enterY = (1 - arrive) * 118;
        const stackY = -behind * DECK.peek;
        const z = -behind * DECK.depth;
        const tilt = (1 - arrive) * DECK.tilt;

        card.style.transform = `translate3d(0, ${enterY + stackY}%, ${z}px) rotateX(${tilt}deg)`;

        /* Cards still below the fold, and cards buried past the back of the
           stack, are taken out of paint entirely — six full-size images with
           blurred edges is real compositing work on an integrated GPU. */
        card.style.visibility =
          arrive <= 0 || seg - i > DECK.visibleBehind + 0.25 ? "hidden" : "visible";

        const shade = shadeRefs.current[i];
        if (shade) shade.style.opacity = String(Math.min(behind * DECK.dim, 0.8));
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
   * and every card would sit below the fold, invisible — which is exactly what
   * it did the first time.
   */
  return (
    <section
      ref={sectionRef}
      className={pinned ? "bg-surface-1 relative h-[440svh]" : "section"}
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

          <p className="container-page text-caption text-muted-foreground mt-10">
            Images are representative only and do not depict a specific project.
          </p>
        </>
      ) : (
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          {/* A little depth behind the deck, so the cards sit in a space
              rather than on a flat panel. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_35%,#1b1b1b_0%,#141414_55%,#0d0d0d_100%)]"
          />

          {/* The stage. `perspective` here is what makes the Z translations on
              the cards foreshorten; without it they would merely scale. */}
          <div
            className="absolute inset-0 flex items-center justify-center pt-[5vh]"
            style={{ perspective: "1900px", perspectiveOrigin: "50% 45%" }}
          >
            {/* Sized from HEIGHT, not width, with the width following from the
                aspect ratio.

                Driving it from width put a 1120px card at 630px tall, which on
                a 674px-high window left the card's own copy hanging off the
                bottom of the screen. A landscape card has to fit the short axis
                first; the long axis has room to spare on any desktop. */}
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                /* Height drives the box; width follows from the aspect ratio,
                   clamped so it never runs to the screen edges.

                   68svh rather than the 58 this started at. The first pass was
                   tuned on a 674px-tall window, where the card came out 391px
                   high and read as a thumbnail floating in a lot of empty
                   ground. The copy block inside needs about 200px, so 68% still
                   leaves comfortable room on a short laptop while filling the
                   frame properly on anything taller. */
                height: "min(68svh, 760px)",
                aspectRatio: "16 / 9",
                maxWidth: "92vw",
              }}
            >
              {/* Reserves the deck's box, so the absolutely positioned cards
                  have something to sit in and the layout never depends on them. */}
              <div className="h-full w-full" aria-hidden />

              {PANELS.map((panel, i) => (
                <div
                  key={panel.title}
                  ref={(node) => void (cardRefs.current[i] = node)}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    zIndex: i,
                    transformOrigin: "50% 100%",
                    // Pre-positioned so the first paint matches frame one.
                    transform:
                      i === 0
                        ? undefined
                        : `translate3d(0, 118%, 0) rotateX(${DECK.tilt}deg)`,
                    visibility: i === 0 ? "visible" : "hidden",
                  }}
                >
                  <div className="border-hairline relative h-full w-full overflow-hidden rounded-md border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)]">
                    <Image
                      src={panel.image}
                      alt=""
                      aria-hidden
                      fill
                      sizes="(min-width: 1200px) 1120px, 88vw"
                      className="object-cover"
                    />
                    {/* Card scrim, so the copy holds over any photograph. */}
                    <div
                      aria-hidden
                      className="from-surface-0 via-surface-0/60 absolute inset-0 bg-gradient-to-t to-transparent"
                    />
                    {/* The dimmer, driven as this card is covered. */}
                    <div
                      ref={(node) => void (shadeRefs.current[i] = node)}
                      aria-hidden
                      className="bg-surface-0 absolute inset-0 opacity-0"
                    />

                    <div className="relative flex h-full items-end">
                      <div className="p-7 md:p-10">
                        <p className="eyebrow text-gold-soft">{panel.tagline}</p>
                        <h3 className="text-ivory mt-3 max-w-[16ch] text-h4 leading-[1.06]">
                          {panel.title}
                        </h3>
                        <p className="measure text-small text-ivory/70 mt-3">
                          {panel.body}
                        </p>
                        <Link
                          href={panel.href}
                          className="eyebrow text-ivory mt-5 inline-block border-b border-current pb-1"
                        >
                          See these projects
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heading and counter ride above the deck and never move. Pushed
              clear of the site header, which is fixed. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
            <div className="container-page flex items-start justify-between pt-[14vh]">
              <div>
                <p className="eyebrow text-gold-soft">What we build</p>
                <h2
                  id="what-we-build-heading"
                  className="text-ivory measure mt-4 text-h4"
                >
                  What we build for you.
                </h2>
              </div>
              <p className="eyebrow text-ivory/80 tabular-nums">
                <span ref={counterRef}>01</span>
                <span className="text-ivory/45">
                  {" "}
                  / {PANELS[PANELS.length - 1].index}
                </span>
              </p>
            </div>
          </div>

          <p className="text-ivory/35 absolute inset-x-0 bottom-6 text-center text-[0.6875rem] tracking-wide">
            Images are representative only and do not depict a specific project.
          </p>
        </div>
      )}
    </section>
  );
}

/** The stacked-list rendering, used on narrow viewports and for reduced motion. */
function PanelCard({ panel }: { panel: Panel }) {
  return (
    <article className="border-border bg-surface-1 overflow-hidden rounded-md border">
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
