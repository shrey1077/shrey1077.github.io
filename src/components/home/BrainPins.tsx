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
import { useIsCompact } from "@/hooks/useMediaQuery";

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
  // Flush to the right edge (`right-0`, not the old `right-[3vw]`) — the owner
  // wants these hard against the screen edge. The four illustrations are
  // different widths, so their LEADING edges stay ragged by design; it is the
  // trailing edge that lines up. `top` moved 0.22 → 0.30 to clear ThoughtBox.
  creative: { x: "right-0", top: 0.3, step: 0.07, align: "flex-row-reverse" },
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

/** Fallback only. Every line actually lands on a MEASURED anchor — the centre
 *  of the icon going in, the centre of the stroked circle coming out — so it
 *  touches the thing it connects to rather than the edge of a box near it.
 *  This is used only before the first measurement arrives. */
const CONNECTOR_END = 6;
/** Innermost vertical (the topmost pin's), and the step further out per pin. */
const CONNECTOR_X0 = 4.2;
const CONNECTOR_GAP = 0.9;
/** Corner radius, in viewBox units. */
const CONNECTOR_R = 0.6;
/** Stroke weights. Open thickens the line rather than adding a second one
 *  beside it — a parallel rail read as a mistake, not as emphasis. */
const STROKE_REST = 1;
const STROKE_OPEN = 2;

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
/*  Exported for `SectionNav`, the compact nav that stands in for these pins
 *  below `lg` — the two share the marks rather than keeping two copies. */
export const SECTION_ICONS: Partial<Record<NavSectionId, string>> = {
  clients: "/content/icons/clients.png", // handshake
  projects: "/content/icons/projects.png", // briefcase
  logofolio: "/content/icons/logofolio.png", // open book
  "career-path": "/content/icons/career-path.png", // summit
};

/* ── The right column is artwork ───────────────────────────────────────────
 *
 * The four creative pins are supplied illustrations (2026-08-16): each carries
 * its own ring, connector, circle, white pill, label and paint splash. They
 * replace the DOM pill/stub/circle on that side entirely — only the logic
 * column is still drawn in markup.
 *
 * Source art exported on a white ground; the background was keyed out and the
 * pills deliberately kept opaque (`scripts/`-free, see the handoff). They are
 * WebP because `next.config` sets `images.unoptimized`, so whatever ships is
 * what downloads — as PNG the four came to 2.6MB.
 *
 * ⚠ Every number below is MEASURED off the artwork, not eyeballed:
 *  • `pillCenterY` differs per image (0.539–0.676). The row is positioned by
 *    the PILL's centre, not the image's top — align tops and the four labels
 *    come out raggedly spaced by up to 13px, because each illustration sits
 *    its pill at a different height in the frame.
 *  • `circleC*`/`circleR` are the white disc inside the ring, so the hover dot
 *    lands in the artwork's own circle rather than near it.
 * Re-measure if any file is replaced.
 */
/** px. Was 96 (pill ≈ 33px, matching the DOM pills these replaced); the owner
 *  asked for 20% smaller, so 96 × 0.8. Every other number in ART is a FRACTION
 *  of the image, so they all follow this on their own. */
const ART_H = 76.8;

interface PinArt {
  src: string;
  aspect: number;
  pillCenterY: number;
  circleCX: number;
  circleCY: number;
  circleR: number;
  /** The small lead ring at the artwork's far left — where this column's
   *  connector lands. MEASURED off each file; `ringCY` differs from artwork to
   *  artwork (0.494–0.627), so it cannot be assumed from the frame. */
  ringCX: number;
  ringCY: number;
}

const ART: Partial<Record<NavSectionId, PinArt>> = {
  art: {
    src: "/content/pins/art.webp",
    aspect: 4.0596, pillCenterY: 0.6762,
    circleCX: 0.2393, circleCY: 0.6458, circleR: 0.2034,
    ringCX: 0.0508, ringCY: 0.6266,
  },
  publications: {
    src: "/content/pins/publications.webp",
    aspect: 4.3422, pillCenterY: 0.5393,
    circleCX: 0.215, circleCY: 0.5108, circleR: 0.2034,
    ringCX: 0.0392, ringCY: 0.4938,
  },
  "the-extincts-project": {
    src: "/content/pins/the-extincts-project.webp",
    aspect: 4.7284, pillCenterY: 0.5425,
    circleCX: 0.1786, circleCY: 0.5121, circleR: 0.1999,
    ringCX: 0.0182, ringCY: 0.4984,
  },
  "ai-generations": {
    src: "/content/pins/ai-generations.webp",
    aspect: 4.8619, pillCenterY: 0.5906,
    circleCX: 0.1867, circleCY: 0.5583, circleR: 0.2015,
    ringCX: 0.0289, ringCY: 0.5391,
  },
};

/* The unopened artworks used to fall back to 0.45 while another section was
 * open. Removed 2026-08-16 — the owner wants all four at full strength at all
 * times. "Which one is open" is now carried solely by the dot dropping into
 * that artwork's circle, since the pill and label are baked into the raster
 * and cannot invert the way the DOM pill did. */

function connectorPath(x: number, y: number, end: number): string {
  const r = CONNECTOR_R;
  // Start above the stage so the line reads as arriving from off-screen.
  return `M ${x} -2 V ${y - r} Q ${x} ${y} ${x + r} ${y} H ${end}`;
}

/* A second run per pin used to leave the stroked circle, turn right and fall to
 * the footing (OUT_CLEAR / OUT_GAP / OUT_BOTTOM / outgoingPath). Removed
 * 2026-08-17 at the owner's request — the circles are now line ENDS, not
 * junctions, so nothing measures them any more either. */

/** The point a pin's line lands on, as a percentage of the stage: the icon on
 *  the logic side, the artwork's small lead ring on the creative side. */
interface Anchor {
  x: number;
  y: number;
}

/** Clearance between the creative verticals and the leftmost lead ring, so the
 *  four drops sit in the gap rather than on top of the artwork. */
const CREATIVE_CLEAR = 1.6;

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
  anchors,
  baseX,
  fallbackEnd,
}: {
  pins: Pin[];
  open: NavSectionId | null;
  reduceMotion: boolean;
  /** Measured landing points, as % of the stage. */
  anchors: Record<string, Anchor>;
  /** Where the TOPMOST pin's vertical sits. Each pin below steps one
   *  CONNECTOR_GAP further left, so the run that travels furthest down sits
   *  furthest out and no horizontal crosses another's drop. */
  baseX: number;
  /** Used only before the first measurement arrives. */
  fallbackEnd: number;
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
        const a = anchors[pin.id];
        const common = {
          fill: "none" as const,
          stroke: "currentColor",
          // Open thickens the line rather than adding a second one beside it.
          strokeWidth: isOpen ? STROKE_OPEN : STROKE_REST,
          vectorEffect: "non-scaling-stroke" as const,
          className: "text-neutral-900/45",
        };
        // ⚠ The reveal is a CLIP, not a dash offset, and it must stay that way.
        //
        // The old draw set `pathLength=100` with `stroke-dasharray: 100` and
        // walked the offset to zero. On paper that is one dash covering the
        // whole path; in practice it rendered DASHED, because
        // `vector-effect: non-scaling-stroke` strokes (and therefore dashes) in
        // a different space from the one `pathLength` normalises. Measured: the
        // paths are ~52.6 and ~57.5 user units long while being told to call
        // themselves 100, and the viewBox stretches ~14x across and ~9x down.
        // The pattern tiles at the wrong rate and breaks the line up.
        //
        // A clip has no such problem: it is two straight edges, so the stretch
        // moves them without distorting anything. Phase one opens downward
        // through the vertical drop, phase two opens rightward along the turn,
        // which is the "flows from the top, then reaches its icon" the brief
        // asks for — continuous, with no dashes at any point.
        const drawAt = (delay: number) =>
          reduceMotion
            ? undefined
            : {
                clipPath: "inset(0 92% 100% 0)",
                animation: `brainpin-draw ${CONNECTOR_DRAW}s linear ${delay}s forwards`,
              };

        // The line lands on the icon's centre. Until the first measurement
        // arrives it stops at the column edge.
        const inY = a ? a.y : pin.y * 100;
        const inEnd = a ? a.x : fallbackEnd;

        // One run per pin. A second path used to leave the stroked circle,
        // turn right and fall to the footing; removed 2026-08-17 at the
        // owner's request.
        return (
          <path
            key={pin.id}
            d={connectorPath(baseX - pin.index * CONNECTOR_GAP, inY, inEnd)}
            {...common}
            style={drawAt(pin.index * CONNECTOR_DRAW)}
          />
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
  const art = logic ? undefined : ART[pin.id];

  // The creative column is artwork. Falls through to the DOM pin below if a
  // section has no file, so an unillustrated id still renders something.
  if (art) {
    const w = ART_H * art.aspect;
    // Same 0.42-of-the-circle dot the DOM pins drop into their ring.
    const dot = ART_H * art.circleR * 2 * 0.42;
    return (
      <div
        className={`absolute ${COL[pin.side].x} flex items-center`}
        // ⚠ Positioned by the pill's centre, not the image's top. See ART.
        style={{ top: `calc(${pin.y * 100}% - ${ART_H * art.pillCenterY}px)` }}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="pointer-events-auto relative block outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
          style={{ width: w, height: ART_H }}
        >
          {/* The label is inside the raster now, so the button carries its own
              name — without this the whole right column is four unlabelled
              buttons to a screen reader. */}
          <span className="sr-only">{pin.label}</span>
          {/* Zero-size marker on the artwork's own lead ring. The connector is
              measured to this rather than computed, so it keeps landing on the
              ring when the frame is resized. */}
          <span
            aria-hidden
            data-pin-ring={pin.id}
            className="absolute"
            style={{ left: `${art.ringCX * 100}%`, top: `${art.ringCY * 100}%` }}
          />
          <Image
            src={art.src}
            alt=""
            fill
            sizes={`${Math.round(w)}px`}
            className="object-contain"
          />
          {/* The tell, dropped into the artwork's own circle. */}
          <motion.span
            aria-hidden
            className="absolute block rounded-full bg-neutral-950"
            initial={false}
            animate={{ scale: hover || open ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
            style={{
              left: `${art.circleCX * 100}%`,
              top: `${art.circleCY * 100}%`,
              width: dot,
              height: dot,
              marginLeft: -dot / 2,
              marginTop: -dot / 2,
            }}
          />
        </button>
      </div>
    );
  }

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
            data-pin-icon={pin.id}
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

        {/* Pill and circle, flush against each other.
            ⚠ No gap between these two on purpose: the circle is tangent to the
            pill's rounded right edge and centred on it. A 24px stub used to
            run between them — removed 2026-08-17. The gap lives on the BUTTON,
            so the icon keeps its spacing while this pair stays joined. */}
        <span className={`flex items-center ${COL[pin.side].align}`}>
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

        <span
          aria-hidden
          className={`relative grid shrink-0 place-items-center rounded-full ${
            logic
              // Open no longer FILLS the circle — the ring stays and a flat
              // black disc drops inside it, which is the hover tell held.
              ? "border-2 border-neutral-950 bg-transparent"
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
            animate={{ scale: hover || open ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
            style={{ width: CIRCLE * 0.42, height: CIRCLE * 0.42 }}
          />
        </span>
        </span>
      </button>
    </motion.div>
  );
}

export function BrainPins() {
  const reduceMotion = useReducedMotion() ?? false;
  const isCompact = useIsCompact();
  const pins = buildPins();
  const [open, setOpen] = useState<NavSectionId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // The two points each logic line has to touch: the centre of the icon it
  // arrives at, and the centre of the stroked circle it leaves. Measured, not
  // assumed — the rows are as wide as their labels, so any fixed column would
  // leave lines ending near the thing rather than on it.
  //
  // ⚠ Written only from the ResizeObserver's callback, never from the effect
  // body — this repo lints `react-hooks/set-state-in-effect` as an error, and
  // observing fires once immediately, which is the first measure.
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const centre = (el: Element, box: DOMRect) => {
      const r = el.getBoundingClientRect();
      return {
        x: ((r.left + r.width / 2 - box.left) / box.width) * 100,
        y: ((r.top + r.height / 2 - box.top) / box.height) * 100,
      };
    };
    const ro = new ResizeObserver(() => {
      const box = root.getBoundingClientRect();
      if (!box.width || !box.height) return;
      // Only the icon is measured now. The stroked circle used to be measured
      // too, as the point the outgoing run left from; that run is gone, so the
      // circle is a line END and needs no anchor of its own.
      const next: Record<string, Anchor> = {};
      root
        .querySelectorAll<HTMLElement>("[data-pin-icon], [data-pin-ring]")
        .forEach((el) => {
          const id = el.dataset.pinIcon ?? el.dataset.pinRing;
          if (!id) return;
          next[id] = centre(el, box);
        });
      setAnchors((prev) => {
        const keys = Object.keys(next);
        const same =
          keys.length === Object.keys(prev).length &&
          keys.every((k) => {
            const a = prev[k];
            const b = next[k];
            return (
              a &&
              Math.abs(a.x - b.x) < 0.05 &&
              Math.abs(a.y - b.y) < 0.05
            );
          });
        return same ? prev : next;
      });
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Below `lg` this whole block is `hidden`, and `SectionNav` is the live nav
  // instead. Yield to it rather than leaving a section open behind pins nobody
  // can see: derived, not synced in an effect, so crossing the breakpoint
  // dispatches `null` on its own and the panel closes with the pins.
  const active = isCompact ? null : open;

  // Leftmost measured lead ring, backed off by CREATIVE_CLEAR — the origin of
  // the right column's vertical band. Null until the first measurement.
  const creativeRingX = pins
    .filter((p) => p.side === "creative")
    .map((p) => anchors[p.id]?.x)
    .filter((x): x is number => typeof x === "number");
  const creativeBase =
    creativeRingX.length === 4 ? Math.min(...creativeRingX) - CREATIVE_CLEAR : null;

  // Tell the rest of the page which section is open, so the panel can follow.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PIN_OPEN_EVENT, { detail: active }));
  }, [active]);

  // Anywhere outside the pins or the open panel closes it.
  useEffect(() => {
    if (!active) return;
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
  }, [active]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      <PinConnectors
        pins={pins.filter((p) => p.side === "logic")}
        open={active}
        reduceMotion={reduceMotion}
        anchors={anchors}
        baseX={CONNECTOR_X0}
        fallbackEnd={CONNECTOR_END}
      />
      {/* The creative column's mirror of the same idea: four drops that turn
          into the small lead ring on each artwork.
          ⚠ The band is derived from the MEASURED rings, not a constant. The
          four illustrations are different widths and right-anchored, so their
          lead rings sit at four different x — a fixed column would land on the
          artwork for some and float away from it for others. `creativeBase`
          takes the leftmost ring and backs off, so the whole bracket clears
          every one of them. It renders only once measured; before that there
          is nothing sensible to draw. */}
      {creativeBase !== null && (
        <PinConnectors
          pins={pins.filter((p) => p.side === "creative")}
          open={active}
          reduceMotion={reduceMotion}
          anchors={anchors}
          baseX={creativeBase}
          fallbackEnd={creativeBase}
        />
      )}
      {pins.map((p) => (
        <PinRow
          key={p.id}
          pin={p}
          open={active === p.id}
          reduceMotion={reduceMotion}
          onToggle={() => setOpen((o) => (o === p.id ? null : p.id))}
        />
      ))}
    </div>
  );
}
