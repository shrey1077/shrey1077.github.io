"use client";

/**
 * HobbiesRotator — the lower-right "hobbies" rotator (Phase 4).
 *
 * The creative-side mirror of AboutFacts: a "Hobbies" heading with the pursuits
 * cycling one at a time beneath it. Sits just above "Artist"; right-aligned to
 * mirror the logic side. Extendable — add to HOBBIES. Reduced motion holds the
 * first item.
 *
 * A hobby may carry a `mark`. It is OPTIONAL on purpose, the same way
 * `SECTION_ICONS` is in BrainPins: an entry without one renders as bare type
 * exactly as before, so adding a mark to one pursuit does not oblige the other
 * six to have one. The icon sits to the LEFT of the word — the column is
 * right-aligned, so leading with the mark keeps the right edge flush.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

/** Pickleball — a paddle and a ball, drawn inline.
 *
 *  There is no pickleball artwork on the drives; `chess.png` is the owner's own
 *  supplied file, and nothing comparable exists for this. So this is drawn here,
 *  which is the same road the chess knight took before real art arrived (see
 *  AboutFacts' ChessMark). Swap it for a file the moment one lands.
 *
 *  Black art on transparency, matching ChessMark's treatment — the holes are a
 *  genuinely empty stroke rather than a light fill, so it reads on this corner's
 *  ground without a plate. Sized to the existing 30px line box so the rotator's
 *  height does not change: HeroName measures this corner to clamp Imagine's
 *  descender above it, and growing the box would move the word. */
function PickleballMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 shrink-0 text-neutral-950"
    >
      <g transform="rotate(-20 9 10)">
        <ellipse cx="9" cy="7.5" rx="5" ry="5.8" />
        <rect x="7.4" y="12.5" width="3.2" height="6" rx="1.6" />
      </g>
      {/* The ball clears the paddle's rotated handle by ~1.4 units. It was 0.5
          at cx 18.5 / r 3.9 — the handle's far corner rotates out to x≈13.4,
          and the stroked ball reached back to x≈13.95, which at a 24px render
          is half a pixel of daylight. */}
      <circle
        cx="19"
        cy="18"
        r="3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="17.9" cy="16.9" r="0.5" />
      <circle cx="20.2" cy="17.4" r="0.5" />
      <circle cx="18.9" cy="19.8" r="0.5" />
    </svg>
  );
}

interface Hobby {
  label: string;
  /** Optional mark, drawn ahead of the word. Absent on most. */
  mark?: React.ReactNode;
}

const HOBBIES: Hobby[] = [
  { label: "Arts" },
  { label: "Painting" },
  { label: "Sketching" },
  { label: "Calligraphy" },
  { label: "Crafts & Installations" },
  { label: "Photography" },
  { label: "Pickleball", mark: <PickleballMark /> },
];

const CYCLE_MS = 2200;

export function HobbiesRotator() {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((v) => v + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const hobby = HOBBIES[i % HOBBIES.length];

  return (
    <div className="w-[min(32vw,28rem)] text-right">
      <h3 className="text-[34px] font-semibold leading-tight tracking-[-0.01em] text-neutral-800">
        Hobbies
      </h3>
      <div className="mt-1 h-[30px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={hobby.label}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            // `justify-end` keeps the right edge flush, which `block` gave for
            // free before the mark existed.
            className="flex items-center justify-end gap-2 text-[22px] leading-[1.4] text-neutral-500"
          >
            {hobby.mark}
            <span>{hobby.label}</span>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
