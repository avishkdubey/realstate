import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/enquiry-form";
import { siteConfig } from "@/lib/site-config";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach our Ahmedabad sales desk by WhatsApp, phone or enquiry form. NRI callbacks are scheduled to your timezone.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { address } = siteConfig;

  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Talk to us</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Contact</h1>
        <p className="measure text-muted-foreground mt-6">
          The fastest route is WhatsApp — it reaches the sales desk directly and
          is usually answered within minutes during working hours. The form
          below reaches the same people.
        </p>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-12">
            <div className="flex flex-wrap gap-4">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow bg-forest text-ivory rounded-sm px-8 py-4"
              >
                WhatsApp
              </a>
              <a
                href={telLink()}
                className="eyebrow border-foreground rounded-sm border px-8 py-4"
              >
                {siteConfig.phone}
              </a>
            </div>

            <div>
              <p className="eyebrow text-muted-foreground">Sales office</p>
              <address className="mt-4 not-italic leading-relaxed">
                {address.street}
                <br />
                {address.locality}
                <br />
                {address.city} {address.postalCode}, {address.region}
              </address>
              <p className="text-small text-muted-foreground mt-4">
                {siteConfig.hours}
              </p>
              <p className="text-caption text-muted-foreground mt-2">
                Map and directions arrive with the location pages in the next
                release.
              </p>
            </div>

            <div className="border-t border-border pt-8">
              <p className="eyebrow text-muted-foreground">Buying from abroad</p>
              <p className="measure text-small text-muted-foreground mt-4">
                {siteConfig.nriNote} Tick the NRI box on the form and tell us
                your city — we will call at a reasonable hour for you, not for us.
              </p>
            </div>

            <div className="border-t border-border pt-8">
              <p className="eyebrow text-muted-foreground">Email</p>
              <p className="mt-4">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="underline underline-offset-4"
                >
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>

          <EnquiryForm source="contact" />
        </div>
      </div>
    </section>
  );
}
