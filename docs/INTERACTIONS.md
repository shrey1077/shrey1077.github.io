# INTERACTIONS

How the installation responds: hover, click, scroll, and the state that wires
it together.

## The homepage loop

```
hover a nav item   → brain leans toward that hemisphere; label darkens
click a nav item   → preview sheet expands below + page scrolls to it
click another item → sheet content crossfades in place (never re-collapses)
chevron (or scroll)→ returns to the brain; sheet retracts to height 0
```

The homepage is `HeroStage (~90vh, min 600px)` → `PreviewPane (0→auto)` →
`SiteFooter (~10vh)`: one viewport when idle, never a long scroll.

## Navigation

- Data-driven from `constants/navigation.ts` (`NAV_SECTIONS` — 8 sections with
  hemisphere, order, preview kind, description). Adding/reordering sections is a
  data change only.
- Each `NavItem` is a `<button>` (it opens the in-page preview; only client
  cards are `<Link>`s). Accessible name on the button; `aria-controls="preview"`
  + `aria-expanded`; hover mirrored on focus/blur for keyboards.
- Layout: lg+ = grid lanes flanking the brain (center lane reserved — labels
  cannot overlap the artwork); <lg = the hero's lower band, two columns; <md =
  compact thought-only labels (see TYPOGRAPHY.md).
- Hover writes `hoveredNav` to the scene store → the brain's per-frame hook
  reads it as a snapshot and leans (`BRAIN_NAV_HOVER`: 4° toward the hemisphere,
  1.5° nod), damped like every brain motion. Leave → eases back. No React
  re-render is involved (see the hot-path contract in BRAIN_SYSTEM.md).

## The preview sheet (PreviewPane)

Exactly ONE reusable container (`components/preview/PreviewPane.tsx`):

- **Closed** = height 0, `aria-hidden`, zero whitespace.
- **Open** — Framer height 0→auto (the sheet: `neutral-50`, rounded top,
  hairline) + `scrollIntoView` on the pane, so the reveal reads as one gesture.
- **Rail + body**: rail = two-digit global index (`navSectionIndex`), the title
  in the section's hemisphere voice, the section description; body = the
  section's preview by `kind` — `clients` → ClientsPreview grid, anything else →
  ComingSoonPreview. New kinds extend the union in `types/navigation.ts`.
- **Section switch** = crossfade keyed by section id, in place.
- **Close** (the centered chevron) = scroll to top FIRST (layout stays stable),
  collapse on arrival — `scrollend` listener with an 800ms fallback that also
  force-jumps if the smooth scroll was interrupted (throttled tabs). Collapsing
  mid-scroll would thrash layout; this ordering is deliberate. Reduced motion →
  instant jump + collapse.

## Scroll choreography

- `html { scroll-behavior: smooth }` with a reduced-motion media override;
  programmatic scrolls pass explicit behaviors.
- Only two programmatic scrolls exist: *into* the sheet on open, *back to top*
  on close. Nothing else moves the page.
- The document allows vertical scroll only (`overflow-x: hidden`,
  `overscroll-behavior-y: none`).

## UI state (Zustand)

`src/state/useSceneStore.ts` — the shared state between DOM and canvas:

| Field | Purpose | Read pattern |
|---|---|---|
| `activeSection: NavSectionId \| null` | which preview is open | reactive (`useSceneStore(s => …)`) — rare changes |
| `hoveredNav: { id, hemisphere } \| null` | what the brain acknowledges | **snapshot** (`getState()`) inside `useFrame` — hot path |
| `scrollProgress`, `animationState`, `currentPhase`, `mousePosition`, `brainRotation` | reserved for future phases | see BRAIN_SYSTEM.md notes |

`src/state/useDebugStore.ts` holds dev-only tuning (Leva writes it; production
reads neutral defaults). Rule of thumb: reactive subscriptions for rare UI
changes; `getState()` snapshots for anything per-frame; per-frame `setState` is
forbidden.

## The memory transition (architecture, `src/components/transition/`)

The philosophy: the homepage is the mind; each client is a memory inside it.
Entering a client should eventually feel like slipping into a memory, not
loading a page. Phase 2.6 built the homes for that choreography:

**LIVE since Phase 3B (v1):** clicking a client card no longer navigates — it
begins a *retrieval*, orchestrated by `MemoryTransitionHost` (mounted globally
in the root layout): the card sets `pendingMemory` (slug + click point) →
`BrainConnection` draws a hairline thread from the card back toward the brain
(or upward toward the mind if it's off-screen) → the brain acknowledges through
the existing hover machinery (lean + pulse + lighting breath, pointed at the
left hemisphere) → `MemoryOverlay` settles at ~450ms → the route changes at
~950ms beneath the veil, which lifts over the arriving experience. Modified
clicks (new tab) and reduced motion bypass the theater; the href stays real.

| Component | Role |
|---|---|
| `MemoryTransitionHost` | the orchestrator (root layout; store-driven) |
| `ExperienceTransition` | the arrival settle inside experience pages |
| `MemoryOverlay` | the white veil (pointer-events-none, gentle ease) |
| `BrainConnection` | the drawn thread (SVG hairline + dot, rule-and-dot language) |

Experiences never dead-end: `FooterNavigation` (experience framework) links
previous/next memory through the client list, wrapping.

`MediaViewer` (experience framework) is the focused-viewing layer: a
gallery-white lightbox on the `viewer` z-level (constants/design.ts), closed by
backdrop, ✕, or Escape. The future immersive gallery wires it to AssetGrid.

## Performance guards

- The R3F frameloop pauses (`frameloop="never"`) when the hero scrolls out of
  view (`useInViewport`, 200px margin) — the GPU idles while reading a preview.
- Preview bodies mount only when open; client routes are separate pages.
