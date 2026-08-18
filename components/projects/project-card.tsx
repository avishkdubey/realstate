import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProjectImage } from "@/components/media/project-image";
import { configLabel, formatArea, formatStatus, priceLabel } from "@/lib/format";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A portrait project card.
 *
 * Carries everything a buyer screens on before clicking: where it is, what
 * configurations exist, what it costs, and whether it is RERA registered.
 * Facts the client has not supplied are omitted rather than filled with zeroes.
 *
 * **Still a Server Component, deliberately.** Every bit of motion here is CSS
 * driven off `group-hover` and `group-focus-within`, so the card ships zero
 * JavaScript. A hover effect is not worth a client boundary, and these appear
 * eight at a time on the listing page — that is eight component trees that
 * would otherwise hydrate for the sake of a shadow.
 *
 * `group-focus-within` alongside `group-hover` throughout is not decoration:
 * without it a keyboard user tabbing to the card gets the default focus ring on
 * an element whose surrounding state never changes, so the card reads as inert
 * while it is in fact the active target.
 */
export function ProjectCard({
  project,
  index = 0,
  headingLevel: Heading = "h3",
  priority = false,
}: {
  project: Project;
  index?: number;
  /**
   * The listing page puts cards directly under its h1, so they are h2 there;
   * the home page has a section h2 above them, so they are h3. Skipping a
   * level fails the heading-order audit and misleads screen-reader users.
   */
  headingLevel?: "h2" | "h3";
  /** Set on the first card above the fold only. */
  priority?: boolean;
}) {
  const config = configLabel(project);
  const area = formatArea(project);
  const meta = [config, area].filter(Boolean).join(" · ");

  return (
    <article className="group h-full">
      <Link
        href={`/projects/${project.slug}`}
        className={cn(
          "border-hairline bg-surface-1 relative block h-full overflow-hidden rounded-lg border",
          "transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-entrance)]",
          "group-hover:border-gold/35 group-focus-within:border-gold/35",
          "group-hover:-translate-y-1.5 group-focus-within:-translate-y-1.5",
          "group-hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.9)]",
        )}
      >
        {/* 3:4 — taller than the old 4:5, which is what makes a row of these
            read as a set of portraits rather than as a grid of thumbnails. */}
        <div className="relative aspect-3/4 w-full overflow-hidden">
          {/* `ProjectImage` already owns the slow hover push and a base scrim —
              adding either here would compound them into a lurch and a
              near-black card. It only needs to be told to fill this box. */}
          <ProjectImage
            src={project.images?.hero}
            alt={project.name}
            seed={index}
            priority={priority}
            className="h-full w-full"
          />

          {/* A second scrim that deepens on hover, to carry the meta row that
              eases open underneath it. */}
          <div
            aria-hidden
            className={cn(
              "from-charcoal absolute inset-0 bg-gradient-to-t to-transparent opacity-0",
              "transition-opacity duration-500",
              "group-hover:opacity-70 group-focus-within:opacity-70",
            )}
          />

          {/* Top scrim. `ProjectImage`'s own gradient is bottom-weighted for the
              name, which leaves the head of the card bare — and the locality
              label sat directly on a sunlit render, where it was effectively
              unreadable. */}
          <div
            aria-hidden
            className="from-charcoal/75 absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent"
          />

          {/* Status and locality, top-left, out of the way of the name. */}
          <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-5">
            <StatusChip status={project.status} />
            <span className="eyebrow text-ivory/80">{project.microMarket}</span>
          </div>

          {/* The affordance. Slides in from the corner rather than fading, so
              it reads as arriving rather than as something that was hiding. */}
          <span
            aria-hidden
            className={cn(
              "bg-gold text-charcoal absolute top-5 right-5 grid size-10 place-items-center rounded-full",
              "translate-x-2 -translate-y-2 opacity-0 transition-all duration-400 ease-[var(--ease-entrance)]",
              "group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
              "group-focus-within:translate-x-0 group-focus-within:translate-y-0 group-focus-within:opacity-100",
            )}
          >
            <ArrowUpRight className="size-4" />
          </span>

          {/* Everything else sits on the image, so the card is one object. */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <Heading className="font-display text-ivory text-h4 leading-[1.05]">
              {project.name}
            </Heading>

            <p className="text-ivory mt-3 text-base">{priceLabel(project)}</p>

            {/* Collapsed to nothing until hover, then eased open. Animating
                grid-template-rows rather than height is what lets this work
                without measuring the content — `auto` is not animatable, `1fr`
                is. */}
            <div
              className={cn(
                "grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[var(--ease-entrance)]",
                "group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]",
              )}
            >
              <div className="overflow-hidden">
                {meta && (
                  <p className="text-small text-ivory/70 pt-2">{meta}</p>
                )}
                <p className="eyebrow text-ivory/45 pt-2">
                  RERA {project.reraNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function StatusChip({ status }: { status: Project["status"] }) {
  return (
    <span
      className={cn(
        "eyebrow rounded-sm px-2 py-1",
        status === "ongoing" && "bg-gold text-charcoal",
        status === "completed" && "bg-ivory/15 text-ivory backdrop-blur-sm",
        status === "upcoming" && "border-ivory/40 text-ivory border backdrop-blur-sm",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
