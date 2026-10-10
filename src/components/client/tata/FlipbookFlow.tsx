"use client";

/**
 * FlipbookFlow — band 03's flipbook in the middle of a two-column paragraph
 * that describes it (owner, 2026-10-05). The page's scroll turns the frames,
 * and the text GIVES WAY as the drawing grows: the boy and the cage hold the
 * left column back, and as the birds climb away to the upper right they push
 * the right column's lines aside.
 *
 * ⚠ THE TEXT WRAPS THE DRAWING, NOT ITS BOX. Each column carries a float on
 * its inner edge, half the drawing wide and pulled into the gutter by half the
 * gap, so the two floats together are exactly the drawing's footprint. Their
 * shape-outside is that frame's outline (FLIPBOOK_OUTLINES, measured by
 * scripts/prepare-tata-flipbook-flow.mjs): the left float takes the part of
 * each band left of centre, the right float the part right of it. Every frame
 * has the same number of points, so the browser can ease one into the next.
 * The shape is `border-box` on purpose — the default margin-box would count
 * the negative margin and squash the outline.
 *
 * The frames are one sheet (a background-position per frame — no image swap,
 * no flicker). Reduced motion: the last frame, still, with its outline.
 *
 * Below `md` there is one column and nothing to flow between: the drawing,
 * then the text.
 */

import { useRef, useState, type CSSProperties } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import {
  FLIPBOOK_FLOW as F,
  FLIPBOOK_OUTLINE_ROWS as ROWS,
  FLIPBOOK_OUTLINES,
} from "@/constants/tataFlipbookFlow";
import { TATA_HANDBOOK_FLIPBOOK_COPY as COPY } from "@/constants/tataStory";

const LAST = F.frames - 1;
const RATIO = F.h / F.w;

/** --a the drawing's width, --g the gap between the columns, --t how far down
 *  the columns the drawing starts (two lines run full width above it). */
const GEOMETRY = "[--a:15rem] [--g:2.5rem] [--t:0rem] md:[--a:17rem] md:[--t:3.6rem] lg:[--a:19rem] lg:[--g:3rem]";
const ART_H = `calc(var(--a) * ${RATIO})`;

/** Each frame's outline as the two floats' polygons, built once. */
const SHAPES = FLIPBOOK_OUTLINES.map((bands) => {
  const left = ["100% 0%"];
  const right = ["0% 0%"];
  bands.forEach((b, r) => {
    const ya = ((r / ROWS) * 100).toFixed(2);
    const yb = (((r + 1) / ROWS) * 100).toFixed(2);
    // The share of each half the ink reaches into, from the centre line out.
    const l = b && b[0] < 0.5 ? (b[0] / 0.5) * 100 : 100;
    const rr = b && b[1] > 0.5 ? ((b[1] - 0.5) / 0.5) * 100 : 0;
    left.push(`${l.toFixed(1)}% ${ya}%`, `${l.toFixed(1)}% ${yb}%`);
    right.push(`${rr.toFixed(1)}% ${ya}%`, `${rr.toFixed(1)}% ${yb}%`);
  });
  left.push("100% 100%");
  right.push("0% 100%");
  return { left: `polygon(${left.join(",")}) border-box`, right: `polygon(${right.join(",")}) border-box` };
});

export function FlipbookFlow() {
  const reduceMotion = useReducedMotion();
  const artRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);

  // The run: from the drawing's top passing 80% down the screen to its foot
  // passing 55% — so the birds lift off while the paragraph is being read, and
  // the whole drawing is in view when it comes to rest. The last frames are a
  // hold.
  const { scrollYProgress } = useScroll({ target: artRef, offset: ["start 0.8", "end 0.55"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const f = Math.round(Math.min(1, Math.max(0, v)) * LAST);
    setFrame((prev) => (prev === f ? prev : f));
  });

  const shown = reduceMotion ? LAST : frame;
  const shape = SHAPES[shown];
  const col = shown % F.cols;
  const row = Math.floor(shown / F.cols);

  const float = (side: "left" | "right"): CSSProperties => ({
    width: "calc(var(--a) / 2)",
    height: ART_H,
    [side === "left" ? "marginRight" : "marginLeft"]: "calc(var(--g) / -2)",
    shapeOutside: shape[side],
    shapeMargin: "0.85rem",
    transition: reduceMotion ? undefined : "shape-outside 140ms ease-out",
  });

  const paragraphs = (ps: readonly string[]) =>
    ps.map((p) => (
      <p key={p} className="tata-body mb-4 text-[0.98rem] leading-[1.8] text-neutral-700 md:text-justify md:hyphens-auto">
        {p}
      </p>
    ));

  return (
    <div className={`${GEOMETRY} mx-auto w-full max-w-4xl`}>
      <p className="tata-body mb-5 text-center text-[0.68rem] uppercase tracking-[0.2em] text-neutral-900">{COPY.kicker}</p>

      {/* Held open to the drawing's foot, should the text run short of it. */}
      <div
        className="relative md:grid md:min-h-[calc(var(--t)+var(--ah))] md:grid-cols-2 md:gap-x-[var(--g)]"
        style={{ ["--ah" as string]: ART_H }}
      >
        {/* The drawing — over the gutter from md up, above the text below it. */}
        <div
          ref={artRef}
          role="img"
          aria-label="The flipbook: a boy holds up a birdcage and the birds fly free, one after another"
          className="relative mx-auto mb-8 w-[var(--a)] md:absolute md:left-1/2 md:top-[var(--t)] md:mb-0 md:-translate-x-1/2"
          style={{
            height: ART_H,
            backgroundImage: `url(${F.sprite})`,
            backgroundSize: `${F.cols * 100}% ${F.rows * 100}%`,
            backgroundPosition: `${(col / (F.cols - 1)) * 100}% ${(row / (F.rows - 1)) * 100}%`,
          }}
        />

        <div>
          <span aria-hidden className="hidden w-0 md:float-right md:block" style={{ height: "var(--t)" }} />
          <span aria-hidden className="hidden md:float-right md:clear-right md:block" style={float("left")} />
          {paragraphs(COPY.columns[0])}
        </div>
        <div>
          <span aria-hidden className="hidden w-0 md:float-left md:block" style={{ height: "var(--t)" }} />
          <span aria-hidden className="hidden md:float-left md:clear-left md:block" style={float("right")} />
          {paragraphs(COPY.columns[1])}
        </div>
      </div>
    </div>
  );
}
