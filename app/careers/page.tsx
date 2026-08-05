import type { Metadata } from "next";

import { FadeInView } from "@/components/motion/fade-in-view";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles in design, site management and sales at our Ahmedabad office.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-bronze">Join us</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Careers</h1>
        <p className="measure text-muted-foreground mt-6">
          We are a small team that builds a few things carefully. That means
          fewer roles than a firm our age might have, and more responsibility in
          each of them.
        </p>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <FadeInView>
            <p className="eyebrow text-muted-foreground">Open roles</p>
            <ul className="mt-8 divide-y divide-border border-t border-border">
              {roles.map((role) => (
                <li key={role.title} className="py-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h2 className="text-lead">{role.title}</h2>
                    <span className="eyebrow text-muted-foreground">
                      {role.location} · {role.type}
                    </span>
                  </div>
                  <p className="measure text-muted-foreground mt-3">{role.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground mt-8">
              Roles listed here are illustrative in this demonstration build.
            </p>
          </FadeInView>

          <FadeInView delay={0.05}>
            <div className="border border-border p-8">
              <p className="eyebrow text-bronze">How to apply</p>
              <p className="measure text-muted-foreground mt-4">
                Send a CV and a short note about something you have built — a
                building, a spreadsheet, an argument — to our office. We read
                everything and reply to everyone, though not always quickly.
              </p>
              <p className="mt-6">
                <a
                  href={`mailto:${siteConfig.email}?subject=Application`}
                  className="underline underline-offset-4"
                >
                  {siteConfig.email}
                </a>
              </p>
              <address className="text-small text-muted-foreground mt-6 not-italic leading-relaxed">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.locality}
                <br />
                {siteConfig.address.city} {siteConfig.address.postalCode}
              </address>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

const roles = [
  {
    title: "Site Engineer",
    location: "Ahmedabad",
    type: "Full time",
    body: "Day-to-day supervision on an ongoing tower project on SG Highway. You will own the monthly progress report that gets published on this website, which means it has to be accurate.",
  },
  {
    title: "Design Architect",
    location: "Ahmedabad",
    type: "Full time",
    body: "Layout and detailing across residential projects, working to carpet-area efficiency targets and Vastu constraints without letting either ruin the plan.",
  },
  {
    title: "Sales Associate",
    location: "Ahmedabad",
    type: "Full time",
    body: "Handling enquiries from the website and WhatsApp. The job is answering questions honestly and fast; it is not persuading anyone of anything.",
  },
];
