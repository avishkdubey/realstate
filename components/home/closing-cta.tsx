"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { useVisitor } from "@/lib/visitor-storage";
import { telLink, whatsappLink } from "@/lib/whatsapp";

/**
 * The closing invitation.
 *
 * The last thing on the page is the easiest thing to do next, and the phone
 * number is shown rather than hidden behind an icon — a visible number on every
 * page is one of the trust signals this market actually responds to
 * (`CLAUDE.md` §2).
 *
 * Three routes out, in the order this audience uses them: WhatsApp first
 * (~60–70% of enquiries), then a call, then the form for people who would
 * rather write than talk.
 */
export function ClosingCta() {
  const visitor = useVisitor();

  return (
    <section className="section bg-surface-2" aria-labelledby="closing-heading">
      <div className="container-page">
        <p className="eyebrow text-accent">Are you ready?</p>
        <h2
          id="closing-heading"
          className="measure mt-6 text-h3 leading-[1.08] md:text-h2"
        >
          {visitor?.name ? `${visitor.name}, let's find a space` : "Let's find a space"}{" "}
          that was always meant for you.
        </h2>
        <p className="measure text-muted-foreground mt-8">
          Come and stand in one. Site visits run {siteConfig.hours}, and we will
          send the location and a name to ask for before you arrive.
        </p>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4 transition-transform duration-300 hover:-translate-y-0.5"
          >
            Schedule a visit
          </Link>

          {/* The number is the label. A "Call us" button that hides the digits
              is worth less than the digits. */}
          <a
            href={telLink()}
            className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal inline-flex items-center gap-3 rounded-sm border px-8 py-4 transition-colors duration-300"
          >
            <Phone className="size-4" aria-hidden />
            {siteConfig.phone}
          </a>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal inline-flex items-center gap-3 rounded-sm border px-8 py-4 transition-colors duration-300"
          >
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </a>
        </div>

        <p className="text-caption text-muted-foreground mt-8">
          All enquiries are strictly confidential.
        </p>
      </div>
    </section>
  );
}
