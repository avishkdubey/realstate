# Handoff — premium dark 3D overhaul

**Status: all six phases complete.** Dark theme, 3D foundations, construction
hero, onboarding agent, apartment walkthrough, cleanup. Build, typecheck and
lint are green.

Outstanding, in rough order of value:

1. **Swap in the real assets** — the Ready Player Me GLB and the ElevenLabs
   MP3s (§10). The agent runs against a primitives placeholder today; the rig
   contract, tracking, blinking and lip-sync are all already wired, so this is
   a change of geometry, not of logic.
2. **A human scroll-through.** Screenshot capture in this environment lags
   Lenis-driven scrolling badly enough to be misleading — several "bugs" turned
   out to be stale frames. Assertions against the DOM were reliable; pictures
   were not. The interior in particular deserves a real pair of eyes.
3. **Real carpet areas.** Everything downstream of `carpetAreaMin: 0` currently
   falls back to a nominal scale or says "on request".

### The one workaround to know about

`components/three/scene-frame.tsx` fires synthetic `resize` events across the
first second after mount. That is not decoration — R3F will not build its root
until its ResizeObserver reports a non-zero measurement, and when the first
measurement comes back zero and nothing nudges it again it waits forever. The
failure mode is vicious: the `<canvas>` exists, is correctly sized in CSS,
throws nothing, and not a single child mounts. A bright red sphere at the origin
renders as nothing. This has silently blanked **three** separate scenes. If a
fourth ever comes up empty with no error, look here first.

This file exists so a different agent or developer can pick the work up cold.
Read it before `CLAUDE.md`.

---

## 1. What is being built, and why

`/home/cis/windows/realstate` is a Next.js 16 / React 19 / Tailwind v4 marketing
site for **Kautilya Developers**, a real residential builder in Ahmedabad. It
was a light "quiet luxury" editorial site. The owner asked for it to become a
**premium dark, 3D-first experience**:

1. A first-visit **onboarding gate**: a 3D human agent greets the visitor with
   voice, asks their name; they type it and click through to the site.
2. Models whose **eyes and head follow the mouse pointer**.
3. A scroll-driven **building construction sequence, pillars → finished tower**.
4. A **scrollable 3D apartment interior**.
5. Visual quality is the priority — the owner explicitly deprioritised load
   performance.

### Decisions already made with the owner (do not re-litigate)

| Decision | Choice |
|---|---|
| Avatar | Ready Player Me GLB (free; ships ARKit + Oculus viseme blendshapes) |
| Voice | Pre-recorded ElevenLabs MP3s as static assets |
| Building + interior | Procedural Three.js geometry, no sourced GLBs |
| Theme scope | Whole site, token-driven |
| Gate | **Skippable, shown once per visitor** |
| Assets | Build placeholder-first; owner swaps in real GLB + MP3s later |
| Aesthetic | "Cinematic gallery" — near-black, one warm gold accent, dramatic single-source light |
| Mobile | **Full 3D on phones too** (the old gate excluded everything under 1024px) |

The full original plan is at `/home/cis/.claude/plans/delightful-singing-haven.md`.

---

## 2. Environment gotchas that will waste your time

- **`next build` and `next dev` can die with `Bus error (core dumped)`.** This
  is a **truncated `@next/swc` native binary**, not a code problem. A failed
  `npm install` (socket timeout) left it at 13.7 MB when it should be 96.6 MB.
  Diagnose with:
  `node -e 'require("./node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node")'`
  — a silent `SIGBUS` means it is corrupt. Fix by deleting the two
  `node_modules/@next/swc-*` directories and reinstalling. `maplibre-gl` was
  truncated the same way (missing its 640 KB `.d.ts`). If anything looks
  impossibly broken, suspect a partial install first.
- **`npm config set fetch-timeout 600000 fetch-retries 5`** is already set; keep it.
- **`pkill -f 'next start'` does not kill the server** — the process is named
  `next-server`. Use `pkill -f 'next-server'`. Several confusing "my change
  didn't apply" episodes traced to this.
- Start the server detached so the harness does not reap it:
  `(setsid nohup npx next start --port 3111 > /tmp/start3111.log 2>&1 < /dev/null &)`
- **The browser caches chunks aggressively.** After a rebuild, a stale tab
  throws `ChunkLoadError` for a chunk that no longer exists. Hard-reload or use
  a fresh tab.
- **Do not hammer reload while testing 3D.** After ~15 reloads in one tab the
  WebGL context stops being granted and the scene silently falls back. Fresh tab
  fixes it. This is a testing artifact, not a site defect.
- **`IntersectionObserver` does not fire in the automated browser here, and
  screenshots lag Lenis-driven scrolling.** Both were established the hard way.
  A *control* observer, created by hand on an element sitting at `top: 300` in a
  871px viewport, never fired — which proves the environment, not the code. So
  every `LazyMount` block (floor plans, brochure, enquiry form) appears stuck on
  its skeleton under automation while being fine for a real reader. Likewise a
  `fixed` header photographed halfway down the page while `getBoundingClientRect`
  reports `top: 0`.

  **Trust DOM assertions; do not trust pictures.** Several hours went into
  chasing bugs that were stale frames. When something looks broken, query the
  DOM for it before believing the screenshot.

---

## 3. Lint rules that will reject the obvious code

The React Compiler lint is strict and rejected three separate idioms:

- **Cannot read a ref's `.current` during render.** So a hook cannot return
  `ref.current`; return the ref and let the caller read `.current`.
- **Cannot mutate a `useState` or `useMemo` value.** For a per-frame mutable
  object (a `Vector2`, an `InstancedBufferAttribute`) the only sanctioned home
  is `useRef`.
- **Cannot call `setState` synchronously inside an effect.** Where a value has
  to be published from an effect, use a module-scope store read with
  `useSyncExternalStore` — the shape `components/providers/reduced-motion-provider.tsx`
  already uses. `lenis-provider.tsx` and `lib/visitor-storage.ts` both follow it.

Always run **`npx tsc --noEmit` and `npm run lint`** before `npm run build`;
they are much faster and catch nearly everything.

---

## 4. What is DONE

### Phase 1 — dark theme (complete, verified)

`app/globals.css` restructured. The dead `.dark {}` block was moved into
`:root` and deleted — the site is permanently dark, not toggleable.

**Key structural decision:** the page ground is `--surface-0: #0d0d0d`, which is
*deeper than* `--charcoal`. That frees charcoal to be a surface, giving a real
elevation ladder rather than a flat inversion:

```
--surface-0 #0d0d0d  page ground
--surface-1 #141414  cards, footer
--surface-2 #1a1a1a  alternating sections   (replaced bg-cream/50)
--surface-3 #242424  elevated emphasis      (replaced the bg-charcoal device)
--hairline / --hairline-strong   ivory at 10% / 18%
```

Two tokens were retuned because they failed contrast on the new ground:
- `--bronze` `#7a5a33` → `#a8834d` (was **1.9:1**, a hard WCAG failure).
  Eyebrows additionally moved from `text-bronze` → `text-accent` (gold-soft) to
  match the footer, which was already the de-facto dark reference.
- `--forest` `#243b34` was 1.5:1 and invisible; new `--forest-lift #356b5c` is
  what WhatsApp CTAs and "available" unit cells actually use.

Also changed: `site-header` differentiates its two states by backdrop-blur +
hairline instead of colour (both states were identical on dark); footer gained a
top hairline so it separates from `main`; skip link is gold-on-charcoal;
`:focus-visible` has an explicit gold outline; `lib/utils.ts` now configures
`tailwind-merge` with the custom font-size and colour scales (the README warned
about this collision and it was never fixed).

### Phase 2 — foundations (complete)

- `lib/webgl.ts` — added **`shouldRenderShowcaseWebGL()`** (drops the coarse-pointer
  and narrow-viewport refusals so phones get 3D; keeps reduced-motion as absolute;
  adds a Save-Data check) plus **`qualityTier()`** → `high | medium | low` and
  `dprRange()`. The original `shouldRenderWebGL` is untouched so existing callers
  cannot regress.
- `components/providers/lenis-provider.tsx` — now publishes the instance via
  `useLenis()` and wires `lenis.on("scroll", ScrollTrigger.update)`, which was
  entirely missing. Returns `null` on touch and reduced motion; every caller must
  handle null.
- `components/three/use-scroll-progress.ts` — one shared rAF loop; returns a ref
  so scrolling never re-renders React.
- `components/three/use-pointer-look.ts` — window-level (not canvas-level,
  because DOM overlays the canvas and `state.pointer` would freeze), damped,
  with `deviceorientation` fallback for phones. **Returns a ref.**
- `components/three/scene-frame.tsx` — the house `<Canvas>`: ACES tone mapping at
  exposure **1.45**, procedural `<Lightformer>` studio environment (no CDN HDRI),
  and `HouseGrade` (Bloom + Vignette + Noise) mounted on the high tier only.
  `children` may be a function receiving the tier.
- `components/webgl-boundary.tsx` — now also catches `webglcontextlost`, which
  does not throw and so was never caught. **Its wrapper div must keep
  `display: contents`** — as a normal box it is a zero-height static div that
  makes R3F measure 300×150 and never recover.
- `lib/three-palette.ts` — the scene palette in one place, replacing hardcoded
  hexes that had drifted between scenes.

### Phase 3 — the hero (REMOVED; now a photograph)

**Deleted, and deliberately not to be resurrected without a reason.** The hero
went through three iterations — a 36-frame scroll-scrubbed photo sequence, then
a procedural 18-storey tower assembling itself from pillars to lit windows, then
a low-poly night-skyline GLB — and now renders a single 379 KB WebP in
`components/hero/home-hero.tsx`.

Gone with it: `lib/tower-geometry.ts`, `components/three/tower-construction.tsx`,
`components/hero/construction-canvas.tsx`,
`components/hero/deferred-construction.tsx`,
`components/hero/scroll-frame-sequence.tsx`, `public/frames/hero/`, the
frame-extraction scripts, and `CitySurrounds` from `city-backdrop.tsx`
(`CityBackdrop` stays — the apartment walkthrough uses it). `STAGE_WINDOWS`,
`stageAt`, `stageProgress` and `staggeredReveal` went from
`lib/construction-stages.ts`, which now keeps only what the progress timeline and
the city-block tour call.

The reason is worth recording, because the tower was good work. A Chrome audit
found the hero rendered **nothing at all for 5–10 seconds** on a cold load: the
Three.js chunk, then a 24 MB GLB, then the scene, with an LCP element that only
existed once all three had landed. A photograph is painted from the first frame
of HTML, has no capability gate and no GL context to lose. If a 3D hero ever
returns, that is the bar it has to clear.

Two bugs from that era are still worth knowing, because both are easy to
reintroduce anywhere on this site:

1. **A staggered reveal must be normalised so the last item finishes at 1.**
   Spacing items at `index / count` meant the top floor started at 0.944 and
   needed until 1.11 to complete — so the top three storeys were permanently
   unfinished, showing as short columns hanging in mid-air.
2. **Concrete must be far lighter than instinct suggests** on a near-black
   ground (`#59544c` / `#736c62`). Reusing the old `#2a2622` made the tower
   vanish into the page.

The hero's H1, lead copy and CTAs remain untouched markup — that is the SEO and
RERA guarantee, and it held through all four versions.

---

## 5. Phase 4 — onboarding gate (complete)

A first-visit, skippable gate. `lib/visitor-storage.ts` persists the name
locally and nothing else; `lib/agent-script.ts` keeps audio path, caption and
duration on one object; `components/onboarding/` holds the rig contract, the
primitives placeholder, the lip-sync analyser, the scene and the state machine.

Three faults were fixed to make it visible at all, and each is a trap worth not
re-treading: SceneFrame's resize nudge fired before R3F attached its observer
(see the box at the top of this file); a second `<Environment>` nested inside
the children boundary held every sibling unmounted; and the figure sat at
y = -1.3, putting her head below a camera looking horizontally from 1.45.

Constraints that still hold and should not be quietly dropped:

- **The gate renders nothing on the server.** Verify with
  `curl -s localhost:3111/ | grep -c 'Meet Aanya'` — it must be 0, while the
  `<h1>` and the GujRERA link are present.
- **Audio is gesture-gated**, with captions carrying the line regardless.
  `CLAUDE.md` §6 lists autoplay audio under *Avoid*, and browsers block it
  anyway. Test in Safari: iOS respects the hardware mute switch even after a
  valid gesture.
- **The name never leaves the browser** while the gate's copy says it does not.
  Logging it to analytics would make that copy a false statement.

## 6. Phase 5 — apartment walkthrough (complete)

Walls extruded from `lib/floor-plans.ts`, furnished by
`lib/interior-furniture.ts` (26–55 pieces depending on configuration, each
guarded against exceeding 55% of its room's floor area), camera on a
Catmull-Rom spline through the rooms at eye height, looking five metres ahead
with the aim damped slower than the position.

Two things that made it a black box before, both fixed: it had **no windows**,
so no daylight could enter and the city outside was invisible; and the lens was
**fov 38**, a telephoto inside a 14-metre flat. Alternate exterior bays are now
opened into sill-and-lintel windows and the lens is 62.

`components/three/city-backdrop.tsx` places the `public/glb` models, fitting
each to a target height from its own measured bounding box — the files disagree
about units by four orders of magnitude, so a hardcoded multiplier is only ever
right for one of them. `lib/glb-catalog.ts` records what is actually in each
file and which two are deliberately unused.

## 7. Corrections to existing docs

- The README's false "Three deliberate stack deviations" section is gone, and
  its stale performance table with it. Pannellum has since been removed for
  real; MapLibre and Framer Motion are still installed and in use.
- `hero-canvas.tsx` / `hero-scene.tsx` were dead code and are deleted.
- `rera-block.tsx` gates an extra warning on `reraNumber === "DEMO-PENDING"`,
  but the placeholder data uses `"AWAITING CLIENT"` — so that branch never runs.
  Worth reconciling when the real numbers land.
- The placeholder projects are thin: all 12 have `priceOnRequest: true`, no
  `startingPrice`, no `possession`, `specifications: []`, `progress: []`,
  `carpetArea: 0`. Consequently the Money, Specifications and Progress sections
  on `/projects/[slug]` **do not render at all**.

---

## 8. Conventions to match

- **Server Components by default.** `"use client"` only where a hook or listener
  demands it. Indexable content must live in server-rendered HTML — most AI
  crawlers never execute JS.
- **The `deferred-*` convention:** a `"use client"` shim holding one
  `dynamic(() => import(...).then(m => m.X), { ssr:false, loading: <height-reserving skeleton> })`
  plus a thin prop-forwarding wrapper. Four already exist; copy their shape.
- **The two-gate 3D mount** (`components/projects/master-plan.tsx` is canonical):
  capability check → IntersectionObserver → `requestIdleCallback` → render inside
  `<WebGLBoundary>`.
- **Never allocate inside `useFrame`.** Scratch `Vector3`/`Matrix4`/`Quaternion`
  at module scope and recycle. `CLAUDE.md` §7 is explicit and
  `components/three/city-block-tour.tsx` follows it strictly.
- **Measure a GLB before placing it** — `node scripts/measure-glb.mjs <file>`.
  It transforms every primitive's bounding box through its full node chain and
  reports world size, grounding, footprint ratio and emissive materials. Reading
  raw accessor `min`/`max` instead is what produced a wrong "these are Z-up"
  diagnosis and a correction that turned every building upside down.
- Framer Motion is used through `<LazyMotion strict>` — import `m`, never
  `motion`, or it throws at runtime.
- Next 16 specifics: globally-injected `LayoutProps<"/">` / `PageProps<"/x/[y]">`
  types (not imported), `await params`, typed routes (a `<Link>` to a
  non-existent route fails the build).
- **Comment style matters here.** The codebase explains *why*, in a first-person
  engineering voice, often citing `CLAUDE.md §n`. Match it; do not strip it.

## 9. Compliance rules that override aesthetics

- **Never invent a RERA number.** `siteConfig.rera.promoterNumber` is
  `"AWAITING CLIENT"` and every project reads the same. RERA §59 attaches
  penalties of up to 10% of project cost to the advertisement itself, and a
  website is an advertisement.
- Every 3D surface needs an **"Artist's impression / indicative, not to scale"**
  caption. The procedural tower is not a real Kautilya building and must stay
  visibly schematic. §12 makes the promoter liable for misleading visuals and a
  disclaimer does not waive that.
- The RERA number + `https://gujrera.gujarat.gov.in` must remain on every
  project page and in the footer (§11(2)).
- The visitor's name must never leave the browser while the gate's copy says it
  does not.

## 10. What the owner still has to supply

1. **The avatar GLB.** Build at readyplayer.me, download **full-body** with
   `?morphTargets=ARKit,Oculus%20Visemes&pose=A&textureAtlas=none&useDracoMeshCompression=false`,
   save to `public/models/agent/agent.glb`. Verify it contains both `jawOpen`
   and `viseme_aa` — there are reports of the two morph groups not both
   arriving. Draco is disabled deliberately: otherwise drei fetches a decoder
   from a CDN at runtime.
   RPM node names: bones `Hips/Spine/Spine1/Spine2/Neck/Head/LeftEye/RightEye`;
   meshes `Wolf3D_Head`, `Wolf3D_Teeth`, `EyeLeft`, `EyeRight`. **Apply jaw
   morphs to `Wolf3D_Head` *and* `Wolf3D_Teeth`** or the teeth float in place.
2. **Three MP3s** into `public/audio/agent/` matching `lib/agent-script.ts`.
   An Indian-English female voice will land far better than a generic American
   one. ⚠ **ElevenLabs' free tier generally prohibits commercial use** — this is
   a real business site, so it likely needs a paid plan. The owner has been told.
3. **Real RERA registration numbers** when they arrive.

---

## 11. Verification checklist

```bash
npx tsc --noEmit      # fastest signal
npm run lint
npm run build         # typed routes; must pass
(setsid nohup npx next start --port 3111 > /tmp/start3111.log 2>&1 < /dev/null &)
```

- Server HTML intact: `curl -s localhost:3111/ | grep -c Kautilya` non-zero, and
  the `<h1>` present.
- Gate absent from `curl` output entirely.
- Reduced motion (DevTools → Rendering): gate must not appear, 3D falls back.
- WebGL disabled: every surface degrades to a designed fallback, not an empty div.
- Keyboard only through the gate, with visible focus; `Escape` dismisses.
- Accessibility and SEO should stay at 100 in Lighthouse. Performance will drop
  below the repo's stated ≥90 target — that is the accepted trade (see §12).

## 12. The performance trade, stated explicitly

The owner said not to prioritise performance; `CLAUDE.md` §15 demands Lighthouse
≥90 mobile and LCP ≤2.5 s. The reconciliation actually applied:

- **Kept**, because these prevent stutter and stutter is an *aesthetic* failure:
  no allocation in `useFrame`, DPR caps, instancing, quality tiers, `ssr:false`,
  reserved dimensions, real fallbacks, server-rendered content behind the canvas.
- **Skipped**, because they only buy load time: OffscreenCanvas workers, Draco
  compression, KTX2 textures.

Expect mobile Lighthouse performance below 90. That is a decision, not a defect.
