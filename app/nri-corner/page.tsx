import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "NRI Corner",
  alternates: { canonical: "/nri-corner" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="For NRI buyers"
      title="NRI Corner"
      description="Buying from abroad — power of attorney, NRE and NRO accounts, FEMA rules, NRI home loans, remote booking and timezone-aware callbacks."
      phase="Phase 4"
    />
  );
}
