"use client";

import { useEffect, useRef, useState } from "react";

type PannellumViewer = { destroy: () => void };
type PannellumApi = {
  viewer: (
    container: HTMLElement | string,
    config: Record<string, unknown>,
  ) => PannellumViewer;
};

/**
 * 360° panorama, rendered with Pannellum.
 *
 * Matters most to buyers who decide without ever standing in the building,
 * which describes a large share of NRI purchases (CLAUDE.md §2, §5).
 *
 * Pannellum is a UMD bundle that attaches to `window` and needs a DOM, so it
 * is imported inside an effect rather than at module scope — and only once the
 * viewer is near the viewport, so neither the script nor the panorama image
 * costs anything on pages the visitor never scrolls.
 */
export function PannellumTour({
  src,
  label,
}: {
  /** Equirectangular (2:1) panorama image. */
  src: string;
  label: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !container.current) return;

    const node = container.current;
    let viewer: PannellumViewer | undefined;
    let disposed = false;

    (async () => {
      try {
        await import("pannellum/build/pannellum.css");
        await import("pannellum/build/pannellum.js");
        if (disposed) return;

        const pannellum = (window as unknown as { pannellum?: PannellumApi })
          .pannellum;
        if (!pannellum) throw new Error("pannellum failed to attach to window");

        viewer = pannellum.viewer(node, {
          type: "equirectangular",
          panorama: src,
          autoLoad: true,
          // A slow drift reads as live without hijacking the visitor's scroll.
          autoRotate: -2,
          autoRotateInactivityDelay: 3000,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          keyboardZoom: true,
          mouseZoom: "fullscreenonly",
          backgroundColor: [0.08, 0.08, 0.08],
        });
      } catch (error) {
        console.warn("[pannellum] failed to initialise", error);
        setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      try {
        viewer?.destroy();
      } catch {
        // Pannellum throws if it never finished initialising; nothing to clean.
      }
    };
  }, [near, src]);

  return (
    <figure className="m-0">
      <div
        ref={container}
        className="bg-surface-1 aspect-[2/1] w-full overflow-hidden border border-border"
        role="img"
        aria-label={`360-degree view: ${label}`}
      />
      <figcaption className="text-caption text-muted-foreground mt-3">
        {failed
          ? "The 360° view could not load on this device."
          : "Drag to look around. Artist's impression — representational only."}
      </figcaption>
    </figure>
  );
}
