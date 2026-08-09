"use client";

/**
 * PaintBurst — the paint-explosion film, behind the right hemisphere's spray.
 *
 * Confined to the right HALF of the stage: the left flank is the logic side and
 * has its own circuit texture, so letting this bleed across would collapse the
 * distinction the whole layout rests on. Opacity is the whole balancing act:
 * at 50% it barely registered, at 85% it swallowed Imagine and the right-hand
 * pins whole and became the subject. 60% is where the film reads as its own
 * event while the brain's own thrown paint still sits in front of it.
 *
 * Fades out toward the midline so there is no hard vertical seam where the film
 * stops — the mask does the work a crop would do badly.
 *
 * Reduced motion gets the poster frame instead of the loop.
 */

import { useReducedMotion } from "framer-motion";

/** Feathered toward the brain's midline so the layer has no visible edge. */
const FADE =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 12%, #000 34%, #000 100%)";

export function PaintBurst() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden"
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative layer, not content
        <img
          src="/videos/paint-burst-poster.jpg"
          alt=""
          className="h-full w-full object-cover opacity-60"
        />
      ) : (
        <video
          src="/videos/paint-burst.mp4"
          poster="/videos/paint-burst-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-60"
        />
      )}
    </div>
  );
}
