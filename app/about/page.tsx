import type { Metadata } from "next";
import Link from "next/link";

import { PlaceholderVisual } from "@/components/media/placeholder-visual";
import { FadeInView } from "@/components/motion/fade-in-view";
import { getProjects } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About & Legacy",
  description: `Building homes in Ahmedabad since ${siteConfig.foundedYear}. The family, the timeline, the certifications and the buildings that are already standing.`,
  alternates: { canonical: "/about" },
};

/**
 * Legacy is the strongest trust signal available to an Indian builder — a
 * founding year and a delivered track record outrank any adjective (CLAUDE.md §2).
 */
export default async function AboutPage() {
  const projects = await getProjects();
  const delivered = projects.filter((p) => p.status === "completed");
  const years = new Date().getFullYear() - siteConfig.foundedYear;

  return (
    <>
      <section className="bg-charcoal text-ivory pt-40">
        <div className="container-page pb-24">
          <p className="eyebrow text-gold-soft">
            Ahmedabad · Since {siteConfig.foundedYear}
          </p>
          <h1 className="measure mt-8 text-h3 md:text-h2">
            Three generations, one city, and a habit of finishing.
          </h1>
          <p className="measure text-lead text-stone-2 mt-8">
            We have built in Ahmedabad for {years} years. In that time the city
            has moved west, then north, and the things buyers ask us about have
            changed completely — except for the one that has not, which is
            whether we will hand over when we said we would.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <FadeInView>
            <p className="eyebrow text-bronze">The timeline</p>
          </FadeInView>

          <FadeInView delay={0.05}>
            <ol className="divide-y divide-border">
              {milestones(siteConfig.foundedYear).map((milestone) => (
                <li key={milestone.year} className="grid gap-3 py-8 sm:grid-cols-[120px_1fr]">
                  <span className="eyebrow text-muted-foreground tabular-nums">
                    {milestone.year}
                  </span>
                  <span>
                    <span className="block text-lead">{milestone.title}</span>
                    <span className="measure text-muted-foreground mt-2 block text-small">
                      {milestone.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </FadeInView>
        </div>
      </section>

      {/* Delivered */}
      {delivered.length > 0 && (
        <section className="section bg-cream/50">
          <div className="container-page">
            <p className="eyebrow text-bronze">Already standing</p>
            <h2 className="measure mt-6 text-h4">
              The most useful hour you can spend with us is in a building we
              finished.
            </h2>
            <p className="measure text-muted-foreground mt-6">
              We arrange walkthroughs of delivered projects for buyers
              considering our ongoing ones. You get to ask the residents rather
              than us.
            </p>

            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
              {delivered.map((project, index) => (
                <FadeInView key={project.id} delay={index * 0.05}>
                  <Link href={`/projects/${project.slug}`} className="group block">
                    <PlaceholderVisual
                      label={project.name}
                      seed={index + 3}
                      className="aspect-[16/10] w-full"
                    />
                    <h3 className="mt-5 text-h5 group-hover:text-bronze transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-small text-muted-foreground mt-2">
                      {project.microMarket} · Delivered
                    </p>
                  </Link>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How we work */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <FadeInView>
            <p className="eyebrow text-bronze">What we hold ourselves to</p>
          </FadeInView>
          <FadeInView delay={0.05}>
            <ul className="divide-y divide-border">
              {commitments.map((item) => (
                <li key={item.title} className="py-8">
                  <h2 className="text-lead">{item.title}</h2>
                  <p className="measure text-muted-foreground mt-3">{item.body}</p>
                </li>
              ))}
            </ul>
          </FadeInView>
        </div>
      </section>

      {/* Certifications and office */}
      <section className="section bg-cream/50">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <FadeInView>
            <p className="eyebrow text-bronze">Certifications</p>
            <ul className="mt-8 divide-y divide-border">
              <Certification
                name="IGBC Gold"
                note="Targeted on projects launched from 2026 onward"
              />
              <Certification
                name="GujRERA registered"
                note="Every project we advertise carries its registration number"
              />
              <Certification
                name="ISO 9001:2015"
                note="Quality management across design and delivery"
              />
            </ul>
            <p className="text-caption text-muted-foreground mt-6">
              Certifications listed here are illustrative in this demonstration
              build and must be substantiated before publication.
            </p>
          </FadeInView>

          <FadeInView delay={0.05}>
            <p className="eyebrow text-bronze">Come and see us</p>
            <address className="mt-8 not-italic leading-relaxed">
              {siteConfig.address.street}
              <br />
              {siteConfig.address.locality}
              <br />
              {siteConfig.address.city} {siteConfig.address.postalCode},{" "}
              {siteConfig.address.region}
            </address>
            <p className="text-small text-muted-foreground mt-4">
              {siteConfig.hours}
            </p>
            <Link
              href="/contact"
              className="eyebrow text-foreground mt-8 inline-block border-b border-current pb-1"
            >
              Book a visit
            </Link>
          </FadeInView>
        </div>
      </section>
    </>
  );
}

function Certification({ name, note }: { name: string; note: string }) {
  return (
    <li className="py-5">
      <p className="text-lead">{name}</p>
      <p className="text-small text-muted-foreground mt-1">{note}</p>
    </li>
  );
}

/** Derived from the founding year so the story stays consistent with config. */
function milestones(founded: number) {
  return [
    {
      year: String(founded),
      title: "The first site",
      body: "A twelve-flat walk-up in the old city, built by a family that had until then only supplied the cement.",
    },
    {
      year: String(founded + 22),
      title: "West of the river",
      body: "Following the city as it moved outward — the first projects on what would become the SG Highway corridor.",
    },
    {
      year: "2017",
      title: "RERA, and what it changed",
      body: "We moved every project to carpet-area pricing and published possession dates we could defend. It cost us some sales that year.",
    },
    {
      year: "2023",
      title: "Delivered early",
      body: "Aarambh Corniche handed over four months ahead of its committed date, and reached full occupancy inside eleven months.",
    },
    {
      year: "2026",
      title: "North of the river",
      body: "First projects in Chandkheda and the GIFT City corridor, where the next decade of Ahmedabad's employment is being built.",
    },
  ];
}

const commitments = [
  {
    title: "Carpet area on every drawing",
    body: "Super built-up exists to make a number look bigger than the home is. We do not quote it, and we do not price on it.",
  },
  {
    title: "Possession dates we can defend",
    body: "The date on the RERA registration is the date we plan to. Delayed possession carries interest at SBI MCLR plus 2% under the Act, and we would rather not pay it.",
  },
  {
    title: "Site photographs, dated",
    body: "Published monthly on every ongoing project, in the months where the news is good and in the months where it is not.",
  },
  {
    title: "Escrow, as required",
    body: "70% of collections sit in the project escrow account, as RERA requires. We mention it because buyers ask, and because not every builder can say it plainly.",
  },
];
