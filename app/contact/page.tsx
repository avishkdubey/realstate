import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Talk to us"
      title="Contact"
      description="Reach the sales desk by WhatsApp, phone or the enquiry form. NRI callbacks are scheduled to your timezone."
      phase="Phase 1"
    />
  );
}
