# 07 — CONTEXT BOOTSTRAP

Minimum facts to continue. No history, no reasoning.

**⚠ Rewritten 2026-07-13 — the homepage was rebuilt twice since this doc was
first written (Phase 5: video hero; Phase 5 v4: pose/panel redesign). Sections
below describe the CURRENT state. If you're picking up `docs/HANDOFF/09_*`,
skip straight there — this doc is homepage/global context, not needed for
client-experience work.**

## What this is
`D:\Brain Folio` — a Next.js portfolio for designer Shrey Singh, built as an
interactive "Memory Palace": every client is a memory; the homepage is the
mind. **Git IS initialized** (local only, no remote); `master` is the mainline,
feature branches merge back into it.

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 ·
Zustand 5 · Framer Motion. Fonts (next/font): Caveat, Fraunces, IBM Plex Mono.
Path alias `@/*` → `src/*`. **Three.js / React Three Fiber / drei / Leva / GSAP
were REMOVED** (Phase 5 cleanup) — the homepage no longer renders WebGL; do not
re-add them without being asked.

## Commands
`npm run dev` · `npm run build` (all routes SSG) · `npx tsc --noEmit` ·
`npx eslint src`. No dev-only debug panel exists anymore.

## Homepage composition (`app/page.tsx`) — Phase 5 v4
`HeroStage (100svh)` → `SiteFooter (~10vh)`. HeroStage is a video background
(`HeroVideo` — `public/videos/upscale.mp4`, mouse-scrubbed, no 3D) plus a
three-pose state machine in `useSceneStore.heroPose` (`"center" | "logic" |
"creative"`): landing shows a split headline (`HeroHeadline`); clicking a side
plays the video to that end pose and rises `SectionPanels` (an accordion of
that hemisphere's 4 nav sections, replacing the old separate preview pane).
`BrainNavigation.tsx` and `PreviewPane.tsx` were DELETED — don't reference them.

## Client experience — `components/experience/` + `components/client/`
**This is what `09_TATA_IIS_EXPERIENCE_HANDOFF.md` covers in full — read that
doc for the real detail.** Quick shape: `/clients/[slug]` branches on data —
config in `constants/clientExperiences.ts` → full `ClientExperience` (numbered
sections on the reusable framework); no config → minimal `ClientWip`. Catalogue
is folder-driven: drop a folder under `public/content/clients/<slug>/catalogue/`
→ a card + SSG route appear, no code. Server-only readers in
`content/catalogue.ts`. **Tata IIS is the reference implementation** and (as of
this doc) the active build target on branch `tata-iis-experience`.

## Typography — `components/typography/`, `constants/typography.ts`
Four voices: `thought` (Caveat), `logic` (IBM Plex Mono, UPPERCASE), `creative`
(Fraunces serif), `plain` (sans). Render voiced text ONLY via `<TypeReveal>` or
`typeVoiceClass(voice, variant)`. `reveal="pipeline"` animates handwrite → pause
→ letter-by-letter paper-flip → `finalVoice` type; `onPipelineComplete` fires at
end; reduced-motion → final type instantly. Still frozen/valid — unaffected by
the homepage rebuilds.

## Memory Transition — `components/transition/`
`MemoryTransitionHost` mounted globally in `layout.tsx`. Setting
`pendingMemory {slug,x,y}` in the store (now done from `SectionPanels`'
`ClientDetail`, not a homepage `ClientCard`) draws a `BrainConnection` hairline
thread, `MemoryOverlay` veil settles (~450ms), `router.push` at ~950ms. No
spinner. Reduced-motion / modified-click = instant navigation. Still live and
in use — this system was NOT touched by the homepage redesigns.

## State — `state/`
`useSceneStore` (activeSection, hoveredNav, pendingMemory, animationState,
heroPose, currentPhase). `useDebugStore` and `useSystemsStore` were DELETED
along with the 3D/flow systems they tuned.

## Invariants (still true)
Hot-path contract (no per-frame React setState in anything hot); no
bounce/elastic/spinner/stock-photo; respect reduced motion; tunables in
`constants/`, content on the filesystem; `@/content` `node:fs` readers are
server-only. **Changed:** the page background is `#f9f9f9` (`bg-gallery`
Tailwind utility), not pure `#FFFFFF` — matched to the hero video so the seam
between video and page disappears; use `bg-gallery` for any new page-level
surface, not `bg-white`.

## Current state (2026-07-13)
Homepage (Phase 5 v4) is built and verified green. Seven client placeholder
rooms exist (`ClientWip.tsx`). **Tata IIS is now the active objective** — see
`09_TATA_IIS_EXPERIENCE_HANDOFF.md` and work on branch `tata-iis-experience`.
`docs/01_PROJECT_STATE.md` / `05_NEXT_SESSION.md` describe an EARLIER phase
(pre-Phase-5) and are stale for homepage facts; still fine for historical
Phase 1–3 detail if needed.
