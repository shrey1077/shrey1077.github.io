"use client";

/**
 * SectionParticles — a drifting particle field over the LOGIC rooms' ground.
 *
 * Originkit's Particle Drift, supplied by the owner on 2026-08-25 to sit over
 * the left-side sections' existing background "so that previous bg is slightly
 * visible". The vendored component is
 * src/components/originkit/ParticleDrift.tsx and is kept as-supplied; every
 * site decision lives here.
 *
 * ⚠ `background` IS TRANSPARENT, and that is the whole point. The component
 * paints its own ground by default (#030509, near-black) which would COVER the
 * circuit-board poster and the scrim underneath it — exactly what the brief
 * asks not to happen. Passing "transparent" leaves only the dots and the lines,
 * so the existing ground reads straight through the field. The canvas itself
 * already clears to a transparent colour, so nothing else had to change.
 *
 * ⚠ The layer is ALSO held at reduced opacity. Transparent background alone
 * still gives a fairly assertive white constellation over a dark room; the
 * brief is "slightly visible", meaning the ground should keep the upper hand.
 * PARTICLE_OPACITY is the one number to turn if it wants to be stronger.
 *
 * ⚠ WHITE, NOT YELLOW — the owner's instruction. Both `baseColor` and
 * `accentColor` are white now. The two are not redundant: `accentColor` is what
 * a dot mixes toward when the pointer is near it, and the shader ALSO ramps
 * alpha (0.4 at rest to 1.0 lit), so the pointer still reads as a brightening
 * even with no hue difference between the two.
 *
 * ⚠ LOGIC ROOMS ONLY. The creative rooms run the paint film at full strength
 * with no scrim, and a white particle field over thrown paint reads as dirt on
 * the lens. SectionPanel only mounts this on the logic branch.
 *
 * ⚠ IT IS UNMOUNTED WITH THE PANEL, which matters more than it looks: the
 * component runs an unconditional requestAnimationFrame loop AND an O(n²)
 * proximity pass over its particles every frame. Living inside the panel's own
 * conditional means it only runs while a logic room is actually open, rather
 * than for the life of the page.
 *
 * ⚠ Reduced motion renders nothing — it is a drifting field with no meaningful
 * still state, and it is decoration.
 */

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

/** Client-only: it reaches for `window.devicePixelRatio` and a WebGL context on
 *  its first effect, and there is nothing to server-render — it is a canvas. */
const ParticleDrift = dynamic(() => import("@/components/originkit/ParticleDrift"), {
  ssr: false,
});

/** How far the field is held back so the circuit ground still leads. */
const PARTICLE_OPACITY = 0.45;

export function SectionParticles() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity: PARTICLE_OPACITY }}
    >
      <ParticleDrift
        background="transparent"
        baseColor="#FFFFFF"
        accentColor="#FFFFFF"
      />
    </div>
  );
}
