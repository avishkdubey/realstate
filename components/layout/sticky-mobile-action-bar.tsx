import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { telLink, whatsappLink } from "@/lib/whatsapp";

/**
 * Call / WhatsApp / Enquire, pinned to the bottom of every mobile viewport.
 *
 * Most of this audience arrives on a phone, and the difference between a lead
 * answered in five minutes and one answered in sixty is roughly 60–75% vs
 * 5–12% conversion to a site visit — so the fastest channels stay one thumb
 * away at all times (CLAUDE.md §12).
 */
export function StickyMobileActionBar() {
  return (
    <div className="bg-charcoal text-ivory fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 border-t border-white/10 lg:hidden">
      <a
        href={telLink()}
        className="eyebrow flex items-center justify-center gap-2 py-4"
      >
        <Phone size={16} aria-hidden />
        Call
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow flex items-center justify-center gap-2 border-x border-white/10 py-4"
      >
        <MessageCircle size={16} aria-hidden />
        WhatsApp
      </a>
      <Link
        href="/contact"
        className="eyebrow bg-gold text-charcoal flex items-center justify-center py-4"
      >
        Enquire
      </Link>
    </div>
  );
}
