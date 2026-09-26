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
import { useInViewport } from "@/hooks/useInViewport";

export interface ShowcaseImage {
  src: string;
  alt: string;
  /** Which panel it belongs to — the caption follows the artwork. */
  panel: string;
  /** How it sits in the centre. See where it is used. */
  fit: "cover" | "contain";
}

export interface ShowcasePanelView {
  id: string;
  number: string;
  label: string;
  blurb: string;
  tint: string;
  /** The panel's own cover art. */
  cover: string;
  images: ShowcaseImage[];
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

/** A shape's bounding box, as percentages — where its cover and label sit. */
function boxOf(points: Point[]) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
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
          <motion.div
            key={current.src}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : FADE / 1000 }}
          >
            {/* ⚠ `fit` is per panel. Photographs fill the shape; a portrait
                brochure page cropped to it is a band of unreadable columns, so
                printed work is CONTAINED on the dark ground instead. */}
            {/* ⚠ A contained plate is PADDED INTO THE SAFE AREA. The hexagon
                takes its corners off, and `object-contain` fits the image to
                the element's box, not to the visible shape — so a rulebook
                plate lost the top of its own heading to the diagonal. The
                padding keeps it inside the widest rectangle the shape allows,
                with more at the foot to clear the caption. */}
            <Image
              src={current.src}
              alt={current.alt}
              fill
              sizes="(max-width: 768px) 92vw, 46vw"
              className={
                current.fit === "contain"
                  ? "object-contain px-[9%] pb-[18%] pt-[6%]"
                  : "object-cover"
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent px-[16%] pb-6 pt-16 text-center sm:pb-9">
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
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </span>

        {/* The tint: what makes a cover read as a panel rather than as a
            photograph, and what says which one holds the centre. */}
        <span
          aria-hidden
          className="absolute inset-0 transition-[background] duration-300"
          style={{
            background: `linear-gradient(135deg, ${panel.tint}${isActive ? "40" : "8f"} 0%, ${panel.tint}${isActive ? "63" : "bf"} 100%)`,
          }}
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
      {/* The owner's grid-line artwork, behind everything. */}
      {gridLines && (
        <div aria-hidden className="pointer-events-none absolute -inset-x-4 -inset-y-8 -z-10 overflow-hidden">
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
    </div>
  );
}
