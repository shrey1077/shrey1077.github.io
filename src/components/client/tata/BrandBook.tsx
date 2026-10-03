"use client";

/**
 * BrandBook — the rulebook as a closed book you open.
 *
 * The owner replaced band 02's five "Brand DNA" cards with this on 2026-09-27:
 * the book, closed, which opens into the rulebook's own pages on a three-second
 * fade.
 *
 * ⚠ THE CLOSED BOOK IS THE OWNER'S MOCKUP since 2026-10-03 — a cut-out on a
 * transparent ground, so it stands on the page itself with only a soft shadow
 * under it. Until then the cover was drawn in markup (a spine, a page stack and
 * the wordmark file); git has that version.
 *
 * ⚠ THE PAGES ARE THE ACTUAL PLATES, all twelve of them, in their own order,
 * shown on an A4-landscape sheet the size of the book's footprint — opening a
 * brand book should show the brand book.
 *
 * ⚠ CLICK ADVANCES, THE CORNER CLOSES. Auto-advance is the default, but it is
 * not the only way through: a click steps to the next plate and the × returns
 * to the book, so someone who cannot wait — or who has asked their system for
 * reduced motion, where nothing advances on its own — can still read it.
 *
 * ⚠ It stops when it scrolls away; a slideshow nobody is looking at is a timer
 * for nothing.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** ms a plate holds before the next one fades up — the owner's three seconds. */
const HOLD = 3000;
/** ms of cross-fade. */
const FADE = 700;
/** The plates' own shape, A4 landscape. */
const SHEET = 1.414;

export function BrandBook({
  title,
  plates,
  mockup,
}: {
  title: string;
  plates: string[];
  mockup: { src: string; w: number; h: number };
}) {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "200px" });
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!open || reduceMotion || !inView || plates.length < 2) return;
    const timer = setInterval(() => setPage((p) => (p + 1) % plates.length), HOLD);
    return () => clearInterval(timer);
  }, [open, reduceMotion, inView, plates.length]);

  const fade = `transition-opacity duration-500 ${reduceMotion ? "" : "ease-out"}`;

  return (
    // The box keeps the BOOK's proportions whether it is shut or open, so
    // opening it never moves anything around it.
    <div ref={ref} className="relative w-full" style={{ aspectRatio: `${mockup.w} / ${mockup.h}` }}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={
          open
            ? `${title} — plate ${page + 1} of ${plates.length}. Click for the next plate.`
            : `Open the ${title}`
        }
        onClick={() => (open ? setPage((p) => (p + 1) % plates.length) : setOpen(true))}
        className="group absolute inset-0 block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-4"
      >
        {/* ── The book, shut. ── */}
        <span
          className={`absolute inset-0 block ${fade} ${open ? "opacity-0" : "opacity-100"}`}
          aria-hidden={open}
        >
          <span className="absolute inset-0 block transition-transform duration-700 ease-out group-hover:-translate-y-1.5">
            <Image
              src={mockup.src}
              alt=""
              fill
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-contain [filter:drop-shadow(0_28px_32px_rgba(0,0,0,0.16))_drop-shadow(0_6px_8px_rgba(0,0,0,0.08))]"
            />
          </span>
        </span>

        {/* ── The book, open: the plates on a sheet as tall as the book. ── */}
        <span
          className={`absolute inset-y-0 left-1/2 block -translate-x-1/2 overflow-hidden bg-white shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 ${fade} ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ aspectRatio: String(SHEET) }}
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
                  sizes="(max-width: 1024px) 92vw, 42vw"
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
          <p className="tata-body pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.22em] text-neutral-500 tabular-nums">
            {String(page + 1).padStart(2, "0")} / {String(plates.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setPage(0);
            }}
            aria-label={`Close the ${title}`}
            className="absolute right-[6%] top-2 grid size-7 place-items-center rounded-full bg-white/95 text-[0.7rem] leading-none text-neutral-600 ring-1 ring-neutral-200 outline-none transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
