"use client";

/**
 * CodeStream — the "left brain" code window (Phase L1).
 *
 * A small, left-aligned terminal on the logic side that types the site's own
 * source, ten lines at a time, then loops. Each line types on character by
 * character (a slightly irregular cadence, like a real keystroke stream), the
 * oldest line falls off the top once ten are showing, and a caret blinks on the
 * line being written. Monospace, faint, decorative — it sets a digital tone
 * without competing with "Designer".
 *
 * Reduced motion renders a static block of the first ten lines.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** ~50 lines of the site's own source (the hero name split), looped. */
const SOURCE = `export function HeroName() {
  const reduceMotion = useReducedMotion();
  const shreyRef = useRef<HTMLSpanElement>(null);
  const singhRef = useRef<HTMLSpanElement>(null);
  const geo = useRef({ restL: 0, restR: 0 });

  const spread = useMotionValue(0.5);
  const smooth = useSpring(spread, { stiffness: 70 });
  const xLeft = useMotionValue(0);
  const xRight = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const brain = measureBrain(vw) ?? fallback;
      geo.current.restL = brain.left - vw / 2;
      geo.current.restR = brain.right - vw / 2;
      apply(smooth.get());
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onMove);
    return () => cleanup();
  }, []);

  return (
    <motion.h1 className="absolute inset-0">
      <motion.span style={{ x: xLeft }}>Shrey</motion.span>
      <motion.span style={{ x: xRight }}>Singh</motion.span>
    </motion.h1>
  );
}`.split("\n");

const VISIBLE = 8;

export function CodeStream() {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState<string[]>([]);
  const [cur, setCur] = useState("");
  const pos = useRef({ line: 0, col: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    let t: number;
    const step = () => {
      const p = pos.current;
      const line = SOURCE[p.line % SOURCE.length];
      if (p.col < line.length) {
        p.col += 1;
        setCur(line.slice(0, p.col));
        t = window.setTimeout(step, 16 + Math.random() * 46);
      } else {
        setDone((prev) => [...prev, line].slice(-VISIBLE));
        setCur("");
        p.line += 1;
        p.col = 0;
        t = window.setTimeout(step, line.trim() === "" ? 120 : 240);
      }
    };
    t = window.setTimeout(step, 350);
    return () => window.clearTimeout(t);
  }, [reduceMotion]);

  return (
    <div
      aria-hidden
      className="font-mono-brand w-[min(23vw,17rem)] select-none text-[0.58rem] leading-[1.55] text-neutral-400"
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[0.5rem] tracking-[0.15em] text-neutral-300">
        <span className="size-1.5 rounded-full bg-neutral-300" />
        <span>herofolio — heroName.tsx</span>
      </div>
      <pre className="whitespace-pre-wrap break-words font-[inherit]">
        {(reduceMotion ? SOURCE.slice(0, VISIBLE) : done).map((l, i) => (
          <span key={i} className="block text-neutral-400/70">
            {l || " "}
          </span>
        ))}
        <span className="block text-neutral-600">
          {cur}
          <span className="ml-px inline-block h-[0.9em] w-[0.45em] translate-y-[0.12em] animate-pulse bg-neutral-500 align-baseline" />
        </span>
      </pre>
    </div>
  );
}
