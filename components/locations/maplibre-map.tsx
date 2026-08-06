"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Location } from "@/lib/types";

/**
 * MapLibre GL map of the micro-markets.
 *
 * Loaded only after `LocationMap` has decided the map is near the viewport, so
 * neither the library nor the tiles touch the critical path.
 *
 * ⚠ TILES: this uses OpenStreetMap's public raster tiles, which are fine for
 * development but explicitly not licensed for production traffic under the
 * OSMF tile usage policy. Set NEXT_PUBLIC_MAP_TILE_URL to a provider you have
 * an account with (MapTiler, Stadia, Protomaps) before this website goes live.
 */
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function MapLibreMap({
  locations,
  activeSlug,
  projectCounts,
}: {
  locations: Location[];
  activeSlug?: string;
  projectCounts?: Record<string, number>;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    let map: import("maplibre-gl").Map | undefined;
    let disposed = false;

    (async () => {
      // maplibre-gl exposes named exports, not a default.
      const maplibre = await import("maplibre-gl");
      if (disposed) return;

      const active = locations.find((l) => l.slug === activeSlug);
      const centre = active ?? locations[0];

      const instance = new maplibre.Map({
        container: node,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [TILE_URL],
              tileSize: 256,
              attribution: ATTRIBUTION,
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [centre.geo.lng, centre.geo.lat],
        zoom: active ? 12.5 : 10.5,
        // Keeps the interaction calm and stops the map swallowing page scroll.
        scrollZoom: false,
        attributionControl: { compact: true },
      });

      map = instance;
      instance.addControl(
        new maplibre.NavigationControl({ showCompass: false }),
        "top-right",
      );

      for (const location of locations) {
        const count = projectCounts?.[location.slug] ?? 0;
        const isActive = location.slug === activeSlug;

        // Markers are plain DOM so they inherit the brand palette rather than
        // MapLibre's defaults.
        const el = document.createElement("div");
        el.className = "map-marker";
        el.dataset.state = isActive ? "active" : count > 0 ? "has-projects" : "idle";
        el.setAttribute("aria-hidden", "true");

        new maplibre.Marker({ element: el })
          .setLngLat([location.geo.lng, location.geo.lat])
          .setPopup(
            new maplibre.Popup({ offset: 16, closeButton: false }).setHTML(
              `<strong>${location.name}</strong>${
                count > 0
                  ? `<br>${count} ${count === 1 ? "project" : "projects"}`
                  : ""
              }`,
            ),
          )
          .addTo(instance);
      }
    })();

    return () => {
      disposed = true;
      map?.remove();
    };
  }, [locations, activeSlug, projectCounts]);

  return (
    <div
      ref={container}
      className="aspect-[4/3] w-full border border-border"
      role="img"
      aria-label="Map of west Ahmedabad micro-markets"
    />
  );
}
