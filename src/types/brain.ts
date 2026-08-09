/**
 * Brain-specific type definitions.
 *
 * The brain is the centerpiece of the experience. Its visual language is split
 * across two hemispheres with opposite meanings (logic vs. creativity), so the
 * types here encode that split explicitly rather than leaving it implicit in
 * component code.
 */

/** Which anatomical hemisphere a piece of geometry or material belongs to. */
export type Hemisphere = "left" | "right";

/**
 * A Euler-style rotation in radians. We intentionally avoid depending on a
 * three.js type here so that non-rendering code (state, utils, tests) can
 * reason about rotation without importing the 3D library.
 */
export interface RotationEuler {
  x: number;
  y: number;
  z: number;
}
