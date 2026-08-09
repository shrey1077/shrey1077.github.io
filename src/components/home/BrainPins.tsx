"use client";

/**
 * BrainPins — the sections, floating either side of the brain.
 *
 * No leader lines back to the brain any more. Each section is a label pill with
 * a short stub running off its inner edge to a stroked circle, and the whole
 * assembly levitates on its own slow cycle so the four read as suspended rather
 * than pinned to anything.
 *
 * Three states, and the open state deliberately inverts the resting one:
 *   rest    label filled, trailing circle stroked and empty
 *   hover   levitation stops, a small flat dot drops into the circle
 *   open    the label becomes a stroked circle with dark text and the trailing
 *           circle fills solid — the two swap roles
 *
 * The logic side fills flat black; the creative side fills with the brain-paint
 * gradient. Choosing one opens its panel across the foot of the stage.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NAV_SECTIONS } from "@/constants/navigation";
import type { NavSectionId } from "@/types/navigation";
import { EASE_OUT } from "@/constants/motion";

/** Fired when a section is chosen (or cleared); the panel follows it. */
export const PIN_OPEN_EVENT = "brainpin:open";

const CIRCLE = 26;

/** Where each column sits and the band it occupies. THINK is high on the crown
 *  so the left flank is clear from 40% down; IMAGINE runs along the base, so
 *  the right column has to sit above it. */
const COL = {
  logic: { x: "left-[3vw]", top: 0.4, step: 0.115, align: "flex-row" },
  creative: { x: "right-[3vw]", top: 0.17, step: 0.105, align: "flex-row-reverse" },
} as const;

type Side = "logic" | "creative";

interface Pin {
  id: NavSectionId;
  label: string;
  y: number;
  side: Side;
  /** Each pin drifts on its own period so the four never bob in unison. */
  drift: number;
}

function buildPins(): Pin[] {
  const make = (side: Side, hemisphere: "left" | "right"): Pin[] =>
    NAV_SECTIONS.filter((s) => s.hemisphere === hemisphere)
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({
        id: s.id,
        label: s.label,
        y: COL[side].top + i * COL[side].step,
        side,
        drift: 3.6 + i * 0.55,
      }));
  return [...make("logic", "left"), ...make("creative", "right")];
}

function PinRow({
  pin,
  open,
  onToggle,
  reduceMotion,
}: {
  pin: Pin;
  open: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const [hover, setHover] = useState(false);
  const logic = pin.side === "logic";
  const fill = logic ? "bg-neutral-950" : "brain-paint";
  const stopped = hover || open || reduceMotion;

  return (
    <motion.div
      className={`absolute ${COL[pin.side].x} flex items-center ${COL[pin.side].align}`}
      style={{ top: `${pin.y * 100}%` }}
      animate={stopped ? { y: 0 } : { y: [0, -9, 0] }}
      transition={
        stopped
          ? { duration: 0.5, ease: EASE_OUT }
          : { duration: pin.drift, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className={`pointer-events-auto flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${COL[pin.side].align}`}
      >
        {/* The label: a filled pill at rest, a stroked circle with dark text
            once open, trading places with the trailing circle. */}
        <span
          className={`grid place-items-center whitespace-nowrap text-center leading-none transition-all duration-300 ${
            open
              ? "aspect-square rounded-full border-2 border-neutral-950 bg-transparent p-4 text-neutral-950"
              : `rounded-full px-5 py-2.5 text-white ${fill}`
          } ${logic ? "font-digibra text-[1.6rem]" : "font-graff text-[3.2rem]"}`}
        >
          {pin.label}
        </span>

        {/* The stub, then the circle it runs to. */}
        <span aria-hidden className="h-px w-6 shrink-0 bg-neutral-900/45" />
        <span
          aria-hidden
          className={`grid shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
            open
              ? logic
                ? "border-neutral-950 bg-neutral-950"
                : "brain-paint border-transparent"
              : "border-neutral-950 bg-transparent"
          }`}
          style={{ width: CIRCLE, height: CIRCLE }}
        >
          {/* Hover tell: a small flat dot drops into the empty circle. */}
          <motion.span
            className={`block rounded-full ${logic ? "bg-neutral-950" : "brain-paint"}`}
            initial={false}
            animate={{ scale: hover && !open ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
            style={{ width: CIRCLE * 0.42, height: CIRCLE * 0.42 }}
          />
        </span>
      </button>
    </motion.div>
  );
}

export function BrainPins() {
  const reduceMotion = useReducedMotion() ?? false;
  const pins = buildPins();
  const [open, setOpen] = useState<NavSectionId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Tell the rest of the page which section is open, so the panel can follow.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PIN_OPEN_EVENT, { detail: open }));
  }, [open]);

  // Anywhere outside the pins or the open panel closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-section-panel]")) return;
      setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      {pins.map((p) => (
        <PinRow
          key={p.id}
          pin={p}
          open={open === p.id}
          reduceMotion={reduceMotion}
          onToggle={() => setOpen((o) => (o === p.id ? null : p.id))}
        />
      ))}
    </div>
  );
}
