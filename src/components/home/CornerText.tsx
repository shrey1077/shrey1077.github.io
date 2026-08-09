"use client";

/**
 * CornerText — a small aphorism that changes every 10s, one per screen corner.
 *
 * Replaces the old drifting "thoughts": the left corners speak in the logic
 * voice (mono), the right corners in the creative voice (brush). Each corner
 * walks its list on its own offset so the four never read in lockstep. The
 * bottom-left corner is set large (≈3× the others) on request.
 *
 * Decorative, pointer-inert. Reduced motion holds the first line.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const LOGIC = [
  "measure twice",
  "grids before decoration",
  "constraints are the brief",
  "hierarchy is kindness",
  "structure first, style after",
];
const CREATIVE = [
  "just start cutting",
  "chaos is honest",
  "chase the accident",
  "let the spill stay",
  "mystery is the feature",
  "a moment is enough",
];

const CYCLE_MS = 10000;
const STRIDE = 7;

type Corner = "tl" | "tr" | "bl" | "br";

const POS: Record<Corner, string> = {
  tl: "left-4 top-3 text-left",
  tr: "right-4 top-3 text-right",
  bl: "left-4 bottom-3 text-left",
  br: "right-4 bottom-3 text-right",
};
const SEED: Record<Corner, number> = { tl: 0, tr: 2, bl: 4, br: 1 };

export function CornerText({ corner }: { corner: Corner }) {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setTick((t) => t + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const left = corner === "tl" || corner === "bl";
  const list = left ? LOGIC : CREATIVE;
  const text = list[(tick * STRIDE + SEED[corner]) % list.length];

  return (
    <div className={`pointer-events-none absolute max-w-[18ch] ${POS[corner]}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className={[
            "block text-[10px] leading-snug",
            left
              ? "font-mono-brand uppercase tracking-[0.14em] text-neutral-400"
              : "font-brush-brand text-neutral-500",
          ].join(" ")}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
