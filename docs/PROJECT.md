# PROJECT — Mind (Portfolio v2)

## Vision

An interactive creative installation that doubles as a portfolio — not a
scrolling website. A top-view anatomical 3D brain sits centered on a white
gallery page; its hemispheres carry the two sides of one mind:

- **Left — logic**: engineering, structure, analysis. Monochrome ink.
- **Right — creativity**: art, imagination, storytelling. Color.

The brain is the navigation hub of everything. Sections surround it; content
rises beneath it; every idea on the page begins as a handwritten thought and
ends as set type (see [TYPOGRAPHY.md](./TYPOGRAPHY.md)). The homepage stays
compact — brain (~90vh), an on-demand preview sheet, footer (~10vh) — and never
becomes a long scroll.

## Roadmap & status

| Phase | Scope | State |
|------:|-------|-------|
| **1** | Foundation: R3F scene, procedural brain, damped mouse rotation, studio lighting, state/constants/docs | ✅ 2026-07-01 |
| **2** | Navigation hub: nav around each hemisphere, one reusable preview pane, Clients grid + `/clients/[slug]` routes, footer | ✅ 2026-07-02 |
| **2.5** | Installation refactor: Typography Constitution (3 voices + TypeReveal), dual-type navigation, identity header, preview sheet, Tata IIS client experience, data-driven catalogue/photography system, docs restructure | ✅ 2026-07-02 |
| **2.6** | Framework consolidation: sculpted 3D brain (gyri/sulci + crevice ink), brain subsystem split, reusable experience framework, memory-transition architecture, design/motion token system, idea-engine seed, content top-level structure | ✅ 2026-07-02 |
| **3A** | Tata IIS archive study & curation: full inventory (25 folders / ~440 files / 5.2GB), five curation docs (ASSET_REPORT · CURATION_REPORT · COMMUNICATION_ECOSYSTEM · STORYBOARD_TATA_IIS · TATA_IIS_CONTENT_MAP) | ✅ 2026-07-05 |
| **3B** | Hero experience: the Typography Constitution LIVE (write → pause → flip → final; "Every project begins as a thought."), brain sculpt v2 (anatomical silhouette, dual-scale folds, paper-tooth materials), alive layer (hover pulse, lighting breath, scroll awakening), nav/sheet craftsmanship, memory-dive transition v1 (thread → veil → route), GLB recommendation (Z-Anatomy) | ✅ 2026-07-05 |
| Next | Tata IIS experience build (legacy sequence, ecosystem, collections), paint flow, circuits, sparks, live idea engine, immersive gallery | ⏳ |

## Architecture at a glance

```
app/                          routes (Server Components)
 ├─ page.tsx                  HeroStage (~90vh) → PreviewPane (0→auto) → SiteFooter (~10vh)
 ├─ clients/                  /clients index
 │   └─ [slug]/               client page → ClientExperience (config) or ClientWip
 │       └─ catalogue/[category]/   auto-generated from content folders (SSG)
components/
 ├─ home/                     HeroStage · IdentityHeader · BrainNavigation · NavItem
 ├─ typography/               TypeReveal · Eyebrow        (the Constitution, in code)
 ├─ preview/                  PreviewPane · ClientsPreview · ClientCard · ComingSoonPreview
 ├─ experience/               the reusable experience framework (see CLIENT_ARCHITECTURE.md)
 ├─ client/                   client-specific pieces composed on the framework
 ├─ transition/               memory-transition architecture (see INTERACTIONS.md)
 ├─ scene/ · brain/ · debug/  the 3D system, six brain subsystems (see BRAIN_SYSTEM.md)
content/  (src/content/)      server-only filesystem readers (catalogue/photography)
state/                        Zustand stores (scene + dev)
constants/                    tokens (design/motion/typography) · data lists · ideas/
public/content/…              the content filesystem (see CONTENT_GUIDE.md)
```

Deep dives: [BRAIN_SYSTEM.md](./BRAIN_SYSTEM.md) ·
[INTERACTIONS.md](./INTERACTIONS.md) ·
[CLIENT_ARCHITECTURE.md](./CLIENT_ARCHITECTURE.md) ·
[CONTENT_GUIDE.md](./CONTENT_GUIDE.md).

## Technology

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · React Three
Fiber + drei · Zustand · Framer Motion · Leva (dev-only) · GSAP (installed,
reserved for timeline/scroll phases). Fonts via `next/font`: Caveat, Fraunces,
IBM Plex Mono.

## Engineering principles (non-negotiable)

1. **The render loop never re-renders React.** Per-frame work mutates three.js
   objects through refs and reads state via `getState()` snapshots — never
   `setState`. See the hot-path contract in [BRAIN_SYSTEM.md](./BRAIN_SYSTEM.md).
2. **One source of truth for tunables and data.** Every meaningful number and
   list lives in `src/constants/`; content lives on the filesystem. Components
   render data; they don't own it.
3. **Systems, not one-offs.** A hook used by one system lives beside it;
   genuinely shared code goes in `src/hooks` / `src/utils`. No duplicated logic.
4. **Dev tooling never ships.** Leva is dynamically imported dev-only; `node:fs`
   readers are server-only. Bundle checks are part of every phase's verification.
5. **Server by default.** Routes and sections are Server Components; `"use
   client"` boundaries are thin and deliberate (HeroStage, PreviewPane, nav).
6. **TypeScript strict, no magic numbers, explain *why* in comments,** mark
   extension points with `⚑ SWAP POINT`.

## Working agreements

- `npx tsc --noEmit` and `npx eslint src` clean before any milestone.
- `npm run build` must pass with all routes statically generated.
- Update the relevant doc in `/docs` with every system change.
