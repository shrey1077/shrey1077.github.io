"use client";

/**
 * CaseBackdrop — a client's own film, run as a wash behind their room.
 *
 * Fixed to the viewport so it holds still while the page scrolls, sat well
 * below the content, and kept faint: the plates are the subject and this is
 * atmosphere. Under `prefers-reduced-motion` the film never starts and the
 * poster frame stands in, so the texture survives without the movement.
 *
 * ⚠ The film waits for the page (speed fix 3, 2026-10-13): it autoplayed, so
 * its download (2.6MB for NewsMobile) ran alongside the page's own first
 * pictures. Now the poster stands until the page has loaded, then the film
 * plays. At 10% under a paper wash the change cannot be seen.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { usePageLoaded } from "@/components/home/nearness";

export function CaseBackdrop({ src, poster }: { src: string; poster: string }) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageLoaded = usePageLoaded();
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !pageLoaded) return;
    v.preload = "auto";
    v.play().catch(() => {});
  }, [pageLoaded, reduceMotion]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative wash, not content
        <img src={poster} alt="" className="h-full w-full object-cover opacity-[0.10]" />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="none"
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
