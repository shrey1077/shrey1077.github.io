"use client";

/**
 * BrainTraces — the logic pins' runs into the brain.
 *
 * Each left-hand section leaves its stroked circle as a circuit trace: straight
 * out, one 45° jog, then straight on until it disappears INTO the artwork. The
 * owner asked for this on 2026-09-17, from a mockup where the pins were wired
 * to the brain and the wires ended behind it.
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

/** px. Straight run out of the widest pin's circle before any line may turn,
 *  so the four jogs line up as a column rather than starting wherever each
 *  label happens to end. */
const LEAD = 34;
/** px. How much later each successive jog starts. Lines heading the SAME way
 *  turn in order — the one with further to go turns first — so no diagonal
 *  crosses another. This must stay below the row spacing (~48px at the
 *  smallest desktop stage) or the ordering stops protecting it. */
const STAGGER = 22;
/** px. The short spur that carries on straight past each jog, and its end
 *  ring — the branch-and-node detail the mockup's traces have. */
const SPUR = 18;
const SPUR_RING = 2.5;
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
  /** The jog's corner — where the node dot and the spur sit. Null when the
   *  line barely moves: a spur laid along a near-flat run would sit on top of
   *  the line itself and read as a thicker patch, not a branch. */
  jog: { x: number; y: number } | null;
  index: number;
}

/** A frame pixel → stage pixel, exactly as the footage layer places it. */
function toStage(
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
    // The end must be past the jog. On any desktop stage it is by a wide margin;
    // the guard only stops a malformed path if the brain is ever moved hard left.
    const endX = Math.max(top.x, diagEnd + SPUR + 12);
    return {
      id: s.id,
      d: `M ${s.x} ${s.y} H ${jx} L ${diagEnd} ${ty} H ${endX}`,
      jog: Math.abs(drop) < MIN_JOG ? null : { x: jx, y: s.y },
      index: i,
    };
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
  const [geo, setGeo] = useState<{ w: number; h: number; starts: Start[] } | null>(null);
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
      const starts: Start[] = [];
      stage.querySelectorAll<HTMLElement>("[data-pin-circle]").forEach((el) => {
        const r = el.getBoundingClientRect();
        // Below `lg` the pins are display:none and measure as zero — no runs.
        if (!r.width) return;
        starts.push({
          id: el.dataset.pinCircle as NavSectionId,
          x: r.right - box.left,
          y: r.top + r.height / 2 - box.top,
        });
      });
      starts.sort((a, b) => a.y - b.y);
      setGeo((prev) => {
        const same =
          prev &&
          prev.w === box.width &&
          prev.h === box.height &&
          prev.starts.length === starts.length &&
          prev.starts.every(
            (p, i) => Math.abs(p.x - starts[i].x) < 0.5 && Math.abs(p.y - starts[i].y) < 0.5,
          );
        return same ? prev : { w: box.width, h: box.height, starts };
      });
    };

    // ⚠ The STAGE is observed for resizes, and every pin BUTTON for its own
    // width: the circle sits at the end of a label, so it moves when the web
    // font swaps in and when opening a pin thickens the pill's border — and
    // neither of those resizes the stage.
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    stage.querySelectorAll("[data-pin-circle]").forEach((el) => {
      ro.observe(el.closest("button") ?? el);
    });
    return () => ro.disconnect();
  }, []);

  const traces = geo ? buildTraces(geo.starts, geo.w, geo.h, { scale, shiftX, rise }) : [];

  return (
    <svg
      ref={svgRef}
      aria-hidden
      // A true pixel viewBox, unlike BrainPins' stretched 0–100 one, so strokes
      // and the draw-in need no non-scaling tricks.
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
    >
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
              <path
                d={`M ${t.jog.x} ${t.jog.y} H ${t.jog.x + SPUR}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_REST}
              />
              <circle
                cx={t.jog.x + SPUR + SPUR_RING}
                cy={t.jog.y}
                r={SPUR_RING}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_REST}
              />
              <circle cx={t.jog.x} cy={t.jog.y} r={NODE} fill="currentColor" />
            </motion.g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
