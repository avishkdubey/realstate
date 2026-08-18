/**
 * Buyer stories for the home page.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EVERY ENTRY HERE IS SAMPLE CONTENT. NONE OF IT IS A REAL CUSTOMER.
 *
 * The section that renders this shows a visible "sample content" marker for
 * exactly that reason, and `SAMPLE` below is what drives it. Delete these
 * entries the moment real quotes arrive — do not edit a name and keep the body.
 *
 * Why this file is not simply filled in with the quotes that were supplied:
 * those quotes name real, identifiable individuals and describe projects built
 * by **A. Shridhar**, a different Ahmedabad developer. Publishing them on
 * Kautilya's site would misattribute a competitor's customers, and under RERA
 * §12 the promoter is liable to compensate for false or misleading statements
 * in an advertisement — a disclaimer does not waive that liability. So the
 * layout, length and rhythm of the originals are preserved here, and the
 * substance is written as an obvious placeholder against Kautilya's own
 * projects.
 *
 * `lib/placeholders/testimonials.ts` stays deliberately empty for the same
 * reason; this file exists so the home page's story rail can be designed and
 * reviewed before the client supplies anything.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Flips the visible "sample content" marker on the section. Set false only
    when every entry below is a real, attributed, permissioned quote. */
export const SAMPLE = true;

export type Story = {
  id: string;
  quote: string;
  name: string;
  /** Which project they bought in. */
  project: string;
  /** Still shown on the card and used as the video poster. */
  image: string;
  /**
   * Path to a client video testimonial, e.g. `/videos/stories/merchant.mp4`.
   *
   * `null` until the client supplies footage. Nothing here is sourced from the
   * internet: a stock or scraped clip presented as a customer of this builder
   * is a fabricated review, which is the one thing a placeholder may never be.
   * The card falls back to the still and the written quote, which is a complete
   * design rather than a hole.
   */
  videoUrl: string | null;
};

export const stories: Story[] = [
  {
    id: "story-1",
    quote:
      "What drew us in was how quiet it was without being far from anything. The courtyard was the first thing we fell in love with — we could picture the children there before we had seen a single flat. The handover was on the date we were given, which is not something we expected to be able to say.",
    name: "Sample buyer — name to follow",
    project: "Kautilya Two20",
    image: "/images/projects/two20-slider.webp",
    videoUrl: null,
  },
  {
    id: "story-2",
    quote:
      "We visited four projects and this was the only one where the salesperson opened the cost sheet before we asked. The carpet area on the plan was the carpet area in the agreement. That sounds like a small thing until you have been shown a super built-up number three times in one week.",
    name: "Sample buyer — name to follow",
    project: "Kautilya One54",
    image: "/images/projects/one54-slider.webp",
    videoUrl: null,
  },
  {
    id: "story-3",
    quote:
      "The balcony is what decided it. It is deep enough to actually sit on, which almost none of the others were. Two years in, the building still looks like the photographs, and the society is run properly. We have already sent two families here.",
    name: "Sample buyer — name to follow",
    project: "Kautilya Nilay",
    image: "/images/projects/nilay-balcony.webp",
    videoUrl: null,
  },
];
