"use client";

/**
 * SidesShowcase — both hemispheres' sections, side by side (Phase 3).
 *
 * Scroll past the landing and BOTH sides show at once, split 50/50: the logic
 * options (Designer) on the left as quiet black-and-white rows, the creative
 * options (Artist) on the right as colourful painted cards. No need to choose a
 * side first.
 *
 * Click any option and that whole side takes the full width — the other side
 * slides shut — and the chosen section's body opens. A back control returns to
 * the even split; the four options stay reachable as tabs while a side is open.
 *
 * Reuses SectionBody for the content (client sliders, the Logofolio wall, the
 * career timeline, the art rooms). Reduced motion snaps instead of sliding.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAV_SECTIONS, navSectionIndex, navSectionsFor } from "@/constants/navigation";
import { SectionBody } from "@/components/home/SectionBody";
import type { ArtCollection, LogoMark } from "@/content/catalogue";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { typeVoiceClass } from "@/constants/typography";
import type { NavSectionId } from "@/types/navigation";

type Side = "logic" | "creative";

/** A different painted colourway per creative card. */
const PAINT: Record<string, string> = {
  art: "linear-gradient(120deg,#ff2e8b,#ff5a3c,#ff2e8b)",
  publications: "linear-gradient(120deg,#ff8a00,#f5c518,#ff8a00)",
  "the-extincts-project": "linear-gradient(120deg,#00a6a6,#7fbf2e,#00a6a6)",
  "ai-generations": "linear-gradient(120deg,#7a3fb0,#3f6ad8,#7a3fb0)",
};

/* -- the option list shown while a side is at rest ---------------------- */

function OptionList({
  side,
  onOpen,
}: {
  side: Side;
  onOpen: (id: NavSectionId) => void;
}) {
  const reduceMotion = useReducedMotion();
  const logic = side === "logic";
  const sections = navSectionsFor(logic ? "left" : "right");

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      className="flex h-full flex-col px-5 py-6 sm:px-6 sm:py-[8vh] lg:px-[3vw]"
    >
      <header className="mb-[5vh] shrink-0">
        {logic ? (
          <span className="group inline-flex cursor-default select-none overflow-hidden rounded-xl bg-neutral-950 px-6 py-3 transition-colors duration-300 hover:bg-white active:bg-white">
            <span
              className={`${typeVoiceClass("logic", "display")} text-[clamp(2rem,4vw,3.4rem)] font-medium leading-none tracking-[-0.02em] text-white transition-colors duration-300 group-hover:text-neutral-900 group-active:text-neutral-900`}
            >
              Designer
            </span>
          </span>
        ) : (
          <span className="group relative inline-flex cursor-default select-none overflow-hidden rounded-xl">
            <span
              aria-hidden
              className="brain-paint absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 group-active:opacity-0"
              style={{ backgroundImage: PAINT.art }}
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
            />
            <span
              className={`${typeVoiceClass("creative", "display")} relative px-6 py-3 text-[clamp(2rem,4vw,3.4rem)] italic leading-none text-white transition-colors duration-300 group-hover:text-[#ff2e8b] group-active:text-[#ff2e8b]`}
            >
              Artist
            </span>
          </span>
        )}
      </header>

      <ul className="flex min-h-0 flex-1 flex-col justify-center gap-3">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onOpen(s.id)}
              className={[
                "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 text-left outline-none transition-colors duration-300",
                logic
                  ? "border border-neutral-200 bg-white hover:border-neutral-900 focus-visible:border-neutral-900"
                  : "text-white ring-1 ring-white/15",
              ].join(" ")}
            >
              {!logic && (
                <span
                  aria-hidden
                  className="brain-paint absolute inset-0 -z-0"
                  style={{ backgroundImage: PAINT[s.id] }}
                />
              )}

              <span
                className={`${typeVoiceClass("logic", "meta")} relative text-[0.6rem] ${logic ? "text-neutral-400" : "text-white/70"}`}
              >
                {navSectionIndex(s.id)}
              </span>
              <span className="relative flex min-w-0 flex-col">
                <span
                  className={[
                    "text-[clamp(1.05rem,1.7vw,1.5rem)] leading-tight",
                    logic
                      ? "font-medium text-neutral-900"
                      : "font-brush-brand text-[clamp(1.3rem,2vw,1.9rem)] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]",
                  ].join(" ")}
                >
                  {s.label}
                </span>
                <span
                  className={`mt-0.5 hidden truncate text-xs leading-relaxed lg:block ${logic ? "text-neutral-400" : "text-white/80"}`}
                >
                  {s.description}
                </span>
              </span>
              <span className="relative flex-1" />
              <span
                aria-hidden
                className={`relative text-xl leading-none transition-transform duration-300 group-hover:translate-x-1 ${logic ? "text-neutral-400 group-hover:text-neutral-900" : "text-white/90"}`}
              >
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* -- the full-width body shown once a side is opened -------------------- */

function ExpandedBody({
  side,
  openId,
  onSelect,
  onClose,
  artCollections,
  logos,
  extinctsSlides,
}: {
  side: Side;
  openId: NavSectionId;
  onSelect: (id: NavSectionId) => void;
  onClose: () => void;
  artCollections: ArtCollection[];
  logos: LogoMark[];
  extinctsSlides: string[];
}) {
  const logic = side === "logic";
  const sections = navSectionsFor(logic ? "left" : "right");
  const open = sections.find((s) => s.id === openId);

  return (
    <div className={`relative flex h-full flex-col ${logic ? "bg-neutral-900" : "bg-neutral-950"}`}>
      {!logic && (
        <span
          aria-hidden
          className="brain-paint absolute inset-0 opacity-[0.22]"
          style={{ backgroundImage: PAINT[openId] }}
        />
      )}

      {/* Header — back control + the four options as tabs. */}
      <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 px-6 pt-6 lg:px-[3vw]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to both sides"
          className="mr-1 text-sm text-white/70 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white"
        >
          ← Back
        </button>
        {sections.map((s) => {
          const active = s.id === openId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={[
                typeVoiceClass("logic", "meta"),
                "text-[0.62rem] outline-none transition-colors duration-200",
                active ? "text-white" : "text-white/40 hover:text-white/80",
              ].join(" ")}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* The section's body. */}
      <div className="relative z-10 min-h-0 flex-1 px-6 pb-8 pt-5 lg:px-[3vw]">
        {/* The heading is the way back out: clicking anywhere along it contracts
            the section. Full-width so the whole strip is the target, not just
            the words. */}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${open?.label ?? "section"}`}
          className="group mb-3 flex w-full items-center justify-between gap-4 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <h3
            className={[
              "font-digibra text-[clamp(1.3rem,2.4vw,2.2rem)] leading-none text-white",
            ].join(" ")}
          >
            {open?.label}
          </h3>
          <span className="shrink-0 rounded-full border border-white/25 px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-white/50 transition-colors duration-200 group-hover:border-white/70 group-hover:text-white/90">
            Minimise
          </span>
        </button>
        <div className="min-h-0 flex-1">
          <SectionBody id={openId} artCollections={artCollections} logos={logos} extinctsSlides={extinctsSlides} />
        </div>
      </div>
    </div>
  );
}

/* -- one column -------------------------------------------------------- */

function Column({
  side,
  state,
  openId,
  onOpen,
  onSelect,
  onClose,
  artCollections,
  logos,
  extinctsSlides,
  stacked,
}: {
  side: Side;
  state: "open" | "closed" | "neutral";
  openId: NavSectionId | null;
  onOpen: (id: NavSectionId) => void;
  onSelect: (id: NavSectionId) => void;
  onClose: () => void;
  artCollections: ArtCollection[];
  logos: LogoMark[];
  extinctsSlides: string[];
  stacked: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const logic = side === "logic";
  // Side by side, the open/closed/neutral state drives WIDTH. Stacked on a
  // phone it drives HEIGHT instead — same three states, same feel, but each
  // side gets the full width rather than a 187px sliver.
  const extent = state === "open" ? "100%" : state === "closed" ? "0%" : "50%";

  return (
    <motion.div
      animate={stacked ? { height: extent, width: "100%" } : { width: extent, height: "100%" }}
      initial={false}
      transition={{ duration: reduceMotion ? 0 : DURATION.slow, ease: EASE_OUT }}
      className={`relative min-h-0 min-w-0 overflow-hidden ${logic ? "bg-gallery" : "bg-neutral-950"} ${
        logic ? (stacked ? "border-b border-neutral-200" : "border-r border-neutral-200") : ""
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "open" && openId ? (
          <motion.div
            key="body"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.medium, ease: EASE_OUT }}
            className="absolute inset-0"
          >
            <ExpandedBody
              side={side}
              openId={openId}
              onSelect={onSelect}
              onClose={onClose}
              artCollections={artCollections}
              logos={logos}
              extinctsSlides={extinctsSlides}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={false}
            animate={{ opacity: state === "closed" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
            className="absolute inset-0"
          >
            <OptionList side={side} onOpen={onOpen} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* -- the showcase ------------------------------------------------------ */

export function SidesShowcase({
  artCollections,
  logos,
  extinctsSlides,
}: {
  artCollections: ArtCollection[];
  logos: LogoMark[];
  extinctsSlides: string[];
}) {
  const [expanded, setExpanded] = useState<Side | null>(null);
  const [openId, setOpenId] = useState<NavSectionId | null>(null);
  // Below the md breakpoint the two sides stack instead of splitting.
  const stacked = useMediaQuery("(max-width: 767px)");

  // A pin on the brain above can ask for a section by name.
  useEffect(() => {
    const onPin = (e: Event) => {
      // null is a deliberate signal: the pins closed, so the panel follows.
      const id = (e as CustomEvent<NavSectionId | null>).detail;
      if (id === null) {
        setExpanded(null);
        setOpenId(null);
        return;
      }
      const section = NAV_SECTIONS.find((s) => s.id === id);
      if (!section) return;
      setExpanded(section.hemisphere === "left" ? "logic" : "creative");
      setOpenId(id);
    };
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);

  const stateFor = (side: Side): "open" | "closed" | "neutral" =>
    expanded === null ? "neutral" : expanded === side ? "open" : "closed";

  const open = (side: Side) => (id: NavSectionId) => {
    setExpanded(side);
    setOpenId(id);
  };
  const close = () => {
    setExpanded(null);
    setOpenId(null);
  };

  return (
    <section id="explore" aria-label="Explore both sides" className="relative w-full">
      <div className={`flex w-full overflow-hidden ${stacked ? "h-[100svh] min-h-[620px] flex-col" : "h-[100svh] min-h-[560px]"}`}>
        <Column
          side="logic"
          state={stateFor("logic")}
          openId={expanded === "logic" ? openId : null}
          onOpen={open("logic")}
          onSelect={setOpenId}
          onClose={close}
          artCollections={artCollections}
          logos={logos}
          extinctsSlides={extinctsSlides}
          stacked={stacked}
        />
        <Column
          side="creative"
          state={stateFor("creative")}
          openId={expanded === "creative" ? openId : null}
          onOpen={open("creative")}
          onSelect={setOpenId}
          onClose={close}
          artCollections={artCollections}
          logos={logos}
          extinctsSlides={extinctsSlides}
          stacked={stacked}
        />
      </div>
    </section>
  );
}
