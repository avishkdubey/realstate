import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LocationMap } from "@/components/locations/location-map";
import { FadeInView } from "@/components/motion/fade-in-view";
import { ProjectCard } from "@/components/projects/project-card";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getLocation,
  getLocationSlugs,
  getLocations,
  getProjectsInLocation,
} from "@/lib/data";
import {
  locationBreadcrumbSchema,
  placeSchema,
} from "@/lib/location-schema";
import { faqSchema } from "@/lib/project-schema";

export async function generateStaticParams() {
  const slugs = await getLocationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/locations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) return {};

  const title = `Property in ${location.name}, Ahmedabad`;

  return {
    title,
    description: `${location.tagline} Prices, drive times, landmarks and projects in ${location.name}, Ahmedabad.`,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: { title, description: location.tagline, type: "website" },
  };
}

export default async function LocationPage({
  params,
}: PageProps<"/locations/[slug]">) {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) notFound();

  const [projects, allLocations] = await Promise.all([
    getProjectsInLocation(location.name),
    getLocations(),
  ]);

  return (
    <>
      <JsonLd data={placeSchema(location)} />
      <JsonLd data={locationBreadcrumbSchema(location)} />
      {location.faqs.length > 0 && <JsonLd data={faqSchema(location.faqs)} />}

      <section className="section pt-40">
        <div className="container-page">
          <nav aria-label="Breadcrumb" className="eyebrow text-muted-foreground">
            <Link href="/locations" className="hover:text-foreground">
              Locations
            </Link>
            <span aria-hidden> / </span>
            <span className="text-foreground">{location.name}</span>
          </nav>

          <p className="eyebrow text-accent mt-10">{location.phase}</p>
          <h1 className="measure mt-6 text-h3 md:text-h2">{location.name}</h1>
          <p className="measure text-lead text-muted-foreground mt-6">
            {location.tagline}
          </p>

          <div className="mt-16 grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <p className="measure leading-relaxed">{location.description}</p>

              <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-8">
                <div>
                  <dt className="eyebrow text-muted-foreground">Price band</dt>
                  <dd className="mt-2 text-lead">
                    ₹{location.priceRange.min.toLocaleString("en-IN")}–
                    {location.priceRange.max.toLocaleString("en-IN")}
                    <span className="text-small text-muted-foreground"> / sq ft</span>
                  </dd>
                </div>
                {location.priceTrend && (
                  <div>
                    <dt className="eyebrow text-muted-foreground">
                      Appreciation {location.priceTrend.window}
                    </dt>
                    <dd className="mt-2 text-lead">
                      +{location.priceTrend.changePercent}%
                    </dd>
                  </div>
                )}
                <div className="col-span-2">
                  <dt className="eyebrow text-muted-foreground">Who buys here</dt>
                  <dd className="mt-2">{location.buyerProfile}</dd>
                </div>
              </dl>
            </div>

            <LocationMap
              locations={allLocations}
              activeSlug={location.slug}
              projectCounts={{ [location.slug]: projects.length }}
            />
          </div>
        </div>
      </section>

      {/* Drive times */}
      <section className="section bg-surface-2">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <FadeInView>
            <p className="eyebrow text-accent">Getting around</p>
            <ul className="mt-8 divide-y divide-border">
              {location.driveTimes.map((entry) => (
                <li
                  key={entry.place}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <span>{entry.place}</span>
                  <span className="text-small text-muted-foreground tabular-nums">
                    {entry.minutes} min
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground mt-4">
              Approximate, and worse in traffic.
            </p>
          </FadeInView>

          <FadeInView delay={0.05}>
            <p className="eyebrow text-accent">Nearby</p>
            <ul className="mt-8 divide-y divide-border">
              {location.landmarks.map((landmark) => (
                <li
                  key={landmark.name}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <span>
                    {landmark.name}
                    <span className="eyebrow text-muted-foreground ml-3">
                      {landmark.type}
                    </span>
                  </span>
                  <span className="text-small text-muted-foreground tabular-nums">
                    {landmark.distanceKm} km
                  </span>
                </li>
              ))}
            </ul>
          </FadeInView>
        </div>
      </section>

      {/* What is changing */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <FadeInView>
            <p className="eyebrow text-accent">What is changing</p>
          </FadeInView>
          <FadeInView delay={0.05}>
            <ul className="space-y-6">
              {location.catalysts.map((catalyst) => (
                <li key={catalyst} className="measure border-b border-border pb-6">
                  {catalyst}
                </li>
              ))}
            </ul>
            <p className="measure text-caption text-muted-foreground mt-6 leading-relaxed">
              Infrastructure timelines are set by government, not by us, and
              they have slipped before. Treat them as long-term context rather
              than as commitments.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Projects here */}
      {projects.length > 0 && (
        <section className="section bg-surface-2">
          <div className="container-page">
            <p className="eyebrow text-accent">Our projects in {location.name}</p>
            <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  headingLevel="h2"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {location.faqs.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-accent">Questions about {location.name}</p>
            <dl className="mt-12 max-w-3xl">
              {location.faqs.map((faq) => (
                <div key={faq.q} className="border-t border-border py-8">
                  <dt className="text-lead">{faq.q}</dt>
                  <dd className="measure text-muted-foreground mt-3">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </>
  );
}
