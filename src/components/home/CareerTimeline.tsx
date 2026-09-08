"use client";

/**
 * CareerTimeline — the route so far, as checkpoints on a rail that wraps.
 *
 * Ten stops on one unbroken line needed 832px before the cards started to
 * crush, so the rail now runs in rows and continues onto the next: five to a
 * row on a wide screen, which lands the route in the two rows it reads best in,
 * three then two as the panel narrows. Newest first, left to right, top to
 * bottom.
 *
 * The rail is not drawn once per row. Each stop draws its OWN segment across
 * the full width of its cell at a fixed height, and neighbours meet edge to
 * edge — so the line is continuous across whatever row the grid happens to
 * build, at any column count, with nothing measuring or counting. The last
 * segment of a row and the first of the next are the same line, continued.
 *
 * Each checkpoint is a pin on that line with the employer's mark below it in a
 * circle, and the years, name and role under that. Stops with no logo on disc
 * take their initials instead, so every checkpoint keeps the same silhouette.
 * Study stops sit on the same rail in a quieter key — a hollow pin — so the
 * degrees read as part of the route rather than a separate list.
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
  /** ⚠ "This artwork is BLACK." It used to mean "flip it to white", back when
   *  the checkpoints sat straight on the near-black section panel. They now sit
   *  on a light card (see the panel below), so the flag renders the mark AS
   *  black instead — `brightness-0` with no `invert`. Tata IIS and NDTV are the
   *  two, and inverting either here would erase it into the card. */
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

/** Where the rail sits inside every cell. One number, because the segments only
 *  join into a line if each is drawn at the same height as its neighbours. */
const RAIL_TOP = "top-[1.35rem]";

/** Initials for the stops with no logo on disc, so a checkpoint without artwork
 *  keeps the same circular silhouette as one with it. Joining words are
 *  dropped — "Academy of Animation & Gaming" reads AAG, not AOAG. */
const JOINERS = new Set(["of", "and", "&", "the", "for"]);
function initialsOf(org: string): string {
  return org
    .split(/\s+/)
    .filter((w) => w && !JOINERS.has(w.toLowerCase()))
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 4);
}

export function CareerTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden pb-2">
      {/* No column gap: a gap is a break in the rail, and the segments have to
          abut for the row to read as one line. The cells carry their own `px`
          instead, so the content still breathes. */}
      {/* ⚠ ONE card for the whole route, not one per checkpoint — the owner
          asked for a COMMON rounded rectangle behind the circles (2026-08-25),
          and it is what lets the type go dark: the section's own ground is
          near-black, so dark text only reads against this.
          It wraps the grid rather than sitting behind it as an absolute layer,
          so the card grows with however many rows the grid builds at whatever
          column count — nothing counts rows or measures. */}
      <div className="rounded-2xl bg-gallery px-3 py-7 shadow-sm sm:px-5">
      <ul className="grid grid-cols-2 gap-x-0 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
        {STOPS.map((s, i) => (
          <motion.li
            key={`${s.org}-${s.from}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(i * 0.05, 0.5) }}
            className="relative flex min-w-0 flex-col items-center px-1 pt-6 text-center"
          >
            {/* This cell's slice of the rail. Full-bleed to both edges so it
                meets its neighbours' slices and the row reads as one line. */}
            <span
              aria-hidden
              className={`absolute inset-x-0 ${RAIL_TOP} h-px bg-neutral-900/15`}
            />

            {/* The checkpoint pin, sitting on that line. ⚠ The ring must stay
                the CARD's own colour (`ring-gallery`), not the section panel's:
                its whole job is to punch the rail out from under the pin, and
                it can only do that by matching whatever is directly behind it.
                It was `ring-neutral-900` while the rail sat on the dark panel. */}
            <span
              aria-hidden
              className={`absolute ${RAIL_TOP} z-10 size-1.5 -translate-y-[calc(50%-0.5px)] rounded-full ring-[3px] ring-gallery ${
                s.kind === "study" ? "bg-neutral-900/40" : "bg-neutral-900"
              }`}
            />

            {/* The mark, on disc — now a faint dark wash on the light card
                rather than a faint light one on the dark panel. */}
            <span className="relative mt-4 grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-900/10 bg-neutral-900/[0.04] sm:size-16">
              {s.logo ? (
                <Image
                  src={s.logo}
                  alt={s.org}
                  fill
                  sizes="80px"
                  className={`object-contain p-3 ${s.invert ? "brightness-0" : ""}`}
                />
              ) : (
                <span
                  className={`${typeVoiceClass("logic", "meta")} text-[0.7rem] text-neutral-500`}
                >
                  {initialsOf(s.org)}
                </span>
              )}
            </span>

            {/* Everything the checkpoint says, under it. */}
            <span
              className={`${typeVoiceClass("logic", "meta")} mt-2.5 text-[0.46rem] tracking-[0.02em] text-neutral-500 tabular-nums`}
            >
              {s.from} — {s.to}
            </span>
            <span className="mt-1 line-clamp-2 text-[0.62rem] font-medium leading-tight text-neutral-900">
              {s.org}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[0.55rem] leading-snug text-neutral-600">
              {s.role}
            </span>
            {s.kind === "study" && (
              <span
                className={`${typeVoiceClass("logic", "meta")} mt-1 text-[0.44rem] tracking-[0.1em] text-neutral-400`}
              >
                Study
              </span>
            )}
          </motion.li>
        ))}
      </ul>
      </div>
    </div>
  );
}
