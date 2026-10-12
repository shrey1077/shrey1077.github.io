"use client";

/**
 * BandFacts — the facts (Chess, Education, Part-time, Hobbies) in the black
 * band's two corners (owner, 2026-10-13: "this info should be displayed in the
 * black band at the bottom at left and right corners").
 *
 * Split the way the brain is: the logic side's two (Chess, Education) in the
 * left corner, the creative side's (Part-time, Hobbies) in the right. Each
 * corner shows one fact at a time and hands to the other every FACT_MS, with
 * the fade-and-rise the facts have always used (AboutFacts); the right corner
 * runs half a turn behind the left, so the two never change together.
 *
 * One line — heading, mark, value — on a wide or a short screen; on a narrow
 * portrait one the heading stands over the value, so both fit beside the name.
 * White on the band: the drawn marks take the text's colour, and the chess
 * board (black artwork) is turned over by a filter, as on the old tab.
 *
 * Until 2026-10-13 the facts rode a tab rising out of the band's middle
 * (FactsTab, desktop only) and, below `lg`, the footer (SiteFooter).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { EducationMark, PartTimeMark } from "@/components/home/HomeMarks";
import { CHESS_RATING, EDUCATION, FACT_MS, PART_TIME, WORD_MS } from "@/components/home/AboutFacts";
import { CYCLE_MS, HOBBIES } from "@/components/home/HobbiesRotator";

/** A counter that steps every `ms`, the first step `first` ms in. Reduced
 *  motion holds it at 0. */
function useStep(ms: number, first = ms) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    let id = 0;
    const t = window.setTimeout(() => {
      setI((v) => v + 1);
      id = window.setInterval(() => setI((v) => v + 1), ms);
    }, first);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [ms, first, reduceMotion]);
  return i;
}

/** The drawn marks are 24px black (HomeMarks); here they run at the type's
 *  size, in its colour. */
const MARK = "flex shrink-0 [&_svg]:size-[1.15em] [&_svg]:text-white";

/** A word that changes in place — the same small rise the facts' words use. */
function Words({ items, ms }: { items: { label: string; mark?: React.ReactNode }[]; ms: number }) {
  const reduceMotion = useReducedMotion();
  const item = items[useStep(ms) % items.length];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={item.label}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="flex min-w-0 items-center gap-[0.4em]"
      >
        {item.mark && <span className={MARK}>{item.mark}</span>}
        <span className="truncate">{item.label}</span>
      </motion.span>
    </AnimatePresence>
  );
}

interface Fact {
  key: string;
  heading: string;
  value: React.ReactNode;
}

const LEFT: Fact[] = [
  {
    key: "chess",
    heading: "Chess",
    value: (
      <>
        <span className="relative block size-[1.15em] shrink-0 [filter:invert(1)_brightness(1.5)]">
          <Image src="/content/icons/chess.png" alt="" fill sizes="24px" className="object-contain" />
        </span>
        <span className="font-sans font-bold text-white">{CHESS_RATING}</span>
      </>
    ),
  },
  {
    key: "education",
    heading: "Education",
    value: (
      <>
        <span className={MARK}>
          <EducationMark />
        </span>
        {/* Two degrees: side by side where there is room, one over the other
            on a narrow phone (and side by side again on a short screen —
            .band-degrees). */}
        <span className="band-degrees flex min-w-0 flex-col sm:flex-row sm:gap-x-[0.5em]">
          <span className="truncate">{EDUCATION[0]}</span>
          <span className="truncate">
            <span aria-hidden className="band-dot hidden pr-[0.5em] text-neutral-600 sm:inline">
              ·
            </span>
            {EDUCATION[1]}
          </span>
        </span>
      </>
    ),
  },
];

const RIGHT: Fact[] = [
  {
    key: "parttime",
    heading: "Part-time",
    value: (
      <>
        <span className={MARK}>
          <PartTimeMark />
        </span>
        <Words items={PART_TIME.map((label) => ({ label }))} ms={WORD_MS} />
      </>
    ),
  },
  {
    key: "hobbies",
    heading: "Hobbies",
    value: <Words items={HOBBIES} ms={CYCLE_MS} />,
  },
];

function Corner({ facts, side }: { facts: Fact[]; side: "left" | "right" }) {
  const reduceMotion = useReducedMotion();
  const fact = facts[useStep(FACT_MS, side === "left" ? FACT_MS : FACT_MS * 1.5) % facts.length];
  const right = side === "right";
  return (
    <div className={`flex min-w-0 ${right ? "justify-end text-right" : "justify-start text-left"}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={fact.key}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className={`band-fact flex min-w-0 flex-col gap-[0.15em] lg:flex-row lg:items-center lg:gap-[0.7em] ${
            right ? "items-end lg:justify-end" : "items-start"
          }`}
        >
          <span className="font-graff shrink-0 font-extrabold leading-none tracking-[0.01em] text-white">
            {fact.heading}
          </span>
          <span
            className={`font-graff flex min-w-0 items-center gap-[0.4em] leading-tight text-neutral-400 ${
              right ? "justify-end" : ""
            }`}
          >
            {fact.value}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** The two corners. FootBand lays them either side of the name. */
export function BandFactsLeft() {
  return <Corner facts={LEFT} side="left" />;
}

export function BandFactsRight() {
  return <Corner facts={RIGHT} side="right" />;
}
