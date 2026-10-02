"use client";

/**
 * LeftRightBrain — the landing's two voices, "Left brain" and "Right brain",
 * either side of the brain (2026-10-02). Replaced HeroName's THINK / imagine.
 *
 * Set after a reference the owner supplied: a big headline word over a light
 * "brain", then a centred stack of short serif lines. Landing only — the faces
 * (--font-lr-*) are used nowhere else.
 *
 * DEPTH, DRIVEN BY THE POINTER. The screen is read as three zones:
 *   · the CENTRE 40% of the width — both blocks sit far back in z, headlines
 *     only, faded;
 *   · past 20% of the width LEFT of centre — the left block is "reached": a
 *     circuit trace (the logic pins' own language) runs from the brain's centre
 *     to "Left", and as it lands the block comes forward, turns black, and its
 *     lines set in one after another;
 *   · the same to the RIGHT — but the line is a random, glowing, many-coloured
 *     spark (after the sparks in the backdrop film) striking "Right", which
 *     bursts on impact; the script turns to paint and the lines come in colour.
 * Going back into the centre releases the side (with a little hysteresis, so
 * the pointer resting on the boundary doesn't flicker it).
 *
 * The zoom is a real translateZ under perspective, sprung, and written through
 * motion values — the hot-path contract keeps per-frame work out of React. The
 * only React state is which side is reached, which changes on a crossing.
 *
 * Reduced motion shows both blocks forward and fully set, with no lines. Below
 * `lg` the blocks would collide with the brain, so only the two headlines show.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { toStage } from "@/components/home/BrainTraces";
import { LEFT_BRAIN, RIGHT_BRAIN } from "@/constants/brainCopy";
import { EASE_OUT } from "@/constants/motion";

/** Half-width of the centre zone, as a fraction of HALF the screen: 0.4 here is
 *  20% of the full width either side of centre — the owner's "after the mouse
 *  has moved right 20% of screen width from the centre". */
const REACH = 0.4;
/** Release a little inside REACH, so resting on the line doesn't flicker. */
const RELEASE = 0.34;
/** How far back a block sits when not reached, px of translateZ. Under the
 *  root's perspective this reads as ~0.65× and well back. */
const FAR_Z = -540;
const PERSPECTIVE = 1100;
/** Seconds for a side's line to reach its word; the word and lines follow it. */
const LINE_DRAW = 0.75;
/** Stagger between body lines once the line has landed. */
const LINE_STAGGER = 0.07;

/** Brain centre, frame pixels — the resting grey/colour seam (x 594) on the
 *  hemispheres' circle-fit row (y 396). Lines start here. */
const BRAIN_CENTRE = { x: 594, y: 396 };

/** The paint palette, for the spark and the right-hand lines. */
const PAINT = ["#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518", "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0"];
/** The same hues taken deep enough to read as small serif type on white. */
const INK = ["#c2185b", "#d84315", "#c77800", "#558b2f", "#00796b", "#2e50b8", "#6a3aa0"];

/** Where each block stands on the stage. Both sit between the top of the stage
 *  and the pin columns, which run from ~70% down on BOTH sides since
 *  2026-10-03. Right moved up from 38% that day: with the creative pins back at
 *  the bottom it would have met them on a 640px-tall stage. */
const LEFT_BLOCK: React.CSSProperties = { left: "3vw", top: "25%", width: "27vw" };
const RIGHT_BLOCK: React.CSSProperties = { right: "3vw", top: "28%", width: "27vw" };

type Pt = { x: number; y: number };

/** A body line with its last word set bold — the copy is written to land on
 *  that word (constants/brainCopy.ts). Trailing punctuation stays regular. */
function BoldLast({ line }: { line: string }) {
  const m = line.match(/^(.*\s)?(\S+?)([.,!?;:…]*)$/);
  if (!m) return <>{line}</>;
  const [, head = "", word, tail] = m;
  return (
    <>
      {head}
      <strong className="font-bold">{word}</strong>
      {tail}
    </>
  );
}

interface Geo {
  w: number;
  h: number;
  centre: Pt;
  /** Right-middle of "Left" — where the circuit trace lands. */
  left: Pt;
  /** Left-middle of "Right" — where the spark strikes. */
  right: Pt;
}

/** A side's word, in layout coordinates (offset*, so the z transform doesn't
 *  enter into it — the line is drawn to where the word sits when FORWARD). */
function anchorOf(block: HTMLElement, word: HTMLElement, edge: "left" | "right"): Pt {
  const x = block.offsetLeft + word.offsetLeft + (edge === "right" ? word.offsetWidth : 0);
  const y = block.offsetTop + word.offsetTop + word.offsetHeight * 0.55;
  return { x, y };
}

/** The logic side's line: a circuit trace — straight out of the brain, one 45°
 *  jog to the word's level, straight on into it. */
function circuitPath(c: Pt, a: Pt) {
  const end = { x: a.x + 14, y: a.y };
  const dy = end.y - c.y;
  const jogEnd = end.x + 46;
  const jogStart = Math.min(c.x - 30, jogEnd + Math.abs(dy));
  return {
    d: `M ${c.x} ${c.y} H ${jogStart} L ${jogEnd} ${end.y} H ${end.x}`,
    nodes: [
      { x: jogStart, y: c.y },
      { x: jogEnd, y: end.y },
    ],
    end,
  };
}

/** The creative side's line: a jagged, wandering spark from the brain to the
 *  word, different every time it fires. Three strands — a bright core and two
 *  hair-thin ghosts — so it reads as electricity rather than a drawn line. */
function sparkPath(c: Pt, a: Pt) {
  const end = { x: a.x - 10, y: a.y };
  const dx = end.x - c.x;
  const dy = end.y - c.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const bow = (Math.random() - 0.35) * len * 0.35;
  const cx = c.x + dx / 2 + nx * bow;
  const cy = c.y + dy / 2 + ny * bow;
  const strand = (amp: number) => {
    const n = 22;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const u = 1 - t;
      const j = i === 0 || i === n ? 0 : (Math.random() - 0.5) * 2 * amp * Math.sin(Math.PI * t);
      const x = u * u * c.x + 2 * u * t * cx + t * t * end.x + nx * j;
      const y = u * u * c.y + 2 * u * t * cy + t * t * end.y + ny * j;
      d += `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  };
  const start = Math.floor(Math.random() * PAINT.length);
  const stops = Array.from({ length: 5 }, (_, i) => PAINT[(start + i * 2) % PAINT.length]);
  const burst = Array.from({ length: 12 }, (_, i) => {
    const ang = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 18 + Math.random() * 34;
    return {
      x: end.x + Math.cos(ang) * dist,
      y: end.y + Math.sin(ang) * dist,
      r: 1.2 + Math.random() * 2.2,
      color: PAINT[Math.floor(Math.random() * PAINT.length)],
    };
  });
  return { core: strand(16), ghosts: [strand(26), strand(22)], stops, burst, end, start: c };
}

export function LeftRightBrain({
  brain,
}: {
  /** The footage layer's resting transform — HeroStage's own constants. */
  brain: { scale: number; shiftX: number; rise: number };
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const leftBlockRef = useRef<HTMLDivElement>(null);
  const rightBlockRef = useRef<HTMLDivElement>(null);
  const leftWordRef = useRef<HTMLSpanElement>(null);
  const rightWordRef = useRef<HTMLSpanElement>(null);

  const [geo, setGeo] = useState<Geo | null>(null);
  const [leftOn, setLeftOn] = useState(false);
  const [rightOn, setRightOn] = useState(false);
  // A fresh spark each time the right side is reached — rolled in the pointer
  // handler (never during render), from the geometry as it stands then.
  const [spark, setSpark] = useState<ReturnType<typeof sparkPath> | null>(null);
  const [sparkSeed, setSparkSeed] = useState(0);
  const geoRef = useRef<Geo | null>(null);
  const onRef = useRef({ left: false, right: false });

  // Forward-ness per side, 0 (far) → 1 (forward), sprung.
  const leftTarget = useMotionValue(0);
  const rightTarget = useMotionValue(0);
  const leftNear = useSpring(leftTarget, { stiffness: 70, damping: 18, mass: 0.8 });
  const rightNear = useSpring(rightTarget, { stiffness: 70, damping: 18, mass: 0.8 });
  const leftZ = useTransform(leftNear, (n) => FAR_Z * (1 - n));
  const rightZ = useTransform(rightNear, (n) => FAR_Z * (1 - n));
  const leftFade = useTransform(leftNear, (n) => 0.3 + 0.7 * n);
  const rightFade = useTransform(rightNear, (n) => 0.3 + 0.7 * n);
  const leftBlur = useTransform(leftNear, (n) => `blur(${(1 - n) * 1.6}px)`);
  const rightBlur = useTransform(rightNear, (n) => `blur(${(1 - n) * 1.6}px)`);

  const leftShown = reduceMotion || leftOn;
  const rightShown = reduceMotion || rightOn;

  useEffect(() => {
    leftTarget.set(leftShown ? 1 : 0);
    rightTarget.set(rightShown ? 1 : 0);
  }, [leftShown, rightShown, leftTarget, rightTarget]);

  // Geometry: the stage, the brain's centre on it, and each word's anchor.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const lb = leftBlockRef.current;
      const rb = rightBlockRef.current;
      const lw = leftWordRef.current;
      const rw = rightWordRef.current;
      const w = root.offsetWidth;
      const h = root.offsetHeight;
      // Below `lg` the blocks are display:none and measure as zero.
      if (!lb || !rb || !lw || !rw || !w || !h || !lb.offsetWidth) return;
      const c = toStage(BRAIN_CENTRE.x, BRAIN_CENTRE.y, w, h, brain.scale, brain.shiftX, brain.rise);
      const next: Geo = {
        w,
        h,
        centre: c,
        left: anchorOf(lb, lw, "right"),
        right: anchorOf(rb, rw, "left"),
      };
      geoRef.current = next;
      setGeo((prev) =>
        prev &&
        prev.w === next.w &&
        prev.h === next.h &&
        Math.abs(prev.left.x - next.left.x) < 0.5 &&
        Math.abs(prev.left.y - next.left.y) < 0.5 &&
        Math.abs(prev.right.x - next.right.x) < 0.5 &&
        Math.abs(prev.right.y - next.right.y) < 0.5
          ? prev
          : next,
      );
    };
    // Observed, so the first measure arrives from the observer's own first
    // callback rather than the effect body (react-hooks/set-state-in-effect).
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    // Web fonts swap in after first paint and move the words.
    const timers = [setTimeout(measure, 600), setTimeout(measure, 1600)];
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [brain.scale, brain.shiftX, brain.rise]);

  // The pointer decides which side is reached. A mouse does it by MOVING; a
  // finger has no hover, so on touch a TAP does it instead — the left or right
  // 30% of the width reaches that side, the centre releases both (2026-10-03,
  // when the site went fully responsive).
  useEffect(() => {
    const apply = (left: boolean, right: boolean) => {
      const was = onRef.current;
      if (left !== was.left) setLeftOn(left);
      if (right !== was.right) {
        const g = geoRef.current;
        if (right && g) {
          setSpark(sparkPath(g.centre, g.right));
          setSparkSeed((n) => n + 1);
        }
        setRightOn(right);
      }
      onRef.current = { left, right };
    };
    const sideOf = (x: number) => {
      const half = window.innerWidth / 2;
      return (x - half) / half; // −1 left edge … +1 right edge
    };
    const onMove = (e: PointerEvent) => {
      // Touch "moves" are scrolls and drags, not hovering.
      if (reduceMotion || e.pointerType === "touch") return;
      const t = sideOf(e.clientX);
      const was = onRef.current;
      apply(was.left ? t < -RELEASE : t <= -REACH, was.right ? t > RELEASE : t >= REACH);
    };
    const onTap = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const root = rootRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      // Only taps on the hero itself, while it is the screen in view.
      if (r.top < -40 || e.clientY < r.top || e.clientY > r.bottom) return;
      if ((e.target as Element | null)?.closest?.("a, button")) return;
      const t = sideOf(e.clientX);
      apply(t <= -REACH, t >= REACH);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onTap, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTap);
    };
  }, [reduceMotion]);

  const circuit = geo ? circuitPath(geo.centre, geo.left) : null;

  const lineIn = (delay = 0) => ({ duration: LINE_DRAW, ease: EASE_OUT, delay });
  const after = reduceMotion ? 0 : LINE_DRAW;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-30"
      style={{ perspective: PERSPECTIVE }}
    >
      <h1 className="sr-only">Left brain, right brain — Shrey Singh</h1>

      {/* The lines, drawn over the brain from its centre. */}
      {geo && !reduceMotion && (
        <svg
          aria-hidden
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          className="absolute inset-0 hidden h-full w-full overflow-visible lg:block"
        >
          <defs>
            {spark && (
              <linearGradient
                id="lr-spark"
                gradientUnits="userSpaceOnUse"
                x1={spark.start.x}
                y1={spark.start.y}
                x2={spark.end.x}
                y2={spark.end.y}
              >
                {spark.stops.map((c, i) => (
                  <stop key={i} offset={`${(i / (spark.stops.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
            )}
            <filter id="lr-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left: the circuit trace. */}
          {circuit && (
            <g className="text-neutral-900">
              <motion.path
                d={circuit.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: leftOn ? 1 : 0, opacity: leftOn ? 1 : 0 }}
                transition={leftOn ? lineIn() : { duration: 0.35, ease: EASE_OUT }}
              />
              {circuit.nodes.map((n, i) => (
                <motion.circle
                  key={i}
                  cx={n.x}
                  cy={n.y}
                  r={2.4}
                  fill="currentColor"
                  initial={false}
                  animate={{ opacity: leftOn ? 1 : 0, scale: leftOn ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: leftOn ? LINE_DRAW * (0.3 + i * 0.35) : 0 }}
                />
              ))}
              <motion.circle
                cx={circuit.end.x - 4}
                cy={circuit.end.y}
                r={4}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                initial={false}
                animate={{ opacity: leftOn ? 1 : 0 }}
                transition={{ duration: 0.2, delay: leftOn ? LINE_DRAW : 0 }}
              />
            </g>
          )}

          {/* Right: the spark. Keyed on the seed, so each firing is a new
              line drawn from scratch rather than a morph of the last. */}
          {spark && (
            <g key={sparkSeed} filter="url(#lr-glow)">
              {[spark.core, ...spark.ghosts].map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="url(#lr-spark)"
                  strokeWidth={i === 0 ? 2.2 : 0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: rightOn ? 1 : 0, opacity: rightOn ? (i === 0 ? 1 : 0.6) : 0 }}
                  transition={rightOn ? lineIn(i * 0.05) : { duration: 0.35, ease: EASE_OUT }}
                />
              ))}
              {/* The strike — a burst of paint flecks where it lands. */}
              {spark.burst.map((p, i) => (
                <motion.circle
                  key={i}
                  r={p.r}
                  fill={p.color}
                  initial={{ cx: spark.end.x, cy: spark.end.y, opacity: 0 }}
                  animate={
                    rightOn
                      ? { cx: p.x, cy: p.y, opacity: [0, 1, 0.85] }
                      : { cx: spark.end.x, cy: spark.end.y, opacity: 0 }
                  }
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: rightOn ? LINE_DRAW * 0.95 : 0 }}
                />
              ))}
            </g>
          )}
        </svg>
      )}

      {/* LEFT — grotesque, black once reached. */}
      <motion.div
        ref={leftBlockRef}
        className="absolute hidden text-left lg:block"
        style={{ ...LEFT_BLOCK, z: leftZ, filter: leftBlur }}
      >
        <motion.p style={{ opacity: leftFade }} className="leading-none">
          <motion.span
            ref={leftWordRef}
            className="font-lr-grotesk inline-block text-[clamp(2.6rem,5.4vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.035em]"
            initial={false}
            animate={{ color: leftShown ? "#0a0a0a" : "#9ca3af" }}
            transition={{ duration: 0.4, delay: leftShown ? after : 0 }}
          >
            {LEFT_BRAIN.word}
          </motion.span>
          <motion.span
            className="font-lr-grotesk mt-1 block text-[clamp(1rem,1.75vw,1.9rem)] font-light leading-none"
            initial={false}
            animate={{ color: leftShown ? "#262626" : "#a3a3a3" }}
            transition={{ duration: 0.4, delay: leftShown ? after : 0 }}
          >
            brain
          </motion.span>
        </motion.p>
        <div className="font-lr-serif mt-2 text-[clamp(0.8rem,1.02vw,1.08rem)] leading-[1.3] text-neutral-800">
          {LEFT_BRAIN.lines.map((line, i) => (
            <motion.p
              key={i}
              initial={false}
              animate={leftShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{
                duration: 0.35,
                ease: EASE_OUT,
                delay: leftShown ? after + i * LINE_STAGGER : 0,
              }}
            >
              <BoldLast line={line} />
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* RIGHT — script, to paint once struck; the lines come in colour. */}
      <motion.div
        ref={rightBlockRef}
        className="absolute hidden text-right lg:block"
        style={{ ...RIGHT_BLOCK, z: rightZ, filter: rightBlur }}
      >
        <motion.p style={{ opacity: rightFade }} className="leading-none">
          <span ref={rightWordRef} className="relative inline-block">
            <span className="font-lr-script block px-[0.15em] text-[clamp(3.2rem,6.6vw,7.4rem)] leading-[0.95] text-neutral-400">
              {RIGHT_BRAIN.word}
            </span>
            {/* The painted word, crossfaded over the grey one. ⚠ Opacity on
                this layer, never an alpha on its text colour — `bg-clip-text`
                text is transparent, and dimming it that way kills the clip. */}
            <motion.span
              aria-hidden
              className="brain-paint font-lr-script absolute inset-0 block bg-clip-text px-[0.15em] text-[clamp(3.2rem,6.6vw,7.4rem)] leading-[0.95] text-transparent"
              initial={false}
              animate={{ opacity: rightShown ? 1 : 0 }}
              transition={{ duration: 0.45, delay: rightShown ? after : 0 }}
            >
              {RIGHT_BRAIN.word}
            </motion.span>
          </span>
          <motion.span
            className="font-lr-grotesk -mt-1 block text-[clamp(1rem,1.75vw,1.9rem)] font-light leading-none"
            initial={false}
            animate={{ color: rightShown ? "#3f6ad8" : "#a3a3a3" }}
            transition={{ duration: 0.4, delay: rightShown ? after : 0 }}
          >
            brain
          </motion.span>
        </motion.p>
        <div className="font-lr-serif mt-2 text-[clamp(0.8rem,1.02vw,1.08rem)] leading-[1.3]">
          {RIGHT_BRAIN.lines.map((line, i) => (
            <motion.p
              key={i}
              style={{ color: INK[i % INK.length] }}
              initial={false}
              animate={rightShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{
                duration: 0.35,
                ease: EASE_OUT,
                delay: rightShown ? after + i * LINE_STAGGER : 0,
              }}
            >
              <BoldLast line={line} />
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Below `lg` (phones, tablets): the blocks can't stand beside the
          brain, so the headlines sit above it and the reached side's lines
          set in the open band beneath it. A tap on a side reaches it. */}
      {/* ⚠ Placed BELOW the wordmark — its top (3.2%), its size
          (max(1.9rem, 4.6vw)) and its name line (~2.4rem), all from HeroStage —
          so the headlines clear it at every width now that it is twice the
          size it was. */}
      <div aria-hidden className="absolute inset-x-0 top-[calc(3.2%+max(1.9rem,4.6vw)+2.4rem)] flex justify-between px-5 sm:px-12 lg:hidden">
        <motion.p
          className="font-lr-grotesk origin-left text-center leading-none text-neutral-900"
          initial={false}
          animate={{ opacity: leftOn ? 1 : rightOn ? 0.3 : 0.75, scale: leftOn ? 1.1 : 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <span className="block text-[2.2rem] font-extrabold tracking-[-0.03em] sm:text-[3.4rem]">
            {LEFT_BRAIN.word}
          </span>
          <span className="block text-sm font-light sm:text-lg">brain</span>
        </motion.p>
        <motion.p
          className="origin-right text-center leading-none"
          initial={false}
          animate={{ opacity: rightOn ? 1 : leftOn ? 0.3 : 0.75, scale: rightOn ? 1.1 : 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <span className="brain-paint font-lr-script block bg-clip-text px-[0.1em] text-[2.8rem] text-transparent sm:text-[4.2rem]">
            {RIGHT_BRAIN.word}
          </span>
          <span className="font-lr-grotesk block text-sm font-light text-neutral-600 sm:text-lg">brain</span>
        </motion.p>
      </div>
      {/* ⚠ Anchored to the Flythrough's "Scroll to explore" cue (bottom 8.5%)
          plus the cue's own height — a plain percentage met it on some
          heights, and the hint printed over "Scroll". */}
      <div className="font-lr-serif absolute inset-x-5 bottom-[calc(8.5%+3.5rem)] text-[0.95rem] leading-[1.3] sm:inset-x-12 sm:text-[1.15rem] lg:hidden">
        <AnimatePresence mode="wait" initial={false}>
          {leftOn || rightOn ? (
            <motion.div
              key={leftOn ? "left" : "right"}
              // Each side keeps to its own edge, under its own headline.
              className={leftOn ? "text-left" : "text-right"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {(leftOn ? LEFT_BRAIN : RIGHT_BRAIN).lines.map((line, i) => (
                <motion.p
                  key={i}
                  style={{ color: leftOn ? "#262626" : INK[i % INK.length] }}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT, delay: i * LINE_STAGGER }}
                >
                  <BoldLast line={line} />
                </motion.p>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              className="font-lr-grotesk text-center text-[0.65rem] font-light uppercase tracking-[0.28em] text-neutral-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Tap left or right
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
