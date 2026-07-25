"use client";

/**
 * LandingLabels — the two doors on the landing.
 *
 * The bottom band of the first load is split in half: "Designer" on the left,
 * "Artist" on the right. Each is the entrance to its hemisphere, and each sits
 * exactly above where that side's section panels will rise, so the label reads
 * as the heading for everything underneath it.
 *
 * Leaves the moment a side is chosen (the parent unmounts it via
 * AnimatePresence).
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { useSceneStore } from "@/state/useSceneStore";

export function LandingLabels() {
  const reduceMotion = useReducedMotion();
  const setHeroPose = useSceneStore((s) => s.setHeroPose);

  return (
    <motion.div
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, transition: { duration: DURATION.fast, ease: EASE_OUT } }}
      className="absolute inset-x-0 bottom-0 z-20 flex h-[7%] min-h-[3.25rem] items-stretch"
    >
      {/* LEFT — the designer's door. */}
      <button
        type="button"
        onClick={() => setHeroPose("logic")}
        className="group relative w-1/2 overflow-hidden border-t border-neutral-200 bg-gallery/70 outline-none backdrop-blur-[2px] transition-colors duration-500 hover:bg-neutral-900 focus-visible:bg-neutral-900"
      >
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 1.3 }}
          className={`${typeVoiceClass("logic", "display")} flex h-full items-center justify-center text-[clamp(0.95rem,1.9vw,1.7rem)] font-medium tracking-[0.08em] text-neutral-900 transition-colors duration-500 group-hover:text-white group-focus-visible:text-white`}
        >
          Designer
        </motion.span>
      </button>

      {/* RIGHT — the artist's door. */}
      <button
        type="button"
        onClick={() => setHeroPose("creative")}
        className="group relative w-1/2 overflow-hidden border-l border-t border-neutral-200 bg-gallery/70 outline-none backdrop-blur-[2px] transition-colors duration-500 focus-visible:bg-neutral-950"
      >
        <span
          aria-hidden
          className="brain-paint absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 1.45 }}
          className="font-brush-brand relative flex h-full items-center justify-center text-[clamp(1.1rem,2.2vw,2rem)] text-neutral-900 transition-colors duration-500 group-hover:text-white group-focus-visible:text-white"
        >
          Artist
        </motion.span>
      </button>
    </motion.div>
  );
}
