"use client";

import Link from "next/link";
import { Building2, FileCheck2, Headset, Video } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import { useVisitor } from "@/lib/visitor-storage";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * The NRI strip.
 *
 * NRIs are ~18–20% of purchases and their luxury demand grew 38% year on year
 * (`CLAUDE.md` §1), and the Gujarati diaspora is the single largest source of
 * that money in this city. They also buy without ever standing in the building,
 * which is why the four cards below are all about *remote* confidence rather
 * than about the homes.
 *
 * Greeted by name where there is one. The name never leaves this browser — see
 * `lib/visitor-storage.ts` for why that keeps it out of DPDP §6 territory.
 */
const ASSURANCES = [
  {
    icon: Video,
    title: "Virtual tours",
    body: "Walk a 360° tour of the actual flat, at your own pace, from anywhere in the world.",
  },
  {
    icon: FileCheck2,
    title: "PoA assistance",
    body: "Power of attorney, NRE and NRO accounts, FEMA and the documentation checklist — written down, not explained on a call.",
  },
  {
    icon: Building2,
    title: "Transparent process",
    body: "Dated construction photographs every month, whether the news that month is good or not.",
  },
  {
    icon: Headset,
    title: "Dedicated manager",
    body: "One person for the whole purchase, on a call scheduled in your timezone rather than ours.",
  },
] as const;

export function NriInvest() {
  const visitor = useVisitor();

  return (
    <section
      className="section bg-surface-3 border-hairline border-y"
      aria-labelledby="nri-heading"
    >
      <div className="container-page">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-gold-soft">For NRI investors</p>
            <h2 id="nri-heading" className="measure mt-6 text-h3">
              Invest in Ahmedabad with confidence.
            </h2>
            <p className="text-lead text-stone-2 measure mt-6">
              Your home, even from miles away.
            </p>
            <p className="measure text-muted-foreground mt-6">
              {visitor?.name ? `${visitor.name}, whether` : "Whether"} you are in
              the US, the UK or the Gulf, we make owning a home in Ahmedabad
              something you can do without a flight. {siteConfig.nriNote}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/nri-corner"
                className="eyebrow bg-gold text-charcoal rounded-sm px-8 py-4 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Talk to our NRI desk
              </Link>
              <a
                href={whatsappLink({
                  message:
                    "Hi, I'm an NRI buyer looking at Ahmedabad. Please share what's available and how the remote purchase process works.",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal rounded-sm border px-8 py-4 transition-colors duration-300"
              >
                WhatsApp the NRI desk
              </a>
            </div>
          </div>

          <ul className="grid gap-px sm:grid-cols-2">
            {ASSURANCES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-surface-1 p-8">
                <Icon className="text-gold-soft size-5" aria-hidden />
                <h3 className="mt-5 text-lead">{title}</h3>
                <p className="text-small text-muted-foreground mt-3">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
