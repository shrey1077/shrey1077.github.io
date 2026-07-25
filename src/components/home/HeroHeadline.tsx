"use client";

/**
 * HeroHeadline — the landing statement (Phase 5 v4).
 *
 * Two halves, each in its hemisphere's voice, set very large and placed so the
 * brain crosses in front of them:
 *
 *   left  (logic)     "50% / logic"       — IBM Plex Mono, top-left
 *   right (creative)  "50% / Imagination" — the brush face, bottom-right,
 *                      the word painted with the living gradient
 *
 * The share reads heavy and huge; the word beneath it is smaller but shares ONE
 * size across both sides — the size at which the longest word ("Imagination")
 * still fits its half, so "logic" is set to match rather than to fill.
 *
 * Going behind the brain: the footage is opaque, so text can't truly sit under
 * it. Instead each half is masked to fade out on the edge that faces the brain,
 * which reads as the type passing behind the silhouette while every letter that
 * matters stays fully legible.
 *
 * The whole layer is pointer-events-none; clicks fall through to HeroStage's
 * pose zones. Reduced motion renders everything in place. Parent unmounts it
 * via AnimatePresence the moment a side is chosen.
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

/** The share — much larger than the word it qualifies. */
const PCT = "text-[clamp(3.6rem,14vw,14rem)]";
/** The word — one size for both sides, set so "Imagination" fits its half. */
const WORD = "text-[clamp(1.9rem,7vw,6.8rem)]";

/** Fade the edge that faces the brain, so the type reads as passing behind it. */
const FADE_RIGHT: React.CSSProperties = {
  maskImage: "linear-gradient(90deg, black 62%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(90deg, black 62%, transparent 100%)",
};
const FADE_LEFT: React.CSSProperties = {
  maskImage: "linear-gradient(270deg, black 62%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(270deg, black 62%, transparent 100%)",
};

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
        "flex flex-col items-center justify-end gap-2 px-6 pb-[14vh] lg:block lg:gap-0 lg:p-0",
      ].join(" ")}
    >
      {/* LEFT — logic, sitting over the brain's top-left. */}
      <div
        aria-hidden
        className="text-center leading-[0.86] lg:absolute lg:left-[2.5vw] lg:top-[9%] lg:text-left"
        style={reduceMotion ? undefined : FADE_RIGHT}
      >
        <h1 className={`${typeVoiceClass("logic", "display")} text-neutral-900`}>
          <MaskedLine delay={0.5} className={`${PCT} font-black tracking-[-0.02em]`}>
            50%
          </MaskedLine>
          <MaskedLine delay={0.62} className={`${WORD} font-normal tracking-[0.02em]`}>
            logic
          </MaskedLine>
        </h1>
      </div>

      {/* RIGHT — creative, tucked under the brain's bottom-right; the word is
          painted with the living gradient. */}
      <div
        aria-hidden
        className="text-center leading-[0.9] lg:absolute lg:bottom-[8%] lg:right-[2.5vw] lg:text-right"
        style={reduceMotion ? undefined : FADE_LEFT}
      >
        <p className="font-brush-brand text-neutral-900">
          <MaskedLine delay={0.86} className={`${PCT} font-black`}>
            50%
          </MaskedLine>
          <MaskedLine
            delay={0.98}
            className={`${WORD} brain-paint bg-clip-text pb-[0.12em] font-normal text-transparent`}
          >
            Imagination
          </MaskedLine>
        </p>
      </div>
    </motion.div>
  );
}
