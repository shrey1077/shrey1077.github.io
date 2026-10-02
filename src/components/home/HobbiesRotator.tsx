"use client";

/**
 * HobbyWords — the hobbies, one at a time, each with its own mark.
 *
 * Was HobbiesRotator: a whole "Hobbies" block of its own, in the landing's
 * lower-right corner and later the footer. On 2026-10-03 the owner asked for
 * Chess, Education, Part-time and Hobbies to be ONE section at the landing's
 * bottom right, so the heading went to AboutFacts (which now cycles Hobbies as
 * its fourth fact) and this is just the cycling line under it.
 *
 * Every hobby carries a `mark` drawn to the LEFT of the word, so in a
 * right-aligned column the right edge stays flush. Extendable — add to
 * HOBBIES. Reduced motion holds the first item.
 *
 * ⚠ The line box is a fixed `h-[30px]`: a box that changed height as the words
 * cycled would make the whole section jump.
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

export function HobbyWords({ align = "right" }: { align?: "left" | "right" | "center" }) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((v) => v + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const hobby = HOBBIES[i % HOBBIES.length];

  return (
    <div className="h-[30px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={hobby.label}
          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          // `truncate` on the label is the one-line guarantee — the column
          // narrows with the viewport and nothing here may wrap.
          className={`font-graff flex items-center gap-2 text-[22px] leading-[1.4] text-neutral-500 ${
            align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
          }`}
        >
          {hobby.mark}
          <span className="truncate">{hobby.label}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
