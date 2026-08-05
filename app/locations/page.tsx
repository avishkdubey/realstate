import type { Metadata } from "next";

import { CorridorList, CorridorMap } from "@/components/locations/corridor-map";
import { FadeInView } from "@/components/motion/fade-in-view";
import { getLocations, getLocationsWithProjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Locations in Ahmedabad",
  description:
    "Neighbourhood guides to SG Highway, Shela, South Bopal, Sindhu Bhavan Road, the GIFT City corridor and Chandkheda — prices, drive times, landmarks and what each corridor is actually like.",
  alternates: { canonical: "/locations" },
};

export default async function LocationsPage() {
  const [locations, withProjects] = await Promise.all([
    getLocations(),
    getLocationsWithProjects(),
  ]);

  const projectCounts = Object.fromEntries(
    withProjects.map(({ location, projectCount }) => [location.slug, projectCount]),
  );

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Micro-markets</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">
          Six corridors, and what each one is really like.
        </h1>
        <p className="measure text-muted-foreground mt-6">
          Where a home is matters more than almost anything else about it. These
          guides cover prices, drive times, what has already been built and what
          is still missing — including the things that would put us off.
        </p>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <FadeInView>
            <CorridorMap locations={locations} projectCounts={projectCounts} />
          </FadeInView>

          <FadeInView delay={0.05}>
            <CorridorList locations={locations} projectCounts={projectCounts} />
          </FadeInView>
        </div>

        <p className="measure text-caption text-muted-foreground mt-20 leading-relaxed">
          Price figures throughout these guides are directional, drawn from
          developer and portal sources that do not always agree with one
          another. Verify against GujRERA and live listings before making a
          decision.
        </p>
      </div>
    </section>
  );
}
