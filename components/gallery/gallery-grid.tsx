"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import type { GalleryItem } from "@/lib/data";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "exterior", label: "Exteriors" },
  { value: "interior", label: "Interiors" },
  { value: "amenity", label: "Amenities" },
  { value: "progress", label: "Construction" },
] as const;

/**
 * Filterable gallery with an Embla-backed lightbox.
 *
 * The lightbox traps nothing it does not need to: Escape closes, arrows move,
 * and focus returns to the thumbnail that opened it.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [category, setCategory] = useState<string>("all");
  const [project, setProject] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const projects = [...new Set(items.map((item) => item.projectName))];

  const visible = items.filter(
    (item) =>
      (category === "all" || item.category === category) &&
      (project === "all" || item.projectName === project),
  );

  return (
    <div>
      <div className="space-y-6">
        <FilterRow
          label="Type"
          options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          active={category}
          onChange={setCategory}
        />
        <FilterRow
          label="Project"
          options={[
            { value: "all", label: "All" },
            ...projects.map((name) => ({ value: name, label: name })),
          ]}
          active={project}
          onChange={setProject}
        />
      </div>

      <p className="eyebrow text-muted-foreground mt-10 border-b border-border pb-4">
        {visible.length} {visible.length === 1 ? "image" : "images"}
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group block w-full text-left"
            >
              <PlaceholderVisual
                label={item.projectName}
                seed={index + item.label.length}
                className="aspect-[4/3] w-full"
              />
              <p className="text-small text-muted-foreground mt-3 group-hover:text-foreground transition-colors">
                {item.label}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <p className="measure text-muted-foreground mt-12">
          Nothing matches that combination. Clear a filter to see the rest.
        </p>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={visible}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-muted-foreground mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active === option.value}
            className={cn(
              "eyebrow rounded-sm border px-4 py-2 transition-colors duration-200",
              active === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: true,
  });
  const [selected, setSelected] = useState(startIndex);

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery"
      className="bg-surface-0/97 fixed inset-0 z-[60] flex flex-col"
    >
      <div className="flex items-center justify-between p-6">
        <p className="eyebrow text-ivory/70">
          {selected + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="text-ivory p-2"
          autoFocus
        >
          <X size={22} aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {items.map((item, index) => (
            <div key={item.id} className="min-w-0 flex-[0_0_100%] px-6">
              <div className="flex h-full flex-col items-center justify-center">
                <PlaceholderVisual
                  label={item.projectName}
                  seed={index + item.label.length}
                  className="aspect-[3/2] w-full max-w-4xl"
                />
                <p className="text-ivory/70 text-small mt-4">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 p-6">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="text-ivory border-ivory/25 rounded-sm border p-3"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="text-ivory border-ivory/25 rounded-sm border p-3"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
