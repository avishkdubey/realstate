"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { CorridorMap } from "@/components/locations/corridor-map";
import type { Location } from "@/lib/types";

const MapLibreMap = dynamic(
  () => import("@/components/locations/maplibre-map").then((m) => m.MapLibreMap),
  { ssr: false, loading: () => null },
);

/**
 * The location map, in two layers.
 *
 * The drawn SVG corridor map renders immediately and server-side — it is real,
 * crawlable content and it is what a visitor sees while anything else loads.
 * MapLibre then swaps in once the map scrolls near the viewport, giving pan,
 * zoom and street detail.
 *
 * Ordering it this way means the ~200KB library never sits on the critical
 * path, and a visitor on a slow connection or a blocked tile host still gets a
 * usable map rather than an empty rectangle.
 */
export function LocationMap({
  locations,
  activeSlug,
  projectCounts,
}: {
  locations: Location[];
  activeSlug?: string;
  projectCounts?: Record<string, number>;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper}>
      {near ? (
        <figure className="m-0">
          <MapLibreMap
            locations={locations}
            activeSlug={activeSlug}
            projectCounts={projectCounts}
          />
          <figcaption className="text-caption text-muted-foreground mt-3">
            Locations are indicative. Distances and drive times are approximate.
          </figcaption>
        </figure>
      ) : (
        <CorridorMap
          locations={locations}
          activeSlug={activeSlug}
          projectCounts={projectCounts}
        />
      )}
    </div>
  );
}
