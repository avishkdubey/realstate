"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { WebGLBoundary } from "@/components/webgl-boundary";
import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";
import { shouldRenderShowcaseWebGL } from "@/lib/webgl";

/**
 * "Not one building. A neighbourhood." — the city-block tour section.
 *
 * A tall scroll container with a sticky viewport inside it, exactly like the
 * hero: scroll position drives a camera through `modern_city_block.glb` while
 * the copy over the top stays put.
 *
 * Three differences from the hero, all deliberate:
 *
 *  - **It waits to be seen.** The hero cannot use an IntersectionObserver
 *    because it is already on screen; this is well below the fold and the model
 *    is 24 MB, so nothing is fetched until the visitor is approaching it.
 *  - **The fallback is a real photograph**, not an empty box. Reduced motion, a
 *    weak device or a dead GL context all land on the same still, and the copy
 *    reads identically over either.
 *  - **The copy is server-renderable markup**, so the section says what it says
 *    to a crawler that will never run the canvas (`CLAUDE.md` §7).
 */
const CityTour = dynamic(
  () => import("@/components/home/city-tour").then((m) => m.CityTour),
  { ssr: false, loading: () => null },
);

export function CityTourSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const [allowed, setAllowed] = useState(false);
  const [sceneActive, setSceneActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (!shouldRenderShowcaseWebGL(reducedMotion)) return;

    /* Two viewports of lead time. The GLB and the Three.js chunk together are
       the largest fetch on the page, and starting them the moment the section
       clips the fold means the visitor arrives at a half-loaded scene. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        /* Only start loading. `sceneActive` — which is what takes the
           photograph away — is now set by the scene itself once the model has
           arrived. Setting both here meant the still vanished the instant the
           observer fired while 24 MB was still in flight, and the section sat
           empty and dark for as long as that took. It read as "the 3D model has
           disappeared", which is exactly what it looked like. */
        setAllowed(true);
        observer.disconnect();
      },
      { rootMargin: "200% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative h-[300svh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* The still. Always mounted, faded out once the scene is live, so a
            lost GL context uncovers it instantly rather than leaving a hole. */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            sceneActive ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src="/images/projects/bird-view.webp"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {allowed && (
          <WebGLBoundary fallback={<FallbackSignal onMount={() => setSceneActive(false)} />}>
            <CityTour
              sectionRef={sectionRef}
              onReady={() => setSceneActive(true)}
            />
          </WebGLBoundary>
        )}

        {/* Loading note. The model is 24 MB — on a slow connection that is a
            long, silent wait, and silence is what makes people think something
            is broken. Shown only while the fetch is genuinely in flight. */}
        {allowed && !sceneActive && (
          <p className="eyebrow text-ivory/45 absolute top-6 right-6 animate-pulse">
            Loading the model
          </p>
        )}

        {/* Scrim.
            Confined to the bottom third, where the copy actually is. The first
            version ran the full height at 85% → 25% → 90%, and the camera looks
            *down* at the block — so the model sat squarely in the lower half,
            under the 90% end. It was rendering the whole time and was almost
            perfectly invisible. Type needs a ground to sit on; the rest of the
            frame needs to be left alone. */}
        <div
          aria-hidden
          className="from-surface-0 via-surface-0/55 absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t to-transparent"
        />
        {/* A whisper at the very top, so the header does not collide with a
            bright roofline. Nothing like enough to hide anything. */}
        <div
          aria-hidden
          className="from-surface-0/70 absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent"
        />

        <div className="relative flex h-full items-end">
          <div className="container-page pb-[14vh]">
            <p className="eyebrow text-gold-soft">Not one building</p>
            <h2 className="text-ivory mt-6 max-w-[18ch] text-h3 leading-[1.06] md:text-h2">
              A neighbourhood, planned as one thing.
            </h2>
            <p className="measure text-lead text-ivory/70 mt-6">
              Roads, setbacks, parking, courtyards and the walk from the gate to
              your door are drawn together — before the first tower is priced.
            </p>
            <Link
              href="/locations"
              className="eyebrow text-ivory mt-10 inline-block border-b border-current pb-1"
            >
              See where we build
            </Link>
          </div>
        </div>

        {/* Honest about what the visitor is looking at. Under RERA §12 a visual
            that implies a specific building is a representation the promoter is
            liable for, and a generic massing model is not one of our projects. */}
        <p className="text-ivory/35 absolute right-6 bottom-6 text-[0.6875rem] tracking-wide">
          Indicative massing model — not a specific project.
        </p>
      </div>
    </section>
  );
}

/** Renders nothing; exists so the boundary can report that it failed. */
function FallbackSignal({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return null;
}
