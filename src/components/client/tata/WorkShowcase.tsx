"use client";

/**
 * WorkShowcase — five panels cut around one central display, band 04.
 *
 * Hover a panel and the centre shows that panel's work, with a heading and a
 * line about it across the foot; leave it and the centre goes back to rotating
 * through everything at random. A tap pins a panel, which is how a touch
 * visitor drives it.
 *
 * ⚠ THE SHAPES ARE THE OWNER'S OWN DIVISION GRID, not an approximation of it.
 * He supplied the drawing on 2026-09-27 (`showcase/_orig/division-grid.webp`,
 * 1672×941) and the numbers below were MEASURED off it by reading where its
 * heavy strokes fall: the left block's inner edge runs 33.5% → 20% → 33.5%, the
 * right block's 66.4% → 79.8% → 66.4%, split once at 50% on the left and at
 * 32.3% / 66.8% on the right. Re-measure rather than re-draw if it is revised.
 *
 * ⚠ EVERY PANEL IS THE FULL BLOCK, CLIPPED. All six shapes are percentages of
 * the WHOLE composition and every panel is `inset-0`, so the cuts share one
 * coordinate space and land on each other exactly. The first version made three
 * columns and cut each panel in its own space; the diagonals came out at
 * different angles and the five read as unrelated boxes. It is also why a
 * panel's cover and label are placed against its BOUNDING BOX — the element
 * itself is the whole band.
 *
 * ⚠ ROUNDED CORNERS NEED PIXELS. `clip-path: polygon()` has no radius, so the
 * paths are generated with quadratic joins once the block has been measured,
 * and the plain polygons stand in until then (and if the observer never fires).
 * Each corner's radius is clamped to half its shortest edge, so the sharp
 * points round as far as they can and no further.
 *
 * ⚠ The panel covers are the owner's composites — decoration. The CENTRE is the
 * real work, read from the catalogue. See scripts/prepare-tata-showcase.mjs.
 *
 * ⚠ THE VEIL IS GREY, NOT COLOURED, and the hovered panel has none at all —
 * the owner's instruction, 2026-09-28. A resting panel is dimmed and drained
 * of colour so the five read as one quiet set; the one holding the centre shows
 * its cover at full strength, which is what says it is chosen. The campus tints
 * that used to wash the panels are gone from this band (they still carry bands
 * 01–03).
 *
 * ⚠ THE PREVIEW NEVER FILLS THE HEXAGON. Its four corners must sit inside the
 * shape, so the artwork is drawn in a rounded rectangle INSCRIBED in it — the
 * largest one of that image's own proportions, which is why it changes size
 * from piece to piece. `inscribedBox` does the arithmetic; the hexagon's half
 * width falls off at a known rate from its middle (29.9 − 0.269·d per the grid
 * above), so the box's aspect and that fall-off solve for its height directly.
 * The box sits slightly above centre to leave the caption its own air.
 *
 * ⚠ PHONES GET A PLAIN GRID. Below `md` the five become ordinary rounded cards
 * under a rectangular display: at 380px the angles eat most of the artwork and
 * the side panels become slivers. The interaction is identical, and a tap does
 * what a hover does — which is also how a touch visitor drives it at any width,
 * since `hover` is a lie on a touchscreen.
 *
 * ⚠ THE FIRST PIECE IS ALWAYS pool[0], and only the ROTATION is random. Random
 * on first render would put one image in the server's HTML and another in the
 * client's, which React flags as a mismatch; drawing the random number inside
 * the interval's callback keeps the first paint identical on both sides.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useInViewport } from "@/hooks/useInViewport";
import { TATA_OPEN_ROOM } from "@/components/client/tata/TataRoomLink";

export interface ShowcaseImage {
  src: string;
  alt: string;
  /** Which panel it belongs to — the caption follows the artwork. */
  panel: string;
  /** How it sits in the centre. See where it is used. */
  fit: "cover" | "contain";
}

/** One subsection card under the composition. Exactly one of `href` and
 *  `room` says where it goes; a card with neither is work still to come. */
export interface ShowcaseSubsection {
  key: string;
  label: string;
  thumb?: string;
  /** `cover` for real work, `contain` for a cutout or a whole plate. */
  thumbFit: "cover" | "contain";
  /** The small caps line — "24 pieces", "12 plates", "No plates yet". */
  meta: string;
  /** The subsection's own catalogue page. */
  href?: string;
  /** …or a room on this page, opened through the board. */
  room?: string;
}

export interface ShowcasePanelView {
  id: string;
  number: string;
  label: string;
  blurb: string;
  /** The panel's own cover art. */
  cover: string;
  images: ShowcaseImage[];
  /** Laid out under the composition when this panel is clicked. */
  subsections: ShowcaseSubsection[];
}

/** ms each piece of artwork holds in the centre. */
const ROTATE = 4000;
/** ms of cross-fade between two pieces. */
const FADE = 600;
/** px. "Big rounded corners", the owner's ask — clamped per corner. */
const RADIUS = 26;
/** px. The white rule painted along every cut, which is what reads as a gap. */
const GUTTER = 7;

/* ── The owner's grid, measured ─────────────────────────────────────────── */
const L_EDGE = 33.5;
const L_VERTEX = 20;
const R_EDGE = 66.4;
const R_VERTEX = 79.8;
/** The right block's two horizontal cuts. The left block has one, at 50%. */
const R_SPLIT = [32.3, 66.8] as const;

/** Each block's inner edge at a given height (0…1 down the composition). Both
 *  are chevrons: furthest in at the middle, back out at the ends. */
const leftX = (t: number) => L_EDGE - (L_EDGE - L_VERTEX) * (1 - Math.abs(2 * t - 1));
const rightX = (t: number) => R_EDGE + (R_VERTEX - R_EDGE) * (1 - Math.abs(2 * t - 1));

type Point = [number, number];

/** Every shape, in percentages of the whole composition. */
const SHAPES: Record<string, Point[]> = {
  brand: [
    [0, 0],
    [leftX(0), 0],
    [leftX(0.5), 50],
    [0, 50],
  ],
  print: [
    [0, 50],
    [leftX(0.5), 50],
    [leftX(1), 100],
    [0, 100],
  ],
  centre: [
    [leftX(0), 0],
    [rightX(0), 0],
    [rightX(0.5), 50],
    [rightX(1), 100],
    [leftX(1), 100],
    [leftX(0.5), 50],
  ],
  digital: [
    [rightX(0), 0],
    [100, 0],
    [100, R_SPLIT[0]],
    [rightX(R_SPLIT[0] / 100), R_SPLIT[0]],
  ],
  photography: [
    [rightX(R_SPLIT[0] / 100), R_SPLIT[0]],
    [100, R_SPLIT[0]],
    [100, R_SPLIT[1]],
    [rightX(R_SPLIT[1] / 100), R_SPLIT[1]],
    [rightX(0.5), 50],
  ],
  video: [
    [rightX(R_SPLIT[1] / 100), R_SPLIT[1]],
    [100, R_SPLIT[1]],
    [100, 100],
    [rightX(1), 100],
  ],
};

/** Which side each panel's diagonal is on, so its words keep clear of it. */
const DIAGONAL: Record<string, "left" | "right"> = {
  brand: "right",
  print: "right",
  digital: "left",
  photography: "left",
  video: "left",
};

const polygonOf = (points: Point[]) =>
  `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;

/** The same shape in pixels, every corner rounded as far as its edges allow — a
 *  quadratic through the corner, which needs no angle maths and behaves at the
 *  acute points, where an arc would fold over itself. */
function roundedPath(points: Point[], w: number, h: number, radius: number): string {
  const px: Point[] = points.map(([x, y]) => [(x / 100) * w, (y / 100) * h]);
  const n = px.length;
  const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const along = (from: Point, to: Point, d: number): Point => {
    const len = dist(from, to) || 1;
    return [from[0] + ((to[0] - from[0]) * d) / len, from[1] + ((to[1] - from[1]) * d) / len];
  };
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const cur = px[i];
    const prev = px[(i - 1 + n) % n];
    const next = px[(i + 1) % n];
    const r = Math.min(radius, dist(cur, prev) / 2, dist(cur, next) / 2);
    const from = along(cur, prev, r);
    const to = along(cur, next, r);
    out.push(`${i === 0 ? "M" : "L"} ${from[0].toFixed(2)} ${from[1].toFixed(2)}`);
    out.push(`Q ${cur[0].toFixed(2)} ${cur[1].toFixed(2)} ${to[0].toFixed(2)} ${to[1].toFixed(2)}`);
  }
  out.push("Z");
  return out.join(" ");
}

/** Where the preview's centre sits, as a percentage down the block. A little
 *  above the middle, so the caption below it is not crowded. */
const PREVIEW_Y = 46;
/** The tallest a preview may be, as a percentage of half the block — keeps a
 *  portrait plate from reaching the caption. */
const PREVIEW_MAX_H = 37;

/** The largest rectangle of `aspect` that fits inside the hexagon, centred on
 *  PREVIEW_Y — as percentages of the block.
 *
 *  The hexagon's half-width shrinks by 0.269 per unit away from its middle (see
 *  the measured grid above), so with half-height `h` the furthest corner sits
 *  |PREVIEW_Y − 50| + h away and may be at most 29.9 − 0.269·that. Setting the
 *  aspect's own half-width equal to it gives `h` in one step. */
function inscribedBox(aspect: number, blockW: number, blockH: number) {
  // Half-width in % of width, per unit of half-height in % of height.
  const k = (aspect * blockH) / blockW;
  const offset = Math.abs(PREVIEW_Y - 50);
  const h = Math.min((29.9 - 0.269 * offset) / (k + 0.269), PREVIEW_MAX_H);
  const w = k * h;
  return {
    left: (L_VERTEX + R_VERTEX) / 2 - w,
    top: PREVIEW_Y - h,
    width: 2 * w,
    height: 2 * h,
  };
}

/** A shape's bounding box, as percentages — where its cover and label sit. */
function boxOf(points: Point[]) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}

/** One piece of artwork, in its own inscribed box.
 *
 * ⚠ AT MODULE SCOPE, and it must stay there. Declared inside WorkShowcase it is
 * a new component type on every render, so React unmounts and remounts it each
 * time the parent re-renders — which happens on every hover and every rotation
 * tick. Its measured aspect would reset to the default each time and the
 * dissolve would restart. (The lint rule that catches this elsewhere did not
 * fire here; the remount is real either way.)
 *
 * ⚠ Each fading layer carries ITS OWN box rather than sharing one: the outgoing
 * piece keeps the size it was drawn at while the incoming one arrives at its
 * own, so nothing resizes mid-dissolve. The aspect is read off the file when it
 * loads; until then it is drawn at 3:2, which is close enough that the settle
 * is not a jump.
 */
function Plate({
  image,
  rounded,
  block,
  reduceMotion,
}: {
  image: ShowcaseImage;
  /** True on the phone, where the display is a plain rectangle. */
  rounded: boolean;
  block: { w: number; h: number };
  reduceMotion: boolean;
}) {
  const [aspect, setAspect] = useState(3 / 2);
  const box = inscribedBox(aspect, block.w, block.h);
  return (
    <motion.div
      className={`absolute overflow-hidden ${rounded ? "rounded-2xl" : "rounded-3xl"}`}
      style={
        rounded
          ? { inset: "6%" }
          : {
              left: `${box.left}%`,
              top: `${box.top}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }
      }
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : FADE / 1000 }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 768px) 88vw, 40vw"
        // The box is cut to the image's own proportions, so `cover` crops
        // nothing — it just fills the rounded corners cleanly.
        className="object-cover"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setAspect(img.naturalWidth / img.naturalHeight);
          }
        }}
      />
    </motion.div>
  );
}

/** One subsection, in the same card the six rooms below use — number, title,
 *  a plate, a line of small caps and the arrow — so the two rows read as one
 *  system. At module scope for the same reason as Plate. */
function SubsectionCard({ sub, number }: { sub: ShowcaseSubsection; number: string }) {
  const body = (
    <>
      <span className="flex items-baseline gap-2">
        <span className="tata-display text-[1.6rem] leading-none text-neutral-300">{number}</span>
        <span className="tata-display text-[1.05rem] leading-tight text-neutral-900">{sub.label}</span>
      </span>

      <span className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-sm bg-neutral-100">
        {sub.thumb ? (
          <Image
            src={sub.thumb}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className={`transition-transform duration-500 group-hover:scale-[1.03] ${
              sub.thumbFit === "contain" ? "object-contain p-3" : "object-cover"
            }`}
          />
        ) : (
          <span className="tata-body px-2 text-center text-[0.52rem] uppercase tracking-[0.16em] text-neutral-400">
            No plates yet
          </span>
        )}
      </span>

      <span className="tata-body block text-[0.58rem] uppercase leading-[1.7] tracking-[0.12em] text-neutral-500">
        {sub.meta}
      </span>

      {(sub.href || sub.room) && (
        <span
          aria-hidden
          className="mt-auto grid size-7 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-700 transition-colors duration-300 group-hover:border-neutral-900"
        >
          <span className="block text-[0.7rem] leading-none transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </span>
      )}
    </>
  );

  const shell =
    "group flex h-full w-full flex-col gap-3 rounded-sm border border-neutral-200 bg-white/80 p-3 text-left outline-none backdrop-blur-[2px] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:p-4";

  if (sub.href) {
    return (
      <Link href={sub.href} className={`${shell} hover:border-neutral-400`}>
        {body}
      </Link>
    );
  }
  if (sub.room) {
    return (
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent(TATA_OPEN_ROOM, { detail: sub.room }))}
        className={`${shell} hover:border-neutral-400`}
      >
        {body}
      </button>
    );
  }
  // Work still to come: the card keeps its place in the grid, and says so.
  return <div className={`${shell} opacity-70`}>{body}</div>;
}

export function WorkShowcase({
  panels,
  gridLines,
}: {
  panels: ShowcasePanelView[];
  /** The owner's grid-line artwork, washed behind the whole composition. */
  gridLines?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const blockRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ id: string | null; i: number }>({ id: null, i: 0 });

  /* Measured, so the shapes can be drawn with real radii — see above. */
  useEffect(() => {
    const block = blockRef.current;
    if (!block) return;
    const ro = new ResizeObserver(() => {
      const r = block.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setSize((prev) =>
        prev && Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1
          ? prev
          : { w: r.width, h: r.height },
      );
    });
    ro.observe(block);
    return () => ro.disconnect();
  }, []);

  const clipFor = (id: string) =>
    size ? `path("${roundedPath(SHAPES[id], size.w, size.h, RADIUS)}")` : polygonOf(SHAPES[id]);

  const activeId = hovered ?? pinned;
  const active = panels.find((p) => p.id === activeId) ?? null;
  const pinnedPanel = panels.find((p) => p.id === pinned) ?? null;

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

  const display = (rounded: boolean) => (
    <div
      data-showcase-display
      className={`relative h-full w-full overflow-hidden bg-neutral-900 ${rounded ? "rounded-3xl" : ""}`}
    >
      <AnimatePresence initial={false}>
        {current && (
          <Plate
            key={current.src}
            image={current}
            rounded={rounded}
            block={size ?? { w: 1400, h: 560 }}
            reduceMotion={!!reduceMotion}
          />
        )}
      </AnimatePresence>

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-[18%] pb-5 pt-10 text-center sm:pb-7">
          <p className="tata-body text-[0.58rem] uppercase tracking-[0.22em] text-white/55">
            {caption.number}
          </p>
          <h3 className="tata-display mt-1 text-[clamp(1.05rem,1.7vw,1.5rem)] leading-tight text-white">
            {caption.label}
          </h3>
          <p className="tata-body mx-auto mt-1.5 max-w-md text-[0.76rem] leading-relaxed text-white/70">
            {caption.blurb}
          </p>
        </div>
      )}
    </div>
  );

  const panelFace = (panel: ShowcasePanelView, shaped: boolean) => {
    const isActive = activeId === panel.id;
    const box = shaped
      ? boxOf(SHAPES[panel.id])
      : { left: 0, top: 0, width: 100, height: 100 };
    const side = DIAGONAL[panel.id];
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
        className={`group text-left outline-none focus-visible:brightness-90 ${
          shaped ? "absolute inset-0" : "relative h-full w-full overflow-hidden rounded-2xl"
        }`}
        style={shaped ? { clipPath: clipFor(panel.id) } : undefined}
      >
        {/* The cover, fitted to the panel's own bounding box rather than to the
            whole band — see the note at the top. */}
        <span
          className="absolute overflow-hidden"
          style={{
            left: `${box.left}%`,
            top: `${box.top}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
          }}
        >
          <Image
            src={panel.cover}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 34vw"
            className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.04]"
            style={{ filter: isActive ? "none" : "grayscale(0.85)" }}
          />
        </span>

        {/* The veil. Grey and translucent at rest, gone entirely on the panel
            that holds the centre — see the note at the top. */}
        <span
          aria-hidden
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(135deg, #6b6b6b 0%, #3f3f3f 100%)",
            opacity: isActive ? 0 : 0.72,
          }}
        />

        {/* A little dark at the foot so the label holds up over a cover at full
            strength, where there is no veil to sit on. */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-neutral-950/55 to-transparent"
        />

        {/* Number and label, inside the box and clear of the diagonal. */}
        <span
          className={`absolute flex flex-col justify-end ${side === "left" ? "items-end text-right" : "items-start"}`}
          style={{
            left: `${box.left}%`,
            top: `${box.top}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            padding: "clamp(0.9rem, 1.6vw, 1.5rem)",
            paddingLeft: side === "left" && shaped ? "16%" : undefined,
            paddingRight: side === "right" && shaped ? "16%" : undefined,
          }}
        >
          <span className="tata-body text-[0.6rem] uppercase tracking-[0.2em] text-white/75">
            {panel.number}
          </span>
          <span className="tata-display text-[clamp(1rem,1.5vw,1.45rem)] leading-tight text-white">
            {panel.label}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div ref={ref} data-showcase className="relative w-full">
      {/* The owner's grid-line artwork, behind everything.
          ⚠ No sideways bleed (it was `-inset-x-4` until 2026-10-03): the
          showcase runs edge to edge of its column at every width, so 16px out
          either side pushed the page 4–8px wider than the screen — hidden on
          desktop by body's overflow-x, but a sideways wobble on phones. */}
      {gridLines && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -inset-y-8 -z-10 overflow-hidden">
          <Image src={gridLines} alt="" fill sizes="100vw" className="object-cover opacity-90" />
        </div>
      )}

      {/* ── Phones: the display, then the five as plain cards ── */}
      <div className="md:hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
          {display(true)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {panels.map((panel) => (
            <div key={panel.id} className="h-24">
              {panelFace(panel, false)}
            </div>
          ))}
        </div>
      </div>

      {/* ── The composition ── */}
      <div ref={blockRef} className="relative hidden h-[clamp(24rem,40vw,38rem)] w-full md:block">
        {panels.map((panel) => panelFace(panel, true))}

        <div className="absolute inset-0" style={{ clipPath: clipFor("centre") }}>
          {display(false)}
        </div>

        {/* ⚠ The gutter is a STROKE along every cut, not a gap between boxes.
            The shapes share their edges — that is what the grid draws — so the
            only way to part them is to paint the seam. Drawn over everything,
            and deaf to the pointer so it never steals a hover. */}
        {size && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${size.w} ${size.h}`}
            preserveAspectRatio="none"
          >
            {Object.keys(SHAPES).map((id) => (
              <path
                key={id}
                d={roundedPath(SHAPES[id], size.w, size.h, RADIUS)}
                fill="none"
                stroke="#f9f9f9"
                strokeWidth={GUTTER}
                strokeLinejoin="round"
              />
            ))}
          </svg>
        )}
      </div>

      {/* ── The chosen panel's subsections ──
          ⚠ DRIVEN BY THE PIN, NOT THE HOVER. Hovering previews a panel in the
          centre; clicking one commits to it, and only then does its grid lay
          itself out below — otherwise every pass of the pointer across the
          band would rebuild a row of sixteen cards under the reader.
          ⚠ FIVE ACROSS AT MOST (the owner's limit), and each card rises into
          place as it scrolls into view, staggered by its COLUMN so every row
          cascades left to right as it arrives rather than all sixteen timing
          off the first. */}
      <AnimatePresence mode="wait">
        {pinnedPanel && pinnedPanel.subsections.length > 0 && (
          <motion.div
            key={pinnedPanel.id}
            data-showcase-subsections={pinnedPanel.id}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-8"
          >
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              {/* ⚠ The separators are TEXT, not margin: a margin between inline
                  spans vanishes from the accessible name and from any copy of
                  the line, which is how it first read "PRINT16". */}
              <p className="tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500">
                {pinnedPanel.number} · {pinnedPanel.label}
                <span className="text-neutral-400">
                  {" · "}
                  {pinnedPanel.subsections.length}{" "}
                  {pinnedPanel.subsections.length === 1 ? "subsection" : "subsections"}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setPinned(null)}
                className="tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500 underline-offset-4 outline-none transition-colors hover:text-neutral-900 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-900/40"
              >
                Close ✕
              </button>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {pinnedPanel.subsections.map((sub, i) => (
                <motion.li
                  key={sub.key}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 5) * 0.07 }}
                >
                  <SubsectionCard sub={sub} number={String(i + 1).padStart(2, "0")} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
