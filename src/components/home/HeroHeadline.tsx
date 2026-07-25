"use client";

/**
 * HeroHeadline — the landing statement (Phase 5 v4).
 *
 * On first load the hero shows NO navigation. Instead the empty flanks around
 * the brain carry a split headline, each half in its hemisphere's voice:
 *
 *   left  (logic)    "THINKS IN SYSTEMS."  — IBM Plex Mono, set type
 *   right (creative) "dreams in colour."   — Fraunces italic; "in colour." is
 *                     painted — the living gradient clipped to the glyphs.
 *
 * Lines enter with masked rises (translateY 110% → 0 behind overflow-hidden),
 * staggered left → right. The whole layer is pointer-events-none;
 * clicks fall through to HeroStage's pose zones. Reduced motion renders
 * everything in place. Parent (HeroStage) unmounts it via AnimatePresence the
 * moment a side is chosen.
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

/** One masked line: the reveal the agency playbook calls a "line rise". */
function MaskedLine({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        initial={reduceMotion ? false : { y: "112%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay }}
        className={`block will-change-transform ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function HeroHeadline() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-label="50% logic, 50% imagination."
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -28, transition: { duration: DURATION.fast, ease: EASE_OUT } }
      }
      className={[
        "pointer-events-none absolute inset-0 z-10",
        // Below lg the flanks vanish (the brain fills the width), so the two
        // halves stack in the hero's lower band instead — same voices, same
        // order, reading top to bottom.
        "flex flex-col items-center justify-end gap-3 px-6 pb-[12vh]",
        // lg+: BrainNavigation's old geometry — a reserved center lane keeps
        // both halves clear of the brain.
        "lg:grid lg:grid-cols-[1fr_minmax(0,42vw)_1fr] lg:items-center lg:justify-normal lg:gap-0 lg:p-0 lg:pb-0",
      ].join(" ")}
    >
      {/* LEFT — the logic voice. The share reads heavy; what it's made of
          reads plain. */}
      <div aria-hidden className="text-center lg:pl-[4vw] lg:text-left">
        <h1
          className={`${typeVoiceClass("logic", "display")} text-[clamp(1.6rem,3.4vw,3.4rem)] leading-[1.04] text-neutral-900`}
        >
          <MaskedLine delay={0.5} className="font-black">50%</MaskedLine>
          <MaskedLine delay={0.62} className="font-normal">logic</MaskedLine>
        </h1>
      </div>

      {/* Center lane — the brain shows through (lg+ only). */}
      <div aria-hidden className="hidden lg:block" />

      {/* RIGHT — the creative voice; the second line is painted. */}
      <div aria-hidden className="text-center lg:pr-[4vw] lg:text-right">
        {/* The painted half speaks in the brush face (true lowercase), so the
            word reads as painted rather than set. */}
        <p className="font-brush-brand text-[clamp(2.2rem,5vw,5.2rem)] leading-[1.02] text-neutral-900">
          <MaskedLine delay={0.86} className="font-black">50%</MaskedLine>
          <MaskedLine
            delay={0.98}
            className="brain-paint bg-clip-text pb-[0.12em] font-normal text-transparent"
          >
            Imagination
          </MaskedLine>
        </p>
      </div>

      {/* The instruction used to live here; the two labelled doors
          (LandingLabels) now say it plainly.  */}
    </motion.div>
  );
}
