import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

/**
 * Conditional festive-offer strip.
 *
 * Booking in Gujarat clusters around Navratri, Diwali, Akshaya Tritiya and
 * Uttarayan, and offers cluster with it (CLAUDE.md §2). This renders nothing
 * unless `siteConfig.festiveOffer.active` is true — urgency that is not true
 * is a §12 exposure, not a marketing tactic.
 */
export function FestiveBanner() {
  const offer = siteConfig.festiveOffer;
  if (!offer.active || !offer.label) return null;

  return (
    <aside className="bg-forest-lift text-ivory">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
        <p className="text-small">{offer.label}</p>
        <Link
          href={offer.href}
          className="eyebrow border-b border-current pb-1 shrink-0"
        >
          Enquire
        </Link>
      </div>
    </aside>
  );
}
