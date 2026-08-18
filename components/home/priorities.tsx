"use client";

import Link from "next/link";
import { useState } from "react";

import { useVisitor } from "@/lib/visitor-storage";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * "What matters most to you?" — a three-way choice that writes a card back.
 *
 * A micro-commitment, in the sense `CLAUDE.md` §12 uses the term: one tap, no
 * fields, nothing sent anywhere, and the reward is an answer rather than a
 * "thanks, we'll be in touch". The point is to earn the *next* step — the
 * WhatsApp handoff below the card arrives pre-written with the choice already
 * in it, so the visitor never has to explain themselves twice.
 *
 * Nothing is persisted and nothing is transmitted until the visitor taps
 * through to WhatsApp, which is what keeps this outside DPDP §6 consent
 * territory — there is no collection to consent to.
 */

type Priority = {
  id: "location" | "value" | "luxury";
  label: string;
  question: string;
  /** The card. Written as if a person answered, not a brochure. */
  headline: string;
  body: string;
  points: string[];
  /** Prefills the WhatsApp handoff so sales opens with context. */
  intent: string;
  href: string;
  hrefLabel: string;
};

const PRIORITIES: Priority[] = [
  {
    id: "location",
    label: "Location",
    question: "Where it is matters most",
    headline: "Then start with the corridor, not the building.",
    body: "Drive times decide how a home feels on a Tuesday morning, and they are the one thing you cannot renovate. We publish a guide for every corridor we build in — prices, what has already arrived, and what is still only announced.",
    points: [
      "Six corridor guides with real drive times",
      "Schools, hospitals and temples mapped, with distances",
      "Infrastructure listed as long-term, never as a guarantee",
    ],
    intent: "location",
    href: "/locations",
    hrefLabel: "Read the location guides",
  },
  {
    id: "value",
    label: "Value",
    question: "The numbers matter most",
    headline: "Then here is every number, before you call anyone.",
    body: "Starting prices are published on every project that has one. Areas are carpet area as RERA defines it — never super built-up. The EMI calculator and the full cost sheet, stamp duty and GST included, are open on every project page.",
    points: [
      "Carpet area only, on every plan and every listing",
      "Cost sheet with stamp duty, GST and registration shown",
      "EMI calculator with no phone number required",
    ],
    intent: "value",
    href: "/projects",
    hrefLabel: "Compare projects and prices",
  },
  {
    id: "luxury",
    label: "Luxury",
    question: "How it feels matters most",
    headline: "Then judge us on the parts you touch every day.",
    body: "Specification is where a builder's real budget shows. Ours is published per project, down to the make of the fittings, and the finishing photographs are dated so you can see what a five-year-old building actually looks like.",
    points: [
      "Full specification published per project",
      "Dated construction and finishing photography",
      "Vastu facing labelled on every plan, and filterable",
    ],
    intent: "luxury",
    href: "/amenities",
    hrefLabel: "See the amenities",
  },
];

export function Priorities() {
  const [chosen, setChosen] = useState<Priority | null>(null);
  const visitor = useVisitor();

  return (
    <section className="section bg-surface-2" aria-labelledby="priorities-heading">
      <div className="container-page">
        <p className="eyebrow text-accent">One question</p>
        <h2 id="priorities-heading" className="measure mt-6 text-h3">
          What matters most to you?
        </h2>
        <p className="measure text-muted-foreground mt-6">
          Everyone says all three. Almost nobody means it equally — and the
          honest answer changes which project we would show you first.
        </p>

        <div
          className="mt-12 grid gap-4 sm:grid-cols-3"
          role="group"
          aria-label="What matters most to you"
        >
          {PRIORITIES.map((priority) => {
            const active = chosen?.id === priority.id;
            return (
              <button
                key={priority.id}
                type="button"
                aria-pressed={active}
                onClick={() => setChosen(active ? null : priority)}
                className={`border p-8 text-left transition-colors duration-300 ${
                  active
                    ? "border-gold bg-surface-3"
                    : "border-border hover:border-hairline-strong"
                }`}
              >
                <span
                  className={`eyebrow block ${active ? "text-gold-soft" : "text-muted-foreground"}`}
                >
                  {priority.label}
                </span>
                <span className="mt-4 block text-lead">{priority.question}</span>
              </button>
            );
          })}
        </div>

        {/* The card. Rendered only on a choice — an empty placeholder card
            sitting there before anyone taps reads as a broken component. */}
        {chosen && (
          <article
            className="border-border bg-surface-1 mt-8 border p-8 md:p-12"
            /* Announced rather than silently swapped in, because the visitor's
               focus is still on the button they pressed. */
            aria-live="polite"
          >
            <p className="eyebrow text-gold-soft">
              {visitor?.name ? `For you, ${visitor.name}` : "For you"}
            </p>
            <h3 className="measure mt-6 text-h4">{chosen.headline}</h3>
            <p className="measure text-muted-foreground mt-6">{chosen.body}</p>

            <ul className="mt-8 space-y-3">
              {chosen.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden className="text-gold-soft mt-1">
                    —
                  </span>
                  <span className="text-small measure">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={chosen.href}
                className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4 transition-transform duration-300 hover:-translate-y-0.5"
              >
                {chosen.hrefLabel}
              </Link>
              <a
                href={whatsappLink({
                  message: `Hi, ${chosen.intent} matters most to me. Please share what you would recommend.`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal rounded-sm border px-8 py-4 transition-colors duration-300"
              >
                Ask on WhatsApp
              </a>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
