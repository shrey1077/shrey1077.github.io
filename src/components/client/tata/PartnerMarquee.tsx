"use client";

/**
 * PartnerMarquee — a continuously moving band of partner logos.
 *
 * The row scrolls right-to-left forever; hovering anywhere pauses it, leaving
 * resumes it. Logos are normalized to one optical height so the wall reads as
 * a peer group, not a jumble. The track is duplicated so the loop is seamless
 * (translateX(-50%) lands exactly on the copy). Respects reduced motion by
 * standing still.
 */

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

interface PartnerMarqueeProps {
  /** Public logo URLs. */
  logos: string[];
  /** Seconds for one full cycle (lower = faster). */
  durationSec?: number;
}

export function PartnerMarquee({ logos, durationSec = 42 }: PartnerMarqueeProps) {
  const reducedMotion = useReducedMotion();
  const loop = [...logos, ...logos];

  return (
    <div
      className="group relative overflow-hidden py-8"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      aria-label="Partners"
    >
      <ul
        className="flex w-max items-center gap-10 sm:gap-12"
        style={
          reducedMotion
            ? undefined
            : {
                animation: `tata-marquee ${durationSec}s linear infinite`,
              }
        }
      >
        {loop.map((logo, i) => (
          <li key={`${logo}-${i}`} className="shrink-0">
            {/* Logos are normalised to a uniform 266×119 canvas with equal ink
                area (scripts/normalize-tata-partners.mjs); shown in full colour. */}
            <Image
              src={logo}
              alt=""
              width={266}
              height={119}
              className="h-12 w-auto object-contain opacity-95 transition-opacity duration-500 hover:opacity-100 sm:h-14"
            />
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes tata-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .group:hover ul { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
