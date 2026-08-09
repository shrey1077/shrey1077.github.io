/**
 * Motion tokens — shared easing/timing for the Phase 2 interface animations.
 *
 * Centralized so every transition feels part of one deliberate, high-end system
 * (the brief: "deliberate, confident, smooth, high-end, minimal"). Components
 * import these instead of hardcoding curves, and the tuple is typed so it
 * satisfies Framer Motion's `Easing` type without per-call casts.
 */

/** A gentle "ease-out expo"-style curve — slow, confident settle. The default
 *  for everything that ENTERS or reacts. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Symmetric in-out — for motion that travels A→B (future camera/section
 *  choreography), where both ends should feel weighted. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** A softer, near-linear drift — ambient/idle motion that should be felt, not
 *  noticed (future brain breathing, veil fades). */
export const EASE_GENTLE: [number, number, number, number] = [0.4, 0.1, 0.6, 0.9];

/** The full easing set. NOTE: no bounce, no elastic, no overshoot — ever.
 *  Calm, premium, intentional (docs/MOTION.md). */
export const EASINGS = {
  out: EASE_OUT,
  inOut: EASE_IN_OUT,
  gentle: EASE_GENTLE,
} as const;

/** Standard durations (seconds). */
export const DURATION = {
  /** Quick micro-interactions (hover glow, small shifts). */
  fast: 0.4,
  /** Content crossfades. */
  medium: 0.5,
  /** The preview pane expand/collapse — the "cinematic" one. */
  slow: 0.7,
  /** Nav labels settling in on load. */
  settle: 0.8,
  /** Arrivals & departures at experience scale (canvas fade-in, the future
   *  memory dive). */
  verySlow: 1.4,
} as const;
