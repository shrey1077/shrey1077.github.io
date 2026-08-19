"use client";

/**
 * PortraitOrb — the owner, split down the middle, following the mouse.
 *
 * Two supplied ring artworks with the owner's two portraits inside them: the
 * circuit-line ring around the mono frame, the paint-splatter ring around the
 * colour one. At rest the circle is half of each — the same left-logic /
 * right-creative split the brain above it makes — and the pointer slides the
 * seam: right of centre opens the paint side, left of centre the line side.
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
 * The seam is a FEATHERED gradient mask, not a hard clip, and the two masks
 * are exact complements — where one is opaque the other is transparent — so a
 * side that is fully open leaves the other genuinely invisible rather than
 * merely covered. That matters because both frames have transparent
 * background: a covered frame would still show its tracery through the gaps.
 *
 * Motion values, not state — the pointer drives a spring straight into the
 * masks, so nothing here re-renders on mouse move.
 */

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/** Both frames share this canvas exactly. See the header. */
const ASPECT = 1200 / 606;
/** How far off-centre the pointer travels before a side is whole. 1 = the very
 *  edge of the viewport; a little over 1 saturates before the edge, which makes
 *  the ends actually reachable. */
const GAIN = 1.35;
/** Half-width of the feathered seam, as a percentage of the frame's width. */
const FEATHER = 2;

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
const FADE = 0.18;
const fade = (v: number) => Math.min(1, Math.max(0, v / FADE));

export function PortraitOrb({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  /** 0 = line side whole, 0.5 = an even split, 1 = paint side whole. */
  const split = useMotionValue(0.5);
  const smooth = useSpring(split, { stiffness: 90, damping: 22, mass: 0.6 });
  const src = reduceMotion ? split : smooth;

  const maskLine = useTransform(
    src,
    (v) => `linear-gradient(to right, #000 ${seam(v) - FEATHER}%, transparent ${seam(v) + FEATHER}%)`,
  );
  const maskPaint = useTransform(
    src,
    (v) => `linear-gradient(to right, transparent ${seam(v) - FEATHER}%, #000 ${seam(v) + FEATHER}%)`,
  );
  // Beaten side goes fully away — tracery and splatter included.
  const opacityLine = useTransform(src, (v) => fade(1 - v));
  const opacityPaint = useTransform(src, fade);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const t = (e.clientX / window.innerWidth - 0.5) * GAIN + 0.5;
      split.set(Math.min(1, Math.max(0, t)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [split]);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: ASPECT }}>
      {/* Logic half — circuit ring, mono portrait. */}
      <motion.div
        className="absolute inset-0"
        style={{ maskImage: maskLine, WebkitMaskImage: maskLine, opacity: opacityLine }}
      >
        <Image
          src="/content/portrait/orb-line.webp"
          alt="Shrey Singh"
          fill
          sizes="500px"
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Creative half — paint ring, colour portrait. */}
      <motion.div
        className="absolute inset-0"
        style={{ maskImage: maskPaint, WebkitMaskImage: maskPaint, opacity: opacityPaint }}
      >
        <Image
          src="/content/portrait/orb-paint.webp"
          alt=""
          fill
          sizes="500px"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
