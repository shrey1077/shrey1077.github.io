"use client";

/**
 * BrainTraces — the two buses the sections hang from (owner, 2026-10-05).
 *
 * Each hemisphere sends ONE line down out of its underside; it turns outward,
 * runs to its column's trunk, and drops down the trunk, and each of that
 * side's four sections hangs off the trunk on a short stub that ends at its
 * circle — the logic side in black circuit line, the creative side in
 * coloured pencil, mirrored. (Until then every section ran its own trace into
 * the brain — a jogged circuit line on the left, a pencil stroke on the right;
 * git has both.)
 *
 * ⚠ THIS IS A SEPARATE LAYER FROM BrainPins, AND MUST STAY ONE. The line
 * leaves from BEHIND the brain: it starts inside the hemisphere and is drawn
 * UNDER the footage, so the brain's own opaque pixels hide it until it comes
 * out of the underside. BrainPins sits above the footage at z-20, so nothing
 * it draws could go behind it. HeroStage mounts this immediately before the
 * footage instead, with no z-index of its own.
 *
 * ⚠ WHERE IT LEAVES THE BRAIN IS MEASURED OFF THE ARTWORK, not judged. The
 * brain is a 48-frame scrub whose silhouette moves with the pointer, so both
 * numbers come from the per-pixel extremes of all 48 frames:
 *   · the drop STARTS inside the band that is opaque in every frame (rows
 *     480–580 from x ≈ 460 on the left, to ≈ 840 on the right — measured
 *     2026-09-17 and 2026-10-03), so its start is always covered;
 *   · the horizontal run sits BELOW the lowest row any frame reaches (≈ 640,
 *     measured 2026-10-05 — the faint alpha further down is a soft shadow),
 *     so it always shows.
 * Those are FRAME pixels; `toStage` repeats the footage layer's fit, scale and
 * shift, so the line tracks the brain at any viewport. Re-measure if the
 * frames are replaced.
 *
 * The rest is measured off the DOM: each section's circle (`data-pin-anchor`
 * on the left, the artwork's `data-pin-ring` on the right) and each column's
 * trunk (`data-pin-trunk`), which BrainPins places.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CONNECTOR_DRAW, PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { BRAIN_FRAME_H, BRAIN_FRAME_W } from "@/components/home/BrainSequence";
import { EASE_OUT } from "@/constants/motion";
import type { NavSectionId } from "@/types/navigation";

/** Where each hemisphere's line starts: inside the always-opaque band, a
 *  little in from the seam on each side (frame px). The right is the left
 *  mirrored across the seam (BRAIN_CENTRE.x, 594). */
const DROP_X = 470;
const DROP_X_RIGHT = 2 * 594 - DROP_X;
const DROP_Y = 570;
/** The lowest row any frame's brain reaches, frame px (see the header). */
const BRAIN_FOOT = 640;
/** px the run keeps clear of the brain's foot, and the least it keeps above
 *  the first section — so the trunk always shows a stretch before its first
 *  stub, however short the stage. */
const FOOT_CLEAR = 10;
const RUN_MIN = 18;
const RUN_MAX = 44;

/** px. The dot on each junction. */
const NODE = 2.2;
const STROKE_REST = 1;
const STROKE_OPEN = 2;
/** Seconds for the bus to draw, before the stubs. */
const DRAW = 0.9;

interface Anchor {
  id: NavSectionId;
  x: number;
  y: number;
  /** The section's own colour — the creative side's rings carry one. */
  color?: string;
}

interface Bus {
  /** Out of the brain, along, and down the trunk. */
  trunk: string;
  /** The corners and junctions — where the dots sit. */
  nodes: { x: number; y: number }[];
  stubs: { id: NavSectionId; d: string; index: number; pts: { x: number; y: number }[]; color?: string }[];
  trunkPts: { x: number; y: number }[];
}

/** A frame pixel → stage pixel, exactly as the footage layer places it.
 *  Exported for LeftRightBrain and BrainDock, which place things on the brain
 *  too. */
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

/** Brain centre, frame pixels — the grey/colour seam at rest (x 594, see the
 *  hemisphere circle fits made 2026-10-02) on their row. */
export const BRAIN_CENTRE = { x: 594, y: 396 };

/** One side's bus: down out of the brain at `dropFx`, along to the trunk, down
 *  the trunk to the last section, and a stub from the trunk to each circle. */
function buildBus(
  anchors: Anchor[],
  trunkX: number,
  dropFx: number,
  w: number,
  h: number,
  brain: { scale: number; shiftX: number; rise: number },
): Bus | null {
  if (!anchors.length) return null;
  const { scale, shiftX, rise } = brain;
  const drop = toStage(dropFx, DROP_Y, w, h, scale, shiftX, rise);
  const foot = toStage(dropFx, BRAIN_FOOT, w, h, scale, shiftX, rise).y + FOOT_CLEAR;
  const first = anchors[0].y;
  const last = anchors[anchors.length - 1].y;
  // Under the brain's foot — but never so close to the first section that the
  // trunk has nothing to show above it, nor so far that it floats.
  const runY = Math.min(first - RUN_MIN, Math.max(foot, first - RUN_MAX));
  const trunkPts = [
    { x: drop.x, y: drop.y },
    { x: drop.x, y: runY },
    { x: trunkX, y: runY },
    { x: trunkX, y: last },
  ];
  return {
    trunk: `M ${drop.x} ${drop.y} V ${runY} H ${trunkX} V ${last}`,
    trunkPts,
    nodes: [{ x: drop.x, y: runY }, { x: trunkX, y: runY }, ...anchors.map((a) => ({ x: trunkX, y: a.y }))],
    stubs: anchors.map((a, i) => ({
      id: a.id,
      d: `M ${trunkX} ${a.y} H ${a.x}`,
      pts: [
        { x: trunkX, y: a.y },
        { x: a.x, y: a.y },
      ],
      index: i,
      color: a.color,
    })),
  };
}

/* ── Pencil, for the creative bus ────────────────────────────────────────────
 * Each stroke is STRANDS hand-jittered lines laid over each other, each a
 * little off the last, through a turbulence filter that roughens the edges the
 * way graphite catches paper. The jitter is SEEDED by a key, so a stroke is the
 * same scribble on every load rather than a new one per render. */

const STRANDS = 3;
/** px between samples along a stroke; smaller is smoother, larger scratchier. */
const PENCIL_STEP = 7;
/** The paint palette (globals' `.brain-paint`), for the strokes' second hue. */
const PAINT = ["#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518", "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0"];

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
 *  ease in over the first stretch, so every strand leaves its start cleanly. */
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

/** A pencil stroke along `pts`: STRANDS strands, in `color` and a neighbour
 *  from the paint palette. */
function pencil(pts: { x: number; y: number }[], key: string, color: string) {
  const rnd = seeded(key);
  const second = PAINT[Math.floor(rnd() * PAINT.length)];
  return Array.from({ length: STRANDS }, (_, k) => ({
    d: pencilStrand(pts, rnd, 0.5 + k * 0.35, (k - 1) * 0.9),
    color: k === 1 ? second : color,
    width: 1.1 + rnd() * 0.9,
    opacity: 0.55 + rnd() * 0.3,
  }));
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
  const [geo, setGeo] = useState<{
    w: number;
    h: number;
    logic: Anchor[];
    creative: Anchor[];
    trunk: { logic: number; creative: number };
  } | null>(null);
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
      // ⚠ The stage may be mid-flight in depth when this runs, and screen
      // boxes include that scale; layout size does not, so everything is
      // divided back by the ratio of the two. A translateZ under perspective
      // is a uniform scale, so one number does it.
      const W = stage.offsetWidth || box.width;
      const H = stage.offsetHeight || box.height;
      const k = box.width / W;
      const read = (sel: string, attr: string, edge: "left" | "centre"): Anchor[] => {
        const out: Anchor[] = [];
        stage.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          const r = el.getBoundingClientRect();
          // Below `lg` the pins are display:none and measure as zero.
          if (!r.x && !r.y && !r.width) return;
          out.push({
            id: el.getAttribute(attr) as NavSectionId,
            x: ((edge === "left" ? r.left : r.left + r.width / 2) - box.left) / k,
            y: (r.top + r.height / 2 - box.top) / k,
            color: el.dataset.pinColor,
          });
        });
        return out.sort((a, b) => a.y - b.y);
      };
      const logic = read("[data-pin-anchor]", "data-pin-anchor", "left");
      const creative = read("[data-pin-ring]", "data-pin-ring", "centre");
      const trunkOf = (side: string) => {
        const el = stage.querySelector<HTMLElement>(`[data-pin-trunk="${side}"]`);
        return el ? (el.getBoundingClientRect().left - box.left) / k : NaN;
      };
      const trunk = { logic: trunkOf("logic"), creative: trunkOf("creative") };
      const near = (a: Anchor[], b: Anchor[]) =>
        a.length === b.length && a.every((p, i) => Math.abs(p.x - b[i].x) < 0.5 && Math.abs(p.y - b[i].y) < 0.5);
      setGeo((prev) =>
        prev &&
        prev.w === W &&
        prev.h === H &&
        near(prev.logic, logic) &&
        near(prev.creative, creative) &&
        Math.abs(prev.trunk.logic - trunk.logic) < 0.5 &&
        Math.abs(prev.trunk.creative - trunk.creative) < 0.5
          ? prev
          : { w: W, h: H, logic, creative, trunk },
      );
    };

    // ⚠ The STAGE is observed for resizes, and every pin BUTTON for its own
    // size: a label's width moves when the web font swaps in, and that does
    // not resize the stage.
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    stage.querySelectorAll("[data-pin-anchor], [data-pin-ring]").forEach((el) => {
      ro.observe(el.closest("button") ?? el);
    });
    return () => ro.disconnect();
  }, []);

  const brain = { scale, shiftX, rise };
  const logic =
    geo && Number.isFinite(geo.trunk.logic)
      ? buildBus(geo.logic, geo.trunk.logic, DROP_X, geo.w, geo.h, brain)
      : null;
  const creative =
    geo && Number.isFinite(geo.trunk.creative)
      ? buildBus(geo.creative, geo.trunk.creative, DROP_X_RIGHT, geo.w, geo.h, brain)
      : null;

  /** A stub lands as its section appears (BrainPins' CONNECTOR_DRAW beat). */
  const stubDelay = (i: number) => (reduceMotion ? 0 : DRAW * 0.6 + i * CONNECTOR_DRAW * 0.6);
  const draw = (delay: number, duration = DRAW) => ({
    duration: reduceMotion ? 0 : duration,
    ease: EASE_OUT,
    delay: reduceMotion ? 0 : delay,
  });

  return (
    <svg
      ref={svgRef}
      aria-hidden
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

      {/* ── The logic bus: black circuit line, dotted at every joint. ──
          ⚠ Darker than a hairline (/70): it crosses the artwork's own
          circuitry on the way out, and lighter it sank into it. */}
      {logic && (
        <g className="text-neutral-900/70">
          <motion.path
            d={logic.trunk}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_REST}
            strokeLinejoin="round"
            initial={reduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={draw(0)}
          />
          {logic.stubs.map((s) => (
            <motion.path
              key={s.id}
              d={s.d}
              fill="none"
              stroke="currentColor"
              strokeWidth={open === s.id ? STROKE_OPEN : STROKE_REST}
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={draw(stubDelay(s.index), 0.35)}
            />
          ))}
          <motion.g
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={draw(DRAW * 0.5, 0.3)}
          >
            {logic.nodes.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={NODE} fill="currentColor" />
            ))}
          </motion.g>
        </g>
      )}

      {/* ── The creative bus: the same shape, mirrored, in coloured pencil —
          the trunk in the paint, each stub in its section's own ring colour. */}
      {creative && (
        <g filter="url(#brain-pencil)">
          {pencil(creative.trunkPts, "creative-trunk", PAINT[0]).map((s, k) => (
            <motion.path
              key={`t${k}`}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.opacity}
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={draw(k * 0.08)}
            />
          ))}
          {creative.stubs.map((stub) =>
            pencil(stub.pts, stub.id, stub.color ?? PAINT[0]).map((s, k) => (
              <motion.path
                key={`${stub.id}${k}`}
                d={s.d}
                fill="none"
                stroke={s.color}
                strokeWidth={open === stub.id ? s.width + 0.8 : s.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={open === stub.id ? Math.min(1, s.opacity + 0.2) : s.opacity}
                initial={reduceMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={draw(stubDelay(stub.index) + k * 0.05, 0.4)}
              />
            )),
          )}
        </g>
      )}
    </svg>
  );
}
