"use client";

/**
 * AboutFacts — the lower-left "about me" rotator (Phase L1).
 *
 * Four facts, one at a time, each holding ~15s before the next fades in, looped:
 *   Chess     — highest Rapid rating, as the number and nothing else.
 *   Tools     — the software I work in.
 *   Education — the degrees.
 *   Part-time — a small list whose words cycle one by one.
 *
 * Sits just above "Designer", which stays the biggest thing in the corner:
 * headings are 18px, everything under them 10px, quiet neutral tones.
 * Reduced motion holds the first fact.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import {
  EducationMark,
  PartTimeMark,
  ToolsMark,
} from "@/components/home/HomeMarks";

const FACT_MS = 15000;
const WORD_MS = 1400;

/** Part-time roles — words arrive one at a time, hold, and hand off. Extendable. */
const PART_TIME = ["Reader", "Writer", "Researcher", "Birder", "Gamer"];

function PartTimeWords() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => v + 1), WORD_MS);
    return () => window.clearInterval(id);
  }, []);
  const word = PART_TIME[i % PART_TIME.length];
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        // ⚠ `font-graff` matters here. This span carried no font class, so it
        // inherited the document's default sans while Tools and Education
        // beside it ran Juturu — and once the Hobbies rotator opposite was
        // unified onto Juturu too, this was the last thing on the stage still
        // speaking in the system face. `truncate` holds it to one line.
        className="font-graff block truncate text-[19px] leading-[1.4] text-neutral-500"
      >
        {word}
      </motion.span>
    </AnimatePresence>
  );
}

/** Juturu carries this corner now — extra-bold for the heading, regular for
 *  everything under it. The face is a variable 100–900, so 800 and 400 both
 *  come off the one file. The education entry runs long, so the body steps down
 *  from 19px to keep two full lines inside the column. */
const BODY = "font-graff text-[15px] font-normal leading-[1.45] text-neutral-500";

/** The chess mark — the owner's own board icon, replacing the knight that was
 *  drawn inline here. That knight existed only because the reference supplied
 *  at the time was a watermarked stock comp; with real artwork on disk there is
 *  nothing left to work around. Black art on transparency, so it reads on this
 *  corner's light ground without a plate.
 *
 *  ⚠ Stepped down from `size-9` (36px) to `size-6` (24px) on 2026-08-16, when
 *  every other item gained a mark: 36px was tuned to pair with the 34px rating
 *  number alone, and left alone it would have been half again the size of the
 *  ten marks beside it. This is the only real artwork in either corner — the
 *  rest are drawn (HomeMarks). */
function ChessMark() {
  return (
    <span className="relative block size-6 shrink-0">
      <Image
        src="/content/icons/chess.png"
        alt=""
        fill
        sizes="24px"
        className="object-contain"
      />
    </span>
  );
}

const FACTS: {
  key: string;
  heading: string;
  mark: React.ReactNode;
  body: React.ReactNode;
}[] = [
  {
    key: "chess",
    heading: "Chess",
    mark: <ChessMark />,
    body: (
      <p className="text-[34px] font-bold leading-none tracking-tight text-neutral-800">
        1563
      </p>
    ),
  },
  {
    key: "tools",
    heading: "Tools",
    mark: <ToolsMark />,
    body: (
      <p className={`${BODY} line-clamp-2`}>
        Adobe&nbsp;CC · Claude
        <sub className="text-[13px] text-neutral-400"> +more</sub> · Leonardo&nbsp;AI
      </p>
    ),
  },
  {
    key: "education",
    heading: "Education",
    mark: <EducationMark />,
    // ⚠ Shortened 2026-08-16 to hold the two-line cap. It used to carry both
    // degrees in full — "Jaypee University of Information Technology (JUIT),
    // Waknaghat, Solan, H.P." and "UID, Karnavati University, Ahmedabad,
    // Gujarat" — because "B.Tech · M.Des" said nothing about where or in what.
    // Each of those wrapped to two lines on its own, so the fact ran to four.
    // The institution and the field survive, which was the point of writing
    // them out; the town and state are what went. One `truncate`d line per
    // degree is a hard two-line guarantee, not a hope about string lengths.
    body: (
      <div className={BODY}>
        <p className="truncate">B.Tech. (IT) — JUIT, Waknaghat</p>
        <p className="mt-1.5 truncate">M.Des. (Visual Comm.) — UID, Karnavati</p>
      </div>
    ),
  },
  {
    key: "parttime",
    heading: "Part-time",
    mark: <PartTimeMark />,
    body: <PartTimeWords />,
  },
];

export function AboutFacts() {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((v) => v + 1), FACT_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const fact = FACTS[i % FACTS.length];

  return (
    <div className="w-[min(32vw,28rem)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={fact.key}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <h3 className="font-graff text-[34px] font-extrabold leading-tight tracking-[-0.01em] text-neutral-800">
            {fact.heading}
          </h3>
          {/* Mark then body, the same row shape the right corner uses — except
              mirrored, since this column reads left-to-right. `min-w-0` so the
              body's `truncate` has a width to truncate against; without it the
              flex child sizes to its content and never clips. */}
          <div className="mt-1 flex items-center gap-2.5">
            {fact.mark}
            <div className="min-w-0 flex-1">{fact.body}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
