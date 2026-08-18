"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProjectCard } from "@/components/projects/project-card";
import { useVisitor } from "@/lib/visitor-storage";
import type { Project } from "@/lib/types";

/**
 * "Our favourites for you" — a carousel of the projects worth seeing first.
 *
 * Addressed to the visitor by name when there is one. The name lives only in
 * this browser (`lib/visitor-storage.ts` sets out why that is a local
 * convenience rather than a collection under DPDP §6), so this is the one place
 * personalisation is free of a consent question.
 *
 * "Favourites" is an editorial claim, not a ranking — the order is whatever the
 * data layer gives, filtered to what a buyer can actually act on.
 */
export function Favourites({ projects }: { projects: Project[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const visitor = useVisitor();

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const sync = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    sync();
    emblaApi.on("select", sync).on("reInit", sync);
    return () => {
      emblaApi.off("select", sync).off("reInit", sync);
    };
  }, [emblaApi]);

  if (projects.length === 0) return null;

  return (
    <section className="section">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-accent">Hand-picked</p>
            <h2 className="measure mt-6 text-h3">
              {visitor?.name
                ? `Our favourites for you, ${visitor.name}.`
                : "Our favourites for you."}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous projects"
              className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              aria-label="Next projects"
              className="border-border hover:border-hairline-strong rounded-full border p-3 transition-colors disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_48%] lg:flex-[0_0_31%]"
              >
                <ProjectCard project={project} index={index} />
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/projects"
          className="eyebrow text-foreground mt-12 inline-block border-b border-current pb-1"
        >
          View all
        </Link>
      </div>
    </section>
  );
}
