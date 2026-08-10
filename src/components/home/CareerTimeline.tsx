"use client";

/**
 * CareerTimeline — the route so far, as checkpoints on one line.
 *
 * A horizontal rail with a marker per stop: the employer's own logo, the years,
 * the role. Study checkpoints sit on the same line in a quieter key, so the
 * degrees read as part of the route rather than a separate list. The whole
 * route fits one frame — stops share the width rather than scrolling away, so
 * the shape of the career is legible at a glance. Newest first.
 *
 * Sourced from the 2024 resume; logos are the originals
 * (scripts/prepare-career.mjs).
 */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

interface Stop {
  org: string;
  role: string;
  from: string;
  to: string;
  logo?: string;
  kind: "work" | "study";
  /** Black artwork — flip it to white so it lifts off the dark panel. */
  invert?: boolean;
}

/** Newest first. */
const STOPS: Stop[] = [
  { org: "Tata IIS", role: "Visual Communication Designer", from: "Apr 2024", to: "Sep 2026", logo: "/content/career/tata-iis.png", kind: "work", invert: true },
  { org: "ABS Wholesale", role: "Web & Graphic Designer", from: "Nov 2020", to: "Feb 2024", logo: "/content/career/abs.png", kind: "work" },
  { org: "Zabraku Design", role: "Graphic Designer", from: "Nov 2020", to: "Feb 2024", logo: "/content/career/zabraku.png", kind: "work" },
  { org: "Azoth Biotech", role: "Web & Graphic Designer", from: "Nov 2020", to: "Dec 2023", logo: "/content/career/azoth.png", kind: "work" },
  { org: "Unitedworld Institute of Design", role: "M.Des — Visual Communication", from: "2018", to: "2020", kind: "study" },
  { org: "NewsMobile", role: "Web & Graphic Designer / Content Writer", from: "Jan 2017", to: "Jul 2018", logo: "/content/career/newsmobile.png", kind: "work" },
  { org: "NDTV", role: "Intern — Graphic Designer", from: "Oct 2016", to: "Nov 2016", logo: "/content/career/ndtv.png", kind: "work", invert: true },
  { org: "Maxbox Creations", role: "Freelance Designer", from: "Jan 2014", to: "Jul 2016", kind: "work" },
  { org: "Academy of Animation & Gaming", role: "Marketing Executive / 3D Trainer", from: "Jan 2012", to: "Dec 2013", kind: "work" },
  { org: "Jaypee University of Information Technology", role: "B.Tech — Information Technology", from: "2007", to: "2011", kind: "study" },
];

/** How many checkpoints the rail carries, for panels that count their entries. */
export const CAREER_STOP_COUNT = STOPS.length;

export function CareerTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="h-full min-h-0 overflow-hidden pb-2">
      <div className="relative flex h-full items-stretch gap-1.5 pt-6">
        {/* The rail every checkpoint hangs from. */}
        <span aria-hidden className="absolute left-0 right-0 top-[2.6rem] h-px bg-white/20" />

        {STOPS.map((s, i) => (
          <motion.div
            key={`${s.org}-${s.from}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(i * 0.05, 0.5) }}
            className="relative flex min-w-0 flex-1 flex-col"
          >
            {/* Years above the rail. */}
            <span className={`${typeVoiceClass("logic", "meta")} h-4 text-[0.46rem] uppercase tracking-[0.02em] text-white/60 tabular-nums`}>
              {s.from} — {s.to}
            </span>

            {/* The checkpoint marker, sitting on the rail. */}
            <span
              aria-hidden
              className={`relative z-10 mt-1.5 size-1.5 rounded-full ring-[3px] ring-neutral-900 ${
                s.kind === "study" ? "bg-white/40" : "bg-white"
              }`}
            />

            {/* The card. */}
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1 rounded-lg border border-white/12 bg-white/[0.04] p-2">
              <span className="relative flex h-7 w-full shrink-0 items-center justify-start">
                {s.logo ? (
                  <Image
                    src={s.logo}
                    alt={s.org}
                    fill
                    sizes="200px"
                    className={`object-contain object-left ${s.invert ? "brightness-0 invert" : ""}`}
                  />
                ) : (
                  <span className={`${typeVoiceClass("creative", "display")} text-[0.62rem] leading-tight text-white/70`}>
                    {s.org}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-[0.58rem] font-medium leading-tight text-white">{s.org}</span>
              <span className="line-clamp-2 text-[0.52rem] leading-snug text-white/55">{s.role}</span>
              {s.kind === "study" && (
                <span className={`${typeVoiceClass("logic", "meta")} mt-auto text-[0.44rem] uppercase tracking-[0.1em] text-white/35`}>
                  Study
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
