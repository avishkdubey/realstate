import type { Facing, Project, ProjectStatus } from "@/lib/types";

/**
 * Filter state lives in the URL, not in React state.
 *
 * A filtered view of the portfolio is something buyers share with family and
 * return to from a bookmark, and it is something Google can crawl. Both need
 * the query string to be the source of truth.
 */
export type ProjectFilterState = {
  status?: ProjectStatus;
  microMarket?: string;
  bhk?: string;
  /** Upper bound in rupees. */
  maxPrice?: number;
  facing?: Facing;
};

export const PRICE_BANDS = [
  { label: "Under ₹1 Cr", value: 10_000_000 },
  { label: "Under ₹1.5 Cr", value: 15_000_000 },
  { label: "Under ₹2.5 Cr", value: 25_000_000 },
  { label: "Under ₹3.5 Cr", value: 35_000_000 },
] as const;

export const VASTU_FACINGS: Facing[] = ["East", "North-East", "North", "West"];

/** Parses `searchParams` into typed filter state, ignoring anything unknown. */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ProjectFilterState {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const status = one("status");
  const maxPrice = one("maxPrice");
  const facing = one("facing");

  return {
    status:
      status === "ongoing" || status === "completed" || status === "upcoming"
        ? status
        : undefined,
    microMarket: one("microMarket") || undefined,
    bhk: one("bhk") || undefined,
    maxPrice: maxPrice ? Number(maxPrice) || undefined : undefined,
    facing: VASTU_FACINGS.includes(facing as Facing) ? (facing as Facing) : undefined,
  };
}

export function applyFilters(
  projects: Project[],
  filters: ProjectFilterState,
): Project[] {
  return projects.filter((project) => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.microMarket && project.microMarket !== filters.microMarket) return false;
    if (filters.bhk && !project.bhkOptions.includes(filters.bhk)) return false;
    if (filters.facing && project.vastuFacing !== filters.facing) return false;

    if (filters.maxPrice) {
      // Price-on-request projects have no number to compare, so a price filter
      // excludes them rather than silently showing them as a match.
      if (!project.startingPrice) return false;
      if (project.startingPrice > filters.maxPrice) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: ProjectFilterState): number {
  return Object.values(filters).filter(Boolean).length;
}
