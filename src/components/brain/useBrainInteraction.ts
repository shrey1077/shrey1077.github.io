/**
 * Per-frame brain interaction: mouse rotation + nav-hover acknowledgment +
 * the Phase 3B "alive" layer (hover pulse, scroll awakening).
 *
 * Performance contract (see docs/BRAIN_SYSTEM.md): this runs every frame, so
 * it must not trigger React re-renders. It therefore:
 *   • reads R3F's built-in `state.pointer` (normalized NDC, updated internally),
 *   • reads dev overrides + the hovered nav target via `getState()` snapshots
 *     (NOT subscriptions),
 *   • reads `window.scrollY` directly (no listener), and
 *   • writes rotation AND scale straight onto the group via the ref.
 *
 * Nothing here calls `setState`. The result:
 *   – heavy, damped rotation clamped to ±10° from the mouse;
 *   – a subtle lean toward a hovered nav hemisphere (+ slight nod);
 *   – a TINY damped pulse (≤0.7% scale, decaying sine) when a new thought is
 *     hovered — the brain registering attention;
 *   – a TINY awakening tilt (≤2.5°) as scrolling begins — the mind noticing
 *     the visitor moving deeper. Alive, not animated.
 */

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { Group } from "three";
import { BRAIN_NAV_HOVER, BRAIN_ROTATION } from "@/constants/brain";
import { useDebugStore } from "@/state/useDebugStore";
import { useSceneStore } from "@/state/useSceneStore";
import { brainMotion, pulseEnvelope } from "@/systems/brainMotion";
import { clamp, damp, degToRad } from "@/utils/math";

/** Clamp per-frame delta so returning to a backgrounded tab doesn't snap the
 *  brain across a huge time step. */
const MAX_FRAME_DELTA = 1 / 30;

/** The alive layer's amplitudes — deliberately tiny. */
const ALIVE = {
  /** Peak of the hover pulse (fraction of scale). */
  pulseAmplitude: 0.007,
  pulseDecay: 4.2,
  pulseFrequency: 12,
  /** Awakening tilt as the visitor begins scrolling (radians via degToRad). */
  awakenTiltDeg: -2.5,
  /** How much of a viewport of scroll completes the awakening. */
  awakenScrollFraction: 0.6,
} as const;

export function useBrainInteraction(
  groupRef: RefObject<Group | null>,
  baseScale: number,
): void {
  // The frame loop reads the latest base scale through a ref (no re-binding).
  const baseScaleRef = useRef(baseScale);
  useEffect(() => {
    baseScaleRef.current = baseScale;
  }, [baseScale]);

  // Pulse bookkeeping — refs only, never state.
  const lastHoverId = useRef<string | null>(null);
  const pulseStart = useRef(-1);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const debug = useDebugStore.getState();
    const hoveredNav = useSceneStore.getState().hoveredNav;
    const dt = Math.min(delta, MAX_FRAME_DELTA);
    const { maxAngleRad, dampingLambda, pointerInfluence } = BRAIN_ROTATION;

    // Resting target (0,0) unless the mouse is driving the rotation.
    let targetX = 0;
    let targetY = 0;

    if (debug.mouseRotationEnabled) {
      targetX = clamp(
        -state.pointer.y * pointerInfluence.x * maxAngleRad,
        -maxAngleRad,
        maxAngleRad,
      );
      targetY = clamp(
        state.pointer.x * pointerInfluence.y * maxAngleRad,
        -maxAngleRad,
        maxAngleRad,
      );
    }

    // Acknowledgment lean toward a hovered nav hemisphere.
    if (hoveredNav) {
      const direction = hoveredNav.hemisphere === "left" ? -1 : 1;
      targetY += direction * BRAIN_NAV_HOVER.leanAngleRad;
      targetX += BRAIN_NAV_HOVER.nodAngleRad;
    }

    // Awakening: as the visitor starts moving toward the sheet, the brain
    // lifts its chin a couple of degrees. Damped like everything else.
    if (typeof window !== "undefined") {
      const awaken = clamp(
        window.scrollY / (window.innerHeight * ALIVE.awakenScrollFraction),
        0,
        1,
      );
      targetX += awaken * degToRad(ALIVE.awakenTiltDeg);
    }

    // Constant developer offsets (0 in production) layered on top.
    targetX += degToRad(debug.rotationOffsetXDeg);
    targetY += degToRad(debug.rotationOffsetYDeg);

    // Frame-rate-independent easing → the "heavy" feel, never a snap.
    group.rotation.x = damp(group.rotation.x, targetX, dampingLambda, dt);
    group.rotation.y = damp(group.rotation.y, targetY, dampingLambda, dt);

    // Hover pulse: when attention lands on a NEW thought, a decaying sine
    // breathes through the scale — barely perceptible, definitely felt.
    const hoverId = hoveredNav?.id ?? null;
    if (hoverId && hoverId !== lastHoverId.current) {
      pulseStart.current = state.clock.elapsedTime;
    }
    lastHoverId.current = hoverId;

    let hoverPulse = 0;
    if (pulseStart.current >= 0) {
      const t = state.clock.elapsedTime - pulseStart.current;
      if (t > 1.4) {
        pulseStart.current = -1;
      } else {
        hoverPulse =
          Math.exp(-t * ALIVE.pulseDecay) *
          Math.sin(t * ALIVE.pulseFrequency) *
          ALIVE.pulseAmplitude;
      }
    }

    // Compose every motion channel onto the one shared scale (docs/BRAIN_SYSTEM):
    //   base × hover pulse × idle breathe × neuron/transition event pulse.
    // The event pulse (brainMotion) is scaled down to ALIVE-pulse amplitude so
    // a neuron firing breathes the sculpture at the same gentle magnitude as a
    // nav hover.
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const eventPulse = pulseEnvelope(now) * ALIVE.pulseAmplitude;
    const modulation =
      (1 + Math.max(0, hoverPulse)) *
      (1 + brainMotion.breathe) *
      (1 + Math.max(0, eventPulse));
    group.scale.setScalar(baseScaleRef.current * modulation);
  });
}
