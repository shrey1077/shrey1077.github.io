"use client";

/**
 * ExtinctsRoom — The Extincts Project room, in four sections (owner,
 * 2026-10-03): Initial Research, Stories, Script and Character Sheets, one at
 * a time behind a row of tabs. It replaced the jury deck's slides as this
 * room's board (the deck is a subset of the third report's pages).
 *
 *   · Initial Research — the three research reports, by their covers; a click
 *     opens the report to read, page by page (ExtinctsReader).
 *   · Stories — the six titles, set in the project's red and white.
 *   · Script, Character Sheets — to come from the owner; each says so.
 *
 * Right-aligned, like every creative room since the tracks went parallel, and
 * every block of text on a paper plate over the landing's light ground.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  EXTINCTS_REPORTS,
  EXTINCTS_SECTIONS,
  EXTINCTS_STORIES,
  type ExtinctsReport,
  type ExtinctsSectionId,
} from "@/constants/extincts";
import { EXTINCTS_REPORT_PAGES } from "@/constants/extinctsReportPages";
import { PAPER_PLATE, Z_INDEX } from "@/constants/design";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");
/** The project's own red (its covers and the jury deck). */
const RED = "#e3262b";

const pad = (n: number) => String(n).padStart(2, "0");

export function ExtinctsRoom() {
  const [section, setSection] = useState<ExtinctsSectionId>("research");
  const [reading, setReading] = useState<ExtinctsReport | null>(null);
  // The reader mounts on the first open, never in the static render — a
  // portal there would have nothing to hydrate against.
  const [everRead, setEverRead] = useState(false);
  const read = (r: ExtinctsReport) => {
    setEverRead(true);
    setReading(r);
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-end gap-4">
      {/* The four sections. */}
      <div role="tablist" aria-label="The Extincts Project" className={`${PAPER_PLATE} flex flex-wrap justify-end gap-1 p-1.5`}>
        {EXTINCTS_SECTIONS.map((s, i) => {
          const on = s.id === section;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSection(s.id)}
              className={`font-graff flex items-baseline gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none lg:gap-2 lg:px-3.5 lg:py-2 lg:text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                on ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-900/5 hover:text-neutral-900"
              }`}
            >
              <span className={`${META} text-[0.55rem]`} style={{ color: on ? RED : undefined }}>
                {pad(i + 1)}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* The section. Scrolls on its own when it runs past the room. */}
      <div role="tabpanel" className="min-h-0 w-full flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="flex min-h-full flex-col items-end justify-center"
          >
            {section === "research" && <Reports onRead={read} />}
            {section === "stories" && <Stories />}
            {section === "script" && <ToCome what="The script" />}
            {section === "characters" && <ToCome what="The character sheets" />}
          </motion.div>
        </AnimatePresence>
      </div>

      {everRead && <ExtinctsReader report={reading} onClose={() => setReading(null)} />}
    </div>
  );
}

/** The three reports, by their covers (each one's own first page). */
function Reports({ onRead }: { onRead: (r: ExtinctsReport) => void }) {
  return (
    <ul className="flex flex-wrap justify-end gap-5">
      {EXTINCTS_REPORTS.map((r, i) => {
        const pages = EXTINCTS_REPORT_PAGES[r.id] ?? [];
        const cover = pages[0];
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onRead(r)}
              className="group flex flex-col items-end gap-2.5 text-right outline-none"
              aria-label={`Read report ${i + 1}: ${r.title}`}
            >
              {cover && (
                <span
                  className="relative block overflow-hidden rounded-lg shadow-[0_18px_36px_-16px_rgba(0,0,0,0.45)] ring-1 ring-neutral-200 transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-neutral-900/50"
                  // One height for all three, widths by their own aspect —
                  // two are portrait, the final report is landscape.
                  style={{ height: "clamp(7rem, 22vh, 13rem)", aspectRatio: `${cover.w} / ${cover.h}` }}
                >
                  <Image src={cover.src} alt="" fill sizes="22vw" className="object-cover" />
                </span>
              )}
              <span className={`${PAPER_PLATE} block max-w-[13rem] px-3.5 py-2.5`}>
                <span className={`${META} block text-[0.55rem] text-neutral-500`}>
                  <span style={{ color: RED }}>Report {pad(i + 1)}</span> · {r.date} · {pages.length} pp
                </span>
                <span className="font-graff mt-1 block text-base font-bold leading-tight text-neutral-900">{r.title}</span>
                <span className="font-helv mt-1 line-clamp-2 block text-[0.7rem] leading-snug text-neutral-600">{r.about}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** The six stories — title cards in the project's red, black and white. */
function Stories() {
  return (
    <ul className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
      {EXTINCTS_STORIES.map((s, i) => (
        <li
          key={s.name}
          className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-xl bg-neutral-950/90 p-4 text-right ring-1 ring-white/10 lg:aspect-[16/9]"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: RED }} />
          <span className={`${META} text-[0.55rem] text-white/45`}>Story {pad(i + 1)}</span>
          <span className="block">
            <span className="font-graff block text-[0.8rem] font-bold uppercase tracking-[0.12em]" style={{ color: RED }}>
              {s.lead}
            </span>
            <span className="font-graff block text-[clamp(1.05rem,1.7vw,1.6rem)] font-bold uppercase leading-[0.95] text-white">
              {s.name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A section whose material is still to come. */
function ToCome({ what }: { what: string }) {
  return (
    <p className={`${PAPER_PLATE} font-helv px-5 py-4 text-sm text-neutral-700`}>
      {what} will be added here soon.
    </p>
  );
}

/**
 * The report, to read — every page in one column. Portalled to <body>: the
 * room lives inside the Flythrough's transformed slides, which would make a
 * `position: fixed` box fixed to THEM. While open it sets `data-modal` on the
 * root, which the Flythrough reads to leave the wheel and the keys alone.
 */
function ExtinctsReader({ report, onClose }: { report: ExtinctsReport | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  const open = report !== null;

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.dataset.modal = "open";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      delete root.dataset.modal;
      opener?.focus?.();
    };
  }, [open]);

  const index = report ? EXTINCTS_REPORTS.indexOf(report) : -1;
  const pages = report ? (EXTINCTS_REPORT_PAGES[report.id] ?? []) : [];

  return createPortal(
    <AnimatePresence>
      {report && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Report ${index + 1}: ${report.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE_OUT }}
          className="fixed inset-0 flex flex-col bg-neutral-950/97 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.viewer }}
          onClick={onClose}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-6 pt-5 sm:px-10">
            <p className="min-w-0 text-white">
              <span className={`${META} block text-[0.6rem] text-white/45`}>
                <span style={{ color: RED }}>The Extincts Project</span> · Report {pad(index + 1)} · {report.date} ·{" "}
                {pages.length} pages
              </span>
              <span className="font-graff mt-1 block truncate text-lg font-bold">{report.title}</span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close the report"
              className={`${META} shrink-0 rounded px-2 py-1 text-xs text-white/55 outline-none transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/40`}
            >
              Close ✕
            </button>
          </div>
          {/* The pages. A click on the gutters closes; nothing inside does. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-10" onClick={(e) => e.stopPropagation()}>
            <ol className="mx-auto flex w-full max-w-[min(68rem,100%)] flex-col gap-4">
              {pages.map((p, i) => (
                <li key={p.src}>
                  <Image
                    src={p.src}
                    alt={`Page ${i + 1}`}
                    width={p.w}
                    height={p.h}
                    sizes="(min-width: 1100px) 68rem, 100vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    className="h-auto w-full rounded-sm bg-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                  />
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
