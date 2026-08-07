import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing use of this website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-accent">Legal</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Terms of Use</h1>
        <p className="measure text-muted-foreground mt-6">
          These terms govern your use of this website. They do not limit any
          right you have under the Real Estate (Regulation and Development) Act,
          2016.
        </p>

        <div className="measure mt-16 space-y-12">
          <Clause title="Nothing here is an offer">
            The information on this website is for general reference. It does not
            constitute an offer, an invitation to offer, or any part of a
            contract. A binding agreement arises only on execution of a written
            sale agreement and its registration.
          </Clause>

          <Clause title="Images and plans">
            All renders, elevations, layouts, landscaping and floor plans are an
            artist&apos;s impression, are indicative, and are for
            representational purposes only. Maps and location plans are not to
            scale. Distances and drive times are approximate.
          </Clause>

          <Clause title="Areas and pricing">
            Areas are stated as carpet area under the RERA Act unless expressly
            noted otherwise. Prices are indicative, exclude GST, stamp duty,
            registration and other statutory charges, and may be revised without
            notice.
          </Clause>

          <Clause title="RERA">
            Project registration numbers are published on each project page and
            on our{" "}
            <a
              href="/rera-disclosure"
              className="text-foreground underline underline-offset-4"
            >
              RERA disclosure page
            </a>
            , together with the {siteConfig.rera.authority} website. Please
            verify every particular against the registration before you
            transact. Nothing in these terms limits our liability under section
            12 of the Act for a false or misleading statement.
          </Clause>

          <Clause title="Third-party information">
            Market data, price trends and infrastructure timelines referenced on
            this website are drawn from published third-party sources and from
            government announcements. They are directional, they are outside our
            control, and they have historically been subject to revision and
            delay.
          </Clause>

          <Clause title="Your data">
            Personal data you submit is handled as described in our{" "}
            <a
              href="/privacy"
              className="text-foreground underline underline-offset-4"
            >
              privacy policy
            </a>
            .
          </Clause>

          <Clause title="Governing law">
            These terms are governed by the laws of India, and the courts at
            Ahmedabad, Gujarat have exclusive jurisdiction.
          </Clause>
        </div>

        <p className="measure text-caption text-muted-foreground mt-16 border-t border-border pt-8 leading-relaxed">
          This is a demonstration build. These terms are a working draft and
          must be reviewed by counsel before the website is published.
        </p>
      </div>
    </section>
  );
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-h5">{title}</h2>
      <p className="text-muted-foreground mt-4 leading-relaxed">{children}</p>
    </div>
  );
}
