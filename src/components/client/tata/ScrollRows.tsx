"use client";

/**
 * ScrollRows — a section's tile rows, advanced by the page's own scroll.
 *
 * The section pins itself to the viewport and its rows arrive one at a time as
 * you scroll; once the last row has landed the pin releases and the page moves
 * on to the next section. That is the "scroll-jacked" behaviour asked for.
 *
 * ⚠ It does NOT hijack the wheel. There is no preventDefault, no scroll
 * remapping and no smooth-scroll library: a tall spacer holds the scroll
 * distance and a `position: sticky` child stays put inside it, so the browser's
 * own scrolling is untouched. Keyboard, trackpad momentum, scrollbar dragging,
 * find-in-page and reduced-motion all keep working. Wheel-jacking buys the same
 * effect and breaks every one of those.
 *
 * ⚠ Reduced motion, and any section short enough not to need it, fall back to a
 * plain grid with no pin at all — being trapped in a pinned viewport is
 * precisely the thing motion-sensitive readers are avoiding.
 *
 * The spacer's height is what sets the pace: one viewport of scroll per row
 * after the first. Too little and rows snap past unread; too much and the page
 * feels stuck.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

/** Extra scroll, in viewport heights, spent revealing each row after the first. */
const PER_ROW_VH = 0.72;

export function ScrollRows({
  rows,
  children,
}: {
  /** How many tile rows this section renders — sets the scroll distance. */
  rows: number;
  /** One node per row, in order. */
  children: React.ReactNode[];
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // A single row has nothing to sequence, and a pin would just hold the page
  // still for no reason.
  if (reduceMotion || rows < 2) {
    return <div className="flex flex-col gap-2">{children}</div>;
  }

  return (
    <div ref={ref} style={{ height: `calc(100vh + ${(rows - 1) * PER_ROW_VH * 100}vh)` }}>
      <div className="sticky top-0 flex min-h-screen flex-col justify-center py-10">
        {children.map((row, i) => (
          <Row key={i} index={i} rows={rows} progress={scrollYProgress}>
            {row}
          </Row>
        ))}
      </div>
    </div>
  );
}

function Row({
  index,
  rows,
  progress,
  children,
}: {
  index: number;
  rows: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  children: React.ReactNode;
}) {
  // Row 0 is already there when the pin engages; each later row owns an equal
  // slice of the remaining progress and fades up across it.
  const span = 1 / rows;
  const start = index === 0 ? 0 : index * span * 0.92;
  const end = index === 0 ? 0.0001 : start + span * 0.6;
  const opacity = useTransform(progress, [start, end], [index === 0 ? 1 : 0, 1]);
  const y = useTransform(progress, [start, end], [index === 0 ? 0 : 34, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      transition={{ ease: EASE_OUT }}
      className="mb-2"
    >
      {children}
    </motion.div>
  );
}
