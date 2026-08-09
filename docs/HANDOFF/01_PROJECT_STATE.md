# 01 — PROJECT STATE

**Project:** Portfolio V2 "Mind" — an interactive Memory-Palace portfolio for
Shrey Singh (visual communication designer). A 3D anatomical brain is the
homepage centerpiece and navigation hub.

**Location:** `D:\Brain Folio` (Next.js app). Client assets (not in repo):
`D:\Brain Website portfolio\Tata folio`.

**Version control:** NOT a git repository. No branches. Files on disk are the
single source of truth.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) ·
Tailwind v4 · React Three Fiber 9 + drei 10 · Zustand 5 · Framer Motion · Leva
(dev-only) · GSAP (installed, unused). Fonts via next/font: Caveat, Fraunces,
IBM Plex Mono.

## Current phase
Phase 4 — "Brain Operating System" (living homepage). **IN PROGRESS, NOT
COMPLETE, NOT VERIFIED.**

## Complete & verified (through Phase 3B)
- Homepage: `HeroStage (~90vh)` → `PreviewPane (0→auto sheet)` → `SiteFooter`.
- Sculpted procedural brain (BrainModel.ts) with gyri/sulci + crevice-ink vertex
  colors; six brain subsystems; anatomical silhouette v2.
- Typography Constitution LIVE: `TypeReveal reveal="pipeline"`
  (handwrite → pause → letter-flip → final type). Homepage thought
  "Every project begins as a thought." performs it.
- Dual-type flanking navigation; brain leans toward hovered hemisphere.
- Memory transition v1 (thread → veil → route; no spinner).
- Alive layer: hover pulse, lighting breath, scroll awakening (hot-path).
- Client experience framework + Tata IIS reference page + data-driven catalogue
  (SSG). 21 static routes build successfully as of 3B.
- Docs: 8 core (`docs/*.md`) + 5 Tata curation docs.
- Build/lint/typecheck were all CLEAN at end of Phase 3B.

## Incomplete (Phase 4, present in code, DO NOT trust as working)
Built but unverified: `src/systems/*` (brainEvents, brainMotion, thoughtEngine),
`src/constants/thoughts/*`, `src/constants/systems.ts`, `src/state/useSystemsStore.ts`,
`src/components/flows/*` (LogicalFlow, CreativeFlow, DetailLayer, NeuronEngine,
NeuronThought, BrainSystems, useFlowStream, flowGeometry). Wired into HeroStage
(lg+ only, dynamic import, gated by systems store + in-view). BrainAnimation now
breathes; Lighting/interaction read the shared motion channel.

**Known blockers:** 2 outstanding ESLint (react-compiler) errors — TSC passes:
- `flows/NeuronEngine.tsx` — setState synchronously in effect body.
- `flows/useFlowStream.ts` — ref assignment during render.
`npm run build` has NOT been run since Phase 4 edits; assume it may fail lint.
Old idea engine (`constants/ideas/`, `types/ideas.ts`) was deleted, superseded
by the thought engine.

## Next objective
Homepage brain **visual quality only** (see `05_NEXT_SESSION.md`).
