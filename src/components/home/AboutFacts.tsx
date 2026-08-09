"use client";

/**
 * AboutFacts — the lower-left "about me" rotator (Phase L1).
 *
 * Four facts, one at a time, each holding ~15s before the next fades in, looped:
 *   Chess     — highest Rapid rating, as the number and nothing else.
 *   Tools     — the software I work in.
 *   Education — the degrees.
 *   Part-time — a small list whose words cycle one by one.
 *
 * Sits just above "Designer", which stays the biggest thing in the corner:
 * headings are 18px, everything under them 10px, quiet neutral tones.
 * Reduced motion holds the first fact.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const FACT_MS = 15000;
const WORD_MS = 1400;

/** Part-time roles — words arrive one at a time, hold, and hand off. Extendable. */
const PART_TIME = ["Reader", "Writer", "Researcher", "Birder", "Gamer"];

function PartTimeWords() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => v + 1), WORD_MS);
    return () => window.clearInterval(id);
  }, []);
  const word = PART_TIME[i % PART_TIME.length];
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="block text-[19px] leading-[1.4] text-neutral-500"
      >
        {word}
      </motion.span>
    </AnimatePresence>
  );
}

const BODY = "text-[19px] leading-[1.4] text-neutral-500";

/** The pawn, drawn rather than lifted: the chess.com app icon is their mark,
 *  and a silhouette in their green reads the same without shipping it. */
function PawnMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-9 shrink-0">
      <path
        fill="#81b64c"
        d="M12 2.2a3.15 3.15 0 0 0-1.86 5.7c-1.2.62-2 1.8-2 3.16h7.72c0-1.36-.8-2.54-2-3.16A3.15 3.15 0 0 0 12 2.2Zm-3.1 10.1c0 2.1-.8 4.05-1.9 5.5h10c-1.1-1.45-1.9-3.4-1.9-5.5H8.9ZM6.1 19.3c-.5.8-.75 1.65-.75 2.5h13.3c0-.85-.25-1.7-.75-2.5H6.1Z"
      />
    </svg>
  );
}

const FACTS: { key: string; heading: string; body: React.ReactNode }[] = [
  {
    key: "chess",
    heading: "Chess",
    body: (
      <p className="flex items-center gap-2.5">
        <PawnMark />
        <span className="text-[34px] font-bold leading-none tracking-tight text-neutral-800">
          1563
        </span>
      </p>
    ),
  },
  {
    key: "tools",
    heading: "Tools",
    body: (
      <p className={BODY}>
        Adobe&nbsp;CC · Claude
        <sub className="text-[13px] text-neutral-400"> +more</sub> · Leonardo&nbsp;AI
      </p>
    ),
  },
  {
    key: "education",
    heading: "Education",
    body: (
      <p className={BODY}>
        B.Tech · M.Des
      </p>
    ),
  },
  {
    key: "parttime",
    heading: "Part-time",
    body: <PartTimeWords />,
  },
];

export function AboutFacts() {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((v) => v + 1), FACT_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const fact = FACTS[i % FACTS.length];

  return (
    <div className="w-[min(32vw,28rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={fact.key}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <h3 className="text-[34px] font-semibold leading-tight tracking-[-0.01em] text-neutral-800">
            {fact.heading}
          </h3>
          <div className="mt-1">{fact.body}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
