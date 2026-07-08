# 02 — ARCHITECTURE (current reality)

## Folder structure (`src/`)
```
app/            routes (Server Components)
  page.tsx        homepage: HeroStage + PreviewPane + SiteFooter
  clients/page.tsx                     clients index
  clients/[slug]/page.tsx              client page (experience|WIP branch, SSG)
  clients/[slug]/catalogue/[category]/ auto-generated from content folders (SSG)
  layout.tsx      fonts + MemoryTransitionHost (global)
  globals.css     white bg, scroll, @theme font tokens
components/
  home/         HeroStage · IdentityHeader · BrainNavigation · NavItem · ThoughtLabel
  typography/   TypeReveal · Eyebrow
  preview/      PreviewPane · ClientsPreview · ClientCard · ComingSoonPreview
  scene/        SceneCanvas · CameraRig · Lighting · SceneEnvironment
  brain/        Brain · BrainModel(⚑swap) · BrainMaterials · useBrainInteraction
                · BrainAnimation · BrainEffects · useHemisphereTexture · useBrainScale
  flows/        (Phase 4, unverified) flowGeometry · useFlowStream · LogicalFlow
                · DetailLayer · CreativeFlow · NeuronThought · NeuronEngine · BrainSystems
  experience/   ExperienceLayout · Hero · Navigation · Section · Catalogue* ·
                Photography · Gallery · Process · Timeline · AssetGrid · MediaViewer · FooterNavigation
  client/       ClientExperience · BrandOpening · InstituteStructure · ClientWip
  transition/   MemoryTransitionHost · ExperienceTransition · MemoryOverlay · BrainConnection
  debug/        DebugPanel (Leva, dev-only, sole leva importer)
content/        catalogue.ts (⚠ SERVER-ONLY node:fs readers)
systems/        (Phase 4) brainEvents · brainMotion · thoughtEngine
constants/      scene · brain · navigation · clients · clientExperiences · site ·
                motion · typography · design · systems · thoughts/{left,right}Thoughts
state/          useSceneStore · useDebugStore · useSystemsStore (Zustand)
hooks/          useInViewport      utils/  math · viewport · random · motion
types/          scene · brain · navigation · client · experience · thoughts
```
Path alias `@/*` → `src/*`. `public/content/clients/<slug>/…` holds curated,
web-optimized assets (never the raw archive).

## Main systems

**Brain (3D).** `SceneCanvas` (dynamic, ssr:false) renders top-down perspective
camera + 3-point studio lighting + HDRI preset + soft ContactShadows on pure
white. `Brain` composes six subsystems: **Model** (`BrainModel.ts` — procedural
placeholder: two half-ellipsoids, gyri/sulci from domain-warped ridged noise,
crevice ink baked to vertex colors; all tunables in one `PLACEHOLDER` block; ⚑
GLB swap point → recommended Z-Anatomy, CC-BY-SA), **Materials**
(`BrainMaterials.tsx` — baked hatch texture as map+bumpMap, vertexColors),
**Interaction** (`useBrainInteraction.ts` — hot path), **Animation**
(`BrainAnimation.ts` — idle breathe/drift), **Lighting** (`scene/Lighting.tsx`),
**Effects** (`BrainEffects.tsx` — reserved mount). **Hot-path contract:**
nothing per-frame calls React setState; read `getState()`/singletons, mutate
refs.

**Typography.** Constitution = 4 voices (`constants/typography.ts`):
thought=Caveat script, logic=IBM Plex Mono UPPERCASE, creative=Fraunces serif,
plain=system sans. `TypeReveal` renders all voiced text; `reveal="pipeline"`
animates handwrite → pause → letter-by-letter paper-flip → final type
(`finalVoice`), with `onPipelineComplete`. Reduced-motion → final type instantly.

**Navigation.** Data-driven from `constants/navigation.ts` (8 sections, 4 per
hemisphere). Each `NavItem` shows handwritten label → arrow → final caps on a
hairline rule with dot terminal. Layout: lg+ = 3-col grid flanking the brain
(reserved center lane); below lg = two-column block under the brain. Hover
writes `hoveredNav` → brain leans (hot path). Nav items open the in-page preview
(not routes); client cards route.

**Preview Pane.** ONE reusable `PreviewPane`. Reads `activeSection`. Height 0
when closed; expands to a rounded `neutral-50` sheet (Apple-Photos feel) with a
chevron close, rail (index/title/description) + body. Smooth-scrolls in on open;
close scrolls to top then collapses. Body by section `kind` (Clients grid /
Coming Soon).

**Memory Transition.** `MemoryTransitionHost` (global, in layout) watches
`pendingMemory`. A client card sets it (slug + click point); host draws a
`BrainConnection` thread toward the brain, brain responds, `MemoryOverlay` white
veil settles, `router.push` at ~950ms. No spinner. Reduced-motion = instant.

**Interaction / alive.** Mouse → damped brain rotation (±10°, hot path). Nav
hover → hemisphere lean + tiny pulse + tiny light lift. Scroll → subtle brain
"awaken" tilt + rim lift. Idle → breathe/drift (Phase 4). All composed via
`systems/brainMotion.ts` (shared per-frame channel) + `systems/brainEvents.ts`
(pub/sub) — read inside `useFrame`, never React state.

**State.** `useSceneStore` (activeSection, hoveredNav, pendingMemory,
animationState, currentPhase). `useDebugStore` (Leva tuning, neutral defaults in
prod). `useSystemsStore` (Phase 4 per-system on/off flags).
