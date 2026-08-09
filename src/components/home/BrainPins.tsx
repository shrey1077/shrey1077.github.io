"use client";

/**
 * BrainPins — the sections, floating either side of the brain.
 *
 * No leader lines back to the brain any more. Each section is a label pill with
 * a short stub running off its inner edge to a stroked circle, and the whole
 * A second rule runs the other way, from the pill's outer edge to the screen
 * corner, so each section reads as strung across the flank. They hold still:
 * the four used to levitate, but eight drifting labels around a brain that
 * already answers the mouse was one moving thing too many.
 *
 * Three states, and the open state deliberately inverts the resting one:
 *   rest    label filled, trailing circle stroked and empty
 *   hover   a small flat dot drops into the circle
 *   open    the label keeps its shape but flips to stroked with dark text,
 *           while the trailing circle fills solid — the two swap treatments
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

const CIRCLE = 18;

/** Where each column sits and the band it occupies. THINK is high on the crown
 *  so the left flank is clear from 40% down; IMAGINE runs along the base, so
 *  the right column has to sit above it. */
const COL = {
  logic: { x: "left-[3vw]", top: 0.46, step: 0.075, align: "flex-row" },
  creative: { x: "right-[3vw]", top: 0.22, step: 0.07, align: "flex-row-reverse" },
} as const;

type Side = "logic" | "creative";

interface Pin {
  id: NavSectionId;
  label: string;
  y: number;
  side: Side;
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

  return (
    <div
      className={`absolute ${COL[pin.side].x} flex items-center ${COL[pin.side].align}`}
      style={{ top: `${pin.y * 100}%` }}
    >
      {/* Outer rule — pill to the screen edge. Sits on the row (which is the
          positioned ancestor), so `right-full` lands it flush at x=0. */}
      <span
        aria-hidden
        className={`absolute top-1/2 h-px w-[3vw] bg-neutral-900/45 ${
          logic ? "right-full" : "left-full"
        }`}
      />

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
        {/* The label keeps its pill geometry throughout — only the treatment
            flips. Filled with white type at rest; stroked with dark type once
            open. (It used to go square-and-round on open, which ballooned into
            a circle wide enough to collide with the pill below.)

            The creative side's stroke is a gradient, which CSS borders cannot
            do, so it is a 2px paint-filled wrapper around an inner pill in the
            page colour — the classic gradient-border trick. */}
        {open && !logic ? (
          <span className="brain-paint grid place-items-center rounded-full p-[2px]">
            <span className="brain-paint bg-clip-text font-graff grid place-items-center whitespace-nowrap rounded-full bg-gallery px-3.5 py-1.5 text-center text-[1.07rem] leading-none text-transparent">
              {pin.label}
            </span>
          </span>
        ) : (
          <span
            className={`grid place-items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-[1.07rem] leading-none transition-colors duration-300 ${
              open
                ? "border-2 border-neutral-950 bg-transparent text-neutral-950"
                : `text-white ${fill}`
            } ${logic ? "font-digibra" : "font-graff"}`}
          >
            {pin.label}
          </span>
        )}

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
    </div>
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
