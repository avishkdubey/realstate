import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "About & Legacy",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Our story"
      title="About & Legacy"
      description="The family, the timeline, the leadership, the certifications and the buildings that are already standing."
      phase="Phase 2"
    />
  );
}
