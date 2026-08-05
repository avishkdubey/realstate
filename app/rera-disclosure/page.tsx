import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "RERA Disclosure",
  alternates: { canonical: "/rera-disclosure" },
};

export default function Page() {
  return (
    <PagePlaceholder
      eyebrow="Statutory"
      title="RERA Disclosure"
      description="Project-wise GujRERA registration numbers, QR codes and statutory disclaimers. This build carries demo content only and no live registration."
      phase="Phase 1"
    />
  );
}
