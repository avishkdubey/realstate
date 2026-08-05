export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Market" | "Vastu" | "Locality" | "Finance";
  publishedAt: string;
  readingMinutes: number;
  /** Simple block model — Portable Text replaces this when Sanity lands. */
  body: { heading?: string; paragraphs: string[] }[];
  faqs: { q: string; a: string }[];
};

/**
 * Demo editorial. These exist to carry the local-SEO keyword clusters from
 * CLAUDE.md §11 and to give the Article/FAQPage schema something real to
 * describe. Every figure repeats one already recorded in CLAUDE.md §1 — no new
 * claims are invented here.
 */
export const posts: BlogPost[] = [
  {
    slug: "ahmedabad-property-market-2026",
    title: "What actually happened to Ahmedabad property prices in 2025",
    excerpt:
      "Prime luxury appreciated 14–22% and led the country, while national volumes fell. Both things are true, and the gap between them is the story.",
    category: "Market",
    publishedAt: "2026-07-14",
    readingMinutes: 6,
    body: [
      {
        paragraphs: [
          "Two numbers from 2025 look like they contradict each other. Nationally, residential sales volumes fell around 12–14%, the weakest year since 2022. In Ahmedabad, prime luxury property appreciated between 14% and 22%, leading every major Indian city for the second year running.",
          "They do not contradict each other. They describe the same shift from opposite ends.",
        ],
      },
      {
        heading: "The market moved upmarket, not downward",
        paragraphs: [
          "Homes above ₹1 crore accounted for roughly 78% of the total value of primary residential sales across fifty cities in 2025, against about half of the volume. Ten years ago that share was a fraction of it. Meanwhile affordable housing below ₹50 lakh collapsed to around 6% of new launches, from about 52% in 2018.",
          "So fewer homes changed hands, but the ones that did were considerably more expensive. Average ticket size now sits near ₹1.47 crore.",
        ],
      },
      {
        heading: "Why Ahmedabad outran the national picture",
        paragraphs: [
          "Ahmedabad recorded 6,745 residential launches in Q1 2026 — up 29% year on year and roughly 31% above its three-year quarterly average. The western corridors led, as they have for a decade.",
          "The reason is not speculative. GIFT City employs more than 25,000 people against a stated target of 75,000 by 2028, and housing demand follows payroll. Add the Gujarati diaspora, whose NRI luxury demand rose 38% year on year, and you have buyers who are not waiting for rates to fall.",
        ],
      },
      {
        heading: "Rates stopped being the obstacle",
        paragraphs: [
          "The RBI cut the repo rate to 5.25% in December 2025, its fourth cut of the year and 125 basis points in total. Home loans that started 2025 at 8.50–9.00% now begin near 7.10–7.35%.",
          "Prices rose about 6% nationally over the same period. When borrowing costs fall further than prices rise, affordability improves even though the sticker price went up. That is the least intuitive thing about this market and the most important.",
        ],
      },
      {
        heading: "What we would watch",
        paragraphs: [
          "Unsold inventory grew modestly, and the growth is concentrated above ₹1 crore — that stock rose about 19% year on year while sub-₹1 crore inventory actually declined. Supply is deliberately moving upmarket, and at some point it will overshoot the buyers.",
          "If you are buying to live in, none of this should change your decision much. If you are buying to let, look hard at which price band your building sits in.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are property prices in Ahmedabad still rising in 2026?",
        a: "Prime luxury led India with 14–22% appreciation in 2025 and launches continued to rise into 2026. Ahmedabad still trades 40–60% below equivalent Mumbai addresses, which is why the re-rating has room in it. Nothing about that is a guarantee.",
      },
      {
        q: "Is now a good time to buy in Ahmedabad?",
        a: "Home-loan rates are roughly 125 basis points below where they started 2025 while prices rose about 6%, so affordability is better than it has been in some years. Whether it suits you depends on your own numbers, not the market's.",
      },
    ],
  },

  {
    slug: "vastu-facing-guide-ahmedabad",
    title: "Vastu facing, and what it is actually worth",
    excerpt:
      "East and north-east homes can carry a 3–5% resale premium. Here is what the directions mean and where we think the belief outruns the evidence.",
    category: "Vastu",
    publishedAt: "2026-05-22",
    readingMinutes: 5,
    body: [
      {
        paragraphs: [
          "Ask a builder in Gujarat whether Vastu matters and you will get one of two unhelpful answers: a shrug, or a brochure. It is worth being more precise than either.",
        ],
      },
      {
        heading: "What the directions mean",
        paragraphs: [
          "East-facing homes take the morning sun through the main living areas and are classed A-grade in most local valuations. North-east is considered the most auspicious corner outright, and is the orientation buyers request first.",
          "North-facing is well regarded — even light, no harsh afternoon load. West-facing homes run warmer through the afternoon. South and south-west are the least sought after.",
        ],
      },
      {
        heading: "What it is worth in rupees",
        paragraphs: [
          "In several Indian markets east-facing homes command a resale premium of roughly 3–5% over otherwise identical stock. That is not nothing, and it is not enormous either.",
          "The honest read: facing affects resale liquidity more than resale price. An east-facing 3 BHK does not sell for dramatically more; it sells faster, to a wider pool of buyers, because a portion of that pool will not consider anything else.",
        ],
      },
      {
        heading: "Where we think it is overstated",
        paragraphs: [
          "A well-planned south-facing home with good cross-ventilation will be more comfortable to live in than a poorly-planned east-facing one. Orientation is one variable among several, and it is the easiest to check, which is probably why it gets the most attention.",
          "We label facing on every floor plan and let you filter the whole portfolio by it. We do not price a premium onto east-facing units, because we would rather you paid for the home than for the compass.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which facing is best for a flat in Ahmedabad?",
        a: "East and north-east are the most sought after, and can carry a 3–5% resale premium in some markets. North is well regarded. South and south-west are least preferred.",
      },
      {
        q: "Should I reject a south-facing flat?",
        a: "Not automatically. Layout, ventilation and floor level often matter more to daily comfort. If resale liquidity is a priority, east and north-east give you a wider pool of future buyers.",
      },
    ],
  },

  {
    slug: "home-loan-emi-guide",
    title: "Working out what you can actually afford",
    excerpt:
      "EMI-to-income near 40% is common and above 50% is not rare. The arithmetic is simple; the discipline is not.",
    category: "Finance",
    publishedAt: "2026-03-08",
    readingMinutes: 4,
    body: [
      {
        paragraphs: [
          "Most affordability conversations start at the wrong end — with the price of a home someone has already fallen for. Start with the monthly number instead.",
        ],
      },
      {
        heading: "The rule of thumb, and its limits",
        paragraphs: [
          "Lenders in India typically fund up to 80% of value, so plan on 20% down plus another 6–7% for stamp duty, registration and GST where it applies. That is roughly 27% of the price in cash before you take possession.",
          "On the monthly side, EMI-to-income ratios near 40% are common in this market and cross 50% in premium segments. Banks will lend at those levels. Whether you should borrow at them is a different question, and more than 60% of Indian millennials and Gen Z say housing costs already shape their career decisions.",
        ],
      },
      {
        heading: "Rates fell — use it on tenure, not on price",
        paragraphs: [
          "Home loans now start near 7.10–7.35%, down from 8.50–9.00% at the start of 2025. The instinct is to buy more house with the same EMI. The alternative is to keep the house and shorten the tenure, which is where nearly all the interest saving lives.",
        ],
      },
      {
        heading: "What our calculator does not include",
        paragraphs: [
          "It gives you a monthly instalment on a reducing-balance basis. It does not include processing fees, insurance a lender may bundle, or the maintenance advance collected on possession. The cost breakdown on each project page covers the statutory items.",
          "We are not a lender and none of this is financial advice.",
        ],
      },
    ],
    faqs: [
      {
        q: "What home loan interest rate can I get in Ahmedabad?",
        a: "Leading public sector lenders were offering from roughly 7.10–7.35% following the RBI's December 2025 rate cut. Your actual rate depends on your credit profile, employer and loan-to-value.",
      },
      {
        q: "How much down payment do I need?",
        a: "Typically 20% of value, since lenders fund up to 80%. Budget another 6–7% on top for stamp duty, registration and GST where applicable.",
      },
    ],
  },
];

export const postBySlug = new Map(posts.map((p) => [p.slug, p]));
