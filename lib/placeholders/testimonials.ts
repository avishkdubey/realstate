import type { Testimonial } from "@/lib/types";

/**
 * Demo testimonials. Real ones must be attributable — named, with a role and
 * a location. Anonymous quotes carry no weight with this audience and are
 * worse than none at all (CLAUDE.md §2).
 */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Nikunj Shah",
    role: "Business owner",
    location: "South Bopal",
    quote:
      "They handed over four months early, which I did not believe until I had the keys. The snag list was closed in three weeks.",
    projectSlug: "aarambh-corniche",
  },
  {
    id: "t2",
    name: "Dr. Rupal Mehta",
    role: "Consultant physician",
    location: "Bodakdev",
    quote:
      "I asked for the carpet area on every drawing, and they gave it without the usual argument about super built-up. That is when I decided.",
    projectSlug: "aarambh-sindhu-house",
  },
  {
    id: "t3",
    name: "Hardik Patel",
    role: "Software engineer",
    location: "New Jersey, USA",
    quote:
      "I bought from six thousand miles away. The site photographs arrived every month without my asking for them.",
    projectSlug: "aarambh-vantage",
  },
];
