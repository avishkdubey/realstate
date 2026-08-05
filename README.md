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

## What exists today (Phase 0)

The shell, and nothing behind it:

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

## What comes next

Phase 1 is the demo-ready MVP: Sanity schemas and seed data, the projects
listing with URL-synced filters, the project detail template, the enquiry form
and `/api/enquiry`, and the real RERA disclosure page. **Lighthouse ≥90 is a
Phase 1 gate — it must be met before any WebGL lands in Phase 3.** See
`CLAUDE.md` §16.

## Adding a project

Not yet possible — the CMS arrives in Phase 1. Once Sanity is wired, projects
are authored at `/studio`, and this section will describe the fields.

## Conventions

- Server Components by default. `"use client"` only where a hook or listener
  demands it — indexable content must stay in the server-rendered HTML,
  because most AI crawlers never execute JS.
- Animate `opacity` and `transform` only, and stay under 500ms.
- Never merge `.eyebrow` with a `text-*` colour through `cn()` without checking
  the result: tailwind-merge treats same-prefix classes as conflicting. That
  collision is why the class is not called `.text-luxury`.
