"use client";

/**
 * ThoughtBox — the right brain, thinking out loud (Phase 4, volatile).
 *
 * Replaces the poetry window. One thought at a time, on a 15s window:
 *   • entry  — the line is written on quickly in a hand voice, then settles to
 *              set type (sans) once written;
 *   • hold   — it sits in sans;
 *   • exit   — it strikes through and fades, as if the right brain forgot it.
 *
 * Each thought is a fresh <ThoughtLine> (keyed), so its little state machine
 * resets cleanly. Right-aligned to mirror the logic side. Decorative. Reduced
 * motion holds the current thought in sans with no writing/forgetting.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const THOUGHTS = [
  "watching Lord of the Rings, The Dark Knight, films like those",
  "painting landscapes — imaginary worlds and space",
  "sketching birds into my small birdbook",
  "a Claude-and-coffee session",
  "chess moves that were never played",
  "AI characters for The Extincts Project, and writing the story",
  "products that could solve a wider purpose",
  "playing pickleball in a ping-pong style",
];

const TYPE_MS = 42;
const EXIT_AT = 12000;
const WINDOW = 15000;

function ThoughtLine({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const [wp, setWp] = useState(0);
  const [phase, setPhase] = useState<"writing" | "typed" | "exiting">("writing");

  useEffect(() => {
    if (reduceMotion) return;
    let ci = 0;
    const typeId = window.setInterval(() => {
      ci += 1;
      setWp(ci);
      if (ci >= text.length) {
        window.clearInterval(typeId);
        setPhase("typed");
      }
    }, TYPE_MS);
    const exitId = window.setTimeout(() => setPhase("exiting"), EXIT_AT);
    return () => {
      window.clearInterval(typeId);
      window.clearTimeout(exitId);
    };
  }, [reduceMotion, text.length]);

  const writing = !reduceMotion && phase === "writing";
  const exiting = !reduceMotion && phase === "exiting";

  return (
    <motion.div
      className="text-right"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 1.6 : 0.4, ease: EASE_OUT }}
    >
      <div className="relative inline-block">
        <span
          className={`${writing ? "font-hand-brand" : "font-sans"} text-[clamp(1rem,1.6vw,1.4rem)] leading-snug text-neutral-600`}
        >
          {writing ? text.slice(0, wp) || " " : text}
        </span>
        {exiting && (
          <motion.span
            aria-hidden
            className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-neutral-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          />
        )}
      </div>
    </motion.div>
  );
}

export function ThoughtBox() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => v + 1), WINDOW);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div aria-hidden className="w-[min(26vw,20rem)] text-right">
      <div className="mb-2 flex items-center justify-end gap-1.5 font-mono-brand text-[0.5rem] tracking-[0.15em] text-neutral-300">
        <span>right brain — thinking</span>
        <span className="size-1.5 rounded-full bg-neutral-300" />
      </div>
      <ThoughtLine key={i} text={THOUGHTS[i % THOUGHTS.length]} />
    </div>
  );
}
