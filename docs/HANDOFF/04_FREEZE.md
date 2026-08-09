# 04 — FROZEN

Everything below is correct. Future sessions must assume it is right and must
NOT redesign it unless the user explicitly asks. Build on it; do not relitigate.

**⚠ SUPERSEDED ITEMS (2026-07-13)** — the user explicitly directed these
redesigns since this doc was written; treat the corresponding bullets below as
historical, not current:
- The 3D brain / WebGL pipeline (`components/brain/`, `components/scene/`,
  `BrainModel.ts` GLB swap point) — **deleted**. Homepage background is now a
  mouse-scrubbed video (`components/home/HeroVideo.tsx`).
- "One reusable `PreviewPane`" and the flanking `BrainNavigation` — **both
  deleted**. Replaced by `HeroStage`'s pose machine + `SectionPanels` (Phase 5
  v4) — see `07_CONTEXT_BOOTSTRAP.md`.
- "Pure `#FFFFFF` page" — background is now `#f9f9f9` (`bg-gallery`), matched
  to the hero video.
- `useDebugStore` / `useSystemsStore` (Leva tuning, system flags) — **deleted**
  along with Leva/GSAP/three.js/R3F/drei as dependencies.

Everything else below (Typography Constitution, motion principles, Memory
Transition, the experience framework used by client pages) is still accurate
and still frozen.

## Frozen: architecture & structure
- Folder structure and `@/*` alias (see `02_ARCHITECTURE.md`).
- Server Components by default; thin `"use client"` boundaries; WebGL via
  `next/dynamic({ ssr:false })`.
- State split: `useSceneStore` (app), `useDebugStore` (dev tuning),
  `useSystemsStore` (system flags).
- Content is filesystem-driven (`content/catalogue.ts`, server-only `node:fs`);
  never hardcode client data in components. Tunables live in `src/constants/`.

## Frozen: naming
- Brain subsystems: Model / Materials / Interaction / Animation / Lighting /
  Effects. Model file = `BrainModel.ts` with a single `PLACEHOLDER` config block
  and a documented GLB swap point.
- One reusable `TypeReveal`, one reusable `PreviewPane`, one experience
  framework in `components/experience/`.

## Frozen: Typography Constitution
- Four voices: **thought** (Caveat), **logic** (IBM Plex Mono, UPPERCASE, wide
  tracking), **creative** (Fraunces serif), **plain** (system sans).
- Pipeline: handwrite → pause → letter-by-letter paper-flip → final type.
- Access via `typeVoiceClass()` / `<TypeReveal>` only. Never import font classes
  directly. UPPERCASE belongs to the logic voice only.

## Frozen: motion principles
- Tokens in `constants/motion.ts`: `EASE_OUT` default; durations
  fast/medium/slow/settle/verySlow; easings out/inOut/gentle.
- No bounce, no elastic, no overshoot, ever. No loading spinners. No
  fade-to-black. Respect `prefers-reduced-motion` everywhere.
- Motion explains, never performs. Calm, premium, intentional.

## Frozen: design tokens
- Pure `#FFFFFF` page. Achromatic UI (colour lives inside the brain/artwork).
- Ink `neutral-900`; secondary `neutral-500`; meta `neutral-400`; hairlines
  `neutral-200→400`. The one non-white surface = the preview sheet `neutral-50`.
- Sanctioned shadows: the brain contact shadow + the preview sheet's top-lift
  whisper. Tokens in `constants/design.ts` (spacing, radius, z-index,
  breakpoints).

## Frozen: interaction philosophy
- Hot-path contract: no per-frame React setState; read snapshots/singletons,
  mutate refs. Composition of motion via `systems/brainMotion.ts`; momentary
  events via `systems/brainEvents.ts`.
- Mouse → damped brain rotation (±10°). Nav hover → hemisphere lean + tiny
  pulse + tiny light lift. Alive, not animated.

## Frozen: Memory Transition
- `MemoryTransitionHost` orchestrates: `pendingMemory` → thread
  (`BrainConnection`) → brain response → `MemoryOverlay` veil → `router.push`.
  No spinner. The transition tells the story.

## Frozen: navigation
- 8 sections, 4 per hemisphere, from `constants/navigation.ts`. Dual-type labels
  (script → arrow → caps) on hairline + dot. lg flanking grid / mobile stacked.
  Nav items open the preview; client cards route.
