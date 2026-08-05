import Link from "next/link";

import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import { formatArea, formatStatus, priceLabel } from "@/lib/format";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A card carries everything a buyer screens on before clicking: where it is,
 * what configurations exist, what it starts at, and whether it is RERA
 * registered. Withholding the price to force a phone call is the single
 * behaviour this audience punishes hardest.
 */
export function ProjectCard({
  project,
  index = 0,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  index?: number;
  /**
   * The listing page puts cards directly under its h1, so they are h2 there;
   * the home page has a section h2 above them, so they are h3. Skipping a
   * level fails the heading-order audit and misleads screen-reader users.
   */
  headingLevel?: "h2" | "h3";
}) {
  return (
    <article className="group">
      <Link href={`/projects/${project.slug}`} className="block">
        <PlaceholderVisual
          label={project.name}
          seed={index}
          className="aspect-[4/3] w-full"
        />

        <div className="pt-6">
          <div className="flex items-center gap-3">
            <StatusChip status={project.status} />
            <span className="eyebrow text-muted-foreground">
              {project.microMarket}
            </span>
          </div>

          <Heading className="mt-4 text-h5 group-hover:text-bronze transition-colors duration-200">
            {project.name}
          </Heading>

          <p className="text-small text-muted-foreground mt-2">
            {project.bhkOptions.join(" · ")} · {formatArea(project)}
          </p>

          <p className="mt-4 text-base">{priceLabel(project)}</p>

          <p className="eyebrow text-muted-foreground mt-4">
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
        status === "ongoing" && "bg-forest text-ivory",
        status === "completed" && "bg-cream text-bronze",
        status === "upcoming" && "border border-border text-muted-foreground",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
