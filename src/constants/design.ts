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

/**
 * The plate that carries text over the paint film.
 *
 * Every creative section is grounded in `paint-burst.mp4` at FULL strength —
 * no scrim, by the owner's instruction on 2026-08-20. That footage is bright,
 * high-contrast and MOVING, so white type laid straight onto it is unreadable
 * at some point in every loop. The scrim used to buy that legibility; removing
 * it moves the job onto the type's own ground.
 *
 * So each block of text sits on its own dark, translucent, rounded plate. The
 * blur matters as much as the alpha — it destroys the high-frequency detail
 * that makes moving footage so hard to read small type against, which is why
 * this is not simply `bg-black/60`. Browsers without `backdrop-filter` fall
 * back to the higher opacity, since there they get alpha alone.
 *
 * ⚠ Put the plate on TEXT, never on the panel as a whole. One plate spanning
 * the panel is just the scrim again, and the point of the change is that the
 * film reads at full strength between the blocks.
 *
 * ⚠ The alphas are MEASURED, not chosen by eye. Sampling paint-burst.mp4 at
 * 2fps and blurring each frame to match `backdrop-blur-md`, the brightest 1%
 * of the footage sits at relative luminance 0.553. Against that worst case,
 * white-at-75% text scores:
 *
 *     plate 0.60 -> 3.13:1     plate 0.78 -> 4.75:1
 *     plate 0.68 -> 3.68:1     plate 0.82 -> 5.39:1
 *
 * 0.60 was the first guess and it FAILS WCAG AA for body text (4.5:1) over the
 * bright frames. 0.78 clears it, and the tight variant runs at 0.82 because the
 * type on it is smaller. Re-measure before lowering either.
 */
export const FILM_PLATE =
  "rounded-2xl bg-neutral-950/88 supports-[backdrop-filter]:bg-neutral-950/78 backdrop-blur-md";

/** The same plate for small, dense surfaces (cards, chips) — tighter radius,
 *  a touch more opacity because the type on them is smaller. */
export const FILM_PLATE_TIGHT =
  "rounded-xl bg-neutral-950/90 supports-[backdrop-filter]:bg-neutral-950/82 backdrop-blur-md";

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
