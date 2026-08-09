"use client";

/**
 * HobbiesRotator — the lower-right "hobbies" rotator (Phase 4).
 *
 * The creative-side mirror of AboutFacts: a "Hobbies" heading with the pursuits
 * cycling one at a time beneath it. Sits just above "Artist"; right-aligned to
 * mirror the logic side. Extendable — add to HOBBIES. Reduced motion holds the
 * first item.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const HOBBIES = [
  "Arts",
  "Painting",
  "Sketching",
  "Calligraphy",
  "Crafts & Installations",
  "Photography",
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

  const word = HOBBIES[i % HOBBIES.length];

  return (
    <div className="w-[min(32vw,28rem)] text-right">
      <h3 className="text-[34px] font-semibold leading-tight tracking-[-0.01em] text-neutral-800">
        Hobbies
      </h3>
      <div className="mt-1 h-[30px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={word}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="block text-[22px] leading-[1.4] text-neutral-500"
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
