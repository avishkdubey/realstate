/**
 * The single file to edit when swapping demo content for a real client.
 * Brand name, contact details, office address, socials and RERA identity all
 * live here — nothing else in the codebase should hardcode them.
 *
 * Populated from the client's existing site, kautilyadevelopers.in.
 */

export const siteConfig = {
  /** Brand */
  name: "Kautilya Developers",
  legalName: "Kautilya Group",
  tagline: "A trusted builder in Ahmedabad.",
  description:
    "Since 1996, Kautilya Group has built residential projects, redevelopments and land across Ahmedabad — from Shilaj and SG Highway to Chandkheda and Thaltej.",
  /** Year the firm was founded — powers the "since 19XX" legacy line. */
  foundedYear: 1996,

  /** Canonical origin. Drives metadataBase, sitemap, canonicals and OG URLs. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kautilyadevelopers.in",

  /** Contact */
  phone: "+91 99094 40033",
  /** Second line published on the client's current site. */
  phoneAlt: "+91 95372 06656",
  /** E.164, digits only — required by the wa.me deep-link format. */
  whatsapp: "919909440033",
  email: "admin@kautilyadevelopers.in",

  /** Physical office. Shown in the footer and on every page for trust. */
  address: {
    street: "Kautilya Two20, Near Shridhar Corporate House",
    locality: "Shilaj Circle, Shilaj",
    city: "Ahmedabad",
    region: "Gujarat",
    postalCode: "380059",
    country: "IN",
  },
  /** Shilaj Circle. Replace with surveyed coordinates if precision matters. */
  geo: { lat: 23.0364, lng: 72.4735 },

  /** Sales desk hours, plus a note for NRI buyers in other timezones. */
  hours: "Mon–Sat, 10:00–19:00 IST",
  nriNote: "NRI callbacks scheduled for US, UK, Canada and East Africa hours.",

  /**
   * Headline figures as published on the client's current website. These are
   * the firm's own claims — confirm them before launch, because an overstated
   * delivery record is a §12 exposure, not a marketing flourish.
   */
  stats: {
    completedSqFt: 2_490_150,
    happyFamilies: 1_746,
    yearsExperience: 29,
    completedProjects: 23,
  },

  /**
   * RERA identity. Per RERA Act §11(2) the authority URL and registration
   * number must appear prominently on every project page and in the footer.
   * NEVER substitute a fabricated number — §59 penalties attach to the
   * advertisement itself. Awaiting the client's registration numbers.
   */
  rera: {
    authority: "GujRERA",
    authorityUrl: "https://gujrera.gujarat.gov.in",
    /** Firm-level registration, where applicable. */
    promoterNumber: "AWAITING CLIENT",
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
