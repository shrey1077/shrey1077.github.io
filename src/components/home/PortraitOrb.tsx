"use client";

/**
 * PortraitOrb — the owner, split down the middle, the seam sweeping across.
 *
 * Two supplied ring artworks with the owner's two portraits inside them: the
 * circuit-line ring around the mono frame, the paint-splatter ring around the
 * colour one. At rest the circle is half of each — the same left-logic /
 * right-creative split the brain above it makes — and the seam SWEEPS, left
 * to right and back, on its own (owner, 2026-10-12: "similarly for first
 * slide picture element", after the brain's turn): any pointer movement holds
 * it where it is, and a second of stillness lets it carry on (idleSweep).
 * From 2026-10-03 until then the seam followed the pointer instead.
 *
 * ⚠ The two frames are pre-composited and ALIGNED at build time, not stacked
 * by CSS. The supplied rings do not agree with each other: the line ring's
 * disc sits at (1083.5, 493) with r=391.2 and the paint ring's at (455.5,
 * 489.5) with r=342.5 — different centres AND different radii. Both are
 * re-projected onto one shared canvas so the disc lands identically in each.
 * Both files are therefore the same size and must stay that way; re-run the
 * build step if a ring is replaced rather than nudging anything by eye.
 *
 * ⚠ The two PORTRAITS are aligned to each other too, and that needs a
 * translation, not just a zoom: scale 1.042 with a (+4.5, −7.0) source-pixel
 * shift. Solved by maximising gradient-magnitude correlation across the face,
 * which scores 0.636 against 0.598 for the best scale-only fit. Scale alone
 * left the face visibly broken at the seam — the frames differ by a shift as
 * well as a zoom, and only the shift closes the jaw and glasses across the
 * join.
 *
 * The seam is a gradient mask — a crisp line since 2026-10-03, see FEATHER — and the two masks
 * are exact complements — where one is opaque the other is transparent — so a
 * side that is fully open leaves the other genuinely invisible rather than
 * merely covered. That matters because both frames have transparent
 * background: a covered frame would still show its tracery through the gaps.
 *
 * Motion values, not state — the sweep writes straight into the masks, with
 * no spring (it is smooth already, and must stop the instant the pointer
 * moves), so nothing here re-renders as it goes. It only runs while the orb
 * is on screen.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { SWEEP_PERIOD, SWEEP_START, sweepAt, watchPointer } from "@/components/home/idleSweep";

/** The two frames. ⚠ HeroStage preloads both from the page's <head>
 *  (2026-10-12, speed fix 1): the orb only renders once the stage has been
 *  measured, after the page's code has run, so without that the browser would
 *  not learn of the photo until then — and would fetch it behind everything
 *  else the page asks for at that moment. */
export const ORB_SRC = { line: "/content/portrait/orb-line.webp", paint: "/content/portrait/orb-paint.webp" } as const;

/** Both frames share this canvas exactly. See the header. */
const ASPECT = 1200 / 606;
/** Half-width of the seam, as a percentage of the frame's width. ⚠ A HAIR, not
 *  a feather, since 2026-10-03 (owner: "the transition line should not have the
 *  fade effect") — 2% softened it over ~20px. Kept a hair above zero so the two
 *  complementary masks overlap by a fraction of a pixel and never leave a gap. */
const FEATHER = 0.05;

/* Where the disc sits inside the frame, as percentages of frame width. Emitted
 * by the build step (cxFrac 0.4674, rFracW 0.1688) — re-read them if the rings
 * are rebuilt. The frame is mostly tracery and splatter; the circle is only
 * this middle third of it. */
const CIRCLE_L = 29.86;
const CIRCLE_R = 63.62;

/** Seam position for a given split, in %.
 *
 *  ⚠ It sweeps the CIRCLE's span, not the whole frame, and that distinction is
 *  the whole design. Sweeping 100 → 0 meant the seam spent most of its travel
 *  outside the disc: the face would read as fully mono while the paint side
 *  was still half-revealed, its splatter sliced down a hard vertical edge in
 *  empty space. Ending the sweep at the disc's edges means "the face is whole"
 *  and "that side has won" happen at the same instant.
 *
 *  At split 0.5 this lands on CIRCLE's centre (46.74), not on 50 — the disc is
 *  NOT centred in the frame, so splitting the frame in half would have split
 *  the face 12px off its own middle. */
const seam = (v: number) => CIRCLE_R + (CIRCLE_L - CIRCLE_R) * v;

/** How much of the travel is spent fading a losing side out completely.
 *
 *  The mask alone cannot do this: each frame carries artwork BEYOND the disc
 *  (tracery to the left, splatter to the right) which no seam inside the disc
 *  will ever cover. So the beaten side is faded out outright, over the first
 *  slice of travel, while the seam is still inside the disc — the paint fades
 *  up as it takes the circle rather than popping in at the edge. */
const FADE = 0.25;
const fade = (v: number) => Math.min(1, Math.max(0, v / FADE));

/** ⚠ The ENDS HOLD (owner, 2026-10-03: "this position should be the point
 *  where the black picture is completely visible and the colour totally
 *  invisible, and vice versa"). The last END of the pointer's travel at each
 *  side is spent AT the end — seam on the disc's edge, the beaten side gone —
 *  instead of creeping the last few pixels while the other side's splatter
 *  still showed at half strength beyond the disc. `travel` is the split with
 *  those two dead zones taken out; the seam and both fades read it. */
const END = 0.1;
const travel = (v: number) => Math.min(1, Math.max(0, (v - END) / (1 - 2 * END)));

export function PortraitOrb({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  /** 0 = line side whole, 0.5 = an even split, 1 = paint side whole. */
  const split = useMotionValue(0.5);
  const src = split;

  const maskLine = useTransform(
    src,
    (v) => `linear-gradient(to right, #000 ${seam(travel(v)) - FEATHER}%, transparent ${seam(travel(v)) + FEATHER}%)`,
  );
  const maskPaint = useTransform(
    src,
    (v) => `linear-gradient(to right, transparent ${seam(travel(v)) - FEATHER}%, #000 ${seam(travel(v)) + FEATHER}%)`,
  );
  // Beaten side goes fully away — tracery and splatter included.
  const opacityLine = useTransform(src, (v) => fade(1 - travel(v)));
  const opacityPaint = useTransform(src, (v) => fade(travel(v)));

  // The sweep — held while the pointer moves, carried on after a second's
  // stillness, and only run while the orb is on screen.
  useEffect(() => {
    const root = rootRef.current;
    if (reduceMotion || !root) return;
    const pointer = watchPointer();
    let shown = true;
    const io = new IntersectionObserver(([e]) => {
      shown = e.isIntersecting;
    });
    io.observe(root);
    let phase = SWEEP_START;
    let last = -1;
    let raf = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last < 0 ? 0 : Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!shown || pointer.held(t)) return;
      phase += dt / SWEEP_PERIOD;
      split.set(sweepAt(phase));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      pointer.stop();
    };
  }, [reduceMotion, split]);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ aspectRatio: ASPECT }}>
      {/* Logic half — circuit ring, mono portrait. */}
      <motion.div
        className="absolute inset-0"
        style={{ maskImage: maskLine, WebkitMaskImage: maskLine, opacity: opacityLine }}
      >
        <Image
          src={ORB_SRC.line}
          alt="Shrey Singh"
          fill
          sizes="500px"
          className="object-contain"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* Creative half — paint ring, colour portrait. */}
      <motion.div
        className="absolute inset-0"
        style={{ maskImage: maskPaint, WebkitMaskImage: maskPaint, opacity: opacityPaint }}
      >
        {/* ⚠ Eager and high priority as the line half is (it was lazy until
            2026-10-12): the photo is the first screen's picture, and it is
            whole only when both halves are in. */}
        <Image
          src={ORB_SRC.paint}
          alt=""
          fill
          sizes="500px"
          className="object-contain"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>
    </div>
  );
}
