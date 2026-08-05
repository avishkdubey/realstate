import type { Metadata } from "next";
import Link from "next/link";

import { FadeInView } from "@/components/motion/fade-in-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getTestimonials } from "@/lib/data";
import { faqSchema } from "@/lib/project-schema";
import { siteConfig } from "@/lib/site-config";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "NRI Corner",
  description:
    "Buying property in Ahmedabad from abroad — power of attorney, NRE and NRO accounts, FEMA rules, NRI home loans, remote booking and timezone-aware callbacks.",
  alternates: { canonical: "/nri-corner" },
};

/**
 * NRI buyers are roughly 18–20% of Indian residential purchases and the
 * Gujarati diaspora is central to Ahmedabad demand (CLAUDE.md §1). They buy
 * without standing in the building, so this page has to answer the process
 * questions a site visit would normally cover.
 */
export default async function NriCornerPage() {
  const nriTestimonials = (await getTestimonials()).filter((t) =>
    /USA|UK|Canada|Kenya|Tanzania|Uganda|Dubai/i.test(t.location),
  );

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      <section className="bg-charcoal text-ivory pt-40">
        <div className="container-page pb-24">
          <p className="eyebrow text-gold-soft">For NRI buyers</p>
          <h1 className="measure mt-8 text-h3 md:text-h2">
            Buying from six thousand miles away.
          </h1>
          <p className="measure text-lead text-stone-2 mt-8">
            A meaningful share of the homes we sell are bought by people who
            will not see them until possession. That works, but only if the
            process is written down. Here it is.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href={whatsappLink({
                message:
                  "Hi, I'm an NRI buyer interested in your Ahmedabad projects. Please share details and a convenient time to call.",
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4"
            >
              WhatsApp our NRI desk
            </a>
            <Link
              href="/contact"
              className="eyebrow hover:bg-ivory hover:text-charcoal rounded-sm border border-white/25 px-8 py-4 transition-colors"
            >
              Request a callback
            </Link>
          </div>
          <p className="text-caption text-stone-2 mt-6">{siteConfig.nriNote}</p>
        </div>
      </section>

      {/* The process */}
      <section className="section">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <FadeInView>
            <p className="eyebrow text-bronze">The process</p>
          </FadeInView>
          <FadeInView delay={0.05}>
            <ol className="divide-y divide-border">
              {steps.map((step, index) => (
                <li key={step.title} className="grid gap-4 py-8 sm:grid-cols-[60px_1fr]">
                  <span className="font-display text-h5 text-bronze tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-lead">{step.title}</span>
                    <span className="measure text-muted-foreground mt-2 block">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </FadeInView>
        </div>
      </section>

      {/* Documents */}
      <section className="section bg-cream/50">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <FadeInView>
            <p className="eyebrow text-bronze">What you will need</p>
            <ul className="mt-8 divide-y divide-border">
              {documents.map((doc) => (
                <li key={doc} className="py-4">
                  {doc}
                </li>
              ))}
            </ul>
          </FadeInView>

          <FadeInView delay={0.05}>
            <p className="eyebrow text-bronze">Money, plainly</p>
            <dl className="mt-8 divide-y divide-border">
              {moneyNotes.map((note) => (
                <div key={note.term} className="py-5">
                  <dt className="text-lead">{note.term}</dt>
                  <dd className="measure text-small text-muted-foreground mt-2">
                    {note.body}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeInView>
        </div>
      </section>

      {/* Testimonials */}
      {nriTestimonials.length > 0 && (
        <section className="section">
          <div className="container-page">
            <p className="eyebrow text-bronze">From buyers abroad</p>
            <ul className="mt-12 grid gap-10 lg:grid-cols-2">
              {nriTestimonials.map((testimonial) => (
                <li key={testimonial.id} className="border-t border-border pt-6">
                  <blockquote className="measure text-lead">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <p className="text-small text-muted-foreground mt-4">
                    {testimonial.name} · {testimonial.role} · {testimonial.location}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="section bg-cream/50">
        <div className="container-page">
          <p className="eyebrow text-bronze">Questions we get asked</p>
          <dl className="mt-12 max-w-3xl">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-t border-border py-8">
                <dt className="text-lead">{faq.q}</dt>
                <dd className="measure text-muted-foreground mt-3">{faq.a}</dd>
              </div>
            ))}
          </dl>

          <p className="measure text-caption text-muted-foreground mt-16 leading-relaxed">
            General guidance only, current at the time of writing. FEMA rules,
            tax treatment and repatriation limits change, and they depend on
            your residency status. Take advice from a chartered accountant and a
            lawyer before you transact — we are neither.
          </p>
        </div>
      </section>
    </>
  );
}

const steps = [
  {
    title: "Shortlist remotely",
    body: "Every project page carries carpet areas, starting prices, floor plans with facing labelled, and a 360° view. Nothing is held back for a phone call.",
  },
  {
    title: "A video walkthrough, live",
    body: "We walk the site with you on a video call at an hour that suits your timezone — including the parts still under construction.",
  },
  {
    title: "Confirm eligibility",
    body: "NRIs and OCI cardholders may buy residential and commercial property in India freely. Agricultural land, plantations and farmhouses may not be purchased, only inherited.",
  },
  {
    title: "Appoint a power of attorney",
    body: "Most NRI buyers appoint a family member in India under a registered special power of attorney, executed at the Indian consulate in your country and adjudicated in Gujarat.",
  },
  {
    title: "Arrange funds",
    body: "Payment must come through normal banking channels — an NRE, NRO or FCNR account — never in foreign currency notes or traveller's cheques.",
  },
  {
    title: "Book and register",
    body: "Booking can be completed remotely. Registration happens in Ahmedabad, either in person on a visit or through your power of attorney.",
  },
];

const documents = [
  "Passport, and OCI or PIO card if applicable",
  "Overseas address proof",
  "PAN card — required to register a property in India",
  "Recent photographs",
  "NRE or NRO account details",
  "Registered and adjudicated power of attorney, if you will not attend in person",
  "Employment contract and recent payslips, if you are applying for a loan",
];

const moneyNotes = [
  {
    term: "NRE account",
    body: "Holds income earned abroad. Funds and interest are freely repatriable, which matters if you may want to take sale proceeds back out later.",
  },
  {
    term: "NRO account",
    body: "Holds income earned in India — rent, dividends. Repatriation is permitted within annual limits and requires certification from a chartered accountant.",
  },
  {
    term: "FEMA",
    body: "Governs how the purchase must be funded. In short: through banking channels, from an NRE, NRO or FCNR account. Cash is not an option.",
  },
  {
    term: "NRI home loans",
    body: "Indian lenders fund NRI purchases, typically up to 80% of value, with repayment through NRE or NRO accounts. Rates broadly track resident rates.",
  },
  {
    term: "TDS on resale",
    body: "When an NRI sells Indian property, tax is deducted at source at rates higher than for residents. Plan for it before you buy, not after.",
  },
];

const faqs = [
  {
    q: "Can an NRI buy property in Ahmedabad?",
    a: "Yes. NRIs and OCI cardholders may buy residential and commercial property in India without special permission. Agricultural land, plantation property and farmhouses cannot be purchased, though they can be inherited.",
  },
  {
    q: "Do I need to travel to India to buy?",
    a: "No. Shortlisting, video walkthroughs and booking can all be done remotely. Registration requires either your presence in Ahmedabad or a registered power of attorney acting for you.",
  },
  {
    q: "How do I pay for the property from abroad?",
    a: "Through normal banking channels from an NRE, NRO or FCNR account. Under FEMA you cannot pay in foreign currency notes or by traveller's cheque.",
  },
  {
    q: "Can I get a home loan as an NRI?",
    a: "Yes. Indian lenders fund NRI purchases at typically up to 80% of value, repaid through your NRE or NRO account. You will need your employment contract, payslips and overseas address proof.",
  },
  {
    q: "Can I take the money back out when I sell?",
    a: "Generally yes, subject to FEMA limits and after tax. Funds routed originally through an NRE account are the most straightforward to repatriate. Take advice from a chartered accountant — the rules are specific to your situation.",
  },
];
