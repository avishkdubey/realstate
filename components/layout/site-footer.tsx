import Link from "next/link";

import { footerNav, siteConfig } from "@/lib/site-config";

/**
 * Carries three things that are not optional: the physical office address,
 * the GujRERA registration line required by RERA Act §11(2), and the DPDP
 * privacy link (CLAUDE.md §13).
 */
export function SiteFooter() {
  const { address, rera } = siteConfig;

  return (
    <footer className="bg-charcoal text-ivory mt-auto">
      <div className="container-page py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-h5">{siteConfig.name}</p>
            <p className="measure text-small text-stone-2 mt-4">
              Building in Ahmedabad since {siteConfig.foundedYear}.
            </p>
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
        <div className="mt-16 border-t border-white/10 pt-8">
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
