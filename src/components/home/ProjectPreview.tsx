"use client";

/**
 * ProjectPreview — one independent commission, opened from the Projects board.
 *
 * Three columns, as the owner specified on 2026-08-20:
 *
 *   left   ·  the mark, and the facts — name, kind, accent, site
 *   centre ·  the slider through the work
 *   right  ·  the words — headline, challenge, what was made
 *
 * The centre is the widest thing on screen only in the sense that it is the
 * subject; the thirds are literal (`lg:grid-cols-3`). Below `lg` the three
 * stack in that same order, because the mark and the name are what tell you
 * which project you just opened.
 *
 * ⚠ These entries do NOT navigate. Every other Projects cell is a link to a
 * page; these eight open here instead, because the work is a handful of plates
 * and a paragraph rather than a room. That is why the board renders them as
 * `<button>` and not `<a>` — a link that opens a dialog is a lie to anyone
 * middle-clicking it.
 *
 * Keyboard and focus follow MediaViewer: Escape closes, arrows walk the
 * slider, background scroll is locked while open, focus moves to Close and
 * returns to the opener on dismiss.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState(0);

  const open = study !== null;
  const count = plates.length;

  // Handlers live in a ref so the key effect can depend on OPEN/CLOSED alone,
  // and never tear itself down between slides.
  const nav = useRef({ onClose, count });
  useEffect(() => {
    nav.current = { onClose, count };
  });

  // A new study starts at its first plate. ⚠ Adjusted DURING RENDER, not in an
  // effect — the repo lints set-state-in-effect as an error, and this is the
  // case React documents it for ("adjusting state when a prop changes"). An
  // effect would also paint one frame of the previous study's plate first.
  // Compared by id, not by object: the parent rebuilds the object each render.
  const studyId = study?.id;
  const [lastStudyId, setLastStudyId] = useState(studyId);
  if (studyId !== lastStudyId) {
    setLastStudyId(studyId);
    setAt(0);
  }

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") nav.current.onClose();
      const n = nav.current.count;
      if (n > 1 && e.key === "ArrowLeft") setAt((i) => (i - 1 + n) % n);
      if (n > 1 && e.key === "ArrowRight") setAt((i) => (i + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  // `at` is held across a study change for one render before the effect above
  // resets it, so clamp rather than index past the end of a shorter set.
  const plate = plates[Math.min(at, Math.max(count - 1, 0))];

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

          {/* One click target for the whole body, so a stray click on the
              gutters closes but nothing inside does. */}
          <div
            className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-6 sm:px-10 lg:grid-cols-3 lg:gap-10 lg:overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT: the mark, and the facts ─────────────────────────── */}
            <aside className="flex min-w-0 flex-col gap-5 lg:overflow-y-auto lg:pr-1">
              <span
                className={`relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-2xl ${
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
                  <dt className={`${META} w-16 shrink-0 text-white/35`}>Plates</dt>
                  <dd className="text-white/70 tabular-nums">{count}</dd>
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

            {/* ── CENTRE: the slider ────────────────────────────────────── */}
            {/* ⚠ `min-h-0` is `lg:` only, for the same reason as the box below.
                As a grid item it zeroes this column's min-content contribution,
                which lets the row compress past its own content — stacked, the
                row collapsed to the 52px control strip while the content inside
                measured 505px. At `lg` it is needed, so the three columns can
                scroll independently inside a fixed-height row. */}
            <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
              {/* ⚠ `min-h-[46svh]` is load-bearing below `lg`. The plates are
                  absolutely positioned so they can cross-fade, which means they
                  contribute NO height to this box. At `lg` the grid row is
                  stretched by its tallest sibling and `flex-1` gives the box a
                  real height regardless; stacked in one column there is nothing
                  to stretch it, so it collapsed to zero and the slider showed
                  only its arrows. Measured at 760x1000: clientHeight 48 against
                  a scrollHeight of 228. */}
              <div className="relative flex min-h-[46svh] flex-1 items-center justify-center lg:min-h-0">
                {plate ? (
                  /* ⚠ A CROSS-fade, not `mode="wait"`. Waiting holds the next
                     plate until the previous one has finished leaving, which
                     puts an empty beat between every step of a slider — and if
                     the exit ever stalls, the slider looks broken while the
                     counter keeps counting. Overlapping them has neither
                     problem, which is why the frames are absolutely stacked. */
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={plate.url}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.008 }}
                      transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: EASE_OUT }}
                      className="absolute inset-0 flex h-full w-full items-center justify-center"
                    >
                      {/* Plates vary from 1200x800 to 1081x1921 in one folder,
                          so nothing here fixes an aspect: the image is capped
                          on BOTH axes and finds its own shape between them. */}
                      <Image
                        src={plate.url}
                        alt={plate.name}
                        width={plate.w}
                        height={plate.h}
                        sizes="(min-width: 1024px) 32vw, 90vw"
                        className="max-h-[52svh] w-auto max-w-full rounded-lg object-contain lg:max-h-[64svh]"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <p className={`${META} text-white/40`}>No plates for this one yet.</p>
                )}
              </div>

              {count > 1 && (
                <div className="flex shrink-0 items-center justify-center gap-5">
                  <button
                    type="button"
                    aria-label="Previous plate"
                    onClick={() => setAt((i) => (i - 1 + count) % count)}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/60 outline-none transition-colors duration-200 hover:border-white/60 hover:text-white focus-visible:border-white"
                  >
                    ←
                  </button>
                  <span className={`${META} text-[0.62rem] tabular-nums text-white/45`}>
                    {String(at + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    aria-label="Next plate"
                    onClick={() => setAt((i) => (i + 1) % count)}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/60 outline-none transition-colors duration-200 hover:border-white/60 hover:text-white focus-visible:border-white"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: the words ──────────────────────────────────────── */}
            <div className="flex min-w-0 flex-col gap-5 lg:overflow-y-auto lg:pr-1">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
