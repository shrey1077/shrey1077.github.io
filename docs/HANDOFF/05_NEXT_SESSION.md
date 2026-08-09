# 05 — NEXT SESSION

## Objective
Improve **ONLY the homepage brain** — its visual quality as a 3D sculptural
object.

## Do
- Better silhouette, proportions, fold definition, materials, lighting, depth,
  and contact shadows.
- Work primarily in `BrainModel.ts` (the `PLACEHOLDER` block), `BrainMaterials.tsx`,
  and `scene/Lighting.tsx` / `constants/scene.ts`.
- OR evaluate swapping the procedural model for the recommended open-source GLB
  (Z-Anatomy, CC-BY-SA) via the existing swap point — do not break it.
- Verify visually. Note: the preview screenshot tool cannot capture the WebGL
  layer reliably; use `preview_eval` to read the R3F scene, and/or the Node
  verifier at `…/scratchpad/verify-brain.mjs` for geometry math.

## Do NOT
- No Tata IIS work. No client pages. No galleries. No asset import.
- No new animation systems. No documentation restructuring.
- Do not redesign any frozen system (`04_FREEZE.md`).

## First step
Resolve the current build state before visual work: the Phase 4 flow systems
(`components/flows/*`, `systems/*`) have 2 ESLint errors and are unverified. If
they get in the way, disable them (they are gated behind `useSystemsStore` and
mounted only in `HeroStage` lg+) or set their flags off — but the objective is
the brain, so keep scope tight. Get `npx tsc --noEmit`, `npx eslint src`, and
`npm run build` green, then improve the brain.

One artistic objective for the whole session. Batch edits. Show visible
improvement.
