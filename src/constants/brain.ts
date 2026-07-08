/**
 * Brain configuration constants.
 *
 * Governs the brain's proportions, how it fills the viewport, how it responds
 * to the mouse, and the palette used to "paint" the creative hemisphere. As
 * with scene constants, nothing here should be duplicated inside components.
 */

import { degToRad } from "@/utils/math";

/**
 * Fraction of the *canvas* height the brain should occupy. The brief calls for
 * "roughly one third of the viewport height"; since Phase 2 the canvas fills the
 * ~90vh hero (not the full viewport), this is set a touch higher (0.34 / 0.9 ≈
 * 0.38) so the brain still reads as ~⅓ of the true viewport. The responsive
 * scaling helper (utils/viewport.ts) turns this into a world-space scale that
 * holds across window sizes without clipping or distortion. Kept at ~0.34 so the
 * brain reads as roughly ⅓ of the viewport while leaving the flanking desktop
 * navigation clear room in the outer thirds.
 */
export const BRAIN_TARGET_VIEWPORT_HEIGHT_FRACTION = 0.37;

/**
 * Mouse-driven rotation limits and feel.
 *
 * The brain should feel heavy — a damped response that eases toward a target
 * and never snaps. `maxAngleRad` is the hard clamp (±10°, per the brief) on how
 * far the pointer can push each axis away from rest.
 */
export const BRAIN_ROTATION = {
  /** Maximum deflection on each axis, in radians. ±10° as specified. */
  maxAngleRad: degToRad(10),
  /**
   * Damping coefficient (lambda) for frame-rate-independent easing. Lower =
   * heavier/slower to catch up to the target; higher = snappier. ~2.2 reads as
   * a weighty object with real inertia. Tunable live via the debug panel.
   */
  dampingLambda: 2.2,
  /**
   * Per-axis multiplier applied to the normalized pointer before clamping. This
   * lets vertical and horizontal sensitivity differ subtly — a top-view brain
   * looks best tilting a touch more around X (nodding) than Y (turning).
   */
  pointerInfluence: {
    x: 1.0,
    y: 1.0,
  },
} as const;

/**
 * How the brain "acknowledges" a hovered navigation item (Phase 2).
 *
 * When a nav label is hovered, the brain leans a few degrees toward that
 * hemisphere — a subtle, premium acknowledgment layered on top of the mouse
 * rotation. Read on the render hot path via a store snapshot; damped with the
 * same easing so it never snaps. Deliberately small.
 */
export const BRAIN_NAV_HOVER = {
  /** Lean toward the hovered hemisphere, in radians (turn around Y). */
  leanAngleRad: degToRad(4),
  /** A slight forward nod that accompanies the lean, in radians (tilt around X). */
  nodAngleRad: degToRad(1.5),
} as const;

/**
 * Base scale applied to the placeholder geometry so its natural size is close
 * to one world unit tall. The responsive helper multiplies this to hit the
 * target viewport fraction. Isolating it as a constant means swapping in a real
 * GLB (which may be authored at a different size) only touches this value.
 */
export const BRAIN_BASE_SCALE = 1.0;

/**
 * Palette for the creative (right) hemisphere. These wash colors are painted
 * into the ink-hatch texture (see components/brain/useHemisphereTexture.ts).
 * Chosen to echo the reference mood — magenta, coral, amber, lime — without
 * copying any specific image. The logic (left) hemisphere uses no color at all;
 * it is pure black ink on the white surface.
 */
export const CREATIVE_PALETTE = [
  "#FF2E8B", // magenta
  "#FF5A3C", // coral red
  "#FF8A00", // amber
  "#7FBF2E", // lime
  "#00A6A6", // teal accent
] as const;

/** The ink color used for the technical sketch linework on both hemispheres. */
export const SKETCH_INK_COLOR = "#141414";

/**
 * Base "paper" color the ink sits on. Very light warm gray rather than pure
 * white: enough tone that the lit surface separates from the #FFFFFF background
 * on its shaded side, without reading as "dirty". The dense linework and the
 * lighting gradient do the rest.
 */
export const SKETCH_PAPER_COLOR = "#EAE8E3";

/**
 * Resolution (px, square) of the baked hatch texture. 1024 is a good balance:
 * sharp linework up close, negligible memory, generated once and cached.
 */
export const HATCH_TEXTURE_SIZE = 1024;
