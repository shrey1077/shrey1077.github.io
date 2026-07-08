"use client";

/**
 * BrainConnection — the visual thread between a chosen memory and the mind
 * (memory-transition architecture, alive since Phase 3B).
 *
 * A single hairline SVG stroke drawn from the selected memory (the clicked
 * card) back toward the brain — the nav's rule-and-dot language leaving the
 * page grid and traveling home. It renders in a fixed, pointer-transparent
 * overlay on the `overlay` z-level and draws itself once when mounted; the
 * orchestrator (MemoryTransitionHost) owns its lifetime.
 *
 * If the brain is off-screen (the visitor scrolled to the sheet) or on another
 * page, the thread exits the viewport toward it — the mind is always "above".
 */

import { motion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";

export interface BrainConnectionProps {
  /** Where the thread begins (the chosen memory), viewport px. */
  from: { x: number; y: number };
  /** Where it travels (the brain / the mind), viewport px — may be off-screen. */
  to: { x: number; y: number };
  /** Seconds the draw takes. */
  duration?: number;
}

export function BrainConnection({ from, to, duration = 0.5 }: BrainConnectionProps) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: Z_INDEX.overlay }}
    >
      {/* The dot terminal at the memory end — the line language's period. */}
      <motion.circle
        cx={from.x}
        cy={from.y}
        r={2.5}
        fill="#262626"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#525252"
        strokeWidth={1}
        initial={{ pathLength: 0, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration, ease: EASE_OUT }}
      />
    </svg>
  );
}
