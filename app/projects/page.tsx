import type { Metadata } from "next";
import { Suspense } from "react";

import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { getBhkOptions, getMicroMarkets, getProjects } from "@/lib/data";
import { applyFilters, countActiveFilters, parseFilters } from "@/lib/project-filters";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Ongoing, completed and upcoming residences across SG Highway, Shela, South Bopal, Sindhu Bhavan Road, Chandkheda and the GIFT City corridor.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const [allProjects, microMarkets, bhkOptions] = await Promise.all([
    getProjects(),
    getMicroMarkets(),
    getBhkOptions(),
  ]);

  const results = applyFilters(allProjects, filters);
  const activeCount = countActiveFilters(filters);

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Portfolio</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Projects</h1>
        <p className="measure text-muted-foreground mt-6">
          Every project below shows its configurations, carpet-area range and
          starting price before you speak to anyone. Carpet area is the RERA
          measure — we do not quote super built-up.
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {/* useSearchParams needs a Suspense boundary to keep the rest of
                the page statically prerenderable. */}
            <Suspense fallback={<div className="h-96" />}>
              <ProjectFilters
                microMarkets={microMarkets}
                bhkOptions={bhkOptions}
                activeCount={activeCount}
              />
            </Suspense>
          </aside>

          <div>
            <p className="eyebrow text-muted-foreground border-b border-border pb-4">
              {results.length} {results.length === 1 ? "project" : "projects"}
            </p>

            {results.length === 0 ? (
              <p className="measure text-muted-foreground mt-12">
                Nothing matches that combination yet. Widen the budget or clear a
                filter — or tell us what you are looking for and we will say
                honestly whether we have it.
              </p>
            ) : (
              <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2">
                {results.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    headingLevel="h2"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="measure text-caption text-muted-foreground mt-24 leading-relaxed">
          All images on this page are an artist&apos;s impression and for
          representational purposes only. Prices shown are indicative and
          exclusive of GST, stamp duty, registration and statutory charges.
          Project registration details are published on the{" "}
          <a href={siteConfig.rera.authorityUrl} className="underline underline-offset-4">
            {siteConfig.rera.authority}
          </a>{" "}
          portal.
        </p>
      </div>
    </section>
  );
}
