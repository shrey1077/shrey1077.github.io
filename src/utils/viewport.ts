/**
 * Viewport / responsive-scaling helpers.
 *
 * The brief requires the brain to always occupy "roughly one third of the
 * viewport height", stay centered, and never clip or distort — across any
 * desktop window size. Rather than hardcode a scale, we derive it from the
 * camera's field of view and the object's own measured height, so the same
 * math works if the placeholder mesh is later swapped for a real GLB of a
 * different intrinsic size.
 *
 * All functions are pure (no three.js import) and unit-testable.
 */

import { degToRad } from "@/utils/math";

/**
 * The visible world-space height at a given distance from a perspective camera.
 *
 * Derived from the standard perspective frustum: at distance `d`, the vertical
 * extent visible is `2 * d * tan(fov / 2)`.
 *
 * @param distance     Distance from camera to the plane of interest (world units).
 * @param verticalFovDeg Camera vertical field of view, in degrees.
 */
export function visibleHeightAtDistance(
  distance: number,
  verticalFovDeg: number,
): number {
  return 2 * distance * Math.tan(degToRad(verticalFovDeg) / 2);
}

/**
 * The straight-line distance between two 3D points, expressed as flat tuples so
 * this helper stays independent of any vector library.
 */
export function distanceBetween(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Compute the uniform scale that makes an object of a known intrinsic height
 * fill a target fraction of the visible viewport height.
 *
 * @param params.visibleHeight  Visible world height at the object's distance.
 * @param params.intrinsicHeight The object's un-scaled height in world units
 *                               (measured from its geometry bounding box).
 * @param params.targetFraction Fraction of the viewport height to fill (0–1).
 * @param params.baseScale      A baseline multiplier applied on top of the fit.
 * @returns The scale to apply to the object so it hits the target fraction.
 */
export function computeFitScale(params: {
  visibleHeight: number;
  intrinsicHeight: number;
  targetFraction: number;
  baseScale: number;
}): number {
  const { visibleHeight, intrinsicHeight, targetFraction, baseScale } = params;
  // Guard against a degenerate (zero-height) measurement so we never divide by
  // zero or return NaN before geometry has been measured.
  if (intrinsicHeight <= 0) return baseScale;
  const desiredWorldHeight = visibleHeight * targetFraction;
  return baseScale * (desiredWorldHeight / intrinsicHeight);
}
