"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotionPreference } from "@/components/providers/reduced-motion-provider";

type Frame = ImageBitmap | HTMLImageElement;

/**
 * Scroll-driven image sequence — the technique Apple uses for product pages.
 *
 * A video is decoded to numbered stills ahead of time (see
 * `scripts/extract-frames.md`), and scroll position selects which still is
 * painted to a canvas. Scrubbing a sequence this way is far more responsive
 * than seeking a `<video>`, which forces a decode per seek and stutters badly
 * on mobile.
 *
 * Design notes:
 *  - frames live in state, not a ref, and the render loop is a single effect
 *    that depends on them. An earlier version split loading and painting
 *    across two effects communicating through refs, and the loop could end up
 *    reading a cache the other effect had already replaced — which froze the
 *    sequence on one frame with no error anywhere.
 *  - scroll position is sampled inside rAF rather than in a scroll listener,
 *    so it stays in step with Lenis (which drives scrolling from its own loop)
 *    and a fast flick never queues hundreds of draws.
 *  - frame 1 renders immediately as a plain `<img>`, so the hero is never
 *    empty while the rest decode.
 *  - reduced motion, Data Saver and 2G keep that still and skip the sequence.
 */
export function ScrollFrameSequence({
  frameCount,
  framePath,
  poster,
  className,
  children,
  sectionRef,
  dimmed = false,
}: {
  frameCount: number;
  /** Given a 1-based index, returns that frame's URL. */
  framePath: (index: number) => string;
  /** Rendered immediately and whenever the sequence is skipped. */
  poster: string;
  className?: string;
  children?: React.ReactNode;
  /**
   * Lets a parent measure the same scroll container this sequence measures.
   * The 3D hero drives its camera from exactly this element, so the two
   * backdrops stay in step and a hand-off between them is invisible.
   */
  sectionRef?: React.RefObject<HTMLElement | null>;
  /**
   * Fades the imagery out while keeping it mounted. Used when the 3D scene
   * takes over — unmounting would mean a blank frame if the GPU later drops
   * the context and we need this back.
   */
  dimmed?: boolean;
}) {
  const section = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const reducedMotion = useReducedMotionPreference();
  const [frames, setFrames] = useState<Frame[]>([]);
  /**
   * The canvas only fades in once something has actually been drawn on it.
   * Revealing it as soon as the frames decoded showed a black rectangle over
   * the poster on any tab where rAF had not run yet — a backgrounded tab, for
   * instance, where rAF is paused entirely.
   */
  const [hasPainted, setHasPainted] = useState(false);

  /* ---------------------------------------------------------------- load */
  useEffect(() => {
    if (reducedMotion) return;
    /* Nothing to decode if the imagery is not on screen. The hero now decides
       against the photography before first paint when it is going to render 3D
       instead, and fetching 36 frames to sit at `opacity: 0` behind a canvas is
       ~4.7 MB spent on something nobody will see. If the scene later fails,
       `dimmed` flips back and this effect re-runs. */
    if (dimmed) return;

    // A frame sequence is decoration; decoration should never cost someone
    // their data allowance.
    const connection = (
      navigator as { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g/.test(connection.effectiveType)) return;

    let cancelled = false;

    const load = async () => {
      const settled = await Promise.all(
        Array.from({ length: frameCount }, (_, i) =>
          loadFrame(framePath(i + 1)).catch(() => null),
        ),
      );
      if (cancelled) return;

      const usable = settled.filter((frame): frame is Frame => frame !== null);
      if (usable.length > 0) setFrames(usable);
    };

    // Decode after first paint so the sequence never competes with the LCP.
    const schedule =
      window.requestIdleCallback ?? ((cb: IdleRequestCallback) => setTimeout(cb, 600));
    const handle = schedule(() => void load());

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      }
    };
  }, [frameCount, framePath, reducedMotion, dimmed]);

  /* --------------------------------------------------------------- paint */
  useEffect(() => {
    if (reducedMotion || frames.length === 0) return;

    const node = section.current;
    const surface = canvas.current;
    if (!node || !surface) return;

    const context = surface.getContext("2d", { alpha: false });
    if (!context) return;

    let painted = -1;
    let raf = 0;

    const draw = (frame: Frame) => {
      // Cover-fit, so the sequence behaves like a background image.
      const { width: cw, height: ch } = surface;
      const scale = Math.max(cw / frame.width, ch / frame.height);
      const dw = frame.width * scale;
      const dh = frame.height * scale;
      context.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    /** Reads scroll position and paints the matching frame. Returns if unchanged. */
    const render = () => {
      const rect = node.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;

      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const index = Math.min(
        frames.length - 1,
        Math.round(progress * (frames.length - 1)),
      );
      if (index === painted) return;

      draw(frames[index]);
      painted = index;
      // Exposed so the sequence can be asserted on from outside.
      surface.dataset.frame = String(index);
      setHasPainted(true);
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      render();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      surface.width = Math.round(surface.clientWidth * dpr);
      surface.height = Math.round(surface.clientHeight * dpr);
      painted = -1; // resizing a canvas clears it
      render();
    };

    // Paint once synchronously, so the canvas is never revealed empty even if
    // the first animation frame is delayed or the tab is not rendering yet.
    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [frames, reducedMotion]);

  const active = hasPainted && !reducedMotion;

  return (
    <div
      ref={(node) => {
        section.current = node;
        // Publish the same element the parent may want to measure. Assigning
        // through the callback rather than accepting a forwarded ref keeps the
        // internal rAF loop reading a ref this component definitely owns.
        if (sectionRef) sectionRef.current = node;
      }}
      className={className}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* The imagery is a single unit so the 3D hand-off is one fade rather
            than two that can drift apart. */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            dimmed ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Always present, so there is never an empty frame. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            aria-hidden
            /* High only when it is actually the backdrop. When the 3D scene is
               taking over, this still is a fallback that will most likely never
               be shown, and racing it against the hero's fonts and the Three.js
               chunk costs the LCP it was added to protect. */
            fetchPriority={dimmed ? "low" : "high"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <canvas
            ref={canvas}
            aria-hidden
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

/** Prefers ImageBitmap — decoding off the main thread keeps scrolling smooth. */
async function loadFrame(url: string): Promise<Frame> {
  if (typeof createImageBitmap === "function") {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`frame ${url} failed`);
    return createImageBitmap(await response.blob());
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}
