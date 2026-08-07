import Image from "next/image";

import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import { cn } from "@/lib/utils";

/**
 * A project's photography, with an honest fallback.
 *
 * Renders the client's own render or photograph where one exists and the
 * abstract placeholder where one does not — rather than reusing another
 * project's image, which would misrepresent the building.
 *
 * `priority` should be set only on the one image above the fold; everything
 * else lazy-loads.
 */
export function ProjectImage({
  src,
  alt,
  className,
  seed = 0,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  seed?: number;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return <PlaceholderVisual label={alt} seed={seed} className={className} />;
  }

  return (
    <div className={cn("bg-surface-2 relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-[var(--ease-entrance)] group-hover:scale-[1.04]"
      />
      {/* A weighted scrim so display type stays legible over any render. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent"
      />
    </div>
  );
}
