"use client";

/**
 * CaseBackdrop — a client's own film, run as a wash behind their room.
 *
 * Fixed to the viewport so it holds still while the page scrolls, sat well
 * below the content, and kept faint: the plates are the subject and this is
 * atmosphere. Under `prefers-reduced-motion` the film never starts and the
 * poster frame stands in, so the texture survives without the movement.
 */

import { useReducedMotion } from "framer-motion";

export function CaseBackdrop({ src, poster }: { src: string; poster: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative wash, not content
        <img src={poster} alt="" className="h-full w-full object-cover opacity-[0.10]" />
      ) : (
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-[0.10]"
        />
      )}
      {/* Lift the paper back up so body copy keeps its contrast. */}
      <div className="absolute inset-0 bg-[#fafafa]/55" />
    </div>
  );
}
