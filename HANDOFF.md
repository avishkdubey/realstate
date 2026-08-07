# Handoff — premium dark 3D overhaul

**Status as of this document: Phases 0–3 complete and verified. Phase 4 is
partially built. Phases 5–6 not started.**

This file exists so a different agent or developer can pick the work up cold.
Read it before `CLAUDE.md`, and treat anything here that contradicts `README.md`
as correct — the README is stale in several places (see §7).

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

### Phase 3 — construction hero (complete, verified visually)

Files: `lib/tower-geometry.ts`, `lib/construction-stages.ts`,
`components/three/tower-construction.tsx`, `components/hero/construction-canvas.tsx`,
`components/hero/deferred-construction.tsx`, and edits to
`components/hero/home-hero.tsx` + `scroll-frame-sequence.tsx`.

~1,300 instances across seven `InstancedMesh`es ≈ ten draw calls, plus a tower
crane. `STAGE_FILL` was hoisted out of `progress-timeline.tsx` into
`lib/construction-stages.ts` so the hero and the project timeline share one
scale.

**Three bugs fixed here that would be easy to reintroduce:**

1. **Camera and geometry are on different clocks.** Scroll 0→1 maps onto stage
   `0.34→1` (starting at the pillars, because excavation draws nothing). The
   camera route must be sampled with **raw scroll**, not the remapped value —
   getting this wrong put the camera at its floor-8 framing on frame one,
   staring at empty sky above a two-storey stub.
2. **Concrete must be far lighter than instinct suggests** on a near-black
   ground (`#59544c` / `#736c62`). The first pass reused the old `#2a2622` and
   the tower vanished into the page.
3. `WebGLBoundary`'s `display: contents`, above.

The hero's H1, lead copy and CTAs are untouched server-rendered markup — this is
the SEO and RERA guarantee. The 36-frame photo sequence is retained as the
designed fallback, cross-faded via a new `dimmed` prop.

---

## 5. What is IN PROGRESS — Phase 4, onboarding gate

**Built so far (all compile clean, nothing imports them yet, so the site is
unaffected):**

- `lib/visitor-storage.ts` — `useVisitor()`, `rememberName()`, `rememberSkip()`,
  `forgetVisitor()`, `sanitiseName()`. Module-scope store +
  `useSyncExternalStore`; server snapshot always `null`. Carries the DPDP
  reasoning in its docblock — read it before changing anything about where the
  name goes.
- `lib/agent-script.ts` — `AGENT_SCRIPT`, `THANKS_LINE`, `thanksCaption()`.
  Audio path, caption and `durationHint` on one object.
- `components/onboarding/agent-rig.ts` — the `AgentRig` contract plus
  `useBlinkTimer()`, `useSaccade()`, `applyLook()`, `LOOK_LIMITS`, `useRestPose()`.
- `components/onboarding/agent-placeholder.tsx` — the primitives stand-in,
  driving the same behaviour the real GLB will.

**Still to build:**

- `components/onboarding/use-lip-sync.ts` — Web Audio `AnalyserNode` → RMS →
  mouth openness ref. Should prefer a pre-baked viseme JSON if one exists beside
  the MP3, and fall back to amplitude otherwise.
- `components/onboarding/agent-scene.tsx` — `<SceneFrame transparent>` with a
  portrait camera (**fov ≤ 30** — a wide lens on a face is an uncanny tell),
  three-point lighting, and a bright strip Lightformer camera-right for the eye
  catchlight. Pose her ~12° off-axis; perfectly frontal reads as a mugshot.
- `components/onboarding/agent-avatar.tsx` — the real RPM GLB via drei
  `useGLTF`. **Not yet written; the placeholder is the current implementation.**
- `components/onboarding/deferred-agent-scene.tsx` — `dynamic(ssr:false)`,
  following the repo's `deferred-*` convention.
- `components/onboarding/onboarding-gate.tsx` — the overlay and state machine.
- Wiring: mount the gate **last inside `<MotionProvider>`** in `app/layout.tsx`,
  at `z-[90]`; mark siblings `inert` while open; `lenis.stop()` + body overflow
  lock; consume the name in `components/forms/enquiry-form.tsx` `defaultValues`
  and as a client-only "Welcome back" line in the hero.

### Design constraints for the gate — these are not negotiable

- **It must render nothing on the server.** Client-only, returns `null` until an
  effect confirms first-visit. The server HTML must stay byte-identical so
  crawlers never meet a wall. Verify with
  `curl -s localhost:3111/ | grep -c '<h1'`.
- **Autoplay is the biggest UX trap.** Browsers block audio without a gesture,
  and `CLAUDE.md` §6 independently lists autoplay audio under *Avoid*. The
  design: the avatar is visible, breathing, blinking and already tracking the
  cursor **in silence**; `audio.play()` is attempted optimistically; on rejection
  a single "Meet Aanya" control appears and that click unlocks audio. The name
  input and a visible **Skip** are usable throughout. **Captions render the line
  as text regardless** — so the silent path is complete, not degraded. Test in
  Safari; iOS respects the hardware mute switch even after a valid gesture.
- **A pre-baked viseme track makes the silent path non-degraded** (she mouths
  the words with no audio). That is the argument for it over amplitude.
- Escape hatches: visible Skip, `Escape` key, `?nogate=1`, and a ~6 s failsafe so
  a failed chunk can never permanently occlude the site.
- The stacking order is documented as a comment block in `app/globals.css`.
  Gate `z-[90]`, skip link `z-[110]`.

---

## 6. What REMAINS

**Phase 5 — 3D apartment interior.** Extrude `lib/floor-plans.ts` rooms
(`{x,y,w,h,share,kind}` on a unitless grid) into walls/slabs. Derive metres from
the existing `roomDimensions()` helper so the 3D agrees with the printed
dimensions — a visitor who spots a mismatch stops trusting the page, and an
interior implying more area than the sold carpet area is a RERA §12 exposure.
Extract walls by **counting rooms either side of each grid edge** (1 = exterior,
2 = partition), not by extruding each room's outline — that gives coincident
faces and z-fighting. Camera on a Catmull-Rom spline through room centroids with
a waypoint at each doorway; eye height 1.6 m; no roll, ever. Replaces the
`PannellumTour` section on `/projects/[slug]` (its panorama is 1024×512, about a
quarter of usable resolution); keep `pannellum-tour.tsx` on disk with a TODO for
when real 8K panoramas of completed flats exist. `FloorPlanViewer` stays beneath
as the crawlable, keyboard-operable twin — the same pairing as
`MasterPlan` / `UnitMatrix`.

**Phase 6 — polish.** Pointer-look on `master-plan-3d.tsx`; designed fallbacks
everywhere 3D is refused (`master-plan.tsx` currently renders an **empty
zero-height div**); remove `pannellum`, `@gsap/react` (never imported), `shadcn`
(the `@import "shadcn/tailwind.css"` resolves to nothing, no `components/ui/`
exists), and the dead `hero-canvas.tsx` / `hero-scene.tsx`; rewrite the stale
README sections; keyboard and screen-reader pass.

**Open item #8:** under automation the `LazyMount` IntersectionObserver for the
floor-plan viewer did not fire and the renderer froze under rapid programmatic
scrolling. Confirmed **not** a regression (the Phase 1 diff touched only CSS
classes and tokens). Needs a human scroll-through of
`/projects/kautilya-two20`.

---

## 7. Corrections to existing docs

- **`README.md` "Three deliberate stack deviations" is false.** It claims
  MapLibre, Pannellum and Framer Motion were removed. All three are installed
  and actively imported — commit `c85c131` restored them and the README was
  never updated. Its performance table is also now inaccurate.
- `components/hero/hero-canvas.tsx` and `hero-scene.tsx` are **dead code**, zero
  importers. Delete in Phase 6.
- `rera-block.tsx` gates an extra warning on `reraNumber === "DEMO-PENDING"`,
  but the placeholder data uses `"AWAITING CLIENT"` — so that branch never runs.
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
  `tower-construction.tsx` follows it strictly.
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
