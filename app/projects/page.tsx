import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Projects",
  alternates: { canonical: "/projects" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Portfolio"
      title="Projects"
      description="Ongoing, completed and upcoming residences across west Ahmedabad, with filters for micro-market, configuration, budget, possession and Vastu facing."
      phase="Phase 1"
    />
  );
}
