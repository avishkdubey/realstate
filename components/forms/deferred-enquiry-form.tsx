"use client";

import dynamic from "next/dynamic";

/**
 * Loads the enquiry form only when this component mounts, keeping
 * react-hook-form and zod out of the initial bundle.
 *
 * Used on project pages, where the form sits far below the fold and its
 * hydration was costing ~300ms of blocking time before anyone had scrolled to
 * it. The WhatsApp and phone CTAs beside it stay server-rendered, so the
 * primary contact route never depends on this chunk arriving — and WhatsApp is
 * where most of these conversations happen anyway.
 *
 * The contact page imports EnquiryForm directly: there the form is the page.
 */
const EnquiryForm = dynamic(
  () => import("@/components/forms/enquiry-form").then((m) => m.EnquiryForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-8" aria-hidden>
        <div className="h-12 border-b border-border" />
        <div className="h-12 border-b border-border" />
        <div className="h-12 border-b border-border" />
      </div>
    ),
  },
);

export function DeferredEnquiryForm(props: {
  projectSlug?: string;
  projectName?: string;
  source?: "contact" | "project" | "site_visit";
  className?: string;
}) {
  return <EnquiryForm {...props} />;
}
