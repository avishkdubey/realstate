# Ahmedabad builder website

A quiet-luxury marketing site for a mid-to-premium residential developer in
Ahmedabad. Multi-project brand site, not a single-project microsite.

The full brief — market research, design system, legal obligations, phased
build order — lives in [`CLAUDE.md`](./CLAUDE.md). Read it before changing
anything visual or legal.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## The config file

Everything client-specific lives in **`lib/site-config.ts`** — brand name,
phone, WhatsApp number, email, office address, geo coordinates, socials, RERA
identity and the festive-offer switch. Nothing else in the codebase hardcodes
these. To rebrand the site, edit that one file.

Two fields deserve care:

- `whatsapp` must be **E.164 digits only** (`919999999999`, no `+` or spaces) —
  that is what the `wa.me` deep-link format requires.
- `rera.promoterNumber` ships as `DEMO-PENDING`. **Never replace it with an
  invented number.** RERA Act §59 attaches penalties of up to 10% of estimated
  project cost to the advertisement itself, and a website is an advertisement.

Set `NEXT_PUBLIC_SITE_URL` in the environment to control canonical URLs,
`metadataBase` and Open Graph URLs. It falls back to `https://example.com`.

## What exists today

All five build phases from `CLAUDE.md` §16 are implemented.

**Content & data**
- `lib/data.ts` is the CMS seam. It reads from `lib/placeholders/` today and every
  function is async, returning the shapes a Sanity query would. Wiring the CMS
  means rewriting that one file — no component changes.
- Six demo projects, six micro-markets, twelve amenities, three testimonials,
  three long-form insight posts.

**Pages** — home, projects listing (URL-synced filters), project detail,
locations index + six corridor guides, amenities, gallery, about/legacy,
NRI corner, insights + three articles, contact, channel partners, careers,
RERA disclosure, privacy, terms, 404.

**Tools**
- Floor-plan viewer: schematic SVG per configuration, wheel/drag zoom and pan,
  keyboard controls (`+`, `-`, `0`, arrows), north compass rotated to the unit's
  facing, room dimensions derived from real carpet area.
- EMI calculator: reducing-balance amortisation, four live inputs.
- Cost sheet: agreement value, GST, Gujarat stamp duty, registration,
  maintenance advance — server-rendered so it stays crawlable.
- Brochure: ungated download plus an optional name-and-phone gate.
- Gallery lightbox: Embla, keyboard-navigable, Escape to close.

**3D** — WebGL hero, clickable master-plan massing, and a 360° panorama, all
gated behind `lib/webgl.ts` (real context probe, pointer type, viewport,
cores/memory, reduced-motion) and wrapped in `components/webgl-boundary.tsx`.
Every one sits over content that already works without it.

**SEO** — sitemap (29 URLs), robots, `/llms.txt` generated from live data,
per-project OG images via `next/og`, and JSON-LD throughout:
`RealEstateAgent` site-wide, `Apartment`/`SingleFamilyResidence` + `Offer`,
`Place`, `Article`, `BreadcrumbList` and `FAQPage`.

## Measured performance

Performance load times and Lighthouse scores have been deliberately de-prioritised in favour of a premium 3D experience, as requested by the owner.

See `HANDOFF.md` §12 ("The performance trade, stated explicitly") for the full reasoning and expected impact on mobile performance metrics.

## Conventions

- Server Components by default. `"use client"` only where a hook or listener
  demands it — indexable content must stay in the server-rendered HTML,
  because most AI crawlers never execute JS.
- Animate `opacity` and `transform` only, and stay under 500ms.
- Never merge `.eyebrow` with a `text-*` colour through `cn()` without checking
  the result: tailwind-merge treats same-prefix classes as conflicting. That
  collision is why the class is not called `.text-luxury`.

# realstate
