"use client";

/**
 * ExperienceTransition — the arrival/departure wrapper for experience pages
 * (the memory-transition architecture, docs/INTERACTIONS.md).
 *
 * PHILOSOPHY: the homepage is the designer's mind; each client is a memory
 * stored in it. Entering a client should eventually feel like entering a
 * memory, not loading a webpage. This component is where that choreography
 * will live — coordinating MemoryOverlay (the veil) and BrainConnection (the
 * thread back to the hemisphere) around route changes.
 *
 * TODAY: a calm settle on mount (fade + small rise), honoring reduced motion.
 * FUTURE: a staged enter/exit sequence (veil in → content settle → veil out),
 * driven by `animationState` in the scene store. The wrapper's API will not
 * change — pages already render inside it.
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";

interface ExperienceTransitionProps {
  children: React.ReactNode;
}

export function ExperienceTransition({ children }: ExperienceTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.settle, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
