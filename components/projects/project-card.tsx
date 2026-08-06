import Link from "next/link";

import { ProjectImage } from "@/components/media/project-image";
import { configLabel, formatArea, formatStatus, priceLabel } from "@/lib/format";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A card carries everything a buyer screens on before clicking: where it is,
 * what configurations exist, what it costs, and whether it is RERA
 * registered. Facts the client has not supplied yet are omitted rather than
 * filled with zeroes.
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

  return (
    <article className="group">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative overflow-hidden rounded-sm">
          <ProjectImage
            src={project.images?.hero}
            alt={project.name}
            seed={index}
            priority={priority}
            className="aspect-[4/5] w-full"
          />

          {/* Name sits on the image — the render is the hook, not the label. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
            <div className="flex items-center gap-3">
              <StatusChip status={project.status} />
              <span className="eyebrow text-ivory/80">{project.microMarket}</span>
            </div>
            <Heading className="font-display text-ivory mt-3 text-h4 leading-none">
              {project.name}
            </Heading>
          </div>
        </div>

        <div className="pt-5">
          {(config || area) && (
            <p className="text-small text-muted-foreground">
              {[config, area].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-2 text-base">{priceLabel(project)}</p>
          <p className="eyebrow text-muted-foreground mt-3">
            RERA {project.reraNumber}
          </p>
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
        status === "upcoming" && "border border-ivory/40 text-ivory",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
