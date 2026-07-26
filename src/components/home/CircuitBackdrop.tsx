"use client";

/**
 * CircuitBackdrop — a faint circuit-board film behind the homepage.
 *
 * A fixed, full-viewport layer sitting behind everything on the page at 20%
 * opacity over the gallery wall, so the brain and panels read against a quiet
 * animated tech field rather than flat paper. Decorative and pointer-inert;
 * under reduced motion it holds on its poster frame instead of playing.
 */

import { useReducedMotion } from "framer-motion";

export function CircuitBackdrop() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-white">
      <video
        className="h-full w-full object-cover opacity-[0.07]"
        autoPlay={!reduceMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/circuit-bg-poster.jpg"
      >
        <source src="/videos/circuit-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
