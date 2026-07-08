# 07 — CONTEXT BOOTSTRAP

Minimum facts to continue. No history, no reasoning.

## What this is
`D:\Brain Folio` — a Next.js portfolio for designer Shrey Singh, built as an
interactive "Memory Palace": a 3D anatomical brain on pure white is the homepage
centerpiece and navigation hub. Left hemisphere = logic (monochrome ink); right
= creativity (colour under ink). Not a git repo.

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 ·
React Three Fiber 9 + drei 10 · Zustand 5 · Framer Motion · Leva (dev-only) ·
GSAP (installed, unused). Fonts (next/font): Caveat, Fraunces, IBM Plex Mono.
Path alias `@/*` → `src/*`.

## Commands
`npm run dev` · `npm run build` (all routes SSG) · `npx tsc --noEmit` ·
`npx eslint src`. Dev shows a Leva panel (top-right, collapsed) — dev-only,
absent from production bundle.

## Homepage composition (`app/page.tsx`)
`HeroStage (~90vh)` → `PreviewPane (0→auto sheet)` → `SiteFooter (~10vh)`. One
viewport when idle.

## Brain (3D) — `components/brain/` + `components/scene/`
- `SceneCanvas` (dynamic, ssr:false): top-down perspective camera, 3-point
  studio lighting + HDRI `studio` preset, soft `ContactShadows`, ACES tone
  mapping, pure-white background.
- `Brain` composes 6 subsystems: **Model** `BrainModel.ts` = procedural
  placeholder (two half-ellipsoids meeting at the longitudinal fissure; gyri/
  sulci from domain-warped ridged trig-noise; crevice ink written to vertex
  colors; ALL tunables in one `PLACEHOLDER` object; ⚑ swap point → replace
  `useBrainModel()` with `useGLTF('/models/brain.glb')` returning the same
  `BrainGeometrySet`; recommended model: Z-Anatomy, CC-BY-SA). **Materials**
  `BrainMaterials.tsx` (baked canvas texture as `map`+`bumpMap`, `vertexColors`).
  **Interaction** `useBrainInteraction.ts`. **Animation** `BrainAnimation.ts`
  (idle breathe). **Lighting** `scene/Lighting.tsx`. **Effects** `BrainEffects.tsx`
  (reserved).
- **HOT-PATH CONTRACT (critical):** anything running per-frame (`useFrame`)
  must NOT call React setState or subscribe to stores. Read `getState()`
  snapshots / the `systems/brainMotion.ts` singleton; mutate the group ref.
- Verify geometry via Node: `…/scratchpad/verify-brain.mjs` (mirrors BrainModel).
  Screenshots do NOT capture WebGL here — use `preview_eval` to read the R3F
  scene.

## Typography — `components/typography/`, `constants/typography.ts`
Four voices: `thought` (Caveat), `logic` (IBM Plex Mono, UPPERCASE), `creative`
(Fraunces serif), `plain` (sans). Render voiced text ONLY via `<TypeReveal>` or
`typeVoiceClass(voice, variant)`. `reveal="pipeline"` animates handwrite → pause
→ letter-by-letter paper-flip → `finalVoice` type; `onPipelineComplete` fires at
end; reduced-motion → final type instantly. Homepage shows
"Every project begins as a thought." via `home/ThoughtLabel.tsx`.

## Navigation — `components/home/`
`constants/navigation.ts` = 8 sections (4 left: Clients/Projects/Logofolio/
Career Path; 4 right: Art/Publications/The Extincts Project/AI Generations &
Ideas). `NavItem` shows handwritten label → arrow → final caps on a hairline
with a dot terminal. lg+ = 3-col grid flanking the brain (reserved center lane);
below lg = two-column block under the brain. Hovering writes `hoveredNav` →
brain leans (hot path). Nav items OPEN the preview; only client cards route.

## Preview Pane — `components/preview/PreviewPane.tsx`
ONE reusable pane. Reads `activeSection` (store). Closed = height 0. Open =
rounded `neutral-50` sheet with chevron close, rail (index/title/description) +
body; smooth-scrolls in; close scrolls to top then collapses. Body chosen by
section `kind`: Clients grid (`ClientsPreview` → `ClientCard`s from
`constants/clients.ts`, 6 clients) or `ComingSoonPreview`.

## Memory Transition — `components/transition/`
`MemoryTransitionHost` mounted globally in `layout.tsx`. A `ClientCard` click
sets `pendingMemory {slug,x,y}` (default nav prevented; real href kept for
new-tab). Host draws a `BrainConnection` hairline thread toward the brain, brain
responds, `MemoryOverlay` white veil settles (~450ms), `router.push` at ~950ms.
No spinner. Reduced-motion / modified-click = instant navigation.

## Client experience — `components/experience/` + `components/client/`
`/clients/[slug]` branches on data: config in `constants/clientExperiences.ts`
→ full `ClientExperience` (numbered sections built on the framework); else
minimal `ClientWip`. Catalogue is folder-driven: drop a folder under
`public/content/clients/<slug>/catalogue/` → a card + SSG route appear, no code.
Server-only readers in `content/catalogue.ts`. (Tata IIS is the reference; not
the current focus.)

## State — `state/`
`useSceneStore` (activeSection, hoveredNav, pendingMemory, animationState,
currentPhase). `useDebugStore` (Leva tuning; neutral defaults in prod).
`useSystemsStore` (per-system on/off flags, `constants/systems.ts`).

## Invariants (never break)
Pure white page; no gradients/textures on the page; hot-path contract; no
bounce/elastic/spinner/stock-photo; respect reduced motion; tunables in
`constants/`, content on the filesystem; Leva never ships to production;
`@/content` `node:fs` readers are server-only.

## Current state
Phase 4 (living-homepage flow systems in `components/flows/` + `systems/`) is
MID-BUILD and UNVERIFIED: TSC passes, but 2 ESLint errors remain
(`flows/NeuronEngine.tsx` setState-in-effect; `flows/useFlowStream.ts`
ref-in-render) and `npm run build` has not been re-run. Everything through Phase
3B is complete and was build-clean. See `01_PROJECT_STATE.md` and
`05_NEXT_SESSION.md`. Full docs in `docs/` (8 core + 5 Tata curation + this
HANDOFF set).
