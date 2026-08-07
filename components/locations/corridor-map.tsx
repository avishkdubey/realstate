import Link from "next/link";

import type { Location } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A drawn map of the west-Ahmedabad corridors.
 *
 * Deliberately not a tile map. A raster street map would cost ~200KB of
 * JavaScript, require a keyed tile provider before launch, and look like every
 * other builder's website. This is inline SVG: server-rendered, no JavaScript,
 * about three kilobytes, and in the brand's palette.
 *
 * Positions are schematic — relative geography, not survey coordinates — so
 * the map carries the "not to scale" disclaimer §13 requires.
 *
 * The props are intentionally generic. Swapping in MapLibre later means
 * replacing this one file.
 */

/** Schematic positions on a 100×100 field, roughly matching real geography. */
const POSITIONS: Record<string, { x: number; y: number }> = {
  chandkheda: { x: 62, y: 16 },
  "gift-city-corridor": { x: 80, y: 8 },
  "sindhu-bhavan-road": { x: 44, y: 46 },
  "sg-highway": { x: 50, y: 56 },
  "south-bopal": { x: 33, y: 68 },
  shela: { x: 24, y: 80 },
};

/** The arterial roads, drawn as a single spine with two branches. */
const ROADS = [
  // SG Highway running south-west to north-east, up towards GIFT City.
  "M 18,88 L 33,68 L 50,56 L 62,16 L 80,8",
  // Sindhu Bhavan spur.
  "M 50,56 L 44,46",
  // SP Ring Road arc across the south-west.
  "M 12,72 Q 30,92 58,84",
];

export function CorridorMap({
  locations,
  activeSlug,
  projectCounts,
  className,
}: {
  locations: Location[];
  activeSlug?: string;
  /** Slug → number of projects, used to weight the markers. */
  projectCounts?: Record<string, number>;
  className?: string;
}) {
  return (
    <figure className={cn("m-0", className)}>
      <svg
        viewBox="0 0 100 100"
        className="bg-surface-2 block h-auto w-full border border-border"
        role="img"
        aria-label="Schematic map of west Ahmedabad micro-markets"
      >
        {/* Sabarmati river, as a soft vertical reference. */}
        <path
          d="M 88,0 Q 74,30 70,52 Q 66,74 74,100"
          fill="none"
          className="stroke-[var(--forest-lift)]"
          strokeWidth={1.6}
          strokeOpacity={0.18}
        />

        {ROADS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            className="stroke-[var(--stone-2)]"
            strokeWidth={0.7}
            strokeOpacity={0.6}
            strokeLinecap="round"
          />
        ))}

        {locations.map((location) => {
          const position = POSITIONS[location.slug];
          if (!position) return null;

          const isActive = location.slug === activeSlug;
          const count = projectCounts?.[location.slug] ?? 0;
          const radius = count > 0 ? 1.9 : 1.2;

          // Labels on the right-hand side are anchored to their end, or long
          // corridor names run off the edge of the viewBox.
          const labelRight = position.x > 55;
          const labelX = labelRight ? position.x - 3.2 : position.x + 3.2;
          const anchor = labelRight ? "end" : "start";

          return (
            <g key={location.slug}>
              {isActive && (
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={4.2}
                  className="fill-[var(--gold)]"
                  fillOpacity={0.22}
                />
              )}
              <circle
                cx={position.x}
                cy={position.y}
                r={radius}
                className={
                  count > 0 || isActive
                    ? "fill-[var(--gold)]"
                    : "fill-[var(--stone-2)]"
                }
              />
              <text
                x={labelX}
                y={position.y + 1}
                textAnchor={anchor}
                className={
                  isActive ? "fill-[var(--ivory)]" : "fill-[var(--stone-2)]"
                }
                style={{ fontSize: 2.9, fontWeight: isActive ? 600 : 400 }}
              >
                {location.name}
              </text>
              {count > 0 && (
                <text
                  x={labelX}
                  y={position.y + 4.4}
                  textAnchor={anchor}
                  className="fill-[var(--bronze)]"
                  style={{ fontSize: 2.2 }}
                >
                  {count} {count === 1 ? "project" : "projects"}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <figcaption className="text-caption text-muted-foreground mt-3">
        Map not to scale — indicative only. Positions show relative geography,
        not surveyed coordinates.
      </figcaption>
    </figure>
  );
}

/** Text index that accompanies the map, so the information is not visual-only. */
export function CorridorList({
  locations,
  projectCounts,
}: {
  locations: Location[];
  projectCounts?: Record<string, number>;
}) {
  return (
    <ul className="divide-y divide-border">
      {locations.map((location) => (
        <li key={location.slug}>
          <Link
            href={`/locations/${location.slug}`}
            className="group flex items-baseline justify-between gap-6 py-5"
          >
            <span>
              <span className="text-lead group-hover:text-accent transition-colors duration-200">
                {location.name}
              </span>
              <span className="text-small text-muted-foreground mt-1 block">
                {location.tagline}
              </span>
            </span>
            <span className="eyebrow text-muted-foreground shrink-0">
              {projectCounts?.[location.slug]
                ? `${projectCounts[location.slug]} here`
                : "—"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
