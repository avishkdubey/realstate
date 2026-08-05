"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PRICE_BANDS, VASTU_FACINGS } from "@/lib/project-filters";
import { cn } from "@/lib/utils";

/**
 * Filters that write to the query string.
 *
 * The server component re-renders the grid from the URL, so a filtered view is
 * shareable, bookmarkable and crawlable. `useTransition` keeps the current
 * results interactive while the new ones stream in, rather than blanking the
 * page on every click.
 */
export function ProjectFilters({
  microMarkets,
  bhkOptions,
  activeCount,
}: {
  microMarkets: string[];
  bhkOptions: string[];
  activeCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) params.delete(key);
      else params.set(key, value);

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const current = (key: string) => searchParams.get(key);

  return (
    <div
      className={cn(
        "space-y-8 transition-opacity duration-200",
        pending && "opacity-60",
      )}
    >
      <FilterRow label="Status">
        <FilterChip
          active={!current("status")}
          onClick={() => setFilter("status", null)}
        >
          All
        </FilterChip>
        {(["ongoing", "completed", "upcoming"] as const).map((status) => (
          <FilterChip
            key={status}
            active={current("status") === status}
            onClick={() => setFilter("status", status)}
          >
            {status[0].toUpperCase() + status.slice(1)}
          </FilterChip>
        ))}
      </FilterRow>

      <FilterRow label="Micro-market">
        <FilterChip
          active={!current("microMarket")}
          onClick={() => setFilter("microMarket", null)}
        >
          All
        </FilterChip>
        {microMarkets.map((market) => (
          <FilterChip
            key={market}
            active={current("microMarket") === market}
            onClick={() => setFilter("microMarket", market)}
          >
            {market}
          </FilterChip>
        ))}
      </FilterRow>

      <FilterRow label="Configuration">
        <FilterChip active={!current("bhk")} onClick={() => setFilter("bhk", null)}>
          All
        </FilterChip>
        {bhkOptions.map((bhk) => (
          <FilterChip
            key={bhk}
            active={current("bhk") === bhk}
            onClick={() => setFilter("bhk", bhk)}
          >
            {bhk}
          </FilterChip>
        ))}
      </FilterRow>

      <FilterRow label="Budget">
        <FilterChip
          active={!current("maxPrice")}
          onClick={() => setFilter("maxPrice", null)}
        >
          Any
        </FilterChip>
        {PRICE_BANDS.map((band) => (
          <FilterChip
            key={band.value}
            active={current("maxPrice") === String(band.value)}
            onClick={() => setFilter("maxPrice", String(band.value))}
          >
            {band.label}
          </FilterChip>
        ))}
      </FilterRow>

      {/* Vastu facing is a real screening criterion here, not a novelty —
          east and north-east homes carry a resale premium (CLAUDE.md §2). */}
      <FilterRow label="Vastu facing">
        <FilterChip
          active={!current("facing")}
          onClick={() => setFilter("facing", null)}
        >
          Any
        </FilterChip>
        {VASTU_FACINGS.map((facing) => (
          <FilterChip
            key={facing}
            active={current("facing") === facing}
            onClick={() => setFilter("facing", facing)}
          >
            {facing}
          </FilterChip>
        ))}
      </FilterRow>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          className="eyebrow text-bronze border-b border-current pb-1"
        >
          Clear {activeCount} filter{activeCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-muted-foreground mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "eyebrow rounded-sm border px-4 py-2 transition-colors duration-200",
        active
          ? "bg-charcoal text-ivory border-charcoal"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
