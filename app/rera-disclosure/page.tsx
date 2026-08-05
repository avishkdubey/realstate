import type { Metadata } from "next";
import Link from "next/link";

import { getProjects } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "RERA Disclosure",
  description:
    "Project-wise GujRERA registration numbers, QR codes and statutory disclaimers.",
  alternates: { canonical: "/rera-disclosure" },
};

/**
 * The statutory index page.
 *
 * RERA Act §11(2) requires the registration number and authority website in
 * every advertisement; GujRERA Order No. 108 (effective 15 June 2025) adds the
 * QR code. Collecting them in one table is not itself sufficient — the block
 * also appears on each project page — but it is what a diligent buyer, or a
 * regulator, looks for first.
 */
export default async function ReraDisclosurePage() {
  const projects = await getProjects();

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Statutory</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">RERA Disclosure</h1>
        <p className="measure text-muted-foreground mt-6">
          Registration details for every project we advertise, and the
          disclaimers that apply to everything shown on this website.
        </p>

        <div className="bg-cream border-bronze mt-12 border-l-2 p-6">
          <p className="measure text-small leading-relaxed">
            <strong>This is a demonstration build.</strong> No project listed
            below holds a live registration, and every number reads
            DEMO-PENDING. Nothing on this website constitutes an offer to sell.
            Advertising or selling an unregistered project is an offence under
            RERA Act §59, carrying a penalty of up to 10% of the estimated
            project cost.
          </p>
        </div>

        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left">
            <caption className="sr-only">
              GujRERA registration numbers by project
            </caption>
            <thead>
              <tr className="eyebrow text-muted-foreground border-b border-border">
                <th scope="col" className="py-4 pr-6 font-normal">Project</th>
                <th scope="col" className="py-4 pr-6 font-normal">Location</th>
                <th scope="col" className="py-4 pr-6 font-normal">Status</th>
                <th scope="col" className="py-4 pr-6 font-normal">
                  Registration no.
                </th>
                <th scope="col" className="py-4 font-normal">QR</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border align-top">
                  <td className="py-6 pr-6">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="underline underline-offset-4"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="py-6 pr-6 text-small">{project.microMarket}</td>
                  <td className="py-6 pr-6 text-small capitalize">
                    {project.status}
                  </td>
                  {/* Order 108 requires this at a font no smaller than the
                      contact number, hence text-base rather than text-small. */}
                  <td className="py-6 pr-6 text-base">{project.reraNumber}</td>
                  <td className="py-6">
                    <span
                      className="flex h-16 w-16 items-center justify-center border border-dashed border-border text-center"
                      role="img"
                      aria-label="RERA QR code placeholder"
                    >
                      <span className="text-caption text-muted-foreground leading-tight">
                        On reg.
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-12">
          Authority website:{" "}
          <a
            href={siteConfig.rera.authorityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {siteConfig.rera.authorityUrl}
          </a>
        </p>

        <div className="measure mt-16 space-y-6 border-t border-border pt-12">
          <h2 className="text-h5">Disclaimers</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            All images, renders, elevations, layouts and landscaping shown on
            this website are an artist&apos;s impression and are for
            representational purposes only. They do not form part of any offer
            or contract.
          </p>
          <p className="text-small text-muted-foreground leading-relaxed">
            Maps and location plans are not to scale and are indicative only.
            Distances and drive times are approximate and vary with traffic.
          </p>
          <p className="text-small text-muted-foreground leading-relaxed">
            All areas stated are carpet areas as defined under the Real Estate
            (Regulation and Development) Act, 2016, unless expressly stated
            otherwise. Prices are indicative, exclusive of GST, stamp duty,
            registration and other statutory charges, and are subject to
            revision without notice.
          </p>
          <p className="text-small text-muted-foreground leading-relaxed">
            Infrastructure projects referred to on this website — including
            metro extensions, expressways and airport developments — are
            government initiatives whose timelines are outside our control and
            have historically been subject to delay. They are described as
            long-term context, not as commitments.
          </p>
          <p className="text-small text-muted-foreground leading-relaxed">
            Specifications, amenities and unit availability are subject to
            change at the discretion of the promoter and the competent
            authorities. Please verify all particulars with our sales team and
            against the project&apos;s registration on the{" "}
            {siteConfig.rera.authority} portal before making a booking.
          </p>
        </div>
      </div>
    </section>
  );
}
