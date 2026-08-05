import { Fragment } from "react";

import { formatPrice } from "@/lib/format";
import type { Tower } from "@/lib/types";


/**
 * Unit availability, tower by tower.
 *
 * Phase 3 replaces the tower headings with a clickable 3D master plan; this
 * table stays underneath it as the fallback and as the crawlable version. The
 * numbers are the same either way — showing sold units rather than hiding them
 * is what makes the available ones believable.
 */
export function UnitMatrix({ towers }: { towers: Tower[] }) {
  return (
    <div className="space-y-16">
      {towers.map((tower) => {
        // Units repeat per floor, so one floor's stack describes the whole
        // tower without printing hundreds of near-identical rows.
        const perFloor = tower.units.length / tower.floors;
        const typicalFloor = tower.units.slice(0, perFloor);
        const available = tower.units.filter((u) => u.status === "available").length;

        return (
          <div key={tower.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
              <h3 className="text-h5">{tower.name}</h3>
              <p className="eyebrow text-muted-foreground">
                {tower.floors} floors · {available} of {tower.units.length} available
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="mt-6 w-full min-w-[36rem] text-left">
                <caption className="sr-only">
                  Typical floor plate for {tower.name}
                </caption>
                <thead>
                  <tr className="eyebrow text-muted-foreground">
                    <th scope="col" className="py-3 pr-6 font-normal">Unit</th>
                    <th scope="col" className="py-3 pr-6 font-normal">Type</th>
                    <th scope="col" className="py-3 pr-6 font-normal">Carpet area</th>
                    <th scope="col" className="py-3 pr-6 font-normal">Facing</th>
                    <th scope="col" className="py-3 font-normal">From</th>
                  </tr>
                </thead>
                <tbody>
                  {typicalFloor.map((unit, index) => (
                    <tr key={unit.id} className="border-t border-border">
                      <td className="py-4 pr-6 text-small">
                        {String.fromCharCode(65 + index)}
                      </td>
                      <td className="py-4 pr-6 text-small">{unit.bhk}</td>
                      <td className="py-4 pr-6 text-small">
                        {unit.carpetArea.toLocaleString("en-IN")} sq ft
                      </td>
                      <td className="py-4 pr-6 text-small">{unit.facing}</td>
                      <td className="py-4 text-small">
                        {unit.price ? formatPrice(unit.price) : "On request"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <FloorStack tower={tower} perFloor={perFloor} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * A compact floor-by-floor availability read, top floor first.
 *
 * Rendered as one grid rather than a stack of flex rows, and styled through a
 * `data-status` attribute instead of per-cell utility classes: a 22-floor
 * tower emits ~70 cells, and repeating a 90-character class string on each of
 * them was measurably inflating the HTML payload.
 */
function FloorStack({ tower, perFloor }: { tower: Tower; perFloor: number }) {
  const floors = Array.from({ length: tower.floors }, (_, i) => tower.floors - i);

  return (
    <div className="mt-10">
      <p className="eyebrow text-muted-foreground mb-4">Availability by floor</p>

      <div
        className="grid w-fit items-center gap-1"
        style={{
          gridTemplateColumns: `2rem repeat(${perFloor}, auto)`,
        }}
      >
        {floors.map((floor) => {
          const start = (floor - 1) * perFloor;
          return (
            <Fragment key={floor}>
              <span className="text-caption text-muted-foreground tabular-nums">
                {floor}
              </span>
              {tower.units.slice(start, start + perFloor).map((unit) => (
                <span key={unit.id} className="unit-cell" data-status={unit.status} />
              ))}
            </Fragment>
          );
        })}
      </div>

      <ul className="eyebrow text-muted-foreground mt-6 flex flex-wrap gap-6">
        <Legend status="available">Available</Legend>
        <Legend status="blocked">Blocked</Legend>
        <Legend status="sold">Sold</Legend>
      </ul>
    </div>
  );
}

function Legend({ status, children }: { status: string; children: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="unit-cell" data-status={status} aria-hidden />
      {children}
    </li>
  );
}
