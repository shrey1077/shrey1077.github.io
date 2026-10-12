"use client";

/**
 * FootBand — the black band along the foot of the home page, FIXED to the
 * screen the whole way down (2026-10-11, owner: "The black band at bottom
 * will remain fixed throughout the main page").
 *
 * Until then it was the landing's own footing (HeroStage) and left with the
 * landing. Now it stands still under everything the page does — the orb, the
 * brain, every room, the flights between them and the footer — 7% of the
 * screen tall, as it always was.
 *
 * It carries the name, or — in a room — that room's title in its side's face
 * (owner, 2026-08-25: "that section's title, in Digibra"; the creative side's
 * face is Juturu). The Flythrough says which; past the rooms, at the footer,
 * it is the name again.
 *
 * The facts tab rises out of its middle (FactsTab — desktop only), part of
 * the band since 2026-10-11 (owner: "make this a part of black band").
 *
 * Over the stage (whose own layers stack inside it) and under the dialogs
 * (Z_INDEX.viewer). Everything that stands on the foot — the PORTFOLIO mark,
 * the scroll cue, the facts tab, the brain's circles in the rooms, the
 * footer's last line — is placed clear of it.
 */

import { motion, useReducedMotion } from "framer-motion";
import { SITE } from "@/constants/site";
import { Z_INDEX } from "@/constants/design";
import { FactsTab } from "@/components/home/FactsTab";

/** The band's height — a share of the screen. ⚠ HeroStage (BAND_H), the
 *  Flythrough's rooms and BrainDock all clear this; change them together. */
export const BAND_SVH = 7;

const [FIRST, ...REST] = SITE.name.split(" ");

export function FootBand({ room }: { room: { label: string; side: "logic" | "creative" } | null }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 grid place-items-center bg-neutral-950"
      style={{ height: `${BAND_SVH}svh`, zIndex: Z_INDEX.band }}
    >
      <FactsTab />
      <motion.p
        key={room?.label ?? "name"}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-baseline gap-[0.3em] text-[clamp(0.7rem,1.5vw,1.15rem)] leading-none"
      >
        {room ? (
          <span
            className={`${room.side === "logic" ? "face-logic tracking-[0.16em]" : "face-creative tracking-[0.04em]"} font-bold text-white`}
          >
            {room.label}
          </span>
        ) : (
          <>
            <span className="font-bold tracking-[0.02em] text-white">{FIRST}</span>
            <span className="font-bold tracking-[0.02em] text-white">{REST.join(" ")}</span>
          </>
        )}
      </motion.p>
    </div>
  );
}
