import { cn } from "@/lib/utils";

/**
 * Stands in for project photography until real assets arrive.
 *
 * Deliberately not stock imagery. A buyer in this segment reads generic
 * photography as a lie about the building, and a render shown without its
 * disclaimer is a §12 exposure — so this renders an abstract tonal field that
 * is obviously a placeholder and carries the disclaimer on its face.
 */
export function PlaceholderVisual({
  label,
  seed = 0,
  className,
  disclaimer = "Artist's impression — demo",
}: {
  /** Project or section name, shown faintly across the field. */
  label: string;
  /** Varies the gradient so cards in a grid do not look identical. */
  seed?: number;
  className?: string;
  disclaimer?: string;
}) {
  const angle = 120 + ((seed * 37) % 90);
  const shift = (seed * 13) % 30;

  return (
    <div
      className={cn(
        "bg-surface-2 relative isolate flex items-end overflow-hidden",
        className,
      )}
      role="img"
      aria-label={`${label} — placeholder image, artist's impression`}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, #141414 0%, #2a2622 ${40 + shift}%, #4a4038 78%, #6f5c45 100%)`,
        }}
      />
      {/* A repeating-gradient grid overlay used to sit here. It read well but
          cost real paint time once a page carried a dozen of these, so the
          texture now comes from the base gradient alone. */}
      <p className="text-ivory/25 font-display relative p-6 text-h5 leading-none">
        {label}
      </p>
      <p className="eyebrow text-ivory/40 absolute right-4 top-4">{disclaimer}</p>
    </div>
  );
}
