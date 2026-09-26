"use client";

/**
 * WorkShowcase — five angled panels around one central display.
 *
 * The owner's composition, 2026-09-27: two panels down the left, three down the
 * right, a big hexagon in the middle. The centre rotates through artwork at
 * random; hovering a panel hands the centre over to that panel's work, with a
 * heading and a line about it across the foot. Moving away gives it back.
 *
 * ⚠ THE SHAPES ARE `clip-path` POLYGONS CUT IN PIXELS, NOT PERCENTAGES, and
 * that is the whole trick. Every diagonal has to run at the same angle or the
 * five read as unrelated shapes near each other rather than one cut object. A
 * percentage cut cannot do it: the centre's point spans the full height across
 * 14% of a 720px column while a left panel's spans half the height across 14%
 * of a 340px one — same number, slopes 2:1 apart, which is exactly how the
 * first attempt looked. In pixels the rule is simple: the horizontal run is
 * proportional to the rise the cut covers, so the left column (two rows) cuts
 * CUT, the right column (three rows) two thirds of it, and the middle-right
 * point, which rises only a sixth of the height, a third.
 *
 * ⚠ PHONES GET A PLAIN GRID. Below `md` the five become ordinary cards under a
 * rectangular display: at 380px wide the hexagon's angles eat most of the
 * artwork and the side panels become slivers. The interaction is identical, and
 * a tap does what a hover does — which is also how a touch visitor drives it on
 * any width, since `hover` is a lie on a touchscreen.
 *
 * ⚠ THE FIRST PIECE IS ALWAYS pool[0], and only the ROTATION is random. Random
 * on first render would put one image in the server's HTML and another in the
 * client's, which React flags as a mismatch; drawing the random number inside
 * the interval's callback instead keeps the first paint identical on both sides
 * and still never shows the same order twice.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

export interface ShowcaseImage {
  src: string;
  alt: string;
  /** Which panel it belongs to — the caption follows the artwork. */
  panel: string;
  /** How it sits in the hexagon. See the note where it is used. */
  fit: "cover" | "contain";
}

export interface ShowcasePanelView {
  id: string;
  number: string;
  label: string;
  blurb: string;
  tint: string;
  images: ShowcaseImage[];
}

/** ms each piece of artwork holds before the centre moves on. */
const ROTATE = 4000;
/** ms of cross-fade between two pieces. */
const FADE = 600;

/** px. The centre's point: how far it runs in across half the composition's
 *  height. Every other cut is derived from it — see the note above. */
const CUT = 58;
/** The right column has three rows to the left column's two, so its cuts cover
 *  less rise and must run in less far to hold the same angle. */
const CUT_R = (CUT * 2) / 3;
/** The middle-right panel's point rises half of one of those rows. */
const CUT_P = CUT_R / 2;

/** The centre: a hexagon pointed left and right. */
const HEX = `polygon(${CUT}px 0, calc(100% - ${CUT}px) 0, 100% 50%, calc(100% - ${CUT}px) 100%, ${CUT}px 100%, 0 50%)`;

/** The five side panels, each cut on the edge that faces the centre. */
const SHAPES: Record<string, string> = {
  // Left column — the cut edge is on the right.
  leftTop: `polygon(0 0, 100% 0, calc(100% - ${CUT}px) 100%, 0 100%)`,
  leftBottom: `polygon(0 0, calc(100% - ${CUT}px) 0, 100% 100%, 0 100%)`,
  // Right column — the cut edge is on the left. The middle one takes a point,
  // which is what makes the right side read as the hexagon's other half.
  rightTop: `polygon(${CUT_R}px 0, 100% 0, 100% 100%, 0 100%)`,
  rightMiddle: `polygon(${CUT_P}px 0, 100% 0, 100% 100%, ${CUT_P}px 100%, 0 50%)`,
  rightBottom: `polygon(0 0, 100% 0, 100% 100%, ${CUT_R}px 100%)`,
};

export function WorkShowcase({ panels }: { panels: ShowcasePanelView[] }) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const [hovered, setHovered] = useState<string | null>(null);
  /** A tap pins a panel; hovering another still previews it. */
  const [pinned, setPinned] = useState<string | null>(null);
  /** Which piece is showing, and which panel it was chosen for. ⚠ The two are
   *  ONE state: when the active panel changes, the pool changes under the
   *  index, so an index left over from the last panel would point at somebody
   *  else's artwork for a frame. Keeping the id alongside lets the index be
   *  DERIVED back to 0 on a change, with no effect to reset it. */
  const [cursor, setCursor] = useState<{ id: string | null; i: number }>({ id: null, i: 0 });

  const activeId = hovered ?? pinned;
  const active = panels.find((p) => p.id === activeId) ?? null;

  /** What the centre is drawing from: one panel's work, or everything. */
  const pool = useMemo(
    () => (active ? active.images : panels.flatMap((p) => p.images)),
    [active, panels],
  );

  const index = cursor.id === activeId ? cursor.i : 0;

  useEffect(() => {
    if (reduceMotion || !inView || pool.length < 2) return;
    const timer = setInterval(() => {
      setCursor((c) => {
        const at = c.id === activeId ? c.i : 0;
        // Anywhere but where it already is, so a rotation never looks stuck.
        let next = at;
        while (next === at) next = Math.floor(Math.random() * pool.length);
        return { id: activeId, i: next };
      });
    }, ROTATE);
    return () => clearInterval(timer);
  }, [reduceMotion, inView, pool.length, activeId]);

  const current = pool.length ? pool[index % pool.length] : null;
  // The caption follows the ARTWORK, not the hover: idle, the centre shows
  // something at random and says which panel it came from.
  const caption = panels.find((p) => p.id === (current?.panel ?? activeId)) ?? active;

  const Display = (
    <div data-showcase-display className="relative h-full w-full overflow-hidden bg-neutral-900">
      <AnimatePresence initial={false}>
        {current && (
          <motion.div
            key={current.src}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : FADE / 1000 }}
          >
            {/* ⚠ `fit` is per panel. Photographs fill the hexagon; a portrait
                brochure page cropped to it is a band of unreadable columns, so
                printed work is CONTAINED on the dark ground instead — the plate
                whole, like a slide. */}
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 768px) 92vw, 46vw"
              className={current.fit === "contain" ? "object-contain" : "object-cover"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The heading and its line, across the foot. The scrim is what keeps
          them legible over artwork that might be anything. */}
      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent px-[14%] pb-6 pt-16 text-center sm:pb-8">
          <p className="tata-body text-[0.58rem] uppercase tracking-[0.22em] text-white/60">
            {caption.number}
          </p>
          <h3 className="tata-display mt-1 text-[clamp(1.1rem,1.8vw,1.6rem)] leading-tight text-white">
            {caption.label}
          </h3>
          <p className="tata-body mx-auto mt-1.5 max-w-md text-[0.78rem] leading-relaxed text-white/75">
            {caption.blurb}
          </p>
        </div>
      )}
    </div>
  );

  /** `cut` says which edge the polygon eats, so the words keep clear of it.
   *  ⚠ WITHOUT THIS THE LABELS ARE SLICED: a right-hand panel's diagonal takes
   *  ANGLE% off its left edge, and text sitting in the normal padding is inside
   *  the part that gets clipped away — "Video editing" rendered as "deo
   *  editing". The pad is ANGLE plus a little air. */
  const panelButton = (panel: ShowcasePanelView, shape?: string, cut?: "left" | "right") => {
    const isActive = activeId === panel.id;
    const pad =
      cut === "right"
        ? { paddingRight: `${CUT + 14}px` }
        : cut === "left"
          ? { paddingLeft: `${CUT_R + 14}px` }
          : undefined;
    return (
      <button
        key={panel.id}
        type="button"
        aria-pressed={pinned === panel.id}
        data-showcase-panel={panel.id}
        onMouseEnter={() => setHovered(panel.id)}
        onMouseLeave={() => setHovered((h) => (h === panel.id ? null : h))}
        onFocus={() => setHovered(panel.id)}
        onBlur={() => setHovered((h) => (h === panel.id ? null : h))}
        onClick={() => setPinned((p) => (p === panel.id ? null : panel.id))}
        className="group relative h-full w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
        style={{
          clipPath: shape,
          // ⚠ The tint has to CARRY the panel: there is no border to define it,
          // because clip-path cuts any border or shadow off with the corner it
          // removes. A hairline-and-wash version of this read as nothing at all
          // on a near-white page. Holding the centre deepens it further.
          background: `linear-gradient(135deg, ${panel.tint}${isActive ? "70" : "3d"} 0%, ${panel.tint}${isActive ? "38" : "1c"} 58%, ${panel.tint}0f 100%), #ffffff`,
          transition: "background 300ms ease-out",
        }}
      >
        <span className="relative flex h-full flex-col justify-between p-4 sm:p-5" style={pad}>
          <span
            className="tata-body text-[0.6rem] uppercase tracking-[0.2em] transition-colors duration-300"
            style={{ color: isActive ? panel.tint : "#8a8a8a" }}
          >
            {panel.number}
          </span>
          <span
            className="tata-display text-[clamp(0.95rem,1.4vw,1.3rem)] leading-tight transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ color: isActive ? panel.tint : "#1c1c1c" }}
          >
            {panel.label}
          </span>
        </span>
      </button>
    );
  };

  const [one, two, three, four, five] = panels;

  return (
    <div ref={ref} data-showcase className="w-full">
      {/* ── Phones: the display, then the five as plain cards ── */}
      <div className="md:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">{Display}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {panels.map((panel) => (
            <div key={panel.id} className="h-20">
              {panelButton(panel)}
            </div>
          ))}
        </div>
      </div>

      {/* ── The composition ── */}
      <div
        className="hidden h-[clamp(22rem,36vw,34rem)] w-full grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)_minmax(0,1fr)] gap-2 md:grid"
        // ⚠ Negative margins pull the diagonals into the gaps so the shapes
        // read as one cut object rather than five boxes near each other.
        style={{ letterSpacing: "normal" }}
      >
        <div className="grid grid-rows-2 gap-2">
          {one && panelButton(one, SHAPES.leftTop, "right")}
          {two && panelButton(two, SHAPES.leftBottom, "right")}
        </div>

        <div className="relative h-full w-full" style={{ clipPath: HEX }}>
          {Display}
        </div>

        <div className="grid grid-rows-3 gap-2">
          {three && panelButton(three, SHAPES.rightTop, "left")}
          {four && panelButton(four, SHAPES.rightMiddle, "left")}
          {five && panelButton(five, SHAPES.rightBottom, "left")}
        </div>
      </div>
    </div>
  );
}
