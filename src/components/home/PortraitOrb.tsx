"use client";

/**
 * PortraitOrb — the owner, split down the middle, following the mouse.
 *
 * Two supplied ring artworks with the owner's two portraits already inside
 * them: the circuit-line ring around the mono frame, the paint-splatter ring
 * around the colour one. At rest the circle is half of each — the same
 * left-logic / right-creative split the brain above it makes — and the pointer
 * slides the seam: right of centre opens the paint side to 100%, left of
 * centre closes it and leaves the line side whole.
 *
 * ⚠ The two frames are pre-composited and ALIGNED at build time, not stacked
 * by CSS. The supplied rings did not agree: the line ring's white disc sits at
 * (885.5, 592) with r=329.2 and the paint ring's at (377, 595) with r=306.5 —
 * different centres AND different radii. Both were re-projected onto one
 * shared canvas so the disc lands in exactly the same place in each file. That
 * is what lets the seam pass through the face without the circle appearing to
 * jump, and it is why both files are the same size and must stay that way.
 * Re-run the build step if either ring is replaced; do not nudge these by eye.
 *
 * The colour frame is zoomed 1.04 so the two faces register. That number is
 * measured, not guessed: edge-correlation between the frames peaks across
 * 1.02–1.05 and falls away either side.
 *
 * Motion values, not state — the pointer drives a spring straight into
 * `clipPath`, so nothing here re-renders on mouse move.
 */

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/** Both frames share this canvas exactly. See the header. */
const ASPECT = 1100 / 811;
/** How far off-centre the pointer has to travel for a side to reach 100%.
 *  1 = the very edge of the viewport; a little over 1 means it saturates
 *  before the edge, which makes the ends actually reachable in practice. */
const GAIN = 1.35;

export function PortraitOrb({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  /** 0 = paint fully hidden, 0.5 = an even split, 1 = paint whole. */
  const split = useMotionValue(0.5);
  const smooth = useSpring(split, { stiffness: 90, damping: 22, mass: 0.6 });
  const clipPath = useTransform(
    reduceMotion ? split : smooth,
    (v) => `inset(0 0 0 ${(1 - v) * 100}%)`,
  );

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
      {/* Logic half — circuit ring, mono portrait. Always whole underneath; the
          paint frame above is what actually moves. */}
      <Image
        src="/content/portrait/orb-line.webp"
        alt="Shrey Singh"
        fill
        sizes="460px"
        className="object-contain"
        priority
      />

      {/* Creative half — paint ring, colour portrait, revealed from the right. */}
      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <Image
          src="/content/portrait/orb-paint.webp"
          alt=""
          fill
          sizes="460px"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
