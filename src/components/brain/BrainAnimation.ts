/**
 * BrainAnimation — the brain's autonomous-motion subsystem (BrainCore idle).
 *
 * Interaction (useBrainInteraction) covers everything the brain does in
 * RESPONSE to the visitor. This hook is the brain moving on its OWN — the
 * respiration that makes the sculpture feel alive rather than paused
 * (docs/BRAIN_SYSTEM.md → Brain Core).
 *
 * Since Phase 4 it writes a slow, layered "breathe" value into the shared
 * `brainMotion` channel (two detuned sines → never an obvious loop). The
 * interaction hook reads it and folds it into the group's scale, so breathing
 * and hover/pulse compose on one object without fighting. A whisper of yaw
 * drift is written straight to the group so the idle brain is never perfectly
 * still — every frame is slightly different.
 *
 * Hot-path rules hold: no React state, `getState()`/singleton reads only, ref
 * mutation only.
 */

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { Group } from "three";
import { brainMotion } from "@/systems/brainMotion";

/** Respiration amplitude (fraction of scale) and rates. Deliberately tiny. */
const BREATHE = {
  amplitude: 0.004,
  /** Two detuned rates (Hz-ish) so the sum never repeats obviously. */
  rateA: 0.2,
  rateB: 0.147,
  /** Idle yaw drift, radians. */
  driftYaw: 0.012,
  driftRate: 0.08,
} as const;

export function useBrainAnimation(groupRef: RefObject<Group | null>): void {
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Respiration → shared channel (interaction hook applies it to scale).
    brainMotion.breathe =
      BREATHE.amplitude *
      (0.6 * Math.sin(t * Math.PI * 2 * BREATHE.rateA) +
        0.4 * Math.sin(t * Math.PI * 2 * BREATHE.rateB + 1.3));

    // Whisper of idle yaw drift — added to whatever rotation the interaction
    // hook set this frame, so the brain is never dead-still. (Interaction runs
    // in its own useFrame; order is stable within a frame, and the drift is
    // small enough that composition order doesn't matter perceptually.)
    const group = groupRef.current;
    if (group) {
      group.rotation.y += Math.sin(t * Math.PI * 2 * BREATHE.driftRate) * BREATHE.driftYaw * 0.0016;
    }
  });
}
