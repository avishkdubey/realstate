import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeferredEnquiryForm } from "@/components/forms/deferred-enquiry-form";
import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import { FadeInView } from "@/components/motion/fade-in-view";
import { ReraBlock } from "@/components/projects/rera-block";
import { UnitMatrix } from "@/components/projects/unit-matrix";
import { JsonLd } from "@/components/seo/json-ld";
import { getAmenities, getProject, getProjectSlugs } from "@/lib/data";
import {
  countAvailable,
  formatMonth,
  formatStatus,
  priceLabel,
} from "@/lib/format";
import {
  breadcrumbSchema,
  faqSchema,
  residenceSchema,
} from "@/lib/project-schema";
import { whatsappLink } from "@/lib/whatsapp";

/** Every project is prerendered at build time. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const title = `${project.name} — ${project.bhkOptions.join(" & ")} in ${project.microMarket}`;

  return {
    title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description: project.summary,
      url: `/projects/${project.slug}`,
      type: "website",
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const amenities = await getAmenities(project.amenityIds);
  const available = countAvailable(project);

  return (
    <>
      <JsonLd data={residenceSchema(project)} />
      <JsonLd data={breadcrumbSchema(project)} />
      {project.faqs.length > 0 && <JsonLd data={faqSchema(project.faqs)} />}

      {/* Hero. Above the fold: what it is, where it is, what it costs. */}
      <section className="bg-charcoal text-ivory pt-32">
        <div className="container-page pb-16">
          <nav aria-label="Breadcrumb" className="eyebrow text-stone-2">
            <Link href="/projects" className="hover:text-ivory transition-colors">
              Projects
            </Link>
            <span aria-hidden> / </span>
            <span className="text-ivory">{project.name}</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow text-gold-soft">
                {formatStatus(project.status)} · {project.microMarket}
              </p>
              <h1 className="mt-6 text-h3 md:text-h2">{project.name}</h1>
              <p className="measure text-lead text-stone-2 mt-6">{project.summary}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-8">
              <Fact label="Starting at" value={priceLabel(project)} />
              <Fact label="Configurations" value={project.bhkOptions.join(" · ")} />
              <Fact
                label="Carpet area"
                value={`${project.carpetAreaMin.toLocaleString("en-IN")}–${project.carpetAreaMax.toLocaleString("en-IN")} sq ft`}
              />
              <Fact
                label="Possession"
                value={project.possession ?? "Delivered"}
              />
              <Fact label="Facing" value={`${project.vastuFacing} (Vastu)`} />
              <Fact label="RERA" value={project.reraNumber} />
            </dl>
          </div>
        </div>

        <PlaceholderVisual
          label={project.name}
          seed={project.name.length}
          className="aspect-[21/9] w-full"
        />
      </section>

      {/* Why this one */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <FadeInView>
            <p className="eyebrow text-bronze">Why this one</p>
          </FadeInView>
          <FadeInView delay={0.05}>
            <ul className="space-y-6">
              {project.usp.map((point) => (
                <li key={point} className="measure border-b border-border pb-6 text-lead">
                  {point}
                </li>
              ))}
            </ul>
          </FadeInView>
        </div>
      </section>

      {/* Availability */}
      <section className="section bg-cream/50">
        <div className="container-page">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow text-bronze">Availability</p>
              <h2 className="mt-6 text-h4">
                {available > 0
                  ? `${available} homes available`
                  : "Sold out — resale only"}
              </h2>
            </div>
            <p className="measure text-small text-muted-foreground">
              Live as of the last sales-desk update. An interactive master plan
              replaces this view in a later release; the numbers will be the same.
            </p>
          </div>

          <div className="mt-16">
            <UnitMatrix towers={project.towers} />
          </div>
        </div>
      </section>

      {/* Amenities */}
      {amenities.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-bronze">Amenities</p>
            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="border-t border-border pt-6">
                  <h3 className="text-lead">{amenity.name}</h3>
                  <p className="text-small text-muted-foreground mt-2">
                    {amenity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specifications */}
      {project.specifications.length > 0 && (
        <section className="section bg-cream/50">
          <div className="container-page">
            <p className="eyebrow text-bronze">Specifications</p>
            <div className="mt-12 grid gap-12 md:grid-cols-2">
              {project.specifications.map((group) => (
                <div key={group.group}>
                  <h3 className="text-h5 border-b border-border pb-4">{group.group}</h3>
                  <ul className="mt-6 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="text-small text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Construction progress */}
      {project.progress.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-bronze">Construction progress</p>
            <h2 className="measure mt-6 text-h4">
              Dated updates, published whether or not they are flattering.
            </h2>
            <ol className="mt-12 max-w-3xl">
              {project.progress.map((entry) => (
                <li
                  key={entry.date}
                  className="grid gap-2 border-t border-border py-6 sm:grid-cols-[200px_1fr]"
                >
                  <span className="eyebrow text-muted-foreground">
                    {formatMonth(entry.date)}
                  </span>
                  <span className="text-base">{entry.caption}</span>
                </li>
              ))}
            </ol>
            <p className="text-caption text-muted-foreground mt-6">
              Photography accompanies these entries from the next release.
            </p>
          </div>
        </section>
      )}

      {/* FAQs — also emitted as FAQPage structured data above. */}
      {project.faqs.length > 0 && (
        <section className="section bg-cream/50">
          <div className="container-page">
            <p className="eyebrow text-bronze">Questions</p>
            <dl className="mt-12 max-w-3xl">
              {project.faqs.map((faq) => (
                <div key={faq.q} className="border-t border-border py-8">
                  <dt className="text-lead">{faq.q}</dt>
                  <dd className="measure text-muted-foreground mt-3">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Enquire */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-bronze">Enquire</p>
            <h2 className="measure mt-6 text-h4">
              Two fields, and someone calls you back.
            </h2>
            <p className="measure text-muted-foreground mt-6">
              Or skip the form entirely — WhatsApp reaches the same desk, and it
              is usually faster.
            </p>
            <a
              href={whatsappLink({
                project: project.name,
                bhk: project.bhkOptions[0],
                microMarket: project.microMarket,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow bg-forest text-ivory mt-8 inline-block rounded-sm px-8 py-4"
            >
              WhatsApp about {project.name}
            </a>
          </div>

          <DeferredEnquiryForm
            projectSlug={project.slug}
            projectName={project.name}
            source="project"
          />
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          <ReraBlock project={project} />
        </div>
      </section>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow text-stone-2">{label}</dt>
      <dd className="mt-2 text-base">{value}</dd>
    </div>
  );
}
