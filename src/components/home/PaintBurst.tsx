"use client";

/**
 * PaintBurst — the paint-explosion film.
 *
 * It used to be the hero's right flank: pinned to the right 57% of the stage
 * and feathered toward the midline by a gradient mask, so the creative side had
 * a ground the logic side's circuit texture answered. It was pulled off the
 * landing on 2026-08-10 and now grounds the Art section instead, where the
 * footage sits behind the collection previews rather than behind the brain.
 *
 * Because it fills its container now, the right-hand offset and the feathering
 * mask are both gone — those existed only to stop a half-width layer reading as
 * a hard-edged rectangle across the middle of the stage. Callers position it.
 *
 * Reduced motion gets the poster frame instead of the loop.
 */

import { useReducedMotion } from "framer-motion";

export function PaintBurst() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative layer, not content
        <img
          src="/videos/paint-burst-poster.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          src="/videos/paint-burst.mp4"
          poster="/videos/paint-burst-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
