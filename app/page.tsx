import Link from "next/link";

import { HomeHero } from "@/components/hero/home-hero";
import { LocationMap } from "@/components/locations/location-map";
import { FadeInView } from "@/components/motion/fade-in-view";
import { RevealLine, ScrollReveal } from "@/components/motion/scroll-reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { TestimonialCarousel } from "@/components/testimonials/testimonial-carousel";
import {
  getLocations,
  getLocationsWithProjects,
  getPosts,
  getProjects,
  getTestimonials,
} from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

/**
 * Home.
 *
 * Static and text-first by design: it establishes the type scale, the 60-30-10
 * ground and the whitespace rhythm, and gives Phase 3 a measured LCP baseline
 * to defend once the WebGL hero arrives. All copy is server rendered — the
 * canvas will mount behind this markup, never in place of it.
 */
export default async function HomePage() {
  const [projects, locations, withProjects, testimonials, posts] =
    await Promise.all([
      getProjects(),
      getLocations(),
      getLocationsWithProjects(),
      getTestimonials(),
      getPosts(),
    ]);

  const projectCounts = Object.fromEntries(
    withProjects.map(({ location, projectCount }) => [location.slug, projectCount]),
  );
  const latestPosts = posts.slice(0, 3);
  const featured = [
    ...projects.filter((p) => p.status === "ongoing"),
    ...projects.filter((p) => p.status === "upcoming"),
  ].slice(0, 3);

  // The client's own published figures. Confirm before launch — an
  // overstated delivery record is a §12 exposure, not a flourish.
  const { stats } = siteConfig;
  const trustMetrics = [
    { value: `${stats.completedSqFt.toLocaleString("en-IN")}+`, label: "Completed sq. ft." },
    { value: `${stats.happyFamilies.toLocaleString("en-IN")}+`, label: "Happy families" },
    { value: `${stats.yearsExperience}+`, label: "Years of experience" },
    { value: `${stats.completedProjects}+`, label: "Completed projects" },
  ];

  return (
    <>
      <HomeHero />

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
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-accent">Currently building</p>
                <h2 className="measure mt-6 text-h3">
                  <RevealLine>Three under construction,</RevealLine>
                  <RevealLine>two more on the way.</RevealLine>
                </h2>
              </div>
              <Link
                href="/projects"
                className="eyebrow text-foreground border-b border-current pb-1"
              >
                All projects
              </Link>
            </div>
          </ScrollReveal>

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
      <section className="section bg-surface-2">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <FadeInView>
            <p className="eyebrow text-accent">How we work</p>
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

      {/* Micro-market teaser */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <FadeInView>
            <LocationMap locations={locations} projectCounts={projectCounts} />
          </FadeInView>
          <FadeInView delay={0.05}>
            <p className="eyebrow text-accent">Where we build</p>
            <h2 className="measure mt-6 text-h3">
              Six corridors, west and north of the river.
            </h2>
            <p className="measure text-muted-foreground mt-6">
              Each has a guide covering prices, drive times, what has already
              arrived and what is still missing.
            </p>
            <Link
              href="/locations"
              className="eyebrow text-foreground mt-8 inline-block border-b border-current pb-1"
            >
              Read the location guides
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* NRI strip */}
      <section className="bg-surface-3 border-y border-hairline">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-gold-soft">Buying from abroad</p>
            <h2 className="measure mt-6 text-h4">
              A good share of our buyers have never stood in the building.
            </h2>
            <p className="measure text-stone-2 mt-4">
              Power of attorney, NRE and NRO accounts, FEMA, remote booking and
              callbacks in your timezone — written down rather than explained on
              a call.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <Link
              href="/nri-corner"
              className="eyebrow bg-gold text-charcoal inline-block rounded-sm px-8 py-4"
            >
              NRI Corner
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — renders only when the client supplies real, attributed
          quotes. Inventing customer reviews for a live builder is not an
          option, so an empty list simply hides the section. */}
      {testimonials.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-accent">From people who bought</p>
            <div className="mt-12">
              <TestimonialCarousel items={testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* Insights teaser */}
      {latestPosts.length > 0 && (
        <section className="section bg-surface-2">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <p className="eyebrow text-accent">Insights</p>
              <Link
                href="/insights"
                className="eyebrow text-foreground border-b border-current pb-1"
              >
                All insights
              </Link>
            </div>
            <ul className="mt-12 grid gap-10 md:grid-cols-3">
              {latestPosts.map((post, index) => (
                <li key={post.slug}>
                  <FadeInView delay={index * 0.05}>
                    <Link href={`/insights/${post.slug}`} className="group block">
                      <span className="eyebrow text-muted-foreground">
                        {post.category}
                      </span>
                      <span className="mt-3 block text-h5 group-hover:text-accent transition-colors">
                        {post.title}
                      </span>
                      <span className="text-small text-muted-foreground mt-3 block">
                        {post.excerpt}
                      </span>
                    </Link>
                  </FadeInView>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-page">
          <FadeInView>
            <p className="eyebrow text-accent">Demonstration build</p>
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
