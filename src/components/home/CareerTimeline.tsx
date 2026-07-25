"use client";

/**
 * CareerTimeline — the route so far, as checkpoints on one line.
 *
 * A horizontal rail with a marker per stop: the employer's own logo, the years,
 * the role. Study checkpoints sit on the same line in a quieter key, so the
 * degrees read as part of the route rather than a separate list. Scrolls
 * sideways; newest first.
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
  { org: "ABS Wholesale", role: "Web & Graphic Designer", from: "Nov 2020", to: "Present", logo: "/content/career/abs.png", kind: "work" },
  { org: "Zabraku Design", role: "Graphic Designer", from: "Nov 2020", to: "Present", logo: "/content/career/zabraku.png", kind: "work" },
  { org: "Azoth Biotech", role: "Web & Graphic Designer", from: "Nov 2020", to: "Dec 2023", logo: "/content/career/azoth.png", kind: "work" },
  { org: "Unitedworld Institute of Design", role: "M.Des — Visual Communication", from: "2018", to: "2020", logo: "/content/career/uid.png", kind: "study" },
  { org: "NewsMobile", role: "Web & Graphic Designer / Content Writer", from: "Jan 2017", to: "Jul 2018", logo: "/content/career/newsmobile.png", kind: "work" },
  { org: "NDTV", role: "Intern — Graphic Designer", from: "Oct 2016", to: "Nov 2016", logo: "/content/career/ndtv.png", kind: "work", invert: true },
  { org: "Maxbox Creations", role: "Freelance Designer", from: "Jan 2014", to: "Jul 2016", kind: "work" },
  { org: "Academy of Animation & Gaming", role: "Marketing Executive / 3D Trainer", from: "Jan 2012", to: "Dec 2013", kind: "work" },
  { org: "Jaypee University of Information Technology", role: "B.Tech — Information Technology", from: "2007", to: "2011", kind: "study" },
];

export function CareerTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="h-full min-h-0 overflow-x-auto overflow-y-hidden pb-3">
      <div className="relative flex h-full min-w-max items-stretch gap-6 pt-8">
        {/* The rail every checkpoint hangs from. */}
        <span aria-hidden className="absolute left-0 right-0 top-[3.25rem] h-px bg-white/20" />

        {STOPS.map((s, i) => (
          <motion.div
            key={`${s.org}-${s.from}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(i * 0.05, 0.5) }}
            className="relative flex w-[13rem] shrink-0 flex-col"
          >
            {/* Years above the rail. */}
            <span className={`${typeVoiceClass("logic", "meta")} h-5 text-[0.55rem] uppercase tracking-[0.1em] text-white/60 tabular-nums`}>
              {s.from} — {s.to}
            </span>

            {/* The checkpoint marker, sitting on the rail. */}
            <span
              aria-hidden
              className={`relative z-10 mt-2 size-2.5 rounded-full ring-4 ring-neutral-900 ${
                s.kind === "study" ? "bg-white/40" : "bg-white"
              }`}
            />

            {/* The card. */}
            <div className="mt-5 flex min-h-0 flex-1 flex-col gap-2 rounded-xl border border-white/12 bg-white/[0.04] p-3.5">
              <span className="relative flex h-10 w-full items-center justify-start">
                {s.logo ? (
                  <Image
                    src={s.logo}
                    alt={s.org}
                    fill
                    sizes="200px"
                    className={`object-contain object-left ${s.invert ? "brightness-0 invert" : ""}`}
                  />
                ) : (
                  <span className={`${typeVoiceClass("creative", "display")} text-sm text-white/70`}>
                    {s.org}
                  </span>
                )}
              </span>
              <span className="text-[0.72rem] font-medium leading-tight text-white">{s.org}</span>
              <span className="text-[0.62rem] leading-snug text-white/55">{s.role}</span>
              {s.kind === "study" && (
                <span className={`${typeVoiceClass("logic", "meta")} mt-auto text-[0.5rem] uppercase tracking-[0.14em] text-white/35`}>
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
