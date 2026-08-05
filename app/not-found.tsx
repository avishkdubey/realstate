import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">404</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">
          This address doesn&apos;t exist.
        </h1>
        <p className="measure text-muted-foreground mt-6">
          The page you were looking for has moved or was never here. Our
          portfolio is a better place to start.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/projects"
            className="eyebrow bg-charcoal text-ivory rounded-sm px-8 py-4"
          >
            View Projects
          </Link>
          <Link
            href="/"
            className="eyebrow border-foreground rounded-sm border px-8 py-4"
          >
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
