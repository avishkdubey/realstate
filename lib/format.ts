import type { Project, Unit } from "@/lib/types";

/**
 * Formats rupees the way Indian buyers read them — in lakh and crore, not
 * millions. ₹1,85,00,000 becomes "₹1.85 Cr".
 */
export function formatPrice(rupees: number): string {
  if (rupees >= 10_000_000) {
    const crore = rupees / 10_000_000;
    return `₹${trim(crore)} Cr`;
  }
  const lakh = rupees / 100_000;
  return `₹${trim(lakh)} L`;
}

function trim(value: number): string {
  // Two decimals, minus any trailing zeros: 1.50 → 1.5, 2.00 → 2.
  return value.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * The headline price on a card or detail page.
 *
 * "Price on request" is used only where it is honest — sold-out and
 * unregistered projects. Hiding a live price behind a phone call is the
 * pattern this audience distrusts most (CLAUDE.md §3).
 */
export function priceLabel(project: Project): string {
  if (project.priceOnRequest || !project.startingPrice) return "Price on request";
  return `${formatPrice(project.startingPrice)} onwards`;
}

export function formatArea(project: Project): string {
  return `${project.carpetAreaMin.toLocaleString("en-IN")}–${project.carpetAreaMax.toLocaleString("en-IN")} sq ft carpet`;
}

export function formatStatus(status: Project["status"]): string {
  return { ongoing: "Ongoing", completed: "Completed", upcoming: "Upcoming" }[status];
}

/** Dated construction updates read better as "June 2026" than as ISO. */
export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function countAvailable(project: Project): number {
  return project.towers.reduce(
    (total, tower) =>
      total + tower.units.filter((unit: Unit) => unit.status === "available").length,
    0,
  );
}
