import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Locations in Ahmedabad",
  alternates: { canonical: "/locations" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Micro-markets"
      title="Locations"
      description="Neighbourhood guides for SG Highway, Shela, South Bopal, Sindhu Bhavan Road, Chandkheda and the GIFT City corridor — price trends, drive times and landmarks."
      phase="Phase 2"
    />
  );
}
