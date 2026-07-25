"use client";

/**
 * BrainThoughts — what the brain thinks about while you sit still.
 *
 * The hero's footage is mouse-scrubbed: stop moving and the brain stops with
 * it. That stillness is the cue — after a beat of no pointer movement the two
 * hemispheres start surfacing thoughts, one at a time each, drifting outward
 * from the brain and dissolving. The two are a matched pair — the same
 * question answered from opposite ends:
 *
 *   left  (logic)    black type, the headline's mono voice
 *   right (creative) painted ink, the headline's brush voice
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

/** The two sides think the same thought from opposite ends: index i on the
 *  left is answered by index i on the right, so whatever surfaces, the pair
 *  reads as one argument with two verdicts. */
const LOGIC_THOUGHTS = [
  "measure twice",
  "grids before decoration",
  "constraints are the brief",
  "consistency compounds",
  "clarity is the feature",
  "structure first, style after",
  "every pixel earns its place",
  "hierarchy is kindness",
  "systems outlive campaigns",
  "plan the accident",
] as const;

/** The creative side's ink. White vanished against the light paint, so each
 *  thought arrives in one of the hemisphere's own hues, cycling with the pair. */
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
  "just start cutting",
  "decoration before grids",
  "the brief is a suggestion",
  "surprise compounds",
  "mystery is the feature",
  "style first, structure after",
  "let the spill stay",
  "chaos is honest",
  "a moment is enough",
  "chase the accident",
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
          : `font-brush-brand text-[clamp(1.15rem,2.1vw,2rem)] leading-tight`,
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
                text={pick(CREATIVE_THOUGHTS, tick, 0)}
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
