"use client";

/**
 * NeuronEngine — schedules neuron firings and renders the surfacing thoughts
 * (Phase 4). One neuron per side fires every 5–8s, interleaved so the two
 * hemispheres rarely speak at once (NEURON_CADENCE).
 *
 * On each firing it:
 *   • picks a thought (thoughtEngine — weighted, cooldown, no obvious repeat),
 *   • pulses the sculpture and lifts the light (triggerPulse + brain event),
 *   • mounts a NeuronThought at a seeded position near that hemisphere.
 *
 * The engine only tracks the small set of active firings (React re-renders on
 * fire/finish only, never per frame). Gated by `enabled` (system + in-view) and
 * pauses under reduced motion after an initial beat. See docs/BRAIN_SYSTEM.md.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { Hemisphere } from "@/types/brain";
import { NEURON_CADENCE } from "@/constants/systems";
import { triggerPulse } from "@/systems/brainMotion";
import { emitBrainEvent } from "@/systems/brainEvents";
import { nextThought } from "@/systems/thoughtEngine";
import { NeuronThought, type FiringSpec } from "@/components/flows/NeuronThought";

/** THOUGHT REGION (%, within the hero) — Phase 4.2 pin annotations.
 *
 *  ORIGIN: the firing neuron, on the brain's edge beside the fissure.
 *  LABEL:  far from the brain in the outer white space, in the bands ABOVE or
 *  BELOW the nav pill stacks (pills occupy ~y 34–66% at the margins), so pin
 *  lines and labels never cross the brain artwork, the navigation, the
 *  identity mark, or the wall label. */
const ORIGIN: Record<Hemisphere, { x: [number, number]; y: [number, number] }> = {
  left: { x: [42, 47], y: [36, 54] },
  right: { x: [53, 58], y: [36, 54] },
};
const LABEL_X: Record<Hemisphere, [number, number]> = {
  left: [15, 26],
  right: [74, 84],
};
const LABEL_Y = {
  top: [16, 28] as [number, number],
  bottom: [68, 78] as [number, number],
};

function randBetween([a, b]: [number, number]): number {
  return a + Math.random() * (b - a);
}

export function NeuronEngine({ enabled }: { enabled: boolean }) {
  const reduceMotion = useReducedMotion();
  const [firings, setFirings] = useState<FiringSpec[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (!enabled || reduceMotion) return;

    const timers = new Set<number>();

    const fire = (side: Hemisphere) => {
      const now = performance.now();
      const thought = nextThought(side, now / 1000);
      const origin = ORIGIN[side];
      const band = Math.random() < 0.5 ? LABEL_Y.top : LABEL_Y.bottom;
      const spec: FiringSpec = {
        id: nextId.current++,
        side,
        thought,
        x: randBetween(LABEL_X[side]),
        y: randBetween(band),
        ox: randBetween(origin.x),
        oy: randBetween(origin.y),
        seed: (Math.random() * 0xffffffff) >>> 0,
      };
      triggerPulse(side, 0.9);
      emitBrainEvent("brain:pulse", { side, strength: 0.9 });
      emitBrainEvent("neuron:fire", { side, at: now });
      setFirings((prev) => [...prev, spec]);
    };

    const scheduleSide = (side: Hemisphere, firstDelay: number) => {
      const tick = () => {
        fire(side);
        const gap =
          NEURON_CADENCE.minGapMs +
          Math.random() * (NEURON_CADENCE.maxGapMs - NEURON_CADENCE.minGapMs);
        const t = window.setTimeout(tick, gap);
        timers.add(t);
      };
      const t0 = window.setTimeout(tick, firstDelay);
      timers.add(t0);
    };

    // Interleave: left fires first, right offset by half a cadence.
    scheduleSide("left", 2200);
    scheduleSide("right", 2200 + NEURON_CADENCE.sideOffsetMs);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      setFirings([]);
    };
  }, [enabled, reduceMotion]);

  const handleDone = (id: number) =>
    setFirings((prev) => prev.filter((f) => {
      if (f.id === id) emitBrainEvent("neuron:done", { side: f.side });
      return f.id !== id;
    }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {firings.map((spec) => (
          <NeuronThought key={spec.id} spec={spec} onDone={handleDone} />
        ))}
      </AnimatePresence>
    </div>
  );
}
