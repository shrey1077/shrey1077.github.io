"use client";

/**
 * CodeStream — the landing's two typing windows (Phase L1; the right one
 * 2026-10-04, owner).
 *
 * LEFT, the "left brain" code window: a small terminal on the logic side that
 * types the site's own source, eight lines at a time, then loops. Each line
 * types on character by character (a slightly irregular cadence, like a real
 * keystroke stream), the oldest line falls off the top once the window is
 * full, and a caret blinks on the line being written. Monospace, faint,
 * decorative — it sets a digital tone without competing with the name.
 *
 * RIGHT, its mirror on the creative side (`variant="ideas"`): the same window
 * and the same typing, set right-aligned, but what it types is a sketchbook of
 * ideas — about art, the Extincts project, movies and music — and every line
 * comes in colour, in the deep paint hues the right brain's own lines use.
 *
 * Reduced motion renders a static block of the first lines.
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

/** The right window's sketchbook — art, the Extincts, movies, music. The
 *  `//` lines are its section heads; the Extincts lines name the project's
 *  own stories. */
const IDEAS = `// art
paint first, plan later.
let the splash decide the edge.
colour is a feeling with an address.
draw the light, not the lamp.
a blank wall is an invitation.

// the extincts
the last dodo still walks in my sketchbook.
give the last king of tasmania one more dawn.
the last horn of africa, told in ink.
the last passenger: a sky gone quiet.
bring back what the world has lost.

// movies
frame it wide; let the silence act.
one shot, no cut, all heart.
cut on the breath, not on the beat.
light the face, then the doubt.

// music
the edit follows the drum.
hum the colour before you grade it.
a bassline is a timeline.
leave room for the last note.`.split("\n");

/** Deep paint hues, dark enough to read as small type on white — the same
 *  set the right brain's lines are set in (LeftRightBrain INK). */
const INK = ["#c2185b", "#d84315", "#c77800", "#558b2f", "#00796b", "#2e50b8", "#6a3aa0"];

const VISIBLE = 8;

type Variant = "code" | "ideas";

const VARIANTS: Record<Variant, { lines: string[]; title: string; right: boolean; colour: boolean }> = {
  code: { lines: SOURCE, title: "herofolio — heroName.tsx", right: false, colour: false },
  ideas: { lines: IDEAS, title: "sketchbook — ideas.txt", right: true, colour: true },
};

/** A typed line's colour: section heads stay grey, everything else cycles the
 *  paint, keyed to the line's place in the source so it never shifts. */
function inkOf(line: string, index: number) {
  return line.trim().startsWith("//") ? undefined : INK[index % INK.length];
}

export function CodeStream({ variant = "code" }: { variant?: Variant }) {
  const { lines, title, right, colour } = VARIANTS[variant];
  const reduceMotion = useReducedMotion();
  /** Finished lines, each with its index in the source (for its colour). */
  const [done, setDone] = useState<{ text: string; at: number }[]>([]);
  /** The line being typed, and its index in the source. */
  const [cur, setCur] = useState({ text: "", at: 0 });
  const pos = useRef({ line: 0, col: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    let t: number;
    const step = () => {
      const p = pos.current;
      const at = p.line % lines.length;
      const line = lines[at];
      if (p.col < line.length) {
        p.col += 1;
        setCur({ text: line.slice(0, p.col), at });
        t = window.setTimeout(step, 16 + Math.random() * 46);
      } else {
        setDone((prev) => [...prev, { text: line, at }].slice(-VISIBLE));
        setCur({ text: "", at: (at + 1) % lines.length });
        p.line += 1;
        p.col = 0;
        t = window.setTimeout(step, line.trim() === "" ? 120 : 240);
      }
    };
    t = window.setTimeout(step, right ? 900 : 350);
    return () => window.clearTimeout(t);
  }, [reduceMotion, lines, right]);

  const shown = reduceMotion ? lines.slice(0, VISIBLE).map((text, at) => ({ text, at })) : done;
  const curInk = colour ? inkOf(cur.text, cur.at) : undefined;

  return (
    <div
      aria-hidden
      className={`font-helv w-[min(23vw,17rem)] select-none text-[0.58rem] leading-[1.55] text-neutral-400 ${
        right ? "text-right" : ""
      }`}
    >
      <div
        className={`font-digibra mb-1.5 flex items-center gap-1.5 text-[0.6rem] tracking-[0.15em] text-neutral-400 ${
          right ? "flex-row-reverse" : ""
        }`}
      >
        <span className={`size-1.5 rounded-full ${colour ? "brain-paint" : "bg-neutral-300"}`} />
        <span>{title}</span>
      </div>
      <pre className="whitespace-pre-wrap break-words font-[inherit]">
        {shown.map((l, i) => {
          const ink = colour ? inkOf(l.text, l.at) : undefined;
          return (
            <span
              key={i}
              className={`block ${ink ? "opacity-75" : "text-neutral-400/70"}`}
              style={ink ? { color: ink } : undefined}
            >
              {l.text || " "}
            </span>
          );
        })}
        <span className={`block ${curInk ? "" : "text-neutral-600"}`} style={curInk ? { color: curInk } : undefined}>
          {cur.text}
          <span className="ml-px inline-block h-[0.9em] w-[0.45em] translate-y-[0.12em] animate-pulse bg-neutral-500 align-baseline" />
        </span>
      </pre>
    </div>
  );
}
