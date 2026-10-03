/**
 * Design tokens — the numeric constitution of the interface
 * (docs/DESIGN_SYSTEM.md).
 *
 * Tailwind utilities remain the styling vehicle, but every meaningful design
 * decision is NAMED here so it exists exactly once. Components written with
 * Tailwind classes should match these values; components that style via JS
 * (overlays, viewers, canvas-adjacent layers) import them directly.
 */

/** Spacing rhythm (rem). Mirrors the Tailwind steps the system actually uses —
 *  pick from this scale, don't invent values. */
export const SPACING = {
  /** Hairline gaps, icon offsets. */
  xs: 0.5,
  /** Intra-component gaps (card padding steps, label gaps). */
  sm: 1.25,
  /** Component padding (cards p-5/6, sheet gutters px-6). */
  md: 1.5,
  /** Block separation (rail↔body gap-10). */
  lg: 2.5,
  /** Section padding (py-16/20). */
  xl: 5,
} as const;

/** Corner radius. The system is deliberately square except the sheet. */
export const RADIUS = {
  none: "0px",
  /** The preview sheet / memory surfaces rising over the wall. */
  sheet: "2rem",
  /** Fully round (dots, the chevron hit area). */
  full: "9999px",
} as const;

/** Shadows. The gallery casts almost none — elevation is expressed with
 *  hairlines and lift, not shade. The single sanctioned soft shadow is the 3D
 *  contact shadow under the brain (constants/scene.ts CONTACT_SHADOW). */
export const SHADOWS = {
  none: "none",
} as const;

/**
 * Z-index hierarchy — every layer in the experience, in order. Tailwind
 * classes in components must correspond to these values; JS-styled layers
 * (MemoryOverlay, MediaViewer) import them directly.
 */
export const Z_INDEX = {
  /** The WebGL canvas / page flow. */
  base: 0,
  /** Navigation overlaying the hero. */
  nav: 10,
  /** The identity header. */
  header: 20,
  /** The memory-transition veil (MemoryOverlay). */
  overlay: 40,
  /** Modal media viewing (MediaViewer). */
  viewer: 50,
} as const;

/** The plate the creative rooms set their text on.
 *
 * ⚠ PAPER, NOT FILM, since 2026-10-03 (owner): the creative rooms used to fly
 * over the paint-burst film with no scrim, and every block of text sat on a
 * dark translucent "film plate" tuned (and contrast-measured) against the
 * film's brightest frames. The film is gone — the creative track now stands on
 * the landing's own ground (white, the faint circuit film, the corner
 * lattices) — so the plate is a light one and the type on it is dark. git has
 * the film plates and their measurements. */
export const PAPER_PLATE = "rounded-2xl bg-white/85 ring-1 ring-neutral-200/90 backdrop-blur-sm";

/** The same plate for small, dense surfaces (cards, chips) — tighter radius,
 *  a touch more opacity because the type on them is smaller. */
export const PAPER_PLATE_TIGHT = "rounded-xl bg-white/90 ring-1 ring-neutral-200 backdrop-blur-sm";

/** Viewport breakpoints (px) — Tailwind's scale, named for JS consumers
 *  (matchMedia, canvas math). Keep in lockstep with Tailwind usage. */
export const BREAKPOINTS = {
  sm: 640,
  /** The dual-type nav pair appears here. */
  md: 768,
  /** The nav flanks the brain from here (below: banded layout). */
  lg: 1024,
  xl: 1280,
} as const;
