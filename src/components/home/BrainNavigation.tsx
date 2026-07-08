"use client";

/**
 * BrainNavigation — the DOM navigation overlay for the brain.
 *
 * Two groups (one per hemisphere) of NavItems, from `NAV_SECTIONS`. Responsive:
 *   • lg+      → a 3-column grid `[1fr | center lane | 1fr]`. The nav groups live
 *                in the side columns; the center lane is reserved for the brain,
 *                so the labels can never overlap it regardless of the brain's
 *                pixel size. Vertically centered to align with the brain.
 *   • below lg → a narrow viewport can't flank a height-sized brain, so the two
 *                groups drop into a centered two-column block in the lower part
 *                of the hero, clear of the brain.
 *
 * The container is `pointer-events-none` so it never blocks the canvas's mouse
 * rotation; only the labels opt back in.
 */

import { motion } from "framer-motion";
import { navSectionsFor } from "@/constants/navigation";
import { NavItem } from "@/components/home/NavItem";
import { fadeRiseVariants, staggerContainerVariants } from "@/utils/motion";
import type { Hemisphere } from "@/types/brain";

const containerVariants = staggerContainerVariants({ delay: 0.3 });
const itemVariants = fadeRiseVariants();

function NavColumn({ hemisphere }: { hemisphere: Hemisphere }) {
  const sections = navSectionsFor(hemisphere);
  const isLeft = hemisphere === "left";

  return (
    <motion.nav
      aria-label={isLeft ? "Logic sections" : "Creative sections"}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={[
        // Pills hug their content and align to the OUTER edge of each column, so
        // the flanking navigation frames the brain and never crowds the centre
        // lane. Tighter rhythm in the small-screen band; generous at lg+.
        "flex min-w-0 flex-col gap-3 sm:gap-4 lg:gap-5",
        isLeft ? "items-start lg:pl-[4vw]" : "items-end lg:pr-[4vw]",
      ].join(" ")}
    >
      {sections.map((section) => (
        <motion.div key={section.id} variants={itemVariants}>
          <NavItem section={section} />
        </motion.div>
      ))}
    </motion.nav>
  );
}

/** Organic brush-stroke outline (objectBoundingBox units, so it scales to any
 *  label width) used to clip the right-hemisphere navigation strokes. */
function BrushClipDef() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <clipPath id="brush-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.012,0.5 C0.02,0.33 0.05,0.24 0.13,0.26 C0.28,0.19 0.42,0.27 0.55,0.23 C0.70,0.20 0.82,0.28 0.90,0.25 C0.965,0.23 0.99,0.38 0.988,0.5 C0.99,0.62 0.965,0.76 0.90,0.75 C0.82,0.72 0.70,0.80 0.55,0.77 C0.42,0.73 0.28,0.81 0.13,0.74 C0.05,0.76 0.02,0.67 0.012,0.5 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function BrainNavigation() {
  return (
    <>
      <BrushClipDef />
      <div
        className={[
        "pointer-events-none absolute z-10",
        // below lg: the hero's LOWER band (the canvas holds the upper band —
        // see HeroStage), two columns centered inside it.
        "inset-x-0 bottom-0 top-[58%] flex items-center justify-center gap-6 px-5",
        // lg+: cover the hero with a 3-column grid — a reserved center lane
        // keeps the flanking columns off the brain.
        "lg:inset-0 lg:grid lg:grid-cols-[1fr_minmax(0,42vw)_1fr] lg:items-center lg:gap-0 lg:p-0",
      ].join(" ")}
    >
      <NavColumn hemisphere="left" />
      {/* Center lane — the brain (rendered on the canvas behind) shows through.
          Only participates in the grid at lg+. */}
      <div aria-hidden className="hidden lg:block" />
      <NavColumn hemisphere="right" />
      </div>
    </>
  );
}
