"use client";

/**
 * TypeReveal — the reusable text component of the Typography Constitution.
 *
 * Every piece of "voiced" text renders through this component. Three modes:
 *
 *   • reveal="none"     — static (a parent orchestrates any motion).
 *   • reveal="settle"   — a calm per-letter rise/fade on mount.
 *   • reveal="pipeline" — THE CONSTITUTION, animated (Phase 3B):
 *
 *         handwritten thought → writing-in → brief pause
 *                → letter-by-letter paper flip → final typography
 *
 * The pipeline is deliberately handcrafted, not mechanical: per-letter timing,
 * rotation, and blur carry seeded jitter (identical every load, never uniform).
 * Each letter is a cell that swaps its in-flow glyph from the thought voice to
 * `finalVoice` mid-flip; Framer `layout` animates the width difference so the
 * line reflows like paper settling, not like a DOM swap.
 *
 * Accessibility: the wrapper always carries the full text (`aria-label`);
 * glyphs are presentation-only. `prefers-reduced-motion` renders the final
 * typography immediately — the pipeline is a gift, not a gate.
 */

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { createSeededRandom } from "@/utils/random";
import {
  typeVoiceClass,
  type TypographyVariant,
  type TypographyVoice,
} from "@/constants/typography";

/** Semantic wrappers TypeReveal can render as. */
const MOTION_TAGS = {
  span: motion.span,
  div: motion.div,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

export type TypeRevealTag = keyof typeof MOTION_TAGS;

export interface TypeRevealProps {
  text: string;
  voice: TypographyVoice;
  variant?: TypographyVariant;
  /** Semantic element to render. Default: span. */
  as?: TypeRevealTag;
  /** "settle" = per-letter rise/fade; "pipeline" = the full Constitution;
   *  "none" = static. Default: none. */
  reveal?: "settle" | "none" | "pipeline";
  /** Seconds before the reveal begins. */
  delay?: number;
  /** Extra classes for the (initial) voice — sizing/color live at call sites. */
  className?: string;
  /** Pipeline only: the voice the text flips INTO. Default: logic. */
  finalVoice?: TypographyVoice;
  finalVariant?: TypographyVariant;
  /** Pipeline only: classes for the final typography. */
  finalClassName?: string;
  /** Pipeline only: fired once all letters have flipped to final type. */
  onPipelineComplete?: () => void;
  /**
   * Hide from assistive tech (parent carries the accessible name — e.g. the
   * nav's doubled label).
   */
  ariaHidden?: boolean;
}

/* ── settle mode variants ─────────────────────────────────────────────── */

const containerVariants = (delay: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.02, delayChildren: delay } },
});

const letterVariants = {
  hidden: { opacity: 0, y: "0.3em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ease: EASE_OUT, duration: DURATION.medium },
  },
};

function toWords(text: string): string[] {
  return text.split(" ");
}

/* ── pipeline mode ────────────────────────────────────────────────────── */

interface LetterPlan {
  /** Seconds (from pipeline start) this letter writes in. */
  writeDelay: number;
  /** Handwriting entry rotation, degrees. */
  writeRotation: number;
  /** Per-letter flip duration jitter (seconds). */
  flipDuration: number;
}

/** Deterministic, handcrafted-feeling per-letter timing. */
function planLetters(text: string, seedBase: number): LetterPlan[] {
  const next = createSeededRandom(seedBase);
  const plans: LetterPlan[] = [];
  let t = 0;
  for (const ch of Array.from(text)) {
    if (ch === " ") {
      t += 0.09 + next() * 0.05; // the pen travels between words
      continue;
    }
    t += 0.045 + next() * 0.055; // uneven letter cadence — a hand, not a printer
    plans.push({
      writeDelay: t,
      writeRotation: -3 + next() * 6,
      flipDuration: 0.24 + next() * 0.12,
    });
  }
  return plans;
}

/** Cheap stable seed from the text so timing is identical every load. */
function textSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = (h ^ text.charCodeAt(i)) * 16777619;
  return h >>> 0;
}

/** Per-word cascade (Phase 4.2): a word begins flipping into set type the
 *  moment its own writing settles — while the NEXT word is still being
 *  handwritten — so the line transforms continuously: thought becoming design,
 *  not two separate animations. */
const WORD_FLIP_LAG = 0.22; // a word's writing settles → its flip begins
const FLIP_STAGGER = 0.045; // per-letter cadence within a flipping word

function PipelineText({
  text,
  handClass,
  finalClass,
  delay,
  onComplete,
}: {
  text: string;
  handClass: string;
  finalClass: string;
  delay: number;
  onComplete?: () => void;
}) {
  const plans = useMemo(() => planLetters(text, textSeed(text)), [text]);

  // Per-letter flip moments, cascaded word by word: each word's flip starts
  // right after ITS letters finish writing (writes for later words are already
  // scheduled further along the same clock, so the two overlap).
  const meta = useMemo(() => {
    const out: { flipAt: number }[] = [];
    let li = 0;
    for (const word of toWords(text)) {
      const chars = Array.from(word).length;
      const wordPlans = plans.slice(li, li + chars);
      const writeEnd = wordPlans.length
        ? Math.max(...wordPlans.map((p) => p.writeDelay)) + 0.34
        : 0;
      for (let i = 0; i < chars; i += 1) {
        out.push({ flipAt: writeEnd + WORD_FLIP_LAG + i * FLIP_STAGGER });
      }
      li += chars;
    }
    return out;
  }, [plans, text]);

  const total = meta.reduce(
    (acc, m, i) => Math.max(acc, m.flipAt + (plans[i]?.flipDuration ?? 0.3)),
    0,
  );

  const [elapsed, setElapsed] = useState(0);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  });

  // One light clock drives the whole cascade (~20 re-renders/s on a short
  // label while it runs), then stops itself and fires completion once.
  useEffect(() => {
    const t0 = performance.now();
    let done = false;
    const id = window.setInterval(() => {
      const e = (performance.now() - t0) / 1000;
      setElapsed(e);
      if (!done && e >= delay + total + 0.05) {
        done = true;
        window.clearInterval(id);
        completeRef.current?.();
      }
    }, 48);
    return () => window.clearInterval(id);
  }, [delay, total]);

  let letterIndex = -1;

  return (
    <span aria-hidden className="inline" style={{ perspective: "600px" }}>
      {toWords(text).map((word, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              letterIndex += 1;
              const plan = plans[letterIndex];
              const flipped = elapsed >= delay + (meta[letterIndex]?.flipAt ?? 0);

              return (
                <motion.span
                  key={ci}
                  layout
                  className="relative inline-block align-baseline"
                >
                  {flipped ? (
                    <motion.span
                      initial={{ rotateX: -88, opacity: 0.4 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      transition={{
                        duration: plan?.flipDuration ?? 0.28,
                        ease: EASE_OUT,
                      }}
                      className={`inline-block ${finalClass}`}
                      style={{ transformOrigin: "50% 55%" }}
                    >
                      {ch}
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{
                        opacity: 0,
                        y: "0.28em",
                        rotate: plan?.writeRotation ?? 0,
                        filter: "blur(2px)",
                      }}
                      animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: delay + (plan?.writeDelay ?? 0),
                        duration: 0.34,
                        ease: EASE_OUT,
                      }}
                      className={`inline-block ${handClass}`}
                    >
                      {ch}
                    </motion.span>
                  )}
                </motion.span>
              );
            })}
          </span>
          {wi < toWords(text).length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/* ── the component ────────────────────────────────────────────────────── */

export function TypeReveal({
  text,
  voice,
  variant = "label",
  as = "span",
  reveal = "none",
  delay = 0,
  className = "",
  finalVoice = "logic",
  finalVariant = "meta",
  finalClassName = "",
  onPipelineComplete,
  ariaHidden = false,
}: TypeRevealProps) {
  const reduceMotion = useReducedMotion();
  const Wrapper = MOTION_TAGS[as];
  const voiceClass = typeVoiceClass(voice, variant);
  const finalClass = `${typeVoiceClass(finalVoice, finalVariant)} ${finalClassName}`.trim();

  /* Pipeline mode — the Constitution. Reduced motion skips straight to the
     final typography (rendered plainly below). */
  if (reveal === "pipeline" && !reduceMotion) {
    return (
      <Wrapper aria-label={ariaHidden ? undefined : text} aria-hidden={ariaHidden || undefined} className={className}>
        <PipelineText
          text={text}
          handClass={typeVoiceClass(voice, variant)}
          finalClass={finalClass}
          delay={delay}
          onComplete={onPipelineComplete}
        />
      </Wrapper>
    );
  }

  const pipelineFinal = reveal === "pipeline"; // reduced-motion: final type, static
  const animate = reveal === "settle" && !reduceMotion;
  const activeClass = pipelineFinal ? finalClass : voiceClass;

  return (
    <Wrapper
      {...(ariaHidden ? { "aria-hidden": true } : { "aria-label": text })}
      className={`${activeClass} ${className}`.trim()}
      {...(animate
        ? {
            initial: "hidden",
            animate: "visible",
            variants: containerVariants(delay),
          }
        : {})}
    >
      <span aria-hidden className="inline">
        {toWords(text).map((word, wi) => (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((letter, li) =>
                animate ? (
                  <motion.span
                    key={li}
                    variants={letterVariants}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <span key={li} className="inline-block">
                    {letter}
                  </span>
                ),
              )}
            </span>
            {/* Real space BETWEEN word spans — renders the gap and preserves
                soft-wrap opportunities that nowrap suppresses inside words. */}
            {wi < toWords(text).length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Wrapper>
  );
}
