"use client";

/**
 * MemoryOverlay — the transition veil (memory-transition architecture).
 *
 * A full-viewport white layer that future phases fade up during the "memory
 * dive" (homepage → client) so the journey reads as slipping into a memory
 * rather than a route change. ExperienceTransition will orchestrate it; the
 * component itself only knows how to be a veil.
 *
 * Inert by default: when `active` is false it renders nothing (zero cost).
 * Always pointer-events-none — a veil, never a wall.
 */

import { AnimatePresence, motion } from "framer-motion";
import { DURATION, EASE_GENTLE } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";

interface MemoryOverlayProps {
  /** Whether the veil is up. Driven by the future transition orchestrator. */
  active: boolean;
}

export function MemoryOverlay({ active }: MemoryOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.medium, ease: EASE_GENTLE }}
          className="pointer-events-none fixed inset-0 bg-gallery"
          style={{ zIndex: Z_INDEX.overlay }}
        />
      )}
    </AnimatePresence>
  );
}
