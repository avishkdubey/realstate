/**
 * The single file to edit when swapping demo content for a real client.
 * Brand name, contact details, office address, socials and RERA identity all
 * live here — nothing else in the codebase should hardcode them.
 */

export const siteConfig = {
  /** Brand */
  name: "Aarambh Estates",
  legalName: "Aarambh Estates LLP",
  tagline: "Homes built to be inherited.",
  description:
    "A builder of residences across west Ahmedabad — SG Highway, Shela, South Bopal and the GIFT City corridor. Apartments, villas and penthouses from ₹50 lakh.",
  /** Year the firm was founded — powers the "since 19XX" legacy line. */
  foundedYear: 1978,

  /** Canonical origin. Drives metadataBase, sitemap, canonicals and OG URLs. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",

  /** Contact */
  phone: "+91 79 4000 0000",
  /** E.164, digits only — required by the wa.me deep-link format. */
  whatsapp: "919999999999",
  email: "sales@example.com",

  /** Physical office. Shown in the footer and on every page for trust. */
  address: {
    street: "4th Floor, Westgate Business Bay, Near YMCA Club",
    locality: "SG Highway, Makarba",
    city: "Ahmedabad",
    region: "Gujarat",
    postalCode: "380051",
    country: "IN",
  },
  geo: { lat: 23.0089, lng: 72.5064 },

  /** Sales desk hours, plus a note for NRI buyers in other timezones. */
  hours: "Mon–Sat, 10:00–19:00 IST",
  nriNote: "NRI callbacks scheduled for US, UK, Canada and East Africa hours.",

  /**
   * RERA identity. Per RERA Act §11(2) the authority URL and registration
   * number must appear prominently on every project page and in the footer.
   * NEVER substitute a fabricated number — §59 penalties attach to the
   * advertisement itself. Demo builds use the DEMO-PENDING marker.
   */
  rera: {
    authority: "GujRERA",
    authorityUrl: "https://gujrera.gujarat.gov.in",
    /** Firm-level registration, where applicable. */
    promoterNumber: "DEMO-PENDING",
  },

  socials: {
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    linkedin: "https://linkedin.com/",
    facebook: "https://facebook.com/",
  },

  /**
   * Set true only when a genuine festive offer is live (Navratri, Diwali,
   * Akshaya Tritiya, Uttarayan). Urgency claims must be true — see CLAUDE.md §12.
   */
  festiveOffer: {
    active: false,
    label: "",
    href: "/contact",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Primary navigation — deliberately capped at 5–7 items (CLAUDE.md §8). */
export const mainNav = [
  { label: "Projects", href: "/projects" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
  { label: "NRI Corner", href: "/nri-corner" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = {
  explore: [
    { label: "Projects", href: "/projects" },
    { label: "Amenities", href: "/amenities" },
    { label: "Gallery", href: "/gallery" },
    { label: "Locations", href: "/locations" },
  ],
  company: [
    { label: "About & Legacy", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Channel Partners", href: "/channel-partners" },
    { label: "Insights", href: "/insights" },
  ],
  legal: [
    { label: "RERA Disclosure", href: "/rera-disclosure" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
} as const;
