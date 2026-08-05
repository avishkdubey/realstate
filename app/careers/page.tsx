import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Careers",
  alternates: { canonical: "/careers" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Join us"
      title="Careers"
      description="How we work, and the roles we are currently hiring for."
      phase="Phase 4"
    />
  );
}
