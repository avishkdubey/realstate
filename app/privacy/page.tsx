import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How we collect, use and delete personal data under the Digital Personal Data Protection Act, 2023, and how to withdraw consent.",
  alternates: { canonical: "/privacy" },
};

/**
 * DPDP Act 2023 §5 requires a clear notice at the point of collection, and §6
 * requires consent that is free, specific, informed and unambiguous — which
 * means the notice has to actually say what happens to the data.
 *
 * This is a working draft written to the statute, not legal advice. Have it
 * reviewed by counsel before launch, and fill in the named contact below.
 */
export default function PrivacyPage() {
  return (
    <section className="section pt-40">
      <div className="container-page">
        <p className="eyebrow text-accent">Legal</p>
        <h1 className="measure mt-6 text-h3 md:text-h2">Privacy Policy</h1>
        <p className="measure text-muted-foreground mt-6">
          This notice explains what we collect when you contact us, why, and how
          to make us stop. It is written to the Digital Personal Data Protection
          Act, 2023.
        </p>

        <div className="measure mt-16 space-y-12">
          <Clause title="What we collect">
            When you submit an enquiry we collect your name and mobile number,
            which are required, and your email address, budget range, possession
            preference and NRI status where you choose to provide them. We also
            record which project the enquiry came from and when it was sent.
            <br />
            <br />
            We do not collect financial information, identity documents or
            payment details through this website, and we will never ask for them
            by email or WhatsApp.
          </Clause>

          <Clause title="Why we collect it">
            For one purpose only: so that our sales team can respond to your
            enquiry about our residential projects, and follow up about projects
            of the kind you asked about. We do not use it for anything else.
          </Clause>

          <Clause title="Your consent">
            We collect and process this data on the basis of the consent you give
            by ticking the box on the enquiry form. That box is never pre-ticked,
            and the form will not submit without it.
            <br />
            <br />
            You may withdraw your consent at any time, and it must be as easy to
            withdraw as it was to give. Email{" "}
            <a
              href={`mailto:${siteConfig.email}?subject=Withdraw%20consent`}
              className="text-foreground underline underline-offset-4"
            >
              {siteConfig.email}
            </a>{" "}
            with the subject &ldquo;Withdraw consent&rdquo;, or tell us on
            WhatsApp. We will stop contacting you and erase your details unless a
            law requires us to retain them.
          </Clause>

          <Clause title="Who we share it with">
            Nobody outside our own sales team, except the service providers who
            operate this website and deliver our email on our behalf, and only to
            the extent needed to do that. We do not sell your data, and we do not
            pass it to brokers or listing portals.
          </Clause>

          <Clause title="How long we keep it">
            For as long as your enquiry is active, and for twenty-four months
            afterwards so that we can recognise you if you return. After that we
            erase it. If you withdraw consent we erase it sooner.
          </Clause>

          <Clause title="Marketing calls and messages">
            Commercial calls and SMS in India are governed by TRAI&apos;s TCCCPR
            2018. We contact you only about the enquiry you raised, on the basis
            of the consent you gave. If your number is registered on the Do Not
            Disturb registry we will honour that. To stop all commercial
            communication from us, withdraw consent as described above.
          </Clause>

          <Clause title="Your rights">
            Under the DPDP Act you may ask us for a summary of the personal data
            we hold about you and how we have processed it; ask us to correct or
            complete it; ask us to erase it; and nominate someone to exercise
            these rights if you are unable to. Write to the address below and we
            will respond.
          </Clause>

          <Clause title="Cookies and analytics">
            This website does not set advertising or tracking cookies. If we add
            analytics or retargeting in future, this notice will be updated
            first and consent obtained where the law requires it.
          </Clause>

          <Clause title="Contacting us">
            {siteConfig.legalName}
            <br />
            {siteConfig.address.street}
            <br />
            {siteConfig.address.locality}
            <br />
            {siteConfig.address.city} {siteConfig.address.postalCode},{" "}
            {siteConfig.address.region}
            <br />
            <br />
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-foreground underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
            <br />
            {siteConfig.phone}
          </Clause>
        </div>

        <p className="measure text-caption text-muted-foreground mt-16 border-t border-border pt-8 leading-relaxed">
          This is a demonstration build. Before this website goes live, this
          policy must be reviewed by counsel, a named grievance officer
          appointed, and the retention periods confirmed against the DPDP Rules,
          2025. Full compliance is required by 13 May 2027.
        </p>
      </div>
    </section>
  );
}

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-h5">{title}</h2>
      <p className="text-muted-foreground mt-4 leading-relaxed">{children}</p>
    </div>
  );
}
