"use client";

/**
 * BrainTraces — the logic pins' runs into the brain.
 *
 * Each left-hand section leaves its stroked circle as a circuit trace: straight
 * out, one 45° jog, then straight on until it disappears INTO the artwork. The
 * owner asked for this on 2026-09-17, from a mockup where the pins were wired
 * to the brain and the wires ended behind it. Since 2026-10-03 the right-hand
 * sections' pencil strokes take the SAME shape, mirrored (see buildPencils),
 * and neither side's straight run carries on past its jog any more — the
 * short spur and ring that used to overshoot each corner are gone (owner).
 *
 * ⚠ THIS IS A SEPARATE LAYER FROM BrainPins, AND MUST STAY ONE. "Ends behind the
 * brain" is a stacking requirement: the line has to paint UNDER the footage so
 * the brain's own opaque pixels hide its last stretch. BrainPins sits above the
 * footage at z-20, so nothing it draws can go behind it. HeroStage mounts this
 * immediately before the footage instead, with no z-index of its own.
 *
 * ⚠ WHERE THE LINES END IS MEASURED OFF THE ARTWORK, not judged by eye. The
 * brain is a 48-frame scrub, and the silhouette moves a lot as the pointer
 * crosses the screen — the left hemisphere breaks up into circuitry at one
 * extreme. A line ending where the RESTING frame is solid shows its tip the
 * moment the brain turns. So the band below was taken from the per-pixel
 * MINIMUM alpha across all 48 frames (2026-09-17): rows 480–580 are opaque
 * (alpha > 200) from x ≈ 460 rightward in every one of them, and nothing
 * above row 460 is. SOLID_* sits inside that with a margin. Re-measure if
 * the frames are replaced; BrainSequence says so too.
 *
 * Those are FRAME pixels. The canvas fits the frame to the stage with
 * `object-contain`, and HeroStage then scales and shifts the whole footage
 * layer — `toStage` repeats exactly that, so the ends track the brain at any
 * viewport without measuring the canvas (whose box is the untransformed stage,
 * and tells you nothing about where the brain actually is).
 *
 * The starts ARE measured: each circle's right edge, read off the DOM, because
 * the pills are as wide as their labels.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CONNECTOR_DRAW, PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { BRAIN_FRAME_H, BRAIN_FRAME_W } from "@/components/home/BrainSequence";
import { EASE_OUT } from "@/constants/motion";
import type { NavSectionId } from "@/types/navigation";

/** The opaque-in-every-frame band the lines end in, in frame pixels. The
 *  measured band is 480–580 from x ≈ 460; these keep clear of its edges. */
const SOLID_TOP = 490;
const SOLID_BOTTOM = 570;
/** Where every line stops. Well inside the band, so the tip is covered even
 *  when the brain turns. */
const END_X = 520;
/** The creative strokes' stop: END_X mirrored across the seam (BRAIN_CENTRE.x,
 *  594). The same rows are opaque there in all 48 frames — measured
 *  2026-10-03: rows 480–580 hold from x ≈ 390 to ≈ 840. */
const END_X_RIGHT = 2 * 594 - END_X;

/** px. Straight run out of the widest pin's circle before any line may turn,
 *  so the four jogs line up as a column rather than starting wherever each
 *  label happens to end. */
const LEAD = 34;
/** px. How much later each successive jog starts. Lines heading the SAME way
 *  turn in order — the one with further to go turns first — so no diagonal
 *  crosses another. This must stay below the row spacing (~48px at the
 *  smallest desktop stage) or the ordering stops protecting it. */
const STAGGER = 22;
/** px. The dot on each jog's corner. (A short spur and ring used to carry
 *  the straight run on past the corner; the owner removed them 2026-10-03.) */
const NODE = 2;
/** px. Below this a line is treated as straight and gets no jog detail. */
const MIN_JOG = 8;

const STROKE_REST = 1;
const STROKE_OPEN = 2;
/** Seconds for one run to draw. */
const DRAW = 0.9;

interface Start {
  id: NavSectionId;
  x: number;
  y: number;
}

interface Trace {
  id: NavSectionId;
  d: string;
  /** The jog's corner — where the node dot sits. Null when the line barely
   *  moves: there is no corner to mark. */
  jog: { x: number; y: number } | null;
  index: number;
}

/** A frame pixel → stage pixel, exactly as the footage layer places it.
 *  Exported for LeftRightBrain, which draws its lines from the brain's centre. */
export function toStage(
  fx: number,
  fy: number,
  w: number,
  h: number,
  scale: number,
  shiftX: number,
  rise: number,
) {
  // `object-contain`: fit the whole frame, centred.
  const fit = Math.min(w / BRAIN_FRAME_W, h / BRAIN_FRAME_H);
  const px = (w - BRAIN_FRAME_W * fit) / 2 + fx * fit;
  const py = (h - BRAIN_FRAME_H * fit) / 2 + fy * fit;
  // framer-motion writes translate BEFORE scale, so the shift is not scaled,
  // and the origin is the layer's centre (originX/originY 0.5).
  return {
    x: w / 2 + (px - w / 2) * scale + shiftX,
    y: h / 2 + (py - h / 2) * scale + rise,
  };
}

function buildTraces(
  starts: Start[],
  w: number,
  h: number,
  brain: { scale: number; shiftX: number; rise: number },
): Trace[] {
  const n = starts.length;
  if (!n) return [];
  const { scale, shiftX, rise } = brain;
  const top = toStage(END_X, SOLID_TOP, w, h, scale, shiftX, rise);
  const bottom = toStage(END_X, SOLID_BOTTOM, w, h, scale, shiftX, rise);
  const colX = Math.max(...starts.map((s) => s.x)) + LEAD;

  return starts.map((s, i) => {
    // The ends fan evenly down the band, in the pins' own order, so the four
    // converge on the brain without swapping places.
    const ty = n === 1 ? (top.y + bottom.y) / 2 : top.y + ((bottom.y - top.y) * i) / (n - 1);
    const drop = ty - s.y;
    // Falling lines turn top-first, rising lines bottom-first — in both cases
    // the one with further to travel turns earliest. See STAGGER.
    const rank = drop >= 0 ? i : n - 1 - i;
    const jx = colX + rank * STAGGER;
    const diagEnd = jx + Math.abs(drop);
    // The end must be past the jog — with the pins on an arc, the top and
    // bottom ones have far to fall and their diagonals can run past END_X.
    const endX = Math.max(top.x, diagEnd + 12);
    return {
      id: s.id,
      d: `M ${s.x} ${s.y} H ${jx} L ${diagEnd} ${ty} H ${endX}`,
      jog: Math.abs(drop) < MIN_JOG ? null : { x: jx, y: s.y },
      index: i,
    };
  });
}

/* ── The creative column's pencil strokes (2026-10-02) ───────────────────────
 *
 * The owner asked for each right-hand section to be "connected to the centre of
 * the brain in colourful pencil stroke style lines", from the section's left
 * side — its lead ring. They live HERE, under the footage like the logic runs,
 * so they disappear into the brain rather than being drawn across it.
 *
 * ⚠ THE LOGIC RUNS' SHAPE, MIRRORED (owner, 2026-10-03): straight in from the
 * ring, one 45° jog, straight on into the brain — the same column of jogs, the
 * same stagger so no diagonal crosses another, ending in the same opaque band
 * on the other side of the seam (END_X_RIGHT). They were loose bowed arcs to
 * the brain's centre before.
 *
 * Pencil, not ink: each section is STRANDS hand-jittered lines laid over each
 * other, each a little off the last, in the section's own ring colour and a
 * neighbour from the paint palette, through a turbulence filter that roughens
 * the edges the way graphite catches paper. The jitter is SEEDED by section id,
 * so a stroke is the same scribble on every load rather than a new one per
 * render. */

/** Brain centre, frame pixels — the grey/colour seam at rest (x 594, see
 *  the hemisphere circle fits made 2026-10-02) on their row. */
export const BRAIN_CENTRE = { x: 594, y: 396 };
const STRANDS = 3;
/** px between samples along a stroke; smaller is smoother, larger scratchier. */
const PENCIL_STEP = 7;
/** The paint palette (globals' `.brain-paint`), for each stroke's second hue. */
const PAINT = ["#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518", "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0"];

interface Ring {
  id: NavSectionId;
  x: number;
  y: number;
  color: string;
}

interface Pencil {
  id: NavSectionId;
  strands: { d: string; color: string; width: number; opacity: number }[];
  index: number;
}

/** Tiny deterministic PRNG (mulberry32), seeded from a string. */
function seeded(key: string) {
  let a = 0;
  for (let i = 0; i < key.length; i++) a = (Math.imul(a ^ key.charCodeAt(i), 2654435761) >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One hand-drawn strand along a polyline: sampled every PENCIL_STEP px, each
 *  sample nudged off the line along its segment's normal — a constant
 *  `offset` (so strands sit a hair apart) plus a wobble of up to `amp`. Both
 *  ease in over the first stretch, so every strand leaves the ring cleanly. */
function pencilStrand(pts: { x: number; y: number }[], rnd: () => number, amp: number, offset: number) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  let d = "";
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (!len) continue;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const steps = Math.max(1, Math.round(len / PENCIL_STEP));
    for (let j = d ? 1 : 0; j <= steps; j++) {
      const t = j / steps;
      const ease = Math.min(1, ((run + len * t) / (total || 1)) * 8);
      const off = (offset + (rnd() - 0.5) * 2 * amp) * ease;
      const x = a.x + (b.x - a.x) * t + nx * off;
      const y = a.y + (b.y - a.y) * t + ny * off;
      d += `${d ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    run += len;
  }
  return d;
}

function buildPencils(
  rings: Ring[],
  w: number,
  h: number,
  brain: { scale: number; shiftX: number; rise: number },
): Pencil[] {
  const n = rings.length;
  if (!n) return [];
  const { scale, shiftX, rise } = brain;
  const top = toStage(END_X_RIGHT, SOLID_TOP, w, h, scale, shiftX, rise);
  const bottom = toStage(END_X_RIGHT, SOLID_BOTTOM, w, h, scale, shiftX, rise);
  // buildTraces, mirrored: the jogs line up as a column LEAD short of the
  // left-most ring, and the strokes run LEFT into the brain.
  const colX = Math.min(...rings.map((r) => r.x)) - LEAD;
  return rings.map((ring, i) => {
    const ty = n === 1 ? (top.y + bottom.y) / 2 : top.y + ((bottom.y - top.y) * i) / (n - 1);
    const drop = ty - ring.y;
    const rank = drop >= 0 ? i : n - 1 - i;
    const jx = colX - rank * STAGGER;
    const diagEnd = jx - Math.abs(drop);
    const endX = Math.min(top.x, diagEnd - 12);
    const pts = [
      { x: ring.x, y: ring.y },
      { x: jx, y: ring.y },
      { x: diagEnd, y: ty },
      { x: endX, y: ty },
    ];
    const rnd = seeded(ring.id);
    const palette = PAINT[Math.floor(rnd() * PAINT.length)];
    const strands = Array.from({ length: STRANDS }, (_, k) => ({
      d: pencilStrand(pts, rnd, 0.5 + k * 0.35, (k - 1) * 0.9),
      color: k === 1 ? palette : ring.color,
      width: 1.1 + rnd() * 0.9,
      opacity: 0.55 + rnd() * 0.3,
    }));
    return { id: ring.id, strands, index: i };
  });
}

export function BrainTraces({
  scale,
  shiftX,
  rise,
}: {
  /** The footage layer's resting transform — pass HeroStage's own constants. */
  scale: number;
  shiftX: number;
  rise: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; starts: Start[]; rings: Ring[] } | null>(null);
  const [open, setOpen] = useState<NavSectionId | null>(null);

  useEffect(() => {
    const onPin = (e: Event) => setOpen((e as CustomEvent<NavSectionId | null>).detail);
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);

  useEffect(() => {
    const stage = svgRef.current?.parentElement;
    if (!stage) return;

    const measure = () => {
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return;
      // ⚠ The stage may be mid-flight in depth when this runs (the landing's
      // brain layer waits far back behind the orb, scaled to ~0.4 — see
      // flight.ts), and screen boxes include that scale. Layout size does
      // not, so everything is divided back by the ratio of the two. A
      // translateZ under perspective is a uniform scale, so one number does it.
      const W = stage.offsetWidth || box.width;
      const H = stage.offsetHeight || box.height;
      const k = box.width / W;
      const starts: Start[] = [];
      stage.querySelectorAll<HTMLElement>("[data-pin-circle]").forEach((el) => {
        const r = el.getBoundingClientRect();
        // Below `lg` the pins are display:none and measure as zero — no runs.
        if (!r.width) return;
        starts.push({
          id: el.dataset.pinCircle as NavSectionId,
          x: (r.right - box.left) / k,
          y: (r.top + r.height / 2 - box.top) / k,
        });
      });
      starts.sort((a, b) => a.y - b.y);
      // The creative lead rings — zero-size markers on each artwork's ring,
      // carrying the ring's own colour (BrainPins `data-pin-ring`).
      const rings: Ring[] = [];
      stage.querySelectorAll<HTMLElement>("[data-pin-ring]").forEach((el) => {
        const r = el.getBoundingClientRect();
        // Hidden below `lg`: a display:none ancestor reports a zero box.
        if (!r.x && !r.y) return;
        rings.push({
          id: el.dataset.pinRing as NavSectionId,
          x: (r.left - box.left) / k,
          y: (r.top - box.top) / k,
          color: el.dataset.pinColor ?? "#ff2e8b",
        });
      });
      rings.sort((a, b) => a.y - b.y);
      const near = <T extends { x: number; y: number }>(a: T[], b: T[]) =>
        a.length === b.length &&
        a.every((p, i) => Math.abs(p.x - b[i].x) < 0.5 && Math.abs(p.y - b[i].y) < 0.5);
      setGeo((prev) => {
        const same =
          prev &&
          prev.w === W &&
          prev.h === H &&
          near(prev.starts, starts) &&
          near(prev.rings, rings);
        return same ? prev : { w: W, h: H, starts, rings };
      });
    };

    // ⚠ The STAGE is observed for resizes, and every pin BUTTON for its own
    // width: the circle sits at the end of a label, so it moves when the web
    // font swaps in and when opening a pin thickens the pill's border — and
    // neither of those resizes the stage.
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    stage.querySelectorAll("[data-pin-circle], [data-pin-ring]").forEach((el) => {
      ro.observe(el.closest("button") ?? el);
    });
    return () => ro.disconnect();
  }, []);

  const traces = geo ? buildTraces(geo.starts, geo.w, geo.h, { scale, shiftX, rise }) : [];
  const pencils = geo ? buildPencils(geo.rings, geo.w, geo.h, { scale, shiftX, rise }) : [];

  return (
    <svg
      ref={svgRef}
      aria-hidden
      // A true pixel viewBox, unlike BrainPins' stretched 0–100 one, so strokes
      // and the draw-in need no non-scaling tricks.
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
    >
      <defs>
        {/* Graphite on paper: a fine turbulence nudges every edge a pixel or
            so, which is what turns a clean vector into a pencil line. */}
        <filter id="brain-pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.8" />
        </filter>
      </defs>
      {pencils.map((p) => {
        const isOpen = open === p.id;
        // The creative pins appear with the stage, so their strokes draw in
        // just after the logic runs have started, one after another.
        const delay = reduceMotion ? 0 : 0.6 + p.index * 0.35;
        return (
          <g key={p.id} filter="url(#brain-pencil)">
            {p.strands.map((s, k) => (
              <motion.path
                key={k}
                d={s.d}
                fill="none"
                stroke={s.color}
                strokeWidth={isOpen ? s.width + 0.8 : s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isOpen ? Math.min(1, s.opacity + 0.2) : s.opacity}
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduceMotion ? 0 : 1.1, ease: EASE_OUT, delay: delay + k * 0.08 }}
              />
            ))}
          </g>
        );
      })}
      {traces.map((t) => {
        const isOpen = open === t.id;
        // Starts the moment this pin has landed (see CONNECTOR_DRAW).
        const delay = reduceMotion ? 0 : (t.index + 1) * CONNECTOR_DRAW;
        return (
          // ⚠ Darker than BrainPins' corner hairlines (/45). These cross the
          //   artwork's own circuitry on the way in, and at /45 they sank into it
          //   and stopped reading as the pins' lines at all.
          <g key={t.id} className="text-neutral-900/70">
            <motion.path
              d={t.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={isOpen ? STROKE_OPEN : STROKE_REST}
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : DRAW, ease: EASE_OUT, delay }}
            />
            {t.jog && (
            <motion.g
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT, delay: delay + DRAW * 0.4 }}
            >
              <circle cx={t.jog.x} cy={t.jog.y} r={NODE} fill="currentColor" />
            </motion.g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
