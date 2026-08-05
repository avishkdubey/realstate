"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Testimonial } from "@/lib/types";

/**
 * Named testimonials, one at a time.
 *
 * Attribution is the whole point — an anonymous quote carries no weight with
 * this audience and reads as invented (CLAUDE.md §2). Every quote here shows a
 * name, a role and a location.
 */
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="min-w-0 flex-[0_0_100%] pr-8 lg:flex-[0_0_50%]"
            >
              <blockquote className="measure text-lead">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="text-small text-muted-foreground mt-6">
                {testimonial.name} · {testimonial.role} · {testimonial.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous testimonial"
          className="border-border hover:border-foreground rounded-sm border p-3 transition-colors"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next testimonial"
          className="border-border hover:border-foreground rounded-sm border p-3 transition-colors"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
        <p className="eyebrow text-muted-foreground ml-2" aria-live="polite">
          {selected + 1} / {items.length}
        </p>
      </div>
    </div>
  );
}
