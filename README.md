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

All five build phases from `CLAUDE.md` §16 are implemented, plus a six-phase
dark/3D overhaul on top of them. **[`HANDOFF.md`](./HANDOFF.md) is the current
source of truth** for that work — what is done, what is half-built, and the
environment traps worth knowing before you spend an afternoon on one.

**Content & data**
- `lib/data.ts` is the CMS seam. It reads from `lib/placeholders/` today and every
  function is async, returning the shapes a Sanity query would. Wiring the CMS
  means rewriting that one file — no component changes.
- Twelve demo projects, six micro-markets, twelve amenities, three testimonials,
  three long-form insight posts.
- **Every project ships `carpetAreaMin: 0`** while the client's real figures are
  outstanding. Anything that would otherwise print a derived dimension says
  "Dimensions on request" instead — see `roomDimensions()` in `lib/floor-plans.ts`
  for why inventing one is a RERA §12 problem rather than a placeholder.

**Pages** — home, projects listing (URL-synced filters), project detail,
locations index + six corridor guides, amenities, gallery, about/legacy,
NRI corner, insights + three articles, contact, channel partners, careers,
RERA disclosure, privacy, terms, 404.

**Tools**
- Floor-plan viewer: schematic SVG per configuration, wheel/drag zoom and pan,
  keyboard controls (`+`, `-`, `0`, arrows), north compass rotated to the unit's
  facing, room dimensions derived from carpet area when one is on record.
- EMI calculator: reducing-balance amortisation, four live inputs.
- Cost sheet: agreement value, GST, Gujarat stamp duty, registration,
  maintenance advance — server-rendered so it stays crawlable.
- Brochure: ungated download plus an optional name-and-phone gate.
- Gallery lightbox: Embla, keyboard-navigable, Escape to close.

**3D** — four surfaces, every one layered over markup that already works without
it, and all wrapped in `components/webgl-boundary.tsx`:

- **City-block tour** (`components/three/city-block-tour.tsx`) — a scroll-driven
  camera through `modern_city_block.glb`: an establishing orbit, a descent to
  the rooftops, a push into the street, then a lift back out. Mounted behind an
  IntersectionObserver with two viewports of lead time, because the model is
  24 MB.
- **Onboarding agent** (`components/onboarding/`) — a first-visit, skippable
  greeting. Client-only, so it never appears in the server HTML.
- **Apartment walkthrough** (`components/projects/apartment-interior-scene.tsx`) —
  walls extruded from `lib/floor-plans.ts`, furnished from
  `lib/interior-furniture.ts`, camera on a spline through the rooms. It replaced
  the old 360° panorama, whose only asset was 1024×512.
- **Master-plan massing** — clickable towers, with `UnitMatrix` beneath it as
  the crawlable, keyboard-operable twin.

Two gates decide whether any of them mount. `shouldRenderWebGL` guards
decoration and refuses coarse pointers and narrow viewports;
`shouldRenderShowcaseWebGL` guards the three surfaces above and deliberately
does not, because on those the 3D *is* the content — quality is turned down by
`qualityTier()` rather than refused. Both always honour reduced-motion.

`components/three/scene-frame.tsx` is the house canvas: tone mapping, the
procedural studio environment, quality tiers, and a resize workaround for an
R3F mount race that has silently blanked three separate scenes. If a fourth ever
renders empty with no error, start there.

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
- `cn()` now configures tailwind-merge with this project's custom font-size and
  colour scales, so `cn("text-h3", "text-accent")` keeps both. It did not used
  to — the two were treated as conflicting `text-*` classes and one was silently
  dropped, which is why `.eyebrow` is not called `.text-luxury`.
- Never allocate inside `useFrame`. Scratch vectors and matrices live at module
  scope and are recycled; `CLAUDE.md` §7 explains why, and every scene follows it.
- The site is permanently dark. Tokens live on `:root` in `app/globals.css`;
  there is no `.dark` class and no toggle.
