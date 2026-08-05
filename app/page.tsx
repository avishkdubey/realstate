import Link from "next/link";

import { FadeInView } from "@/components/motion/fade-in-view";
import { ProjectCard } from "@/components/projects/project-card";
import { getProjects } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Home.
 *
 * Static and text-first by design: it establishes the type scale, the 60-30-10
 * ground and the whitespace rhythm, and gives Phase 3 a measured LCP baseline
 * to defend once the WebGL hero arrives. All copy is server rendered — the
 * canvas will mount behind this markup, never in place of it.
 */
export default async function HomePage() {
  const projects = await getProjects();
  const delivered = projects.filter((p) => p.status === "completed").length;
  const featured = [
    ...projects.filter((p) => p.status === "ongoing"),
    ...projects.filter((p) => p.status === "upcoming"),
  ].slice(0, 3);

  const trustMetrics = [
    {
      value: `${new Date().getFullYear() - siteConfig.foundedYear}`,
      label: "Years building",
    },
    { value: String(delivered), label: "Projects delivered" },
    { value: "—", label: "Sq ft delivered" },
    { value: "—", label: "On-time possession" },
  ];

  return (
    <>
      {/* Hero. The R3F canvas slots in behind this block in Phase 3. */}
      <section className="bg-charcoal text-ivory relative flex min-h-[92svh] items-end">
        <div className="container-page pb-24 pt-40">
          <p className="eyebrow text-gold-soft">
            Ahmedabad · Since {siteConfig.foundedYear}
          </p>
          <h1 className="measure mt-8 text-h2 md:text-h1">
            Homes built to be inherited.
          </h1>
          <p className="measure text-lead text-stone-2 mt-8">
            {siteConfig.description}
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4 transition-opacity duration-200 hover:opacity-90"
            >
              View Projects
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow hover:bg-ivory hover:text-charcoal rounded-sm border border-white/25 px-8 py-4 transition-colors duration-200"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar. Every figure here must be true before launch — an untrue
          on-time-possession claim is a §12 liability, not a marketing choice. */}
      <section className="border-b border-border">
        <div className="container-page grid grid-cols-2 lg:grid-cols-4">
          {trustMetrics.map((metric) => (
            <div key={metric.label} className="py-12 pr-8">
              <p className="font-display text-h4">{metric.value}</p>
              <p className="eyebrow text-muted-foreground mt-3">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured work. Ongoing first — that is what a buyer can act on. */}
      <section className="section">
        <div className="container-page">
          <FadeInView>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-bronze">Currently building</p>
                <h2 className="measure mt-6 text-h3">
                  Four addresses in west Ahmedabad, and two more coming.
                </h2>
              </div>
              <Link
                href="/projects"
                className="eyebrow text-foreground border-b border-current pb-1"
              >
                All projects
              </Link>
            </div>
          </FadeInView>

          <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, index) => (
              <FadeInView key={project.id} delay={index * 0.06}>
                <ProjectCard project={project} index={index} />
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* What buyers actually screen on: transparency, not adjectives. */}
      <section className="section bg-cream/50">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <FadeInView>
            <p className="eyebrow text-bronze">How we work</p>
          </FadeInView>
          <FadeInView delay={0.05}>
            <ul className="space-y-8">
              {principles.map((principle) => (
                <li key={principle.title} className="border-b border-border pb-8">
                  <h3 className="text-lead">{principle.title}</h3>
                  <p className="measure text-muted-foreground mt-3">
                    {principle.body}
                  </p>
                </li>
              ))}
            </ul>
          </FadeInView>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <FadeInView>
            <p className="eyebrow text-bronze">Demonstration build</p>
            <h2 className="measure mt-6 text-h4">
              All content on this site is placeholder, and no project carries a
              RERA registration.
            </h2>
            <Link
              href="/rera-disclosure"
              className="eyebrow text-foreground mt-8 inline-block border-b border-current pb-1"
            >
              RERA disclosure
            </Link>
          </FadeInView>
        </div>
      </section>
    </>
  );
}

const principles = [
  {
    title: "Carpet area, always",
    body: "Every area on this website is carpet area as the RERA Act defines it. We do not quote super built-up, because it exists to make a number look bigger than the home is.",
  },
  {
    title: "Prices before conversations",
    body: "Starting prices are published on every project that has one. Where you see 'price on request' it is because the project is sold out or unregistered, not because we want your phone number first.",
  },
  {
    title: "Dated site photographs",
    body: "Construction progress is published with dates, in months where the news is good and in months where it is not.",
  },
  {
    title: "Vastu, taken seriously",
    body: "Facing is labelled on every plan and filterable across the portfolio. It matters to how a home is lived in and to what it resells for.",
  },
];
