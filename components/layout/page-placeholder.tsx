import Link from "next/link";

/**
 * Phase 0 stub for routes that are built out in later phases.
 *
 * These exist now rather than later for two reasons: Next.js typed routes
 * refuse to compile links to non-existent paths, and a navigable shell is what
 * makes the layout reviewable end to end.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
  phase,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Build phase this page is scheduled for — see CLAUDE.md §16. */
  phase: string;
}) {
  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">{title}</h1>
        <p className="measure text-muted-foreground mt-6">{description}</p>
        <p className="eyebrow text-muted-foreground mt-10">
          Scheduled for {phase}
        </p>
        <Link
          href="/"
          className="eyebrow text-foreground mt-8 inline-block border-b border-current pb-1"
        >
          Back home
        </Link>
      </div>
    </section>
  );
}
