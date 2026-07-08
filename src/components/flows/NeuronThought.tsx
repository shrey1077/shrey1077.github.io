"use client";

/**
 * NeuronThought — one neuron firing surfacing as a PIN-ANNOTATED thought
 * (Phase 4.2, per the reference artwork).
 *
 * A neuron fires on the brain's edge and a thin pin line draws outward to a
 * thought standing in the surrounding white space — like a figure annotation
 * in a technical plate. No ring, no scribble.
 *
 * Pin-line grammar (the brief):
 *   • the first segment leaves the brain at ANY angle (it belongs to the
 *     detailing around the brain),
 *   • every turn after that is a strict 90° — horizontal runs and vertical
 *     drops only, like PCB traces / museum plate leaders.
 *
 * The label runs the Typography Constitution at half scale (handwritten →
 * letter flip → set type), then the instance dissolves (`onDone`). The engine
 * places labels only in the safe white-space bands — never over the brain
 * artwork, the navigation, the identity mark, or the footer. Decorative
 * (aria-hidden); see docs/BRAIN_SYSTEM.md.
 */

import { memo, useState } from "react";
import { motion } from "framer-motion";
import type { Hemisphere } from "@/types/brain";
import type { Thought } from "@/types/thoughts";
import { EASE_OUT } from "@/constants/motion";
import { TypeReveal } from "@/components/typography/TypeReveal";

export interface FiringSpec {
  id: number;
  side: Hemisphere;
  thought: Thought;
  /** Pin end / label anchor (%, within the hero) — in a safe white-space band. */
  x: number;
  y: number;
  /** Pin origin (%, within the hero) — the firing neuron on the brain's edge. */
  ox: number;
  oy: number;
  seed: number;
}

export const NeuronThought = memo(function NeuronThought({
  spec,
  onDone,
}: {
  spec: FiringSpec;
  onDone: (id: number) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const isLeft = spec.side === "left";

  // Pin geometry. Breakout leaves the brain at a shallow diagonal (the
  // any-angle zone), then it's right angles only: horizontal run → vertical
  // drop → a short horizontal tick into the label.
  const dir = isLeft ? -1 : 1;
  const bx = spec.ox + dir * 6.5;
  const by = spec.oy + (((spec.seed % 9) - 4) * 0.7); // seeded, ±2.8%
  const hx = spec.x - dir * 1.8; // vertical drop sits just shy of the label
  const points = `${spec.ox},${spec.oy} ${bx},${by} ${hx},${by} ${hx},${spec.y} ${spec.x},${spec.y}`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* The pin line. Percent-space viewBox; non-scaling stroke keeps it
          hairline-thin regardless of the hero's aspect ratio. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <motion.polyline
          points={points}
          stroke="#52525b"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="miter"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{ duration: 1.05, ease: EASE_OUT }}
        />
      </svg>

      {/* The firing neuron — a dot on the brain's edge. */}
      <motion.span
        className="absolute size-[5px] rounded-full bg-neutral-700"
        style={{
          left: `${spec.ox}%`,
          top: `${spec.oy}%`,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.9 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
      />

      {/* The thought, at the pin's end — half the previous scale, free-standing
          (no ring), aligned away from the line. */}
      <div
        className="absolute"
        style={{ left: `${spec.x}%`, top: `${spec.y}%` }}
      >
        <div
          className={isLeft ? "pr-1.5 text-right" : "pl-1.5 text-left"}
          style={{
            width: "max-content",
            maxWidth: 190,
            transform: isLeft ? "translate(-100%, -50%)" : "translate(0, -50%)",
          }}
        >
          <TypeReveal
            text={spec.thought.text}
            voice="thought"
            variant="label"
            reveal="pipeline"
            delay={0.9}
            finalVoice="plain"
            finalVariant="meta"
            className="text-[0.6rem] leading-snug text-neutral-700"
            finalClassName="text-[0.5rem] uppercase tracking-[0.12em] text-neutral-500"
            onPipelineComplete={() => setFlipped(true)}
          />
        </div>
      </div>

      {/* After the flip, hold briefly, then self-destruct (parent exit fades). */}
      {flipped && (
        <motion.div
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          onAnimationComplete={() => onDone(spec.id)}
        />
      )}
    </motion.div>
  );
});
