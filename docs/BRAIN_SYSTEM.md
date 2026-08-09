# BRAIN SYSTEM

The 3D centerpiece: how it's built, lit, moved, and how it will grow.

## Composition

```
HeroStage ("use client", ~90vh)
 └─ SceneCanvas (next/dynamic, ssr:false — WebGL can't render on the server)
     <Canvas frameloop={active ? "always" : "never"} dpr=[1,2] ACES tone mapping>
       <color background #ffffff>
       CameraRig          static perspective camera, top-down, aimed at origin
       Lighting           ambient + warm key / fill / cool rim + ContactShadows
       <Suspense>
         Brain            the centerpiece
         SceneEnvironment HDRI preset (studio), lighting only
```

`Brain` composes six subsystems (`src/components/brain/`) — split in Phase 2.6
so each evolves independently:

| Subsystem | File | Role |
|---|---|---|
| **Model** | `BrainModel.ts` | ⚑ THE SWAP POINT — the sculpted procedural placeholder (below) |
| **Materials** | `BrainMaterials.tsx` | baked textures + PBR surface + vertexColors, single bake |
| **Interaction** | `useBrainInteraction.ts` | the per-frame hot path (below) |
| **Animation** | `BrainAnimation.ts` | reserved: idle breathing, intro, `animationState` transitions |
| **Lighting** | `scene/Lighting.tsx` | the studio rig (scene-level, shapes the brain) |
| **Effects** | `BrainEffects.tsx` | reserved mount point: paint flow, circuits, sparks, idea engine |

**The sculpted model (Phase 2.6).** No licensed anatomical mesh yet, so the
placeholder is sculpted in code: half-ellipsoid hemispheres meeting at the
longitudinal fissure; thin winding **gyri/sulci grooves** carved by
domain-warped ridged trig-noise (deterministic → identical every load, and
seam-safe because it is a pure function of position); frontal taper + posterior
widening; and **crevice ink** — groove depth written into vertex colors with a
harder ramp than the displacement, so sulci render as crisp drawn linework with
soft pencil shading around it (~46k vertices, ~85ms one-time generation, behind
the hero's white Suspense fallback). Fold tunables live in the `PLACEHOLDER`
block. To use a real GLB: put it in `public/models/`, replace `useBrainModel()`
with a `useGLTF` loader returning the same `BrainGeometrySet` shape. Nothing
downstream changes.

**Materials.** `useHemisphereTexture.ts` bakes a now-quiet hand-hatched paper
undertone (left mono, right color washes from `CREATIVE_PALETTE`) — since 2.6
the geometry carries the primary linework. `BrainMaterials` multiplies the
crevice ink under those textures; the Phase-3 paint-flow work replaces only the
right hemisphere's entry there.

**Sizing.** `useBrainScale.ts` — responsive fit from camera FOV/distance: ~37%
of viewport height (`BRAIN_TARGET_VIEWPORT_HEIGHT_FRACTION`), width-guarded,
recomputed on resize only.

## Recommended anatomical GLB (researched, Phase 3B)

When a real model replaces the sculpt, the recommendation is:

- **Primary: [Z-Anatomy](https://sketchfab.com/Z-Anatomy)** — the open-source
  3D human-anatomy atlas (refined from BodyParts3D), **CC-BY-SA 4.0**, free
  GLB downloads (e.g. their
  [Neurology model](https://sketchfab.com/3d-models/neurology-3bfe9ac6efd84555a311f8ea50dd174d)).
  Best anatomical fidelity available with an open license; also listed by
  [AnatomyTOOL's Open3DModel](https://anatomytool.org/open3dmodel) (Leiden/
  Utrecht/Maastricht/KU Leuven anatomists).
- **Alternative:** individual CC-BY brain scans on Sketchfab (e.g.
  ["Human Brain" by AH](https://sketchfab.com/3d-models/human-brain-c9c9d4d671b94345952d012cc2ea7a24))
  — verify each model's license on its page.

**License note:** CC-BY-SA requires visible attribution (site credits) and
share-alike on the *model* (not the site's code). Acceptable for this
portfolio; the user makes the final call on asset choice.

**Preparation checklist:** isolate the cerebrum (drop brainstem/cerebellum
unless wanted), split/tag hemispheres, decimate to ≤150k triangles, bake an AO
map if desired, Draco-compress to GLB, place in `public/models/brain.glb`,
then swap `useBrainModel()` per the checklist above. The ink-linework material
language transfers: crevice ink can be baked from the real model's curvature.

## The hot-path contract (critical, non-negotiable)

The ONLY per-frame code is `useBrainInteraction`. It must never trigger React:

1. reads R3F's `state.pointer` (already-normalized NDC; no extra listeners),
2. reads `useDebugStore.getState()` + `useSceneStore.getState().hoveredNav` —
   **snapshots, not subscriptions**,
3. computes the target: mouse rotation (clamped ±10°, `BRAIN_ROTATION`) + the
   nav-hover lean (±4° toward the hovered hemisphere + 1.5° nod,
   `BRAIN_NAV_HOVER`) + dev offsets,
4. eases via frame-rate-independent `damp()` (`utils/math.ts`, three.js
   `MathUtils.damp` semantics; delta clamped so tab-refocus never snaps),
5. writes straight onto the group ref.

Nothing in a `useFrame` may call `setState` or subscribe to a store. Reactive
state (scale, lights, camera distance) changes only on resize / dev sliders.

## Lighting & rendering

Studio product-photography rig (`constants/scene.ts`): soft ambient, a dominant
**warm key** (#fff4e8), neutral fill, **cool rim** (#edf2fb) — a near-white
temperature split that shapes the paper surface without tinting the gallery.
HDRI environment (drei `studio` preset, lighting only) + a single soft
`ContactShadows` blob grounds the object — real shadow maps and SSAO are
deliberately off (postprocessing arrives as its own future pass). ACES filmic
tone mapping, DPR capped at 2.

## Performance

- `frameloop` flips to `"never"` when the hero leaves the viewport
  (`useInViewport` in HeroStage) — zero GPU while reading previews.
- Geometry/textures are memoized once per mount; textures disposed on unmount.
- 60fps budget guarded by the hot-path contract above.

## State the brain touches

`hoveredNav` (read, snapshot) — the acknowledgment lean. `mousePosition` /
`brainRotation` fields exist in the scene store as **reserved mirrors** for
future non-hot-path consumers (must be fed throttled, never per-frame).
`currentPhase` gates future systems (`if (phase < 3) return null`).

## Future brain features (where they attach)

| Feature | Attaches at |
|---|---|
| Real anatomical model | `BrainModel.ts` swap point |
| Paint flow (right) | right hemisphere entry in `BrainMaterials.tsx` |
| Idle breathing / intro motion | `BrainAnimation.ts` (contract documented in-file) |
| Circuits (left) | `BrainEffects.tsx`, gated on `currentPhase` |
| Neuron sparks / idea engine visuals | `BrainEffects.tsx` + `constants/ideas/` seed data |
| Postprocessing (SSAO/bloom/DOF) | one `PostProcessing` wrapper in SceneCanvas |
| Scroll-driven camera | `CameraRig` (GSAP), replacing the static rig |
