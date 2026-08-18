import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { footerNav, siteConfig } from "@/lib/site-config";
import { telLink, whatsappLink } from "@/lib/whatsapp";

/**
 * Carries three things that are not optional: the physical office address,
 * the GujRERA registration line required by RERA Act §11(2), and the DPDP
 * privacy link (CLAUDE.md §13).
 */

/**
 * Social profiles, filtered to the ones that actually point at a profile.
 *
 * `siteConfig.socials` currently holds bare domains (`https://instagram.com/`)
 * as placeholders. Rendering an Instagram icon that drops the visitor on
 * Instagram's logged-out home page is worse than showing no icon at all — it
 * reads as a broken site, which is precisely the signal this audience treats as
 * evidence of poor construction quality (CLAUDE.md §2). So a link only appears
 * once someone has put a real handle in the config.
 */
/* Labels rather than logos: lucide-react v1 removed its brand icons, and
   hand-rolling an approximation of a company's trademark is both a licensing
   question and, at 16px, visibly worse than the word. */
const SOCIAL_LABELS = {
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  facebook: "Facebook",
} as const;

function realSocials() {
  return (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[])
    .map((key) => ({ key, href: siteConfig.socials[key], label: SOCIAL_LABELS[key] }))
    .filter(({ href }) => {
      try {
        // A bare origin has a pathname of "/" and nothing else.
        return new URL(href).pathname.replace(/\/+$/, "").length > 0;
      } catch {
        return false;
      }
    });
}

export function SiteFooter() {
  const { address, rera } = siteConfig;
  const socials = realSocials();

  return (
    <footer className="bg-surface-1 border-t border-hairline-strong mt-auto">
      {/* Contact band. The last chance to hand off, and the two routes this
          market actually uses — WhatsApp carries ~60–70% of enquiries. */}
      <div className="border-hairline border-b">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-10">
          <p className="font-display text-h5 measure">
            Come and stand in one.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={telLink()}
              className="eyebrow border-hairline-strong hover:bg-ivory hover:text-charcoal inline-flex items-center gap-3 rounded-sm border px-6 py-3 transition-colors duration-300"
            >
              <Phone className="size-4" aria-hidden />
              {siteConfig.phone}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow bg-gold text-charcoal inline-flex items-center gap-3 rounded-sm px-6 py-3 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="container-page py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-h5">{siteConfig.name}</p>
            <p className="measure text-small text-stone-2 mt-4">
              Building in Ahmedabad since {siteConfig.foundedYear}.
            </p>
            <p className="text-small text-stone-2 mt-4 tabular-nums">
              {siteConfig.stats.completedSqFt.toLocaleString("en-IN")}+ sq ft ·{" "}
              {siteConfig.stats.happyFamilies.toLocaleString("en-IN")}+ families
            </p>

            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                {socials.map(({ key, href, label }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eyebrow text-stone-2 hover:text-ivory border-b border-transparent pb-1 transition-colors hover:border-current"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <FooterColumn title="Explore" links={footerNav.explore} />
          <FooterColumn title="Company" links={footerNav.company} />

          <div>
            <p className="eyebrow text-gold-soft">Visit us</p>
            <address className="text-small text-stone-2 mt-5 not-italic leading-relaxed">
              {address.street}
              <br />
              {address.locality}
              <br />
              {address.city} {address.postalCode}, {address.region}
            </address>
            <div className="text-small mt-5 space-y-1">
              <p>
                <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}>
                  {siteConfig.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
              <p className="text-stone-2">{siteConfig.hours}</p>
            </div>
          </div>
        </div>

        {/* Statutory block — RERA Act §11(2) requires the authority URL and the
            registration number to appear prominently, at a size no smaller
            than the contact number (GujRERA Order No. 108). */}
        <div className="mt-16 border-t border-hairline pt-8">
          <p className="text-small">
            {rera.authority} Registration:{" "}
            <span className="text-gold-soft">{rera.promoterNumber}</span> ·{" "}
            <a
              href={rera.authorityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {rera.authorityUrl}
            </a>
          </p>
          <p className="measure text-caption text-stone-2 mt-4 leading-relaxed">
            Project-wise RERA registration numbers and QR codes are listed on the{" "}
            <Link href="/rera-disclosure" className="underline underline-offset-4">
              RERA disclosure page
            </Link>
            . All renders and plans shown on this website are an artist&apos;s
            impression and for representational purposes only. Maps are not to
            scale and are indicative.
          </p>
        </div>

        <div className="text-caption text-stone-2 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {footerNav.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ivory transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-gold-soft">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-small text-stone-2 hover:text-ivory transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
