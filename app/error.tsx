"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * Its main job is recovering from stale chunks. Next.js splits the app into
 * hashed JavaScript files; when a new version is deployed the old hashes stop
 * existing. Anyone with the site already open is then one client-side
 * navigation away from a failed import — which surfaces as a blank "this page
 * couldn't load" screen, even though a manual refresh fixes it instantly
 * because that fetches the new HTML and the new hashes.
 *
 * Making the visitor discover the refresh themselves is not acceptable, so a
 * chunk failure reloads the route once, automatically. The reload is guarded
 * by a session flag: if the fresh copy fails the same way, the cause is not a
 * stale chunk and we stop and show the message rather than loop.
 */
const RELOAD_FLAG = "chunk-reload-attempted";

function isStaleChunkError(error: Error): boolean {
  const message = `${error.name} ${error.message}`;
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isStaleChunkError(error)) return;

    if (sessionStorage.getItem(RELOAD_FLAG)) {
      // Already tried a clean load and it still failed — stop, or we loop.
      return;
    }

    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  }, [error]);

  useEffect(() => {
    // A route that renders successfully clears the guard, so a future stale
    // deploy is allowed its own single recovery attempt.
    return () => sessionStorage.removeItem(RELOAD_FLAG);
  }, []);

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Something went wrong</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">
          This page didn&apos;t load.
        </h1>
        <p className="measure text-muted-foreground mt-6">
          That is our fault, not yours. Try again — and if it keeps happening,
          call or message us and we will send you what you were looking for
          directly.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="eyebrow bg-charcoal text-ivory rounded-sm px-8 py-4"
          >
            Try again
          </button>
          <Link
            href="/projects"
            className="eyebrow border-foreground rounded-sm border px-8 py-4"
          >
            View projects
          </Link>
          <Link
            href="/contact"
            className="eyebrow border-foreground rounded-sm border px-8 py-4"
          >
            Contact us
          </Link>
        </div>

        {error.digest && (
          <p className="text-caption text-muted-foreground mt-10">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
