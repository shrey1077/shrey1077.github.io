"use client";

/**
 * HobbiesRotator — the lower-right "hobbies" rotator (Phase 4).
 *
 * The creative-side mirror of AboutFacts: a "Hobbies" heading with the pursuits
 * cycling one at a time beneath it. Sits just above "Artist"; right-aligned to
 * mirror the logic side. Extendable — add to HOBBIES. Reduced motion holds the
 * first item.
 *
 * ⚠ The type is deliberately the SAME as AboutFacts across the stage: heading
 * `font-graff` extra-bold at 34px, body `font-graff` in neutral-500. This
 * corner used to run the default system sans at semi-bold, which read as a
 * different family from the logic corner it is supposed to mirror. Only the
 * FAMILY and WEIGHT were unified — both corners already shared their colours
 * (neutral-800 heading, neutral-500 body), and the body sizes still differ
 * (15px left, 22px right) because this side shows one word at a time.
 *
 * Every hobby carries a `mark`, drawn to the LEFT of the word: the column is
 * right-aligned, so leading with the mark keeps the right edge flush.
 *
 * ⚠ The line box is a fixed `h-[30px]` and must stay that way. HeroName reads
 * this corner's `getBoundingClientRect` to clamp Imagine's descender above it,
 * and it re-measures on resize and two timers — NOT on an observer. A box that
 * changed height as the rotator cycled would silently leave that clamp stale.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import {
  ArtsMark,
  CalligraphyMark,
  CraftsMark,
  PaintingMark,
  PhotographyMark,
  PickleballMark,
  SketchingMark,
} from "@/components/home/HomeMarks";

interface Hobby {
  label: string;
  mark: React.ReactNode;
}

const HOBBIES: Hobby[] = [
  { label: "Arts", mark: <ArtsMark /> },
  { label: "Painting", mark: <PaintingMark /> },
  { label: "Sketching", mark: <SketchingMark /> },
  { label: "Calligraphy", mark: <CalligraphyMark /> },
  { label: "Crafts & Installations", mark: <CraftsMark /> },
  { label: "Photography", mark: <PhotographyMark /> },
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
      <h3 className="font-graff text-[34px] font-extrabold leading-tight tracking-[-0.01em] text-neutral-800">
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
            // free before the mark existed. `truncate` on the label is the
            // one-line guarantee — every hobby is a single word or two, but the
            // column narrows with the viewport and nothing here may wrap.
            className="font-graff flex items-center justify-end gap-2 text-[22px] leading-[1.4] text-neutral-500"
          >
            {hobby.mark}
            <span className="truncate">{hobby.label}</span>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
