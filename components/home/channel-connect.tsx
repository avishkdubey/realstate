import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

/**
 * Channel Connect — the broker-facing strip.
 *
 * A Server Component: nothing here is personalised or interactive, so there is
 * no reason to ship it as JavaScript.
 *
 * Kept short on purpose. Channel partners are not the audience for the rest of
 * this page, and a full pitch here competes with the buyer journey it sits
 * inside. Its job is to be findable, then get out of the way.
 */
export function ChannelConnect() {
  return (
    <section className="section" aria-labelledby="channel-heading">
      <div className="container-page">
        <div className="border-border grid gap-10 border p-8 md:p-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-accent">Channel Connect Program</p>
            <h2 id="channel-heading" className="measure mt-6 text-h4">
              Grow with a developer who values trust.
            </h2>
            <p className="measure text-muted-foreground mt-6">
              Partnerships built on integrity: registered inventory, brokerage
              paid on a published schedule, and a single point of contact who
              answers. {siteConfig.stats.completedProjects}+ completed projects
              and {siteConfig.stats.happyFamilies.toLocaleString("en-IN")}+
              families since {siteConfig.foundedYear}.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <Link
              href="/channel-partners"
              className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal inline-block rounded-sm border px-8 py-4 transition-colors duration-300"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
