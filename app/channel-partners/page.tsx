import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Channel Partners",
  alternates: { canonical: "/channel-partners" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="For brokers"
      title="Channel Partners"
      description="Registration and benefits for channel partners working with us in Ahmedabad."
      phase="Phase 4"
    />
  );
}
