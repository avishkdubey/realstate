import Link from "next/link";

import { FadeInView } from "@/components/motion/fade-in-view";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Phase 0 placeholder home page.
 *
 * Intentionally static and text-first: it establishes the type scale, the
 * 60-30-10 ground and the whitespace rhythm, and gives Phase 3 a measured LCP
 * baseline to defend once the WebGL hero arrives. All copy is server rendered
 * — the canvas will mount behind this markup, never in place of it.
 */
export default function HomePage() {
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

      <section className="section">
        <div className="container-page">
          <FadeInView>
            <p className="eyebrow text-bronze">The shell is standing</p>
            <h2 className="measure mt-6 text-h3">
              Phase 0 is complete. Projects, filters and the enquiry flow land in
              Phase 1.
            </h2>
            <p className="measure text-muted-foreground mt-6">
              Design tokens, typography, layout chrome, smooth scroll and
              reduced-motion handling are in place. All content on this page is
              placeholder and carries no RERA registration.
            </p>
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

const trustMetrics = [
  {
    value: `${new Date().getFullYear() - siteConfig.foundedYear}+`,
    label: "Years building",
  },
  { value: "—", label: "Projects delivered" },
  { value: "—", label: "Sq ft delivered" },
  { value: "—", label: "On-time possession" },
] as const;
