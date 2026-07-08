/**
 * Responsive brain scaling.
 *
 * Keeps the brain at "roughly one third of the viewport height" (per the brief)
 * and, on narrow viewports, shrinks it further so its width never clips — all
 * derived from the camera geometry rather than hardcoded, so it survives a
 * swap to a real GLB of different intrinsic size.
 *
 * This is NOT hot-path: it recomputes only when the viewport size or a relevant
 * debug value changes, so a normal `useMemo` + React re-render is the right tool
 * (no `useFrame`).
 */

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CAMERA } from "@/constants/scene";
import { BRAIN_BASE_SCALE, BRAIN_TARGET_VIEWPORT_HEIGHT_FRACTION } from "@/constants/brain";
import { useDebugStore } from "@/state/useDebugStore";
import {
  computeFitScale,
  distanceBetween,
  visibleHeightAtDistance,
} from "@/utils/viewport";

/** On narrow screens, never let the brain exceed this fraction of the visible
 *  width — preserves the "art gallery" negative space and prevents clipping. */
const MAX_WIDTH_FRACTION = 0.62;

/**
 * @param onScreenVerticalExtent   The brain dimension that maps to screen-vertical
 *   under the fixed camera. For the top-down camera this is the brain's DEPTH
 *   (front-to-back, Z), which is what "≈⅓ of viewport height" should measure.
 * @param onScreenHorizontalExtent The dimension mapping to screen-horizontal
 *   (the brain's WIDTH, X) — used only to prevent clipping on narrow viewports.
 */
export function useBrainScale(
  onScreenVerticalExtent: number,
  onScreenHorizontalExtent: number,
): number {
  // Subscribing to `size` makes this recompute on window resize.
  const size = useThree((state) => state.size);
  const cameraDistanceMult = useDebugStore((state) => state.cameraDistance);
  const brainScaleMult = useDebugStore((state) => state.brainScale);

  return useMemo(() => {
    const baseDistance = distanceBetween(CAMERA.position, CAMERA.target);
    const distance = baseDistance * cameraDistanceMult;

    const visibleHeight = visibleHeightAtDistance(distance, CAMERA.fov);
    const aspect = size.width / size.height;
    const visibleWidth = visibleHeight * aspect;

    // Primary fit: hit the target fraction of viewport *height*.
    let scale = computeFitScale({
      visibleHeight,
      intrinsicHeight: onScreenVerticalExtent,
      targetFraction: BRAIN_TARGET_VIEWPORT_HEIGHT_FRACTION,
      baseScale: BRAIN_BASE_SCALE,
    });

    // Guard: if that would make the brain too wide for a narrow viewport, clamp.
    const scaledWidth = onScreenHorizontalExtent * scale;
    const maxWidth = visibleWidth * MAX_WIDTH_FRACTION;
    if (scaledWidth > maxWidth) {
      scale *= maxWidth / scaledWidth;
    }

    return scale * brainScaleMult;
  }, [
    onScreenVerticalExtent,
    onScreenHorizontalExtent,
    cameraDistanceMult,
    brainScaleMult,
    size.width,
    size.height,
  ]);
}
