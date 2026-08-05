import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Legal"
      title="Terms of Use"
      description="The terms governing use of this website."
      phase="Phase 1"
    />
  );
}
