"use client";

/**
 * TataSectionsBoard — the six rooms as a row of numbered cards, with the chosen
 * one opening beneath them.
 *
 * ⚠ THE BEHAVIOUR IS THE 2026-08-25 ONE, UNCHANGED. Click a room, it opens
 * below; click it again, it closes; only one is ever open. What changed on
 * 2026-09-22 is the presentation: this was six PINS on a tall rail, three a
 * side, wired with drawn connectors in the landing's style. The owner's
 * redesign replaced that with a card row — number, title, a plate from the room
 * itself, the room's own subsections, and an arrow. The rail, its connectors,
 * the measured anchors and the ResizeObserver that fed them are all gone; git
 * has them if the pins are ever wanted back.
 *
 * ⚠ THE CARD'S NUMBER IS ITS POSITION IN TATA_PINS, not an id or a count. The
 * owner's order (Brand Guidelines, Print, Digital, Photo/Videography,
 * Proposals, AI Apps Dashboard) is fixed in that file for the same reason it
 * always was — TATA_SECTIONS is ordered by content, not by the brief.
 *
 * ⚠ `brand-guidelines` HAS NO ENTRY IN TATA_SECTIONS. It has its own renderer
 * (`GuidelineSections`), which takes no props, so both the panel and the card's
 * thumbnail special-case it.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GuidelineSections } from "@/components/client/tata/GuidelineSections";
import { WorkSections, type ResolvedSection } from "@/components/client/tata/WorkSections";
import { TATA_PINS } from "@/constants/tataPins";
import { TATA_GUIDELINES } from "@/constants/tataExperience";
import { TATA_OPEN_ROOM } from "@/components/client/tata/TataRoomLink";
import { EASE_OUT } from "@/constants/motion";

/** Seconds between neighbouring cards arriving. */
const STAGGER = 0.06;

export function TataSectionsBoard({ sections }: { sections: ResolvedSection[] }) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  /* The bands above ask for a room by name — "Explore brand system" in 02,
     "View brand guidelines" in 03, "Explore the work" in 04. They are server
     -rendered and cannot reach this state, so they announce on the window.
     ⚠ An unknown id is ignored rather than closing whatever is open: a typo in
     a band should do nothing, not undo the reader's click. */
  useEffect(() => {
    const onAsk = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (TATA_PINS.some((p) => p.id === id)) setOpenId(id);
    };
    window.addEventListener(TATA_OPEN_ROOM, onAsk);
    return () => window.removeEventListener(TATA_OPEN_ROOM, onAsk);
  }, []);

  const open = TATA_PINS.find((p) => p.id === openId) ?? null;

  /** The plate on a card's face: the FIRST image the room actually holds, so a
   *  card cannot advertise something the room does not contain. Brand
   *  Guidelines is not a work section, so it shows its rulebook's cover plate. */
  const thumbFor = (id: string): string | undefined => {
    if (id === "brand-guidelines") return TATA_GUIDELINES.tataPlates[0];
    const section = sections.find((s) => s.id === id);
    for (const item of section?.items ?? []) {
      const image = item.assets.find((a) => a.kind === "image");
      if (image) return image.url;
    }
    return undefined;
  };

  return (
    <div className="w-full">
      {/* ── The six cards ── */}
      <div
        ref={boardRef}
        aria-label="Sections"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
      >
        {TATA_PINS.map((pin, i) => {
          const isOpen = openId === pin.id;
          const thumb = thumbFor(pin.id);
          return (
            <motion.div
              key={pin.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: i * STAGGER }}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId((v) => (v === pin.id ? null : pin.id))}
                className={`group flex h-full w-full flex-col gap-3 rounded-sm border bg-white/80 p-3 text-left outline-none backdrop-blur-[2px] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:p-4 ${
                  isOpen
                    ? "border-neutral-900 bg-white"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <span className="flex items-baseline gap-2">
                  <span className="tata-display text-[1.6rem] leading-none text-neutral-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="tata-display text-[1.05rem] leading-tight text-neutral-900">
                    {pin.label}
                  </span>
                </span>

                {/* The plate. A room with no image yet keeps the card's shape
                    rather than collapsing it, so the row stays a row — and it
                    SAYS so instead of showing an empty grey box. Proposals and
                    the AI apps are both real work with no files supplied yet
                    (see TATA_SECTIONS' notes), and the rooms behind them say
                    the same thing. */}
                <span className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-sm bg-neutral-100">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1280px) 30vw, 15vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="tata-body px-2 text-center text-[0.52rem] uppercase tracking-[0.16em] text-neutral-400">
                      No plates yet
                    </span>
                  )}
                </span>

                <span className="tata-body block text-[0.58rem] uppercase leading-[1.7] tracking-[0.12em] text-neutral-500">
                  {pin.keywords.join("  /  ")}
                </span>

                {/* The arrow, which is the whole affordance in the comp. It
                    turns on open, so the open card says so without colour. */}
                <span
                  aria-hidden
                  className={`mt-auto grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                    isOpen
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 group-hover:border-neutral-900"
                  }`}
                >
                  <span
                    className={`block text-[0.7rem] leading-none transition-transform duration-300 ${
                      isOpen ? "rotate-90" : "group-hover:translate-x-0.5"
                    }`}
                  >
                    →
                  </span>
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── The room ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={open.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE_OUT }}
            className="w-full overflow-hidden"
            // ⚠ Fired on COMPLETION, not when `openId` changes: the panel opens
            //   from height 0, so scrolling at the moment of the click aims at a
            //   zero-tall box and is then left behind as it grows. Guarded on
            //   `open` so a closing room does not drag the page after it.
            //
            // ⚠ AND IT TARGETS THE CARD ROW, NOT THE PANEL. Aiming at the panel
            //   is what you would expect and it does not hold: these rooms load
            //   ~50 images and run 3600px tall, and the reflow as they arrive
            //   moves the page under the scroll — measured drifting from 662
            //   back to 267 on its own, seconds after landing. The row sits
            //   ABOVE all of that and does not move, so it is a stable anchor.
            //   Landing on it also keeps the six cards on screen, which is what
            //   lets you switch rooms without scrolling back up for the map.
            onAnimationComplete={() => {
              if (open) {
                boardRef.current?.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                  block: "start",
                });
              }
            }}
          >
            {open.id === "brand-guidelines" ? (
              <GuidelineSections />
            ) : (
              (() => {
                const s = sections.find((x) => x.id === open.id);
                return s ? <WorkSections sections={[s]} startExpanded /> : null;
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
