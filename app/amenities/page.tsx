import type { Metadata } from "next";
import Link from "next/link";

import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import { FadeInView } from "@/components/motion/fade-in-view";
import { getAmenities, getProjects } from "@/lib/data";
import type { Amenity } from "@/lib/types";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "Clubhouse, pool, gym, padel, EV charging, co-working, pet-friendly zones and spaces for children and elders, across our Ahmedabad projects.",
  alternates: { canonical: "/amenities" },
};

const CATEGORY_LABELS: Record<Amenity["category"], string> = {
  wellness: "Wellness",
  social: "Community",
  outdoor: "Outdoors",
  convenience: "Everyday",
  sustainability: "Sustainability",
};

const CATEGORY_ORDER: Amenity["category"][] = [
  "wellness",
  "outdoor",
  "social",
  "convenience",
  "sustainability",
];

export default async function AmenitiesPage() {
  const [amenities, projects] = await Promise.all([getAmenities(), getProjects()]);

  // Which projects carry each amenity — the useful question a buyer is asking.
  const projectsByAmenity = new Map(
    amenities.map((amenity) => [
      amenity.id,
      projects.filter((project) => project.amenityIds.includes(amenity.id)),
    ]),
  );

  return (
    <>
      <section className="section pt-40">
        <div className="container-page">
          <p className="eyebrow text-bronze">Lifestyle</p>
          <h1 className="measure mt-6 text-h3 md:text-h2">
            Amenities people actually use.
          </h1>
          <p className="measure text-muted-foreground mt-6">
            Every one of these exists in at least one of our projects, and each
            is listed with the projects that have it. An amenity that appears in
            a brochure and nowhere else is not an amenity.
          </p>
        </div>
      </section>

      {CATEGORY_ORDER.map((category, categoryIndex) => {
        const inCategory = amenities.filter((a) => a.category === category);
        if (inCategory.length === 0) return null;

        return (
          <section
            key={category}
            className={categoryIndex % 2 === 1 ? "section bg-cream/50" : "section"}
          >
            <div className="container-page">
              <FadeInView>
                <p className="eyebrow text-bronze">{CATEGORY_LABELS[category]}</p>
              </FadeInView>

              <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {inCategory.map((amenity, index) => {
                  const withThis = projectsByAmenity.get(amenity.id) ?? [];
                  return (
                    <FadeInView key={amenity.id} delay={index * 0.04}>
                      <PlaceholderVisual
                        label={amenity.name}
                        seed={amenity.name.length + index}
                        className="aspect-[4/3] w-full"
                      />
                      <h2 className="mt-5 text-h5">{amenity.name}</h2>
                      <p className="text-small text-muted-foreground mt-2">
                        {amenity.description}
                      </p>
                      {withThis.length > 0 && (
                        <p className="text-caption text-muted-foreground mt-4">
                          At{" "}
                          {withThis.map((project, i) => (
                            <span key={project.id}>
                              {i > 0 && ", "}
                              <Link
                                href={`/projects/${project.slug}`}
                                className="text-foreground underline underline-offset-4"
                              >
                                {project.name}
                              </Link>
                            </span>
                          ))}
                        </p>
                      )}
                    </FadeInView>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <section className="pb-24">
        <div className="container-page">
          <p className="measure text-caption text-muted-foreground leading-relaxed">
            Amenity imagery is an artist&apos;s impression and for
            representational purposes only. Provision varies by project and is
            subject to approval by the competent authorities; refer to the
            individual project pages and the sale agreement.
          </p>
        </div>
      </section>
    </>
  );
}
