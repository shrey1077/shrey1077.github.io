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
 * ⚠ DARK GREY since 2026-10-05, when the logic rooms took the landing's white
 * ground (owner: "color of falling nodes and lines will be dark grey"). White,
 * not yellow, before that, over the dark circuit board. `accentColor` is what
 * a dot mixes toward when the pointer is near it — a shade darker — and the
 * shader ALSO ramps alpha (0.4 at rest to 1.0 lit), so the pointer still
 * reads as a darkening.
 *
 * ⚠ LOGIC ROOMS ONLY. The creative rooms run the paint film at full strength
 * with no scrim, and a white particle field over thrown paint reads as dirt on
 * the lens. Flythrough mounts this on the logic ground only.
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

/** How far the field is held back so the ground still leads. A touch more than
 *  the 0.45 it was over the dark board: grey on white carries less. */
const PARTICLE_OPACITY = 0.6;
/** The field's greys (neutral-600, and neutral-800 near the pointer). */
const NODE = "#525252";
/** How many nodes fall: HALF the component's own 400 since 2026-10-15
 *  (owner: "reduce amount of nodes to half"). The lines between them follow,
 *  being drawn between whichever nodes are near each other. */
const DENSITY = 200;
const NODE_LIT = "#262626";

/** `active`: the logic track can be seen. Set up ahead of need and kept
 *  (Flythrough's groundsReady), the field only RUNS while active — its loop
 *  held still otherwise (ParticleDrift's change 4). Until 2026-10-15 it ran
 *  for the life of the page once set up, unseen, on every screen. */
export function SectionParticles({ active = true }: { active?: boolean } = {}) {
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
        baseColor={NODE}
        accentColor={NODE_LIT}
        density={DENSITY}
        paused={!active}
      />
    </div>
  );
}
