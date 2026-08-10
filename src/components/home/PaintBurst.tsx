"use client";

/**
 * PaintBurst — the paint-explosion film, behind the right hemisphere's spray.
 *
 * Confined to the right 57% of the stage — its left boundary sits 7% past the
 * midline, so the film reaches a little way under the brain. It stops there:
 * the left flank is the logic side with its own circuit texture, and letting
 * this bleed across would collapse the distinction the layout rests on.
 *
 * It runs at FULL opacity — the film is the creative flank's ground, not a wash
 * over it. The gradient mask is what keeps that from reading as a hard-edged
 * rectangle: it feathers the film out toward the midline, doing the job a crop
 * would do badly, so the two hemispheres meet rather than butt.
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
      className="pointer-events-none absolute inset-y-0 right-0 w-[57%] overflow-hidden"
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
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
