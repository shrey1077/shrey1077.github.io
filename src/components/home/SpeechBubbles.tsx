"use client";

/**
 * SpeechBubbles — the creative hemisphere's running commentary.
 *
 * Replaces the plain text that used to sit in the top-right corner. Built to
 * match the hand-drawn collection the client supplied as reference: rough,
 * slightly wobbly outlines that draw themselves on, hold their line, then pop
 * away — a speech bubble with a tail, alternating with a thought cloud and its
 * trailing dots.
 *
 * The reference is an After Effects project, which is not something a web page
 * can run, so the shapes are redrawn as SVG paths and the draw-on is a
 * stroke-dashoffset sweep. That keeps it a few kilobytes of vector instead of a
 * video loop, stays crisp at any size, and lets the text be real text —
 * selectable, translatable, and readable to a screen reader.
 *
 * Wobble is deterministic, not random: the paths are authored with uneven
 * control points. Nothing here calls Math.random, so the server and client
 * render the same thing and hydration stays quiet.
 *
 * ⚠ PARKED, not dead. Unmounted from HeroStage on 2026-08-10 once the paint
 * film went to full strength and the top-right corner became the artwork's.
 * Kept intact — do NOT remove it in a dead-code sweep. Re-mount by putting
 * <SpeechBubbles /> back in HeroStage's furniture block.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

/** How long each bubble holds before the next one draws in. */
const HOLD_MS = 5000;

/** The creative side's asides. Kept short — a bubble is not a paragraph. */
const LINES = [
  "chase the accident",
  "let the spill stay",
  "sketching birds into my small birdbook",
  "painting landscapes — imaginary worlds and space",
  "chaos is honest",
  "just start cutting",
];

/** A speech bubble: rounded blob with a tail bottom-left. Control points are
 *  deliberately uneven so the outline reads as drawn, not generated. */
const SPEECH =
  "M 26 8 C 74 2, 150 3, 214 7 C 262 10, 276 26, 274 52 C 272 78, 268 96, 240 101 " +
  "C 190 108, 120 107, 74 104 L 44 126 L 50 101 C 22 97, 8 84, 9 54 C 10 28, 12 12, 26 8 Z";

/** A thought cloud: scalloped top edge, dots trailing away beneath. */
const THOUGHT =
  "M 44 34 C 40 12, 76 4, 96 16 C 110 -2, 156 -1, 168 16 C 196 8, 224 22, 220 44 " +
  "C 246 50, 248 84, 220 92 C 208 110, 168 112, 150 100 C 128 116, 84 112, 74 94 " +
  "C 46 94, 32 66, 44 34 Z";

const DOTS: [number, number, number][] = [
  [62, 108, 7],
  [48, 124, 4.5],
  [38, 136, 2.8],
];

export function SpeechBubbles() {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % LINES.length), HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  const isThought = i % 2 === 1;
  const line = LINES[i];

  return (
    <div aria-live="polite" className="relative w-[min(24vw,17rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: isThought ? -2 : 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
          transition={{ duration: reduceMotion ? 0.3 : 0.5, ease: EASE_OUT }}
          className="relative"
        >
          <svg viewBox="0 0 284 150" className="w-full overflow-visible" aria-hidden>
            {/* The outline draws itself on, the way the reference does. */}
            <motion.path
              d={isThought ? THOUGHT : SPEECH}
              fill="rgba(255,255,255,0.72)"
              stroke="#1a1a1e"
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.75, ease: EASE_OUT }}
            />
            {isThought &&
              DOTS.map(([cx, cy, r], d) => (
                <motion.circle
                  key={cx}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="rgba(255,255,255,0.72)"
                  stroke="#1a1a1e"
                  strokeWidth={2}
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                    ease: EASE_OUT,
                    delay: reduceMotion ? 0 : 0.65 + d * 0.09,
                  }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
              ))}
          </svg>

          {/* Real text, not a picture of text — inside the bubble's body. */}
          <motion.p
            className="font-helv absolute inset-x-[9%] top-[8%] h-[52%] text-balance text-center text-[0.72rem] leading-snug text-neutral-800"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.55 }}
          >
            <span className="flex h-full items-center justify-center">{line}</span>
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
