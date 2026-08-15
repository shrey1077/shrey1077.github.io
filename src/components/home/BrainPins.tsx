"use client";

/**
 * BrainPins — the sections, floating either side of the brain.
 *
 * No leader lines back to the brain any more. Each section is a label pill with
 * a short stub off its inner edge to a stroked circle, and a second rule off
 * its outer edge to the screen corner — so it reads as strung across the flank.
 *
 * They hold still. The four used to levitate, but eight drifting labels around
 * a brain that already answers the mouse, over a full-strength film, was two
 * moving things too many.
 *
 * Three states, and the open state deliberately inverts the resting one:
 *   rest    label filled, trailing circle stroked and empty
 *   hover   a small flat dot drops into the circle
 *   open    the label keeps its shape but flips to stroked with dark text,
 *           while the trailing circle fills solid — the two swap treatments
 *
 * The logic side fills flat black. The creative side is a white pill inside a
 * rainbow border, with its rules doubled and painted white so they read against
 * the full-strength film behind them. Choosing one opens its panel across the
 * foot of the stage.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { NAV_SECTIONS } from "@/constants/navigation";
import type { NavSectionId } from "@/types/navigation";
import { EASE_OUT } from "@/constants/motion";

/** Fired when a section is chosen (or cleared); the panel follows it. */
export const PIN_OPEN_EVENT = "brainpin:open";

const CIRCLE = 18;

/** Cuts a paint disc down to a 2px ring, leaving the centre fully transparent
 *  so the stage still reads through it. `closest-side` pins the gradient's
 *  radius to the element's own half-width, so this holds at any CIRCLE. */
const RING_STROKE = 2;
const RING = `radial-gradient(closest-side, transparent calc(100% - ${RING_STROKE}px), #000 calc(100% - ${RING_STROKE}px))`;
const RING_MASK = { WebkitMaskImage: RING, maskImage: RING } as const;

/** Where each column sits and the band it occupies. THINK is high on the crown
 *  so the left flank is clear from 40% down; IMAGINE runs along the base, so
 *  the right column has to sit above it. */
const COL = {
  // 6vw, not 3: the connectors need a gutter to turn in. At 3vw the four
  // verticals and their corners ate the whole margin and the horizontal run
  // came out under a pixel — the turn the design asks for was invisible.
  // CONNECTOR_END must stay equal to this number.
  logic: { x: "left-[6vw]", top: 0.46, step: 0.075, align: "flex-row" },
  creative: { x: "right-[3vw]", top: 0.22, step: 0.07, align: "flex-row-reverse" },
} as const;

type Side = "logic" | "creative";

/* ── The left column's connectors ──────────────────────────────────────────
 *
 * Four hairlines drop out of the top-left corner, each turning right into one
 * logic pin. They are drawn as ONE svg over the whole stage in a 0–100 viewBox
 * with `preserveAspectRatio="none"`, so every coordinate below is a percentage
 * of the stage and the geometry needs no measurement at any size. The stroke
 * would smear under that non-uniform scale, so every path carries
 * `vector-effect="non-scaling-stroke"` and stays a true hairline.
 *
 * ⚠ The verticals are ordered OUTSIDE-IN: the line that travels furthest down
 * sits furthest left. Reverse that and the top line's horizontal run crosses
 * the verticals of the three below it, which turns a nested bracket into a
 * grid. `CONNECTOR_X` subtracts, and that is why.
 *
 * `pathLength="100"` normalises every path to the same nominal length, so one
 * dash offset animates all four identically regardless of how long each
 * actually is — the alternative is measuring each with getTotalLength().
 */

/** Where a line meets its row: the pin column's own left edge (left-[3vw]). */
const CONNECTOR_END = 6;
/** Innermost vertical (the topmost pin's), and the step further out per pin. */
const CONNECTOR_X0 = 4.2;
const CONNECTOR_GAP = 0.9;
/** Corner radius, in viewBox units. */
const CONNECTOR_R = 0.6;
/** The parallel line added when a section is open — the "double stroke". */
const CONNECTOR_DOUBLE = 0.42;

/** The reveal clock. Four lines draw back to back, and a pin lands the moment
 *  its own line completes its turn — so the last pin arrives at exactly
 *  4 × DRAW = 3s, which is the brief. */
const CONNECTOR_DRAW = 0.75;

/** The mark that sits ahead of each logic pill, by section id.
 *
 *  ⚠ EMPTY UNTIL THE ARTWORK LANDS. The owner's four icons — handshake,
 *  briefcase, open book, summit — were supplied as chat attachments, which
 *  cannot be written to disk from here. Drop the four files under
 *  `public/content/icons/` and fill this in; the pin renders no mark at all
 *  for an id that is absent, so the page is correct either way. */
/*  Mapping confirmed by the owner: handshake → Clients, briefcase → Projects,
 *  open book → Logofolio, summit-with-flags → Career Path. */
const SECTION_ICONS: Partial<Record<NavSectionId, string>> = {
  // clients: "/content/icons/clients.png",       // handshake
  // projects: "/content/icons/projects.png",     // briefcase
  // logofolio: "/content/icons/logofolio.png",   // open book
  // "career-path": "/content/icons/career-path.png", // summit
};

function connectorPath(index: number, row: number, offset = 0): string {
  const x = CONNECTOR_X0 - index * CONNECTOR_GAP - offset;
  const y = row * 100 + offset;
  const r = CONNECTOR_R;
  // Start above the stage so the line reads as arriving from off-screen.
  return `M ${x} -2 V ${y - r} Q ${x} ${y} ${x + r} ${y} H ${CONNECTOR_END}`;
}

interface Pin {
  id: NavSectionId;
  label: string;
  y: number;
  side: Side;
  /** Position within its own column — drives the connector and its delay. */
  index: number;
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
        index: i,
      }));
  return [...make("logic", "left"), ...make("creative", "right")];
}

/** The four hairlines, drawn once over the whole stage. */
function PinConnectors({
  pins,
  open,
  reduceMotion,
}: {
  pins: Pin[];
  open: NavSectionId | null;
  reduceMotion: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {pins.map((pin) => {
        const isOpen = open === pin.id;
        const common = {
          fill: "none" as const,
          stroke: "currentColor",
          strokeWidth: 1,
          vectorEffect: "non-scaling-stroke" as const,
          pathLength: 100,
          className: "text-neutral-900/45",
        };
        // Draw, then hold: `fill-mode: forwards` on a one-shot animation, so
        // the line stays where it landed rather than snapping back. The
        // keyframes drop the dash pattern on the last frame — a resting line
        // must be an unbroken stroke, not a dash tiled along a path the
        // viewBox stretches unevenly.
        const draw = reduceMotion
          ? undefined
          : {
              strokeDasharray: 100,
              strokeDashoffset: 100,
              animation: `brainpin-draw ${CONNECTOR_DRAW}s linear ${
                pin.index * CONNECTOR_DRAW
              }s forwards`,
            };
        return (
          <g key={pin.id}>
            <path d={connectorPath(pin.index, pin.y)} {...common} style={draw} />
            {/* The second rail, on open only — the same L, stepped outward. */}
            {isOpen && (
              <path
                d={connectorPath(pin.index, pin.y, CONNECTOR_DOUBLE)}
                {...common}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
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

  // The logic pins wait for their own connector to arrive; a pin lands the
  // moment its line finishes the turn. The creative side is not on this clock
  // and appears with the stage.
  const wait = logic && !reduceMotion ? (pin.index + 1) * CONNECTOR_DRAW : 0;

  return (
    <motion.div
      initial={wait ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28, ease: EASE_OUT, delay: wait }}
      className={`absolute ${COL[pin.side].x} flex items-center ${COL[pin.side].align}`}
      style={{ top: `${pin.y * 100}%` }}
    >
      {/* Outer rule — only the creative side keeps one. The logic side's run to
          the edge is now the drawn connector (PinConnectors), which arrives
          from the top-left corner rather than straight out sideways.
          This rule is a sibling of the button, not a child, so `.group:hover`
          never reaches it. Same 9s quickening, driven off the hover state the
          dot already uses, so the run to the screen edge keeps pace. */}
      {!logic && (
        <span
          aria-hidden
          className="brain-paint absolute left-full top-1/2 h-0.5 w-[3vw]"
          style={hover ? { animationDuration: "9s" } : undefined}
        />
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        // `group` so hovering the pin reaches every paint layer inside it —
        // globals.css already drops `.brain-paint`'s drift from 24s to 9s under
        // `.group:hover`, so the whole pin quickens together rather than the
        // hover reading only as the dot appearing.
        className={`group pointer-events-auto flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${COL[pin.side].align}`}
      >
        {/* The section's own mark, ahead of the pill on the logic side. The
            connector lands on it. Renders only where SECTION_ICONS has a file
            for the id — nothing is drawn for a section without artwork. */}
        {logic && SECTION_ICONS[pin.id] && (
          <span
            aria-hidden
            className="relative mr-1 grid size-7 shrink-0 place-items-center overflow-hidden rounded-full"
          >
            <Image
              src={SECTION_ICONS[pin.id]!}
              alt=""
              fill
              sizes="28px"
              className="object-contain"
            />
          </span>
        )}

        {/* The label keeps its pill geometry throughout — only the treatment
            flips. (It used to go square-and-round on open, which ballooned it
            into a circle wide enough to collide with the pill below.) */}
        {!logic ? (
          // Rainbow border, white pill. CSS borders cannot hold a gradient, so
          // the paint is a 2px wrapper and the white pill sits inside it. Open
          // flips the inner fill to the paint and the type to white.
          <span className="brain-paint grid place-items-center rounded-full p-[2px]">
            <span
              className={`font-graff grid place-items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-[1.07rem] font-bold leading-none transition-colors duration-300 ${
                open ? "brain-paint text-white" : "bg-white text-neutral-900"
              }`}
            >
              {pin.label}
            </span>
          </span>
        ) : (
          <span
            className={`font-digibra grid place-items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-[1.07rem] leading-none transition-colors duration-300 ${
              open ? "border-2 border-neutral-950 bg-transparent text-neutral-950" : `text-white ${fill}`
            }`}
          >
            {pin.label}
          </span>
        )}

        {/* The stub, then the circle it runs to. */}
        <span
          aria-hidden
          className={`h-0.5 w-6 shrink-0 ${logic ? "bg-neutral-900/45" : "brain-paint"}`}
        />
        <span
          aria-hidden
          className={`relative grid shrink-0 place-items-center rounded-full ${
            logic
              ? `border-2 transition-colors duration-300 ${
                  open ? "border-neutral-950 bg-neutral-950" : "border-neutral-950 bg-transparent"
                }`
              : ""
          }`}
          style={{ width: CIRCLE, height: CIRCLE }}
        >
          {/* The creative circle's stroke is paint, and a CSS border cannot
              hold a gradient any more than the pill's could. The pill solves it
              with a 2px paint wrapper around an opaque inner, but that trick
              needs a fill — this circle's centre has to stay genuinely
              transparent so the stage reads through it. So the disc is paint
              and a radial mask cuts everything but the outer 2px. Open drops
              the mask and the whole disc fills, which is the same inversion the
              pill does. */}
          {!logic && (
            <span
              className="brain-paint absolute inset-0 rounded-full"
              style={open ? undefined : RING_MASK}
            />
          )}

          {/* Hover tell: a small flat dot drops into the empty circle. Sits
              above the ring layer, so it needs its own stacking context. */}
          <motion.span
            className={`relative block rounded-full ${logic ? "bg-neutral-950" : "brain-paint"}`}
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
      <PinConnectors
        pins={pins.filter((p) => p.side === "logic")}
        open={open}
        reduceMotion={reduceMotion}
      />
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
