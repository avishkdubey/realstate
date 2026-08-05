import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Insights",
  alternates: { canonical: "/insights" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Journal"
      title="Insights"
      description="Market notes, Vastu guides, locality guides and home-loan explainers for buyers in Ahmedabad."
      phase="Phase 4"
    />
  );
}
