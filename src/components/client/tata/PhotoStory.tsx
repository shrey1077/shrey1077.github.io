"use client";

/**
 * PhotoStory — band 07 of the Tata IIS page: the aspects of the camera work as
 * a list of tabs, and the chosen aspect's work beside it — a mosaic of
 * photographs, or, for video and editing, the films themselves.
 *
 * ⚠ The tabs sit in the band's MARGIN COLUMN, under its headline (2026-10-05,
 * the owner's "minimal amount of scrolls"): the band's head stood above the
 * tabs and the mosaic until then, and beside them it costs no height. See
 * SideBand.
 *
 * Any photograph opens full size in the page's MediaViewer and walks the rest
 * of its aspect from there. Films load nothing until asked (preload="none").
 */

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { SideBand } from "@/components/client/tata/SideBand";
import type { TataImage } from "@/constants/tataPhotos";
import type { TataBand } from "@/constants/tataStory";

export interface PhotoAspect {
  id: string;
  title: string;
  text: string;
  photos?: readonly TataImage[];
}

export interface Film {
  id: string;
  title: string;
  note: string;
  src: string;
  poster: string;
  portrait?: boolean;
}

/** The three visual themes the films are cut to, as swatches. */
const THEMES = [
  { label: "Tata IIS", colour: "#111111" },
  { label: "IIS Ahmedabad", colour: "#0d3857" },
  { label: "IIS Mumbai", colour: "#00a2b4" },
];

/** Photographs shown at once; the rest are a click away in the viewer. */
const MOSAIC = 5;

export function PhotoStory({
  band,
  aspects,
  films,
}: {
  band: TataBand;
  aspects: readonly PhotoAspect[];
  films: readonly Film[];
}) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const [active, setActive] = useState(aspects[0]?.id);
  const [viewing, setViewing] = useState<{ aspect: string; i: number } | null>(null);
  const [film, setFilm] = useState(0);

  const aspect = aspects.find((a) => a.id === active) ?? aspects[0];
  const photos = aspect.photos ?? [];
  const shown = photos.slice(0, MOSAIC);
  const viewPhotos = viewing ? (aspects.find((a) => a.id === viewing.aspect)?.photos ?? []) : [];

  /** Cell spans for the mosaic: the first picture leads, large. Two pictures
   *  share a three-column grid instead — the first two-thirds, the second a
   *  full-height third — so neither leaves a hole (Interviews, 2026-10-05). */
  const span = (i: number, n: number) => {
    if (n === 2) return i === 0 ? "col-span-2 row-span-2" : "row-span-2";
    if (i === 0) return "col-span-2 row-span-2";
    if (n <= 3) return "col-span-2";
    return "";
  };

  const tabs = (
    <div role="tablist" aria-orientation="vertical" aria-label="Aspects of the work">
      <ol className="border-t border-neutral-300/80">
        {aspects.map((a, i) => {
          const on = a.id === aspect.id;
          return (
            <li key={a.id} className="border-b border-neutral-300/80">
              <button
                type="button"
                role="tab"
                id={`${uid}-tab-${a.id}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                onClick={() => setActive(a.id)}
                className="group flex w-full cursor-pointer items-start gap-4 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/40"
              >
                <span
                  className={`tata-body w-6 shrink-0 pt-[0.15rem] text-[0.65rem] tracking-[0.1em] tabular-nums ${
                    on ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`tata-body block text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
                      on ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-900"
                    }`}
                  >
                    {a.title}
                  </span>
                  {/* Only the chosen aspect says more — the list stays a list. */}
                  <span
                    className={`tata-body grid text-[0.82rem] leading-relaxed text-neutral-700 transition-[grid-template-rows,opacity,margin] duration-500 ${
                      on ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <span className="overflow-hidden">{a.text}</span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`pt-[0.1rem] text-sm transition-all ${on ? "text-neutral-900" : "-translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-neutral-400"}`}
                >
                  →
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <SideBand band={band} id="tata-photo-title" anchor="camera" aside={tabs}>
      {/* ── The chosen aspect's work. ── */}
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${aspect.id}`} className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={aspect.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            {aspect.id === "video" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_13rem]">
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <video
                    key={films[film].id}
                    src={films[film].src}
                    poster={films[film].poster}
                    controls
                    playsInline
                    preload="none"
                    className={`absolute inset-0 h-full w-full ${films[film].portrait ? "object-contain" : "object-cover"}`}
                  >
                    <track kind="captions" />
                  </video>
                </div>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:content-start">
                  {films.map((f, i) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setFilm(i)}
                        aria-current={i === film}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-full p-1.5 pr-4 text-left outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                          i === film ? "bg-white ring-neutral-900" : "ring-neutral-200 hover:bg-white"
                        }`}
                      >
                        <span className="relative block h-9 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-900">
                          <Image src={f.poster} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="tata-body block truncate text-[0.78rem] text-neutral-900">{f.title}</span>
                          <span className="tata-body block truncate text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
                            {f.note}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <ul aria-label="Cut to three visual themes" className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2">
                  {THEMES.map((t) => (
                    <li key={t.label} className="flex items-center gap-2">
                      <span aria-hidden className="block size-3 rounded-full" style={{ backgroundColor: t.colour }} />
                      <span className="tata-body text-[0.6rem] uppercase tracking-[0.18em] text-neutral-600">{t.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : shown.length > 0 ? (
              <>
                <ul
                  className={`grid h-[clamp(18rem,46vw,37rem)] grid-rows-2 gap-2 sm:gap-3 ${
                    shown.length === 2 ? "grid-cols-3" : "grid-cols-4"
                  }`}
                >
                  {shown.map((p, i) => (
                    <li key={p.src} className={`relative min-h-0 ${span(i, shown.length)}`}>
                      <button
                        type="button"
                        onClick={() => setViewing({ aspect: aspect.id, i })}
                        aria-label={`${aspect.title}, photograph ${i + 1} of ${photos.length} — open full size`}
                        className="group absolute inset-0 block cursor-zoom-in overflow-hidden bg-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                      >
                        <Image
                          src={p.src}
                          alt={`${aspect.title}, photograph ${i + 1}`}
                          fill
                          sizes={i === 0 ? "(max-width: 1024px) 60vw, 34rem" : "(max-width: 1024px) 30vw, 17rem"}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
                {photos.length > MOSAIC && (
                  <button
                    type="button"
                    onClick={() => setViewing({ aspect: aspect.id, i: MOSAIC })}
                    className="tata-body mt-4 inline-flex cursor-pointer items-center gap-2 border-b border-neutral-300 pb-0.5 text-[0.7rem] uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                  >
                    All {photos.length} photographs <span aria-hidden>→</span>
                  </button>
                )}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <MediaViewer
        asset={
          viewing && viewPhotos[viewing.i]
            ? { name: `${aspects.find((a) => a.id === viewing.aspect)?.title} — ${viewing.i + 1}`, url: viewPhotos[viewing.i].src, kind: "image" }
            : null
        }
        onClose={() => setViewing(null)}
        onPrev={() => setViewing((v) => v && { ...v, i: (v.i - 1 + viewPhotos.length) % viewPhotos.length })}
        onNext={() => setViewing((v) => v && { ...v, i: (v.i + 1) % viewPhotos.length })}
        position={viewing ? { at: viewing.i + 1, of: viewPhotos.length } : undefined}
      />
    </SideBand>
  );
}
