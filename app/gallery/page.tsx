import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Gallery",
  alternates: { canonical: "/gallery" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Imagery"
      title="Gallery"
      description="Photography and renders, filterable by project and type."
      phase="Phase 2"
    />
  );
}
