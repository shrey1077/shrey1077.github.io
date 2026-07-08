/**
 * Small, dependency-free math helpers.
 *
 * These are intentionally pure and framework-agnostic (no three.js import) so
 * they can be used anywhere — render loops, state, future workers — and unit
 * tested in isolation. Where a helper mirrors a three.js utility, the behavior
 * is kept identical so we can drop the three.js version in later without a
 * behavioral change.
 */

/** Clamp `value` into the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Degrees → radians. */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Radians → degrees. */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Linear interpolation from `a` to `b` by `t` (t is not clamped). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Frame-rate-independent exponential smoothing (a.k.a. "damp").
 *
 * Eases `current` toward `target` such that the result is identical regardless
 * of frame delta — critical for consistent feel across 60Hz / 120Hz displays
 * and frame drops. `lambda` controls speed: higher catches up faster, lower
 * feels heavier. This matches three.js's `MathUtils.damp` semantics so the two
 * are interchangeable.
 *
 * @param current  Present value.
 * @param target   Value to ease toward.
 * @param lambda   Smoothing rate (1/seconds). Typical range ~1–10.
 * @param deltaSec Time since last update, in seconds.
 */
export function damp(
  current: number,
  target: number,
  lambda: number,
  deltaSec: number,
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * deltaSec));
}
