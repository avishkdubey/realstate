import type { Metadata } from "next";

import { EnquiryForm } from "@/components/forms/enquiry-form";
import { FadeInView } from "@/components/motion/fade-in-view";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Channel Partners",
  description:
    "Registration, commission terms and project inventory access for channel partners working with us in Ahmedabad.",
  alternates: { canonical: "/channel-partners" },
};

export default function ChannelPartnersPage() {
  return (
    <>
      <section className="section pt-40">
        <div className="container-page">
          <p className="eyebrow text-accent">For brokers</p>
          <h1 className="measure mt-6 text-h3 md:text-h2">Channel partners</h1>
          <p className="measure text-muted-foreground mt-6">
            We work with a small number of registered partners rather than a
            long list. If you sell in west Ahmedabad and your clients ask you
            hard questions, we will get on well.
          </p>

          <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.1fr]">
            <FadeInView>
              <ul className="divide-y divide-border">
                {benefits.map((benefit) => (
                  <li key={benefit.title} className="py-6">
                    <h2 className="text-lead">{benefit.title}</h2>
                    <p className="measure text-muted-foreground mt-2 text-small">
                      {benefit.body}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <a
                  href={whatsappLink({
                    message:
                      "Hi, I'd like to register as a channel partner. Please share the terms.",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow bg-forest-lift text-ivory rounded-sm px-8 py-4"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </FadeInView>

            <FadeInView delay={0.05}>
              <p className="eyebrow text-muted-foreground mb-6">
                Register your interest
              </p>
              <EnquiryForm source="contact" />
            </FadeInView>
          </div>

          <p className="measure text-caption text-muted-foreground mt-20 leading-relaxed">
            Registration does not create an agency or employment relationship.
            Commission terms are set out in a separate written agreement, and
            partners are expected to hold any registration their own state
            requires and to represent our projects only as they are described on
            this website.
          </p>
        </div>
      </section>
    </>
  );
}

const benefits = [
  {
    title: "Live inventory, not a rumour",
    body: "Availability on this website is what our sales desk sees. You will not bring a client to a unit that sold last week.",
  },
  {
    title: "Transparent pricing",
    body: "Starting prices are published. There is no separate broker price list, which means no awkward conversations in front of your client.",
  },
  {
    title: "Paid on schedule",
    body: "Commission is released against agreed milestones with a written timeline. We would rather you chased buyers than chased us.",
  },
  {
    title: "Co-branded material",
    body: "Project collateral, floor plans and site-visit support, with RERA details intact — as the Act requires of any advertisement carrying our projects.",
  },
];
