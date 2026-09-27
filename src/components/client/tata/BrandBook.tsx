"use client";

/**
 * BrandBook — the rulebook as a closed book you open.
 *
 * The owner replaced band 02's five "Brand DNA" cards with this on 2026-09-27:
 * a book cover carrying nothing but the wordmark and the words Brand
 * Guidelines, at twice the height of the cards it replaces, which opens into
 * the rulebook's own pages on a three-second fade.
 *
 * ⚠ THE COVER IS DRAWN, NOT PHOTOGRAPHED. It is a spine, a page stack and the
 * real wordmark file — a few divs — rather than a mockup image. A photographed
 * book would be a picture of an object that does not exist; this is the marque
 * and the title, which is all the owner asked for, and it stays sharp at every
 * size and weighs nothing.
 *
 * ⚠ THE PAGES ARE THE ACTUAL PLATES, all twelve of them, in their own order —
 * not the cropped card art that used to sit here. Opening a brand book should
 * show the brand book.
 *
 * ⚠ CLICK ADVANCES, THE CORNER CLOSES. Auto-advance is the default, but it is
 * not the only way through: a click steps to the next plate and the × returns
 * to the cover, so someone who cannot wait — or who has asked their system for
 * reduced motion, where nothing advances on its own — can still read it.
 *
 * ⚠ It stops when it scrolls away; a slideshow nobody is looking at is a timer
 * for nothing.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** ms a plate holds before the next one fades up — the owner's three seconds. */
const HOLD = 3000;
/** ms of cross-fade. */
const FADE = 700;

export function BrandBook({
  wordmark,
  title,
  plates,
}: {
  wordmark: string;
  title: string;
  plates: string[];
}) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || reduceMotion || !inView || plates.length < 2) return;
    const timer = setInterval(() => setPage((p) => (p + 1) % plates.length), HOLD);
    return () => clearInterval(timer);
  }, [open, reduceMotion, inView, plates.length]);

  return (
    <div ref={ref} className="flex w-full justify-center">
      <div
        ref={boxRef}
        // A4 landscape, like the plates inside it, at twice the height of the
        // five cards this replaced (186px each, measured).
        className="relative aspect-[1.414] w-full max-w-[34rem]"
      >
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `${title} — plate ${page + 1} of ${plates.length}. Click for the next plate.` : `Open ${title}`}
          onClick={() => (open ? setPage((p) => (p + 1) % plates.length) : setOpen(true))}
          className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-sm bg-white text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)] outline-none ring-1 ring-neutral-200 transition-transform duration-500 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
        >
          {/* The page stack, just inside the right edge. Two hairlines is all it
              takes to read as paper rather than as a panel. */}
          <span aria-hidden className="absolute inset-y-2 right-1 w-px bg-neutral-200" />
          <span aria-hidden className="absolute inset-y-3 right-2.5 w-px bg-neutral-100" />
          {/* The spine. */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-neutral-900 sm:w-4" />
          <span aria-hidden className="absolute inset-y-0 left-3 w-px bg-neutral-300 sm:left-4" />

          {/* ── The cover ── */}
          <span
            className="absolute inset-0 flex flex-col items-center justify-center pl-4 transition-opacity duration-500 sm:pl-6"
            style={{ opacity: open ? 0 : 1 }}
          >
            <span className="relative block h-[16%] w-[52%]">
              <Image src={wordmark} alt="" fill sizes="280px" className="object-contain" />
            </span>
            <span aria-hidden className="mt-7 block h-px w-10 bg-neutral-300" />
            <span className="tata-heading mt-6 text-[clamp(0.8rem,1.3vw,1.05rem)] tracking-[0.18em] text-neutral-900">
              {title}
            </span>
            <span className="tata-body mt-9 text-[0.58rem] uppercase tracking-[0.22em] text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600">
              Click to open
            </span>
          </span>

          {/* ── The plates ── */}
          <span
            className="absolute inset-0 bg-neutral-100 transition-opacity duration-500"
            style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
          >
            <AnimatePresence initial={false}>
              {open && (
                <motion.span
                  key={plates[page]}
                  className="absolute inset-0 block"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : FADE / 1000 }}
                >
                  <Image
                    src={plates[page]}
                    alt={`${title}, plate ${page + 1} of ${plates.length}`}
                    fill
                    sizes="(max-width: 768px) 92vw, 34rem"
                    className="object-contain"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>

        {/* ── The counter and the way back, outside the button so neither one
            steals its click. ── */}
        {open && (
          <>
            <p className="tata-body pointer-events-none absolute bottom-2 left-6 text-[0.55rem] uppercase tracking-[0.2em] text-neutral-500 sm:left-8">
              {String(page + 1).padStart(2, "0")} / {String(plates.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPage(0);
              }}
              aria-label="Close the brand guidelines"
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-[0.7rem] leading-none text-neutral-600 ring-1 ring-neutral-200 outline-none transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}
