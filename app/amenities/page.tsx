import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Amenities",
  alternates: { canonical: "/amenities" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Lifestyle"
      title="Amenities"
      description="Clubhouse, pool, gym, padel, EV charging, co-working, pet-friendly zones and spaces for children and elders, shown across the portfolio."
      phase="Phase 2"
    />
  );
}
