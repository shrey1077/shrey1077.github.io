"use client";

/**
 * BrainPins — the sections, floating either side of the brain.
 *
 * Each section is a label pill with a stroked circle on its inner end, and a
 * hairline that arrives from the top corner — so it reads as strung across the
 * flank.
 *
 * ⚠ THE LOGIC PINS ALSO RUN INTO THE BRAIN (2026-09-17), and that run is NOT
 * drawn here. It has to pass BEHIND the artwork, and everything in this block
 * sits above it at z-20, so it lives in BrainTraces, a layer under the footage.
 * This file only tags each circle (`data-pin-circle`) for it to measure.
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
import { CreativeIcon, hasCreativeIcon } from "@/components/home/CreativeIcons";

/** Fired when a section is chosen (or cleared); the panel follows it. */
export const PIN_OPEN_EVENT = "brainpin:open";

/** ⚠ ONE KNOB FOR BOTH COLUMNS. The owner asked on 2026-09-26 for the sections
 *  and everything in them to come down 30%, both sides.
 *
 *  The two sides get there differently, and both are recorded here rather than
 *  scattered through the file:
 *   · the LOGIC side is DOM — a pill, an icon, a circle and a tagline, each with
 *     its own size — so its row takes one transform rather than six re-typed
 *     numbers that would then drift apart;
 *   · the CREATIVE side is artwork, where ART_H is already the only size there
 *     is and every other number in ART is a fraction of it.
 *  LOGIC_ROW_HALF follows as well, or the artwork stops lining up with the row
 *  opposite — see the note there.
 *
 *  The rows did not move for THAT change; they moved later — see ARC. */
const PIN_SCALE = 0.7;

const CIRCLE = 18;

/** Cuts a paint disc down to a 2px ring, leaving the centre fully transparent
 *  so the stage still reads through it. `closest-side` pins the gradient's
 *  radius to the element's own half-width, so this holds at any CIRCLE. */
const RING_STROKE = 2;
const RING = `radial-gradient(closest-side, transparent calc(100% - ${RING_STROKE}px), #000 calc(100% - ${RING_STROKE}px))`;
const RING_MASK = { WebkitMaskImage: RING, maskImage: RING } as const;

/** THE TWO ARCS (owner, 2026-10-03: "sections on both sides in circular
 *  alignment along the brain artwork"). Each column curves round the brain
 *  like the rim of a circle — the top and bottom pins tucked in, the middle
 *  two out at the screen's edge — and the two columns mirror each other:
 *    · logic, top to bottom: Clients just under the code box, top left, down
 *      to Career Path at the bottom left;
 *    · creative: Art at the top right, down to AI Generations at the bottom
 *      right, level with Career Path — just above the facts (Chess…).
 *  `x` is the column's OUTER edge in vw from its own side of the screen (the
 *  logic pins' left edge, the artworks' right edge); `y` is the row, as a
 *  fraction of the stage. The rows are spaced as points on a circle (60° and
 *  20° either side of the middle), so the gaps narrow toward the ends.
 *  Replaced the two bottom-aligned columns (ROW_STEP / LOGIC_ROW_TOP) — git
 *  has those.
 *  ⚠ The first row never rises above FIRST_ROW_MIN: on a short stage 15% would
 *  put Clients into the code box (top 1.25rem, ~5.5rem tall at half size). */
const ARC: readonly { x: number; y: number }[] = [
  { x: 8, y: 0.152 },
  { x: 3, y: 0.357 },
  { x: 3, y: 0.623 },
  { x: 8, y: 0.828 },
];
const FIRST_ROW_MIN = "7.75rem";
/** A row's top, as CSS. */
const rowTop = (i: number) =>
  i === 0 ? `max(${ARC[0].y * 100}%, ${FIRST_ROW_MIN})` : `${ARC[i].y * 100}%`;

/** Half the height of a logic row: the pill's 1.07rem type at `leading-none`
 *  plus `py-1.5` twice is 1.82rem, and the 28px icon is shorter than that, so
 *  the pill sets the row. A logic row is placed by its TOP edge and an artwork
 *  row by its pill's CENTRE, so the artwork adds this to land on the same line.
 *
 *  ⚠ IT CARRIES PIN_SCALE. The logic row scales about its TOP-LEFT corner, so
 *  its top edge stays on its row while its centre rises to half its SCALED
 *  height. Leave this at the unscaled 0.91rem and every artwork sits ~4px low.
 *  ⚠ Re-derive if the logic pill's type size or padding changes. */
const LOGIC_ROW_HALF = `${0.91 * PIN_SCALE}rem`;

/** How each column runs. Logic pins are anchored by their LEFT edge, the
 *  creative artworks by their RIGHT — the four illustrations are different
 *  widths, so their left ends (the lead rings, where the pencil strokes start)
 *  stay ragged by design. */
const COL = {
  logic: { align: "flex-row" },
  creative: { align: "flex-row-reverse" },
} as const;

type Side = "logic" | "creative";

/* ── No corner connectors (2026-10-02) ─────────────────────────────────────
 *
 * Both columns used to hang from hairlines dropping out of the top corners
 * (PinConnectors). The owner removed them: the logic pins keep only their runs
 * INTO the brain (BrainTraces), and the creative pins now reach the brain too,
 * in coloured pencil strokes from their lead rings (also BrainTraces, so the
 * strokes pass behind the artwork). Recover the old hairlines from git.
 */

/** The reveal clock. The logic pins still land one after another on this beat
 *  — it was the corner hairlines' draw time, a pin landing as its line
 *  completed its turn, the last at 4 × DRAW = 3s. Exported so BrainTraces can start each
 *  pin's run into the brain the moment that pin has landed. */
export const CONNECTOR_DRAW = 0.75;

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
 *  asked for 20% smaller, so 96 × 0.8 — and 30% smaller again on 2026-09-26,
 *  which is PIN_SCALE. Every other number in ART is a FRACTION of the image, so
 *  they all follow this on their own. */
const ART_H = 76.8 * PIN_SCALE;
/** How much of the white circle's diameter a creative icon fills. */
const ICON_FILL = 0.74;

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
  /** The ring's OWN colour, sampled from the artwork — the hover fill drops
   *  this into the ring so each section answers in its own hue. Measured by
   *  scripts/analyze_pin_art.py; re-sample if a file is replaced. */
  ringColor: string;
}

/* ⚠ THE SUPPLIED ORIENTATION AGAIN (2026-10-02): lead ring on the LEFT, facing
 * the brain, so the pencil strokes can run from it into the centre. These are
 * the `_orig` files — the pristine art scripts/mirror_pin_art.py keeps — with
 * that script's original ring/circle fractions. The mirrored WebPs beside them
 * (ring on the right, for the old corner connectors) are no longer referenced. */
const ART: Partial<Record<NavSectionId, PinArt>> = {
  art: {
    src: "/content/pins/_orig/art.webp",
    aspect: 4.0596, pillCenterY: 0.6762,
    circleCX: 0.2393, circleCY: 0.6458, circleR: 0.2034,
    ringCX: 0.0508, ringCY: 0.6266, ringColor: "#ed5f00",
  },
  publications: {
    src: "/content/pins/_orig/publications.webp",
    aspect: 4.3422, pillCenterY: 0.5393,
    circleCX: 0.215, circleCY: 0.5108, circleR: 0.2034,
    ringCX: 0.0392, ringCY: 0.4938, ringColor: "#e3274b",
  },
  "the-extincts-project": {
    src: "/content/pins/_orig/the-extincts-project.webp",
    aspect: 4.7284, pillCenterY: 0.5425,
    circleCX: 0.1786, circleCY: 0.5121, circleR: 0.1999,
    ringCX: 0.0182, ringCY: 0.4984, ringColor: "#af1f9d",
  },
  "ai-generations": {
    src: "/content/pins/_orig/ai-generations.webp",
    aspect: 4.8619, pillCenterY: 0.5906,
    circleCX: 0.1867, circleCY: 0.5583, circleR: 0.2015,
    ringCX: 0.0289, ringCY: 0.5391, ringColor: "#0096a6",
  },
};

/* The unopened artworks used to fall back to 0.45 while another section was
 * open. Removed 2026-08-16 — the owner wants all four at full strength at all
 * times. "Which one is open" is now carried solely by the dot dropping into
 * that artwork's circle, since the pill and label are baked into the raster
 * and cannot invert the way the DOM pill did. */

/* A second run per pin used to leave the stroked circle, turn right and fall to
 * the footing (OUT_CLEAR / OUT_GAP / OUT_BOTTOM / outgoingPath). Removed
 * 2026-08-17 at the owner's request — the circles are now line ENDS, not
 * junctions, so nothing measures them any more either. */

interface Pin {
  id: NavSectionId;
  label: string;
  /** Outer edge, vw from its own side of the screen. See ARC. */
  x: number;
  /** The row's top, as CSS. */
  top: string;
  side: Side;
  /** Position within its own column — drives the connector and its delay. */
  index: number;
  /** Small caps under the pill. Logic side only; see NavSection. */
  tagline?: string;
}

function buildPins(): Pin[] {
  const make = (side: Side, hemisphere: "left" | "right"): Pin[] =>
    NAV_SECTIONS.filter((s) => s.hemisphere === hemisphere)
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({
        id: s.id,
        label: s.label,
        x: ARC[i % ARC.length].x,
        top: rowTop(i % ARC.length),
        side,
        index: i,
        tagline: s.tagline,
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
  const art = logic ? undefined : ART[pin.id];

  // The creative column is artwork. Falls through to the DOM pin below if a
  // section has no file, so an unillustrated id still renders something.
  if (art) {
    const w = ART_H * art.aspect;
    // The lead ring is far smaller than the big circle the old tell used, so
    // the fill is sized from ART_H directly rather than from `circleR`.
    const ringDot = ART_H * 0.085;
    return (
      <div
        className="absolute flex items-center"
        // ⚠ Positioned by the pill's centre, not the image's top. See ART.
        //   LOGIC_ROW_HALF puts that centre on the same line as the logic row
        //   opposite, which is placed by its top edge instead.
        style={{
          right: `${pin.x}vw`,
          top: `calc(${pin.top} + ${LOGIC_ROW_HALF} - ${ART_H * art.pillCenterY}px)`,
        }}
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
          {/* Zero-size marker on the artwork's own lead ring. BrainTraces
              measures it (and reads its colour) to start this section's pencil
              stroke into the brain, so the stroke keeps leaving the ring when
              the frame is resized. */}
          <span
            aria-hidden
            data-pin-ring={pin.id}
            data-pin-color={art.ringColor}
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
          {/* The section's colour mark, in the artwork's own white circle
              (owner, 2026-10-03). Centred on the MEASURED disc (circleC*) and
              sized from its radius, so it sits inside the circle rather than
              near it; ICON_FILL leaves a margin of white round the glyph. */}
          {hasCreativeIcon(pin.id) && (
            <span
              aria-hidden
              className="pointer-events-none absolute grid place-items-center"
              style={{
                left: `${art.circleCX * 100}%`,
                top: `${art.circleCY * 100}%`,
                width: art.circleR * 2 * ART_H * ICON_FILL,
                height: art.circleR * 2 * ART_H * ICON_FILL,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.span
                className="block size-full"
                initial={false}
                animate={{ scale: hover || open ? 1.12 : 1, rotate: hover || open ? -6 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE_OUT }}
              >
                <CreativeIcon section={pin.id} className="block size-full" />
              </motion.span>
            </span>
          )}
          {/* The tell. It used to be a black dot dropped into the BIG white
              circle; the owner replaced it on 2026-08-21 with the artwork's own
              small lead ring filling in its own colour. The big circle is left
              alone entirely now.

              Positioned on the same measured ring point the connector lands on,
              so the fill sits IN the ring rather than near it. It is a separate
              element from the `data-pin-ring` marker, which must stay zero-size
              or the connector measurement moves with it. */}
          <motion.span
            aria-hidden
            className="absolute block rounded-full"
            initial={false}
            animate={{ scale: hover || open ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
            style={{
              left: `${art.ringCX * 100}%`,
              top: `${art.ringCY * 100}%`,
              width: ringDot,
              height: ringDot,
              marginLeft: -ringDot / 2,
              marginTop: -ringDot / 2,
              backgroundColor: art.ringColor,
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
      className={`absolute flex items-center ${COL[pin.side].align}`}
      style={{ [logic ? "left" : "right"]: `${pin.x}vw`, top: pin.top }}
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

      {/* ⚠ THE SCALE IS ONE TRANSFORM ON THE WHOLE ROW, not a size on each part
          — see PIN_SCALE. Type, icon, circle, tagline and the gaps between them
          all come down together, and there is one number to change if 30% turns
          out to be 25%.
          ⚠ ORIGIN TOP-LEFT, and LOGIC_ROW_HALF is derived from it: the row is
          positioned by its top edge, so scaling about the centre would walk the
          pill off its column and leave the artwork opposite misaligned. */}
      <span className="block" style={{ transform: `scale(${PIN_SCALE})`, transformOrigin: "left top" }}>
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
        {/* `relative` so the tagline can hang under the pill without taking
            part in the row's height — the row is centred on its icon, and a
            second line of text in flow would drag the icon, the pill and every
            measured anchor down with it. */}
        <span className={`relative flex items-center ${COL[pin.side].align}`}>
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

        {/* ⚠ `data-pin-circle` is read by BrainTraces, which measures this
            circle's right edge as the start of the pin's run into the brain.
            Only the logic side is tagged; it is the only side with a run. */}
        <span
          aria-hidden
          data-pin-circle={logic ? pin.id : undefined}
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

        {/* ⚠ No tagline under the pill since 2026-10-03 — the owner removed the
            three small-caps words ("People / Brands / Impact") from the pins.
            Each section's slide in the Flythrough still carries its own. */}
        </span>
      </button>
      </span>
    </motion.div>
  );
}

export function BrainPins() {
  const reduceMotion = useReducedMotion() ?? false;
  const isCompact = useIsCompact();
  const pins = buildPins();
  const [open, setOpen] = useState<NavSectionId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Below `lg` this whole block is `hidden`, and `SectionNav` is the live nav
  // instead. Yield to it rather than leaving a section open behind pins nobody
  // can see: derived, not synced in an effect, so crossing the breakpoint
  // dispatches `null` on its own and the panel closes with the pins.
  const active = isCompact ? null : open;

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
