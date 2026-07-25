"use client";

/**
 * BrainThoughts — what the brain thinks about while you sit still.
 *
 * The hero's footage is mouse-scrubbed: stop moving and the brain stops with
 * it. That stillness is the cue — after a beat of no pointer movement the two
 * hemispheres start surfacing thoughts, one at a time each, drifting outward
 * from the brain and dissolving:
 *
 *   left  (logic)    black type, the headline's mono voice
 *   right (creative) white type, the headline's Fraunces italic
 *
 * Only ever shown on the landing pose (`center`), and never under reduced
 * motion. The layer is pointer-events-none, so the stage's click zones and the
 * headline underneath keep working; the first pointer move dismisses it.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { useSceneStore } from "@/state/useSceneStore";

/** Stillness before the brain starts thinking out loud. */
const IDLE_MS = 1400;
/** How long each thought holds before the next surfaces. */
const CYCLE_MS = 3200;

const LOGIC_THOUGHTS = [
  "grids before decoration",
  "constraints are the brief",
  "measure twice, ship once",
  "hierarchy is kindness",
  "systems outlive campaigns",
  "every pixel earns its place",
  "consistency compounds",
  "structure first, style after",
  "clarity is a feature",
  "the grid holds the chaos",
] as const;

/** The creative side's ink. White vanished against the light paint, so each
 *  thought arrives in one of the hemisphere's own hues (the palette the painted
 *  rows and card chips use), cycling with the thought. */
const CREATIVE_INKS = [
  "#ff2e8b",
  "#ff5a3c",
  "#ff8a00",
  "#00a6a6",
  "#7a3fb0",
  "#3f6ad8",
  "#e0119d",
  "#7fbf2e",
] as const;

const CREATIVE_THOUGHTS = [
  "what if it breathed?",
  "colour remembers",
  "let the ink decide",
  "chase the accident",
  "make it feel like monsoon",
  "a mark that hums",
  "texture over polish",
  "beauty, then reason",
  "paint outside the artboard",
  "dream it louder",
] as const;

/** Walk the list with a stride coprime to its length — every thought is seen,
 *  in an order that doesn't read as a loop, with no Math.random (so nothing
 *  can differ between server and client). */
const STRIDE = 7;
const pick = (list: readonly string[], tick: number, seed: number) =>
  list[(tick * STRIDE + seed) % list.length];

function Thought({
  text,
  side,
  delay,
  ink,
}: {
  text: string;
  side: "logic" | "creative";
  delay: number;
  /** Creative side only — the hue this thought arrives in. */
  ink?: string;
}) {
  const logic = side === "logic";
  return (
    <motion.span
      initial={{ opacity: 0, y: 10, x: 0 }}
      animate={{ opacity: 1, y: 0, x: logic ? -14 : 14 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.5, ease: EASE_OUT } }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
      style={logic ? undefined : { color: ink }}
      className={[
        "block max-w-[15ch] will-change-transform",
        logic
          ? `${typeVoiceClass("logic", "display")} text-[clamp(0.85rem,1.35vw,1.25rem)] leading-snug text-neutral-900`
          : `${typeVoiceClass("creative", "label")} text-[clamp(1.05rem,1.9vw,1.8rem)] italic leading-tight`,
      ].join(" ")}
    >
      {text}
    </motion.span>
  );
}

export function BrainThoughts() {
  const reduceMotion = useReducedMotion();
  const heroPose = useSceneStore((s) => s.heroPose);
  const [idle, setIdle] = useState(false);
  const [tick, setTick] = useState(0);

  // Idle detection — any pointer movement wakes the brain back up.
  useEffect(() => {
    if (reduceMotion) return;
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const onMove = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion]);

  // While thinking, surface the next pair on a slow cycle.
  const thinking = idle && heroPose === "center" && !reduceMotion;
  useEffect(() => {
    if (!thinking) return;
    const id = window.setInterval(() => setTick((t) => t + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [thinking]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        {thinking && (
          <motion.div key={tick} className="absolute inset-0">
            {/* LEFT — logic, lower flank (clear of the centred headline). */}
            <div className="absolute left-[5vw] top-[72%] sm:left-[6vw] lg:left-[4vw]">
              <Thought text={pick(LOGIC_THOUGHTS, tick, 0)} side="logic" delay={0} />
            </div>
            {/* RIGHT — creative, upper flank. */}
            <div className="absolute right-[5vw] top-[22%] text-right sm:right-[6vw] lg:right-[4vw]">
              <Thought
                text={pick(CREATIVE_THOUGHTS, tick, 3)}
                side="creative"
                delay={0.45}
                ink={CREATIVE_INKS[(tick * 3 + 1) % CREATIVE_INKS.length]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
