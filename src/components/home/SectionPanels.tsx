"use client";

/**
 * SectionPanels — the hero's lower-half navigation (Phase 5 v4).
 *
 * Once a hemisphere is chosen the brain zooms out to the upper half and this
 * system rises over the lower half:
 *
 *   pose "logic"    → the LEFT hemisphere's four sections as horizontal
 *                     black-and-white rows (Clients / Projects / Logofolio /
 *                     Career Path).
 *   pose "creative" → the RIGHT hemisphere's four sections as painted rows
 *                     (Art / Publications / The Extincts Project / AI
 *                     Generations).
 *
 * Both use the FULL width — the old centre column and 5% flip strips were
 * replaced by PoseSwitch, which floats above the panels' top edge.
 *
 * Clicking a row no longer compresses its siblings — the section GROWS from
 * that row's own band to cover the whole stack, so Clients (the top row) opens
 * downward while the rows beneath it also reach up over the rows above. The
 * panel lands graphite (painted on the creative side) and holds the section's
 * body: a portrait card slider, the Logofolio wall, or the career timeline.
 * Choosing a card goes straight to that client's full experience — the old
 * inline detail step is gone. Every piece of text animates in (masked
 * rises, letter settles, staggered fades). Reduced motion renders in place.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { navSectionIndex, navSectionsFor } from "@/constants/navigation";
import type { LogoMark } from "@/content/catalogue";
import { SectionBody } from "@/components/home/SectionBody";
import type { ArtCollection } from "@/content/catalogue";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { TypeReveal } from "@/components/typography/TypeReveal";
import { useSceneStore } from "@/state/useSceneStore";
import type { NavSectionId } from "@/types/navigation";

/* ── data contract (filled by the server page from the content folders) ── */

export type { ArtCollection };

/* ── palette ──────────────────────────────────────────────────────────── */

/** Painted row surfaces for the creative sections (NavItem's hues, v4 home). */
const PAINTED_ROWS: Record<string, string> = {
  art: "linear-gradient(115deg,#ff2e8b,#ff5a3c,#ff2e8b)",
  publications: "linear-gradient(115deg,#ff8a00,#f5c518,#ff8a00)",
  "the-extincts-project": "linear-gradient(115deg,#00a6a6,#7fbf2e,#00a6a6)",
  "ai-generations": "linear-gradient(115deg,#7a3fb0,#3f6ad8,#7a3fb0)",
};

type PanelPose = "logic" | "creative";

/* ── small shared bits ────────────────────────────────────────────────── */

const riseIn = (reduce: boolean, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
      };

/* -- one section header row ------------------------------------------- */

/** A section's header strip. Rows no longer expand in place — clicking one
 *  hands its geometry up so the panel layer can grow a full-area overlay from
 *  exactly that band. */
function PanelRow({
  id,
  label,
  description,
  pose,
  order,
  onOpen,
}: {
  id: NavSectionId;
  label: string;
  description: string;
  pose: PanelPose;
  order: number;
  onOpen: (geom: { top: number; height: number; containerH: number }) => void;
}) {
  const reduceMotion = useReducedMotion();
  const logic = pose === "logic";

  return (
    <div
      style={{ flexGrow: 1, flexBasis: 0 }}
      className={[
        "relative flex min-h-0 flex-col overflow-hidden",
        logic ? "border-t border-neutral-200 bg-gallery" : "",
      ].join(" ")}
    >
      {!logic && (
        <span
          aria-hidden
          className="brain-paint absolute inset-0"
          style={{ backgroundImage: PAINTED_ROWS[id] }}
        />
      )}

      <button
        type="button"
        onClick={(e) => {
          const row = e.currentTarget.parentElement as HTMLElement | null;
          const stack = row?.parentElement as HTMLElement | null;
          if (!row || !stack) return;
          onOpen({ top: row.offsetTop, height: row.offsetHeight, containerH: stack.clientHeight });
        }}
        className="group relative z-10 flex h-full w-full items-center gap-5 overflow-hidden px-6 py-3 text-left outline-none lg:gap-8 lg:px-[4vw]"
      >
        {logic && (
          <span
            aria-hidden
            className="absolute inset-x-3 inset-y-1 translate-y-[101%] rounded-2xl bg-neutral-900 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 lg:inset-x-[3vw]"
          />
        )}

        <span
          className={[
            typeVoiceClass("logic", "meta"),
            "relative text-[0.6rem]",
            logic
              ? "text-neutral-400 transition-colors duration-500 group-hover:text-white/60"
              : "text-white/70",
          ].join(" ")}
        >
          {navSectionIndex(id)}
        </span>

        <TypeReveal
          text={label}
          voice={logic ? "logic" : "creative"}
          variant="display"
          as="span"
          reveal={reduceMotion ? "none" : "settle"}
          delay={0.35 + order * 0.09}
          className={[
            "relative text-[clamp(1.15rem,2.2vw,2.1rem)] leading-none",
            logic
              ? "font-medium text-neutral-900 transition-colors duration-500 group-hover:text-white"
              : "italic text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        />

        <span className="relative flex-1" />

        <motion.span
          aria-hidden
          {...riseIn(!!reduceMotion, 0.6 + order * 0.09)}
          className={[
            "relative hidden max-w-[24rem] text-xs leading-relaxed lg:block",
            logic
              ? "text-neutral-400 transition-colors duration-500 group-hover:text-white/70"
              : "text-white/80",
          ].join(" ")}
        >
          {description}
        </motion.span>

        <span
          aria-hidden
          className={[
            "relative text-xl leading-none transition-transform duration-500 group-hover:rotate-90",
            logic ? "text-neutral-400 group-hover:text-white" : "text-white/90",
          ].join(" ")}
        >
          +
        </span>
      </button>
    </div>
  );
}

/* -- one hemisphere's panel layer -------------------------------------- */

/** Owns the open-section state. Rendered with `key={pose}`, so flipping
 *  hemispheres REMOUNTS it — each side starts calm.
 *
 *  A section no longer expands in place: clicking a row grows a panel from that
 *  row's exact band to cover the whole stack — so Clients (the top row) opens
 *  downward, while Projects and the rest also reach up over the rows above
 *  them. The panel is graphite on the logic side (its slider's cards read as
 *  lit plates against it) and painted on the creative side.
 */
function PoseLayer({
  pose,
  artCollections,
  logos,
}: {
  pose: PanelPose;
  artCollections: ArtCollection[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<
    { id: NavSectionId; top: number; height: number; containerH: number } | null
  >(null);
  const sections = navSectionsFor(pose === "logic" ? "left" : "right");
  const openSection = open ? sections.find((s) => s.id === open.id) : undefined;
  const logic = pose === "logic";

  return (
    <>
      <div className="relative min-w-0 flex-1">
        <div className="relative flex h-full flex-col">
              {sections.map((section, i) => (
                <PanelRow
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  description={section.description}
                  pose={pose}
                  order={i}
                  onOpen={(geom) => setOpen({ id: section.id, ...geom })}
                />
              ))}

              <AnimatePresence>
                {open && openSection && (
                  <motion.section
                    key={open.id}
                    aria-label={openSection.label}
                    initial={
                      reduceMotion
                        ? { opacity: 0, top: 0, height: open.containerH }
                        : { top: open.top, height: open.height, opacity: 0.6 }
                    }
                    animate={{ top: 0, height: open.containerH, opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { top: open.top, height: open.height, opacity: 0 }
                    }
                    transition={{ duration: DURATION.slow, ease: EASE_OUT }}
                    className={`absolute inset-x-0 z-30 flex flex-col overflow-hidden ${
                      logic ? "bg-neutral-900" : "bg-neutral-950"
                    }`}
                  >
                    {!logic && (
                      <span
                        aria-hidden
                        className="brain-paint absolute inset-0 opacity-25"
                        style={{ backgroundImage: PAINTED_ROWS[open.id] }}
                      />
                    )}

                    <div className="relative z-10 flex shrink-0 items-center gap-5 px-6 pt-4 lg:gap-8 lg:px-[4vw]">
                      <span className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-white/45`}>
                        {navSectionIndex(open.id)}
                      </span>
                      <span
                        className={[
                          logic
                            ? `${typeVoiceClass("logic", "display")} font-medium`
                            : `${typeVoiceClass("creative", "display")} italic`,
                          "text-[clamp(1.15rem,2.2vw,2.1rem)] leading-none text-white",
                        ].join(" ")}
                      >
                        {openSection.label}
                      </span>
                      <span className="flex-1" />
                      <span className="hidden max-w-[24rem] text-xs leading-relaxed text-white/50 lg:block">
                        {openSection.description}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        aria-label={`Close ${openSection.label}`}
                        className="text-xl leading-none text-white/60 outline-none transition-colors duration-300 hover:text-white focus-visible:text-white"
                      >
                        &times;
                      </button>
                    </div>

                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.4 } }}
                      className="relative z-10 min-h-0 flex-1 px-6 pb-5 pt-4 lg:px-[4vw]"
                    >
                      <SectionBody id={open.id} artCollections={artCollections} logos={logos} />
                    </motion.div>
                  </motion.section>
                )}
              </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* ── the panel system ─────────────────────────────────────────────────── */

export function SectionPanels({
  artCollections,
  logos,
}: {
  artCollections: ArtCollection[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();
  const heroPose = useSceneStore((s) => s.heroPose);
  const pose: PanelPose = heroPose === "creative" ? "creative" : "logic";

  return (
    <motion.div
      data-panels
      initial={reduceMotion ? false : { y: "104%" }}
      animate={{ y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { y: "104%" }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 h-1/2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pose}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: DURATION.medium, ease: EASE_OUT }}
          className="flex h-full w-full"
        >
          <PoseLayer pose={pose} artCollections={artCollections} logos={logos} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
