import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Privacy Policy"
      description="How we collect, use, store and delete personal data under the Digital Personal Data Protection Act, 2023, and how to withdraw consent."
      phase="Phase 1"
    />
  );
}
