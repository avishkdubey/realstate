import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LazyMount, Skeleton } from "@/components/lazy-mount";
import { DeferredEnquiryForm } from "@/components/forms/deferred-enquiry-form";
import { DeferredEmiCalculator } from "@/components/finance/deferred-emi-calculator";
import { ProjectImage } from "@/components/media/project-image";
import { FadeInView } from "@/components/motion/fade-in-view";
import { DeferredBrochure } from "@/components/projects/deferred-brochure";
import { CostSheet } from "@/components/projects/cost-sheet";
import { DeferredFloorPlans } from "@/components/projects/deferred-floor-plans";
import { MasterPlan } from "@/components/projects/master-plan";
import { ApartmentInterior } from "@/components/projects/apartment-interior";
import { ProgressTimeline } from "@/components/projects/progress-timeline";
import { ReraBlock } from "@/components/projects/rera-block";
import { UnitMatrix } from "@/components/projects/unit-matrix";
import { JsonLd } from "@/components/seo/json-ld";
import { getAmenities, getProject, getProjectSlugs } from "@/lib/data";
import {
  configLabel,
  countAvailable,
  formatArea,
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

  // One plan per distinct configuration, taken from the first matching unit.
  const planOptions = project.bhkOptions.map((bhk) => {
    const unit = project.towers
      .flatMap((tower) => tower.units)
      .find((candidate) => candidate.bhk === bhk);
    return {
      bhk,
      carpetArea: unit?.carpetArea ?? project.carpetAreaMin,
      facing: unit?.facing ?? project.vastuFacing,
    };
  });

  // Price-on-request projects have no number to build a cost sheet from, and
  // inventing one would be worse than omitting the section.
  const basePrice = project.priceOnRequest ? undefined : project.startingPrice;

  return (
    <>
      <JsonLd data={residenceSchema(project)} />
      <JsonLd data={breadcrumbSchema(project)} />
      {project.faqs.length > 0 && <JsonLd data={faqSchema(project.faqs)} />}

      {/* Hero. Above the fold: what it is, where it is, what it costs. */}
      <section className="bg-surface-2 pt-32">
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
              <Fact label="Configurations" value={configLabel(project)} />
              <Fact label="Carpet area" value={formatArea(project)} />
              <Fact
                label="Possession"
                value={project.possession ?? "Delivered"}
              />
              <Fact label="Facing" value={`${project.vastuFacing} (Vastu)`} />
              <Fact label="RERA" value={project.reraNumber} />
            </dl>
          </div>
        </div>

        <ProjectImage
          src={project.images?.hero}
          alt={`${project.name} — ${project.microMarket}, Ahmedabad`}
          seed={project.name.length}
          priority
          sizes="100vw"
          className="aspect-[16/9] w-full md:aspect-[21/9]"
        />
      </section>

      {/* Why this one */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <FadeInView>
            <p className="eyebrow text-accent">Why this one</p>
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
      <section className="section bg-surface-2">
        <div className="container-page">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow text-accent">Availability</p>
              <h2 className="mt-6 text-h4">
                {available > 0
                  ? `${available} homes available`
                  : "Sold out — resale only"}
              </h2>
            </div>
            <p className="measure text-small text-muted-foreground">
              Live as of the last sales-desk update. The massing model above and
              the table below carry the same numbers — sold units included,
              because that is what makes the available ones believable.
            </p>
          </div>

          <div className="mt-16">
            {/* WebGL massing on capable devices; the table below is the real
                interface and carries the same numbers either way. */}
            <MasterPlan towers={project.towers} />
            <UnitMatrix towers={project.towers} />
          </div>
        </div>
      </section>

      {/* Floor plans */}
      <section className="section">
        <div className="container-page">
          <p className="eyebrow text-accent">Floor plans</p>
          <h2 className="measure mt-6 text-h4">
            Every layout, with its facing labelled.
          </h2>
          <p className="measure text-muted-foreground mt-6">
            Direction matters here — east and north-east homes carry a resale
            premium — so it is printed on the plan rather than left for you to
            work out from the site map.
          </p>

          <div className="mt-14">
            <LazyMount placeholder={<Skeleton className="aspect-[3/2] w-full" />}>
              <DeferredFloorPlans options={planOptions} />
            </LazyMount>
          </div>
        </div>
      </section>

      {/* 360° view. Matters most to buyers who will never stand in the
          building before deciding — which describes most NRI purchases. */}
      <ApartmentInterior bhk={project.bhkOptions[0]} carpetAreaSqFt={project.carpetAreaMin} />

      {/* Money */}
      {basePrice && (
        <section className="section bg-surface-2">
          <div className="container-page">
            <p className="eyebrow text-accent">The money</p>
            <h2 className="measure mt-6 text-h4">
              What you would pay, and what you would pay monthly.
            </h2>

            <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-start">
              <CostSheet
                project={project}
                basePrice={basePrice}
                carpetArea={project.carpetAreaMin}
              />
              <LazyMount placeholder={<Skeleton className="h-[28rem] w-full" />}>
                <DeferredEmiCalculator startingPrice={basePrice} />
              </LazyMount>
            </div>
          </div>
        </section>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-accent">Amenities</p>
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
        <section className="section bg-surface-2">
          <div className="container-page">
            <p className="eyebrow text-accent">Specifications</p>
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
            <p className="eyebrow text-accent">Construction progress</p>
            <h2 className="measure mt-6 text-h4">
              Dated updates, published whether or not they are flattering.
            </h2>
            <div className="mt-12 max-w-4xl">
              <ProgressTimeline entries={project.progress} />
            </div>
            <p className="text-caption text-muted-foreground mt-6">
              Progress indicators are schematic. Site photography replaces them
              once the client&apos;s monthly shoot is in place.
            </p>
          </div>
        </section>
      )}

      {/* FAQs — also emitted as FAQPage structured data above. */}
      {project.faqs.length > 0 && (
        <section className="section bg-surface-2">
          <div className="container-page">
            <p className="eyebrow text-accent">Questions</p>
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
            <p className="eyebrow text-accent">Enquire</p>
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
              className="eyebrow bg-forest-lift text-ivory mt-8 inline-block rounded-sm px-8 py-4"
            >
              WhatsApp about {project.name}
            </a>
          </div>

          <div className="space-y-10">
            <LazyMount placeholder={<Skeleton className="h-64 w-full" />}>
              <DeferredBrochure project={project} />
            </LazyMount>
            <LazyMount placeholder={<Skeleton className="h-[34rem] w-full" />}>
              <DeferredEnquiryForm
                projectSlug={project.slug}
                projectName={project.name}
                source="project"
              />
            </LazyMount>
          </div>
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

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="eyebrow text-stone-2">{label}</dt>
      <dd className="mt-2 text-base">{value}</dd>
    </div>
  );
}
