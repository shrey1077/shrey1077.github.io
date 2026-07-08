"use client";

/**
 * DebugPanel — Leva development controls.
 *
 * This component is the ONLY place `leva` is imported, and it is loaded
 * dynamically (dev-only) by HeroStage, so Leva never ships in a production
 * bundle. It renders the Leva panel (which is HTML, hence it must live OUTSIDE
 * the <Canvas>) and mirrors every control into `useDebugStore`, which the scene
 * reads. This indirection keeps Leva out of the scene components entirely.
 *
 * Controls (per the brief): brain scale, brain rotation, light intensity,
 * camera distance, shadow intensity.
 */

import { useEffect } from "react";
import { Leva, useControls, folder } from "leva";
import { DEBUG_DEFAULTS, useDebugStore } from "@/state/useDebugStore";
import { BRAIN_ROTATION } from "@/constants/brain";
import { BRAIN_SYSTEMS } from "@/constants/systems";
import { useSystemsStore } from "@/state/useSystemsStore";
import { radToDeg } from "@/utils/math";

export default function DebugPanel() {
  const setDebug = useDebugStore((state) => state.setDebug);
  const setSystem = useSystemsStore((state) => state.setSystem);

  const values = useControls({
    Brain: folder({
      brainScale: {
        value: DEBUG_DEFAULTS.brainScale,
        min: 0.25,
        max: 2.5,
        step: 0.01,
        label: "scale",
      },
      mouseRotationEnabled: {
        value: DEBUG_DEFAULTS.mouseRotationEnabled,
        label: "mouse rotation",
      },
      rotationOffsetXDeg: {
        value: DEBUG_DEFAULTS.rotationOffsetXDeg,
        min: -radToDeg(BRAIN_ROTATION.maxAngleRad),
        max: radToDeg(BRAIN_ROTATION.maxAngleRad),
        step: 0.5,
        label: "rot offset X°",
      },
      rotationOffsetYDeg: {
        value: DEBUG_DEFAULTS.rotationOffsetYDeg,
        min: -radToDeg(BRAIN_ROTATION.maxAngleRad),
        max: radToDeg(BRAIN_ROTATION.maxAngleRad),
        step: 0.5,
        label: "rot offset Y°",
      },
    }),
    Lighting: folder({
      lightIntensity: {
        value: DEBUG_DEFAULTS.lightIntensity,
        min: 0,
        max: 3,
        step: 0.01,
        label: "intensity ×",
      },
      shadowOpacity: {
        value: DEBUG_DEFAULTS.shadowOpacity,
        min: 0,
        max: 1,
        step: 0.01,
        label: "shadow opacity",
      },
    }),
    Camera: folder({
      cameraDistance: {
        value: DEBUG_DEFAULTS.cameraDistance,
        min: 0.5,
        max: 2,
        step: 0.01,
        label: "distance ×",
      },
    }),
  });

  // Per-system enable/disable toggles (Brain Operating System).
  const systemValues = useControls(
    "Systems",
    Object.fromEntries(
      BRAIN_SYSTEMS.map((s) => [s.id, { value: s.enabled, label: s.label }]),
    ),
  );

  // Mirror Leva state into the debug store the scene reads from.
  useEffect(() => {
    setDebug(values);
  }, [values, setDebug]);

  // Mirror system toggles into the systems store.
  useEffect(() => {
    for (const s of BRAIN_SYSTEMS) {
      setSystem(s.id, systemValues[s.id] as boolean);
    }
  }, [systemValues, setSystem]);

  // `collapsed` keeps the panel tidy; it still floats top-right in dev only.
  return <Leva collapsed />;
}
