"use client";

/**
 * Lighting — a soft three-point studio rig plus a grounded contact shadow.
 *
 * Modeled on premium product photography: a dominant warm key, a gentler fill,
 * and a slightly cool rim to lift the silhouette off the pure-white background.
 * Combined with the HDRI environment (SceneEnvironment), this gives clean,
 * photographic shading without harsh cast shadows. Real-time shadow maps stay
 * off — the high-res `<ContactShadows>` does the grounding (see
 * docs/BRAIN_SYSTEM.md for that trade-off).
 *
 * ALIVE LAYER (Phase 3B): the key and rim respond per-frame — a ~7% breath
 * when a nav thought is hovered, and the rim lifting slightly as the visitor
 * scrolls. Ref-driven inside `useFrame` with `getState()` snapshots (the
 * hot-path contract): the declarative props set the first frame; the frame
 * loop owns intensity from then on. Ambient and fill stay purely reactive.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { DirectionalLight } from "three";
import { ContactShadows } from "@react-three/drei";
import { CONTACT_SHADOW, LIGHTING } from "@/constants/scene";
import { useDebugStore } from "@/state/useDebugStore";
import { useSceneStore } from "@/state/useSceneStore";
import { pulseEnvelope } from "@/systems/brainMotion";
import { clamp, damp } from "@/utils/math";

/** Alive-layer amplitudes — whispers, not effects. */
const RESPONSE = {
  keyHoverBoost: 1.07,
  rimHoverBoost: 1.05,
  /** Extra rim intensity added across the first stretch of scroll. */
  rimScrollLift: 0.22,
  /** Idle flicker amplitude (fraction) — the room is never perfectly constant. */
  driftAmount: 0.02,
  /** Extra brightness at a neuron/transition pulse peak (fraction). */
  pulseBoost: 0.12,
  /** Damping rate for light responses (feels like a dimmer, not a switch). */
  lambda: 3.2,
} as const;

export function Lighting() {
  const lightIntensity = useDebugStore((state) => state.lightIntensity);
  const shadowOpacity = useDebugStore((state) => state.shadowOpacity);

  const keyRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const debug = useDebugStore.getState();
    const hovered = useSceneStore.getState().hoveredNav !== null;
    const scroll =
      typeof window !== "undefined"
        ? clamp(window.scrollY / (window.innerHeight * 0.6), 0, 1)
        : 0;

    // Idle drift: a slow, barely-there flicker so the museum light is never
    // perfectly constant (two detuned sines → no obvious loop).
    const t = state.clock.elapsedTime;
    const drift =
      1 +
      RESPONSE.driftAmount *
        (0.6 * Math.sin(t * 0.19) + 0.4 * Math.sin(t * 0.131 + 2.1));

    // A neuron firing / transition brightens the room for a beat.
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const eventLift = 1 + Math.max(0, pulseEnvelope(now)) * RESPONSE.pulseBoost;

    const keyTarget =
      LIGHTING.key.intensity *
      debug.lightIntensity *
      drift *
      eventLift *
      (hovered ? RESPONSE.keyHoverBoost : 1);
    const rimTarget =
      LIGHTING.rim.intensity *
        debug.lightIntensity *
        drift *
        eventLift *
        (hovered ? RESPONSE.rimHoverBoost : 1) +
      scroll * RESPONSE.rimScrollLift;

    if (keyRef.current) {
      keyRef.current.intensity = damp(keyRef.current.intensity, keyTarget, RESPONSE.lambda, dt);
    }
    if (rimRef.current) {
      rimRef.current.intensity = damp(rimRef.current.intensity, rimTarget, RESPONSE.lambda, dt);
    }
  });

  return (
    <>
      {/* Base ambient so shadow-side detail never crushes to black. */}
      <ambientLight intensity={LIGHTING.ambientIntensity * lightIntensity} />

      {/* Key — primary shaper, high and camera-left, near-white warm.
          Intensity owned by the frame loop after the first frame. */}
      <directionalLight
        ref={keyRef}
        position={LIGHTING.key.position}
        intensity={LIGHTING.key.intensity * lightIntensity}
        color={LIGHTING.key.color}
      />

      {/* Fill — softens the key's shadows from the opposite side. */}
      <directionalLight
        position={LIGHTING.fill.position}
        intensity={LIGHTING.fill.intensity * lightIntensity}
        color={LIGHTING.fill.color}
      />

      {/* Rim — separates the silhouette from white, slightly cool vs the key. */}
      <directionalLight
        ref={rimRef}
        position={LIGHTING.rim.position}
        intensity={LIGHTING.rim.intensity * lightIntensity}
        color={LIGHTING.rim.color}
      />

      {/* Soft grounding shadow beneath the brain. */}
      <ContactShadows
        position={[0, CONTACT_SHADOW.positionY, 0]}
        opacity={shadowOpacity}
        blur={CONTACT_SHADOW.blur}
        far={CONTACT_SHADOW.far}
        scale={CONTACT_SHADOW.scale}
        resolution={CONTACT_SHADOW.resolution}
        color="#000000"
        frames={1}
      />
    </>
  );
}
