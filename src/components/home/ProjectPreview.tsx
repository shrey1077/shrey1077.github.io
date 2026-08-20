"use client";

/**
 * ProjectPreview — one independent commission, opened from the Projects board.
 *
 * The owner's layout, revised 2026-08-20 (no slider):
 *
 *   left   ·  a one-third column — the mark, and the facts
 *   right  ·  a one-third column — the words
 *   middle ·  the whole body of work as a COLLAGE, which fills the gap between
 *             the two columns and then runs the FULL WIDTH beneath them
 *
 * ⚠ That L-shape is why the two columns are FLOATS and not grid tracks. A grid
 * item cannot wrap around another, so a grid would force the collage either
 * into the middle third alone (wasting the full width below) or entirely below
 * the columns (wasting the middle). Floated columns with the collage in normal
 * flow give exactly the requested shape, for free, at every width.
 *
 * ⚠ Because it depends on float wrapping, the collage images are `inline-block`.
 * Block-level children do NOT flow around floats — only line boxes do, so block
 * images would slide under the columns and be overlapped by them. Each image is
 * scaled to a common row height and keeps its own aspect, which is what makes
 * the rows read as a composed collage rather than a grid with holes in it.
 *
 * ⚠ Nothing here may create a block formatting context around the collage —
 * `overflow`, `display:flow-root`, `contain` on the collage's container would
 * all stop the wrap and silently break the layout back into stacked blocks.
 *
 * Below `lg` the floats are off and it is one honest column: mark, words, then
 * the collage.
 *
 * ⚠ These entries do NOT navigate. Every other Projects cell is a link to a
 * page; these eight open here instead, because the work is a handful of plates
 * and a paragraph rather than a room. That is why the board renders them as
 * `<button>` and not `<a>` — a link that opens a dialog is a lie to anyone
 * middle-clicking it. UID and the chess site are unaffected: they are real
 * pages and their cells still navigate.
 *
 * Escape closes, background scroll is locked while open, focus moves to Close
 * and returns to the opener on dismiss. There are no arrow keys any more —
 * there is nothing left to step through.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectStudy } from "@/constants/projectStudies";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

export interface StudyPlate {
  url: string;
  w: number;
  h: number;
  name: string;
}

/** The row height every collage image is scaled to, so widths vary by aspect
 *  and the rows still line up. Set as a custom property so one declaration
 *  drives both the height and the aspect-derived width. */
const COLLAGE_H = "[--ch:104px] sm:[--ch:132px] lg:[--ch:164px]";

export function ProjectPreview({
  study,
  plates,
  onClose,
}: {
  /** The study being previewed, or null when closed. */
  study: ProjectStudy | null;
  plates: StudyPlate[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = study !== null;

  // The handler lives in a ref so the key effect can depend on OPEN/CLOSED
  // alone and never tears itself down mid-dialog.
  const nav = useRef({ onClose });
  useEffect(() => {
    nav.current = { onClose };
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") nav.current.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {study && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={study.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE_OUT }}
          className="fixed inset-0 flex flex-col bg-neutral-950/97 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.viewer }}
          onClick={onClose}
        >
          <div className="flex shrink-0 items-center justify-between px-6 pt-5 sm:px-10">
            <span className={`${META} text-[0.6rem] text-white/40`}>Projects — independent</span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className={`${META} rounded px-2 py-1 text-xs text-white/55 outline-none transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/40`}
            >
              Close ✕
            </button>
          </div>

          {/* The scroll container. One click target for the body, so a stray
              click on the gutters closes but nothing inside does. */}
          <div
            className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT: the mark, and the facts (floated third) ─────────── */}
            <aside className="mb-6 flex flex-col gap-5 lg:mb-4 lg:mr-8 lg:float-left lg:w-[30%]">
              <span
                // ⚠ `max-w-[300px]` below `lg`. The plate is 3:2 of whatever
                // width it gets, and stacked in one column that was the full
                // 680 — a 453px-tall slab of near-empty white behind a single
                // line of type. At `lg` the column is already ~283 so the cap
                // never bites there.
                className={`relative flex aspect-[3/2] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl lg:max-w-none ${
                  study.logoTone === "light" ? "bg-neutral-900" : "bg-white/92"
                }`}
              >
                {study.logo ? (
                  <span className="relative block h-[58%] w-[70%]">
                    <Image src={study.logo} alt="" fill sizes="24vw" className="object-contain" />
                  </span>
                ) : (
                  /* Six of the eight brands have no standalone mark. The name
                     set large in its own accent is a better answer than an
                     empty plate or a stretched crop of the work. */
                  <span
                    className="px-5 text-center text-[clamp(1.1rem,2vw,1.7rem)] font-semibold leading-tight tracking-[-0.015em]"
                    style={{ color: study.accent }}
                  >
                    {study.name}
                  </span>
                )}
              </span>

              <div>
                <span className={`${META} block text-[0.6rem]`} style={{ color: study.accent }}>
                  {study.kind}
                </span>
                <h2 className="mt-2 text-[clamp(1.35rem,2.4vw,1.9rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                  {study.name}
                </h2>
                <span
                  aria-hidden
                  className="mt-3 block h-0.5 w-12 rounded-full"
                  style={{ backgroundColor: study.accent }}
                />
              </div>

              <dl className="flex flex-col gap-2 text-[0.72rem]">
                <div className="flex gap-3">
                  <dt className={`${META} w-16 shrink-0 text-white/35`}>Pieces</dt>
                  <dd className="text-white/70 tabular-nums">{plates.length}</dd>
                </div>
                {study.site && (
                  <div className="flex gap-3">
                    <dt className={`${META} w-16 shrink-0 text-white/35`}>Site</dt>
                    <dd>
                      <a
                        href={`https://${study.site}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-white/70 underline decoration-white/25 underline-offset-4 transition-colors duration-200 hover:text-white"
                      >
                        {study.site}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </aside>

            {/* ── RIGHT: the words (floated third) ──────────────────────── */}
            <div className="mb-6 flex flex-col gap-5 lg:mb-4 lg:ml-8 lg:float-right lg:w-[30%]">
              <p className="text-[clamp(1.05rem,1.9vw,1.4rem)] font-medium leading-[1.25] tracking-[-0.01em] text-white">
                {study.headline}
              </p>
              <div>
                <span className={`${META} block text-[0.58rem] text-white/35`}>The challenge</span>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-white/70">
                  {study.challenge}
                </p>
              </div>
              <div>
                <span className={`${META} block text-[0.58rem] text-white/35`}>What was made</span>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-white/70">
                  {study.description}
                </p>
              </div>
            </div>

            {/* ── THE COLLAGE ───────────────────────────────────────────── */}
            {/* In normal flow, so it fills the channel between the two floats
                and then runs the full width once it clears them. No wrapper
                with `overflow` — that would end the wrap. */}
            {plates.length > 0 ? (
              <div className={`${COLLAGE_H} text-center lg:text-left`}>
                {plates.map((p) => (
                  <span
                    key={p.url}
                    // ⚠ `max-w-full` is not decoration. Width is derived from
                    // the plate's own aspect, and Leder's banner is 1500x225 —
                    // 6.67:1, which at this row height computes to 1093px and
                    // pushed a horizontal scrollbar onto the whole dialog at
                    // 1024. The cap turns that one plate into a full-width band
                    // and `object-cover` takes up the slack.
                    className="mr-2 mb-2 inline-block max-w-full overflow-hidden rounded-md align-top"
                    style={{
                      height: "var(--ch)",
                      // Aspect-derived width off a shared row height. `calc`
                      // rather than a computed px so the responsive --ch steps
                      // keep working without re-measuring in JS.
                      width: `calc(var(--ch) * ${(p.w / p.h).toFixed(4)})`,
                    }}
                  >
                    <Image
                      src={p.url}
                      alt={p.name}
                      width={p.w}
                      height={p.h}
                      sizes="(min-width: 1024px) 20vw, 40vw"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    />
                  </span>
                ))}
              </div>
            ) : (
              <p className={`${META} py-10 text-center text-white/40`}>
                No pieces for this one yet.
              </p>
            )}

            {/* Floats are taken out of flow; without this the scroll container
                ends at the collage and the taller column hangs out of it. */}
            <div className="clear-both" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
