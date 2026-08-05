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

Production build, Lighthouse mobile, on a developer laptop — **not CI**. Expect
±5 points of run-to-run variance; stop every dev server first, or scores drop
by 15.

| Page | Perf | A11y | Best practices | LCP | CLS |
|---|---|---|---|---|---|
| `/` | 95 | 100 | 100 | 2.9s | 0 |
| `/projects` | 98 | 100 | 100 | 2.1s | 0 |
| `/projects/[slug]` | 86–90 | 100 | 100 | 3.0s | 0 |
| `/locations/[slug]` | 95 | 100 | 100 | 2.9s | 0 |
| `/amenities` | 97 | 100 | 100 | 2.6s | 0 |
| `/gallery` | 90 | 100 | 100 | 2.8s | 0 |
| `/about` | 90 | 100 | 100 | 2.9s | 0 |

Desktop is 100 across performance, accessibility and best practices.
Accessibility is 100 on every page measured.

**Open against the §15 targets:**
- `/projects/[slug]` straddles the mobile ≥90 gate (86–90 across runs). It is by
  far the heaviest page — ~142KB of HTML and eight interactive blocks. Every one
  of those blocks is already dynamically imported.
- LCP runs 2.1–3.0s against a ≤2.5s target on the heavier pages. The LCP element
  is hero body text and the delay is the webfont swap; `size-adjust` fallback
  tuning is the next lever.

Lighthouse reports SEO as 0 under Node 20.14 because its `canonical` audit calls
`URL.parse` (Node 22+). Every individual SEO audit passes — upgrade Node for a
real score.

## Three deliberate stack deviations

`CLAUDE.md` §4 specifies MapLibre, Pannellum and Framer Motion. None are used,
and §4 records why:

- **MapLibre → hand-drawn SVG.** ~200KB gzip and a keyed tile provider, versus
  ~3KB, no key and a map that matches the brand.
- **Pannellum → Three.js sphere.** Three was already in the bundle; a second
  renderer bought nothing.
- **Framer Motion → IntersectionObserver + CSS.** This one was measured, not
  assumed: a dozen `motion.div` instances per page cost 150–300ms of blocking
  time. Removing it moved amenities from 74 to 97 and the project page from 65
  to 88.

## Conventions

- Server Components by default. `"use client"` only where a hook or listener
  demands it — indexable content must stay in the server-rendered HTML,
  because most AI crawlers never execute JS.
- Animate `opacity` and `transform` only, and stay under 500ms.
- Never merge `.eyebrow` with a `text-*` colour through `cn()` without checking
  the result: tailwind-merge treats same-prefix classes as conflicting. That
  collision is why the class is not called `.text-luxury`.
