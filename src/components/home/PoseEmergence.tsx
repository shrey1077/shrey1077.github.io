"use client";

/**
 * PoseEmergence — what spills out of a section when you choose a side.
 *
 * Entering the logic side, black circuit traces run OUT of the graphite panel
 * and away to the left, the way the footage's logic hemisphere trails schematics
 * and equations. Entering the creative side, paint splatter blooms out to the
 * right, the way the painted hemisphere throws colour.
 *
 * Decorative and pointer-inert; it plays once on entry, then settles. Nothing
 * animates under reduced motion.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import type { HeroPose } from "@/types/scene";

/** Stepped traces — the schematic vocabulary of the footage's logic side. */
const TRACES = [
  "M300 20 H180 V52 H96 V84 H24",
  "M300 62 H236 V96 H150 V128 H60",
  "M300 104 H206 V70 H130 V38 H40",
  "M300 146 H244 V176 H140 V150 H36",
  "M300 188 H196 V214 H108 V186 H20",
];
const NODES = [
  [96, 52], [150, 128], [130, 38], [140, 176], [108, 214], [24, 84], [60, 128], [40, 38],
];

/** Splatter blooms — radius, offset and hue per blob. */
const BLOBS = [
  { cx: 40, cy: 60, r: 34, fill: "#ff2e8b", d: 0 },
  { cx: 112, cy: 34, r: 22, fill: "#ff8a00", d: 0.08 },
  { cx: 96, cy: 120, r: 27, fill: "#00a6a6", d: 0.14 },
  { cx: 178, cy: 82, r: 18, fill: "#7a3fb0", d: 0.2 },
  { cx: 208, cy: 158, r: 24, fill: "#3f6ad8", d: 0.26 },
  { cx: 150, cy: 196, r: 15, fill: "#f5c518", d: 0.32 },
  { cx: 254, cy: 46, r: 13, fill: "#ff5a3c", d: 0.38 },
  { cx: 262, cy: 122, r: 9, fill: "#7fbf2e", d: 0.44 },
];

export function PoseEmergence({ pose }: { pose: HeroPose }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {pose === "logic" && (
        <motion.svg
          key="traces"
          aria-hidden
          viewBox="0 0 300 234"
          preserveAspectRatio="xMaxYMid meet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          // Anchored to the panel's top-left, running away from it.
          className="pointer-events-none absolute bottom-1/2 left-0 z-10 h-[22vh] w-[38vw] max-w-[520px]"
        >
          {TRACES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="#171717"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 + i * 0.09 }}
            />
          ))}
          {NODES.map(([cx, cy], i) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="2.4"
              fill="#171717"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.55 }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.7 + i * 0.05 }}
            />
          ))}
        </motion.svg>
      )}

      {pose === "creative" && (
        <motion.svg
          key="splatter"
          aria-hidden
          viewBox="0 0 300 234"
          preserveAspectRatio="xMinYMid meet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="pointer-events-none absolute bottom-1/2 right-0 z-10 h-[22vh] w-[38vw] max-w-[520px]"
        >
          {BLOBS.map((b) => (
            <motion.circle
              key={`${b.cx}-${b.cy}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={b.fill}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.55 }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.12 + b.d }}
              style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
            />
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
