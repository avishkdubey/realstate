<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Read HANDOFF.md first

This repository is mid-way through a large, deliberately-planned overhaul: the
site is being converted to a dark, 3D-first experience with a voice-greeting 3D
agent, a scroll-driven construction sequence and a 3D apartment interior.

**[`HANDOFF.md`](./HANDOFF.md) is the source of truth for that work.** It records
what is done, what is half-built, the decisions already agreed with the owner,
and — most usefully — the environment traps and lint rules that have already
cost hours once.

Order to read things in:

1. **`HANDOFF.md`** — current state, next steps, gotchas.
2. **`CLAUDE.md`** — the original brief: market research, design system, WebGL
   guardrails (§7), legal obligations (§13). Still authoritative on intent.
3. **`README.md`** — **partly stale.** Its "Three deliberate stack deviations"
   section is factually wrong and its performance table no longer describes this
   site. `HANDOFF.md` §7 lists the corrections.

Two things that are never negotiable, whatever else changes:

- **Never invent a RERA registration number.** They are `"AWAITING CLIENT"` on
  purpose. RERA §59 attaches penalties of up to 10% of estimated project cost to
  the advertisement itself, and a website is an advertisement.
- **Indexable content stays in server-rendered HTML.** Every 3D surface is
  decoration layered over markup that already works without it.
