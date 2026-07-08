"use client";

/**
 * CameraRig — the single, static perspective camera.
 *
 * The brief calls for an elegant, minimal, fixed camera: no cinematic movement.
 * So this does exactly one thing — establish a `PerspectiveCamera` as the
 * default at the configured position/fov, aimed at the origin (where the brain
 * sits). The only variable is the debug `cameraDistance` multiplier (dev-only;
 * 1 in production), which scales the camera's distance from the origin so
 * lighting/scale can be inspected.
 *
 * Because the camera looks at the origin and the target IS the origin, scaling
 * the position vector scales the viewing distance uniformly — exactly what
 * `useBrainScale` assumes, keeping the brain's apparent size stable when a dev
 * dollies the camera.
 */

import { useLayoutEffect, useMemo, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import type { PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { CAMERA } from "@/constants/scene";
import { useDebugStore } from "@/state/useDebugStore";

export function CameraRig() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const cameraDistance = useDebugStore((state) => state.cameraDistance);

  const position = useMemo<[number, number, number]>(
    () => [
      CAMERA.position[0] * cameraDistance,
      CAMERA.position[1] * cameraDistance,
      CAMERA.position[2] * cameraDistance,
    ],
    [cameraDistance],
  );

  // Keep the camera aimed at the brain whenever its position changes.
  useLayoutEffect(() => {
    cameraRef.current?.lookAt(CAMERA.target[0], CAMERA.target[1], CAMERA.target[2]);
  }, [position]);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={CAMERA.fov}
      near={CAMERA.near}
      far={CAMERA.far}
      position={position}
    />
  );
}
