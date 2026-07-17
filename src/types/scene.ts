/**
 * Scene-level type definitions.
 *
 * These describe the shape of global, cross-cutting state and configuration
 * for the 3D scene. Keeping them here (rather than inline in components) lets
 * future phases — scroll narrative, section routing, animation orchestration —
 * import a single source of truth instead of redefining ad-hoc shapes.
 */

/** A 2D normalized pointer position, each axis in the range [-1, 1]. */
export interface NormalizedPointer {
  x: number;
  y: number;
}

/**
 * The high-level lifecycle of scene animation.
 *
 * Phase 1 only ever sits in `"idle"`. Later phases (paint flow, particle
 * reveals, scroll-driven timelines) will transition through the other states,
 * so the union is declared up front to avoid churn later.
 */
export type AnimationState = "idle" | "intro" | "active" | "transitioning";

/**
 * @deprecated As of Phase 2 the focused section is identified by `NavSectionId`
 * (see `@/types/navigation`) and the store's `activeSection` uses that. This
 * coarse left/right type is retained only for reference and is no longer used.
 */
export type ActiveSection = "left" | "right" | null;

/**
 * The build phase of the overall project.
 *
 * This is a deliberate architectural hook: future systems can branch on the
 * current phase to progressively enable functionality without restructuring.
 */
export type ProjectPhase = 1 | 2 | 3 | 4 | 5;

/**
 * The hero's pose state (Phase 5 v4). `"center"` is the landing state — brain
 * at its calibrated resting frame, headline in the flanks, mouse scrubbing
 * live. Clicking a side commits to a hemisphere: the video plays to that end
 * pose ("logic" = first frame, "creative" = last frame), the brain zooms out
 * to the upper half, and that hemisphere's section panels rise below. There is
 * no return to "center" (deliberate) — visitors move between the two poses.
 */
export type HeroPose = "center" | "logic" | "creative";
