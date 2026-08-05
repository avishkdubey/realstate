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

## What exists today (Phases 0–1)

**Phase 1 — the demo-ready MVP**

- **Data layer** — `lib/data.ts` is the seam. It reads from `lib/placeholders/`
  today and every function is async, returning the shapes a Sanity query would.
  Wiring the CMS means rewriting that one file: no component changes.
  Six demo projects, twelve amenities, three testimonials.
- **Projects listing** — filters for status, micro-market, configuration,
  budget and Vastu facing, all synced to the query string so a filtered view is
  shareable, bookmarkable and crawlable.
- **Project detail** — prerendered per slug. Hero facts, USPs, unit
  availability (table plus a per-floor stack), amenities, specifications, dated
  construction progress, FAQs, enquiry form, WhatsApp CTA and the statutory
  RERA block.
- **Enquiry flow** — `EnquiryForm` (react-hook-form + Zod) → `/api/enquiry` →
  Resend, with a honeypot and a DPDP consent gate. Email is best-effort: with
  no `RESEND_API_KEY` the lead is logged and the request still succeeds, so the
  demo works with zero credentials. Success hands off to WhatsApp.
- **Compliance pages** — RERA disclosure (registration table, QR slots,
  disclaimers) and a privacy policy written to the DPDP Act.
- **SEO** — `sitemap.ts`, `robots.ts`, and JSON-LD on every project page:
  `Apartment`/`SingleFamilyResidence` with a nested `Offer`, plus
  `BreadcrumbList` and `FAQPage`.

**Phase 0 — the shell**

- **Design tokens** — `app/globals.css`. Palette, 1.25 type scale, spacing,
  radius, motion easings, plus the `.eyebrow`, `.container-page`, `.section`
  and `.measure` component classes.
- **Fonts** — Fraunces (display) and Manrope (body), self-hosted via
  `next/font`. Noto Sans Gujarati is loaded but scoped to `:lang(gu)`, so it
  costs nothing until a translated page needs it.
- **Layout chrome** — header (transparent over the home hero, solid everywhere
  else), footer with the statutory RERA block, sticky mobile action bar,
  desktop WhatsApp bubble, skip link.
- **Motion** — `LenisProvider` (off for reduced motion and coarse pointers)
  and `ReducedMotionProvider`, plus the `FadeInView` reveal primitive.
- **SEO groundwork** — `metadataBase`, title template, canonicals, and a
  site-wide `RealEstateAgent` JSON-LD graph from `lib/structured-data.ts`.
- **Route stubs** for every navigation destination, so typed routes compile
  and the shell is navigable end to end.

Placeholder copy is marked as such and carries no RERA registration.

## Measured performance

Production build, Lighthouse, on a developer laptop (not CI — expect ±6 points
of run-to-run variance):

| Page | Mobile perf | A11y | Best practices | LCP | CLS |
|---|---|---|---|---|---|
| `/` | 93 | 100 | 100 | 3.2s | 0 |
| `/projects` | 93 | 100 | 100 | 3.0s | 0 |
| `/projects/[slug]` | 83–89 | 100 | 100 | 3.2s | 0 |
| `/contact` | 92 | 100 | 100 | 2.7s | 0 |
| `/rera-disclosure` | 95 | 100 | 100 | 2.8s | 0 |

Desktop is 100 across performance, accessibility and best practices.

Two gaps against the `CLAUDE.md` §15 targets, both open:

- **`/projects/[slug]` sits below the mobile ≥90 gate.** It is the heaviest
  page — ~105KB of HTML, driven by the per-floor availability stacks. Phase 3
  replaces that view with the 3D master plan and should retire most of it.
- **LCP is 2.7–3.2s against a ≤2.5s target.** The LCP element is hero body
  text; the delay is the webfont swap. Worth revisiting with `size-adjust`
  fallback tuning before launch.

Lighthouse's SEO category reports 0 under Node 20.14 because its `canonical`
audit calls `URL.parse` (Node 22+). Every individual SEO audit passes; upgrade
Node to get a real score.

## Adding a project

Edit `lib/placeholders/projects.ts`. Once Sanity is wired (see the data-layer
note above), projects will be authored at `/studio` instead and this section
will describe the fields.

## Conventions

- Server Components by default. `"use client"` only where a hook or listener
  demands it — indexable content must stay in the server-rendered HTML,
  because most AI crawlers never execute JS.
- Animate `opacity` and `transform` only, and stay under 500ms.
- Never merge `.eyebrow` with a `text-*` colour through `cn()` without checking
  the result: tailwind-merge treats same-prefix classes as conflicting. That
  collision is why the class is not called `.text-luxury`.
