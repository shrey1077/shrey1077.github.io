/**
 * brainMotion — the shared per-frame modulation channel of the Brain OS.
 *
 * A mutable singleton read and written ONLY inside `useFrame` callbacks (and
 * by event emitters). It lets independent systems compose motion on the same
 * objects without React state and without fighting each other:
 *
 *   • BrainAnimation writes `breathe` (the idle respiration).
 *   • Neuron events / transitions call `triggerPulse()`.
 *   • useBrainInteraction reads both and composes the final scale:
 *         base × (1 + hoverPulse) × (1 + breathe) × (1 + eventPulseEnvelope)
 *   • Lighting reads `lastPulse` for its brightness envelope.
 *
 * Everything here is plain numbers — no allocations in the hot path.
 */

import type { Hemisphere } from "@/types/brain";

export const brainMotion = {
  /** Idle respiration, ±~0.004. Written by BrainAnimation each frame. */
  breathe: 0,
  /** Timestamp (performance.now ms) of the last requested pulse, else -1. */
  lastPulseAt: -1,
  /** Which side asked for it (tints nothing yet — future use). */
  lastPulseSide: null as Hemisphere | null,
  /** Strength multiplier of the last pulse (1 = nav-hover sized). */
  lastPulseStrength: 1,
};

/** Ask the sculpture (and lights) to pulse. Safe to call from anywhere. */
export function triggerPulse(side: Hemisphere | null, strength = 1): void {
  brainMotion.lastPulseAt =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  brainMotion.lastPulseSide = side;
  brainMotion.lastPulseStrength = strength;
}

/**
 * The shared pulse envelope: a decaying sine starting at `lastPulseAt`.
 * Returns 0 outside the window. `now` in ms (performance.now clock).
 */
export function pulseEnvelope(now: number): number {
  if (brainMotion.lastPulseAt < 0) return 0;
  const t = (now - brainMotion.lastPulseAt) / 1000;
  if (t < 0 || t > 1.4) return 0;
  return Math.exp(-t * 4.2) * Math.sin(t * 12) * brainMotion.lastPulseStrength;
}
