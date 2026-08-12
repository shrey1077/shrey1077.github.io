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

/** The knight's pixel dissolve. Chunky on purpose — the mark renders at 36px,
 *  where a fine checker turns to mush. Denser against the mane, thinning out
 *  and upward, so the piece reads as breaking up rather than as a border. */
const DISSOLVE: [number, number][] = [
  [41, 6], [46, 6], [51, 6],
  [41, 11], [51, 11], [56, 11],
  [41, 16], [46, 16], [56, 16],
  [46, 21], [51, 21],
  [41, 26], [51, 26],
  [46, 31],
];

const KNIGHT_NAVY = "#1b4f7a";

/** The knight, DRAWN rather than lifted — same call as the pawn it replaces.
 *  The reference the owner supplied is a Shutterstock comp (id 2731423013,
 *  watermarked, sold with "STRATEGY" lettering); shipping it would need a
 *  licence, and the watermark is not something to edit out. This is an original
 *  silhouette of the same idea — knight, pixel dissolve off the mane — so
 *  nothing licensed ships. If the owner licenses that vector, drop the clean
 *  file in `public/` and swap this whole component for an <Image>.
 *
 *  The eye is a hole rather than a light shape (`evenodd`), so the mark sits on
 *  any ground without carrying a background colour with it. */
function KnightMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="size-9 shrink-0">
      <path
        fill={KNIGHT_NAVY}
        fillRule="evenodd"
        d="M28.6 6.2 L31 12 L34.8 5.8 C38.8 9.6 41.2 15.4 41.6 21.6 L41.6 46 L25.2 46
           C24.6 41.4 23 37.8 20.4 34.8 L16.2 30.8 C13.6 32.2 10.8 31.8 9.8 29.8
           C9 28 10.4 25.8 12.6 24 L18.2 19.4 C21.4 16 24.4 12 26.4 8.8 Z
           M21.6 17.2 L24.6 18.4 L22.4 20.9 L20.2 19.6 Z"
      />
      {/* Collar, plinth, foot. */}
      <path fill={KNIGHT_NAVY} d="M22.5 46.5 H42 L44 51.5 H20.5 Z" />
      <rect fill={KNIGHT_NAVY} x="15" y="53" width="34" height="5" rx="1" />
      <rect fill={KNIGHT_NAVY} x="12" y="59.5" width="40" height="3" rx="1.5" />
      {DISSOLVE.map(([x, y]) => (
        <rect key={`${x}-${y}`} fill={KNIGHT_NAVY} x={x} y={y} width="4.2" height="4.2" />
      ))}
    </svg>
  );
}

const FACTS: { key: string; heading: string; body: React.ReactNode }[] = [
  {
    key: "chess",
    heading: "Chess",
    body: (
      <p className="flex items-center gap-2.5">
        <KnightMark />
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
