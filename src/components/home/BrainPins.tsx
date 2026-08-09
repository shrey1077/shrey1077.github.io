"use client";

/**
 * BrainPins — the sections, annotated onto the brain.
 *
 * Both hemispheres' sections are surfaced on the landing itself rather than
 * only in the showcase below: they sit in the negative space either side of the
 * brain as callouts, each a leader line running from the brain out to a black
 * circular pointer with its label.
 *
 * The two sides are drawn differently on purpose, because they mean different
 * things. The logic hemisphere gets straight pin lines — ruled, exact. The
 * creative hemisphere gets wavy colour: each leader is a cubic curve with its
 * own bend and its own hue off the brain-paint spectrum, so no two run alike.
 *
 * Geometry is proportional to the section box, so the lines stay anchored to
 * the brain at any window size without measuring the canvas. The layer is
 * pointer-events-none and only the pins themselves take the pointer, so the
 * brain underneath keeps its mouse scrub.
 *
 * Choosing a pin opens that section in the showcase below — it dispatches
 * `brainpin:open`, which SidesShowcase listens for, then scrolls there.
 */

import { motion, useReducedMotion } from "framer-motion";
import { NAV_SECTIONS } from "@/constants/navigation";
import type { NavSectionId } from "@/types/navigation";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** Fired when a pin is chosen; SidesShowcase opens the matching section. */
export const PIN_OPEN_EVENT = "brainpin:open";

/** Pointer circle diameter — double the 6px dot the thought box uses. */
const DOT = 12;

/** Where each side's leaders leave the brain, and where the pins sit, as a
 *  fraction of the section box. Kept clear of the code stream (top-left) and
 *  the thought box (top-right). */
const LEFT_X = 0.3;
const RIGHT_X = 0.7;
const PIN_LEFT_X = 0.085;
const PIN_RIGHT_X = 0.915;

/** Vertical band the callouts occupy — below the top-corner furniture. */
const BAND_TOP = 0.42;
const BAND_STEP = 0.115;

/** Hues for the creative leaders, pulled off the brain-paint spectrum. */
const CREATIVE_HUES = ["#f0603c", "#f2a93b", "#3fa86b", "#4a7fd4"];

interface Pin {
  id: NavSectionId;
  label: string;
  /** 0..1 across the section box. */
  x: number;
  y: number;
  /** Where its leader meets the brain. */
  anchorX: number;
  anchorY: number;
  side: "logic" | "creative";
  hue: string;
}

function buildPins(): Pin[] {
  const logic = NAV_SECTIONS.filter((s) => s.hemisphere === "left").sort((a, b) => a.order - b.order);
  const creative = NAV_SECTIONS.filter((s) => s.hemisphere === "right").sort((a, b) => a.order - b.order);

  const make = (list: typeof logic, side: "logic" | "creative"): Pin[] =>
    list.map((s, i) => {
      const y = BAND_TOP + i * BAND_STEP;
      return {
        id: s.id,
        label: s.label,
        x: side === "logic" ? PIN_LEFT_X : PIN_RIGHT_X,
        y,
        anchorX: side === "logic" ? LEFT_X : RIGHT_X,
        // Leaders converge toward the brain's middle, so they read as coming
        // OUT of it rather than running parallel to the edge.
        anchorY: 0.5 + (y - 0.5) * 0.35,
        side,
        hue: side === "logic" ? "#111114" : CREATIVE_HUES[i % CREATIVE_HUES.length],
      };
    });

  return [...make(logic, "logic"), ...make(creative, "creative")];
}

/** A straight leader for logic; a two-bend cubic for creative. The wave's
 *  amplitude alternates by index so neighbouring curves don't trace each other. */
function leaderPath(p: Pin, i: number): string {
  const x1 = p.anchorX * 100;
  const y1 = p.anchorY * 100;
  const x2 = p.x * 100;
  const y2 = p.y * 100;

  if (p.side === "logic") return `M ${x1} ${y1} L ${x2} ${y2}`;

  const dir = i % 2 === 0 ? 1 : -1;
  const amp = 5 + (i % 3) * 2.5;
  const cx1 = x1 + (x2 - x1) * 0.3;
  const cy1 = y1 + amp * dir;
  const cx2 = x1 + (x2 - x1) * 0.7;
  const cy2 = y2 - amp * dir;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

export function BrainPins() {
  const reduceMotion = useReducedMotion();
  const pins = buildPins();

  const open = (id: NavSectionId) => {
    window.dispatchEvent(new CustomEvent(PIN_OPEN_EVENT, { detail: id }));
    document.getElementById("explore")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      {/* Leaders. Non-scaling strokes so the hairlines stay hairlines whatever
          the aspect ratio does to the viewBox. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {pins.map((p, i) => (
          <motion.path
            key={p.id}
            d={leaderPath(p, i)}
            fill="none"
            stroke={p.hue}
            strokeWidth={p.side === "logic" ? 1 : 1.4}
            strokeOpacity={p.side === "logic" ? 0.5 : 0.75}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.9,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : 0.5 + i * 0.08,
            }}
          />
        ))}
      </svg>

      {/* The pointers themselves. */}
      {pins.map((p, i) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DURATION.medium, ease: EASE_OUT, delay: reduceMotion ? 0 : 0.9 + i * 0.08 }}
        >
          <button
            type="button"
            onClick={() => open(p.id)}
            className={`pointer-events-auto group flex -translate-y-1/2 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
              p.side === "logic" ? "-translate-x-0 flex-row" : "-translate-x-full flex-row-reverse"
            }`}
          >
            <span
              aria-hidden
              className="block shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
              style={{
                width: DOT,
                height: DOT,
                background: p.side === "logic" ? "#111114" : p.hue,
                boxShadow: `0 0 0 4px ${p.side === "logic" ? "rgba(17,17,20,0.10)" : `${p.hue}22`}`,
              }}
            />
            <span
              className={`whitespace-nowrap text-[0.72rem] font-medium tracking-tight text-neutral-600 transition-colors duration-300 group-hover:text-neutral-950 ${
                p.side === "creative" ? "text-right" : ""
              }`}
            >
              {p.label}
            </span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
