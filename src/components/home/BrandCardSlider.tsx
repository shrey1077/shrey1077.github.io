"use client";

/**
 * BrandCardSlider — the section's entries as portrait cards on a slider.
 *
 * Each card is a portrait plate: the brand's own logo in the top quarter, then
 * the company's facts (sector, what the work was, where they are, site and
 * contact) beneath. Two cards are in view at a time (one on phones) and the
 * track eases sideways one card per step.
 *
 * The cards sit on white inside the section's dark panel, so the slider reads
 * as a lit shelf against the graphite.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Client } from "@/constants/clients";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

const PER_VIEW_DESKTOP = 2;

export function BrandCardSlider({
  entries,
  onPick,
}: {
  entries: readonly Client[];
  onPick: (slug: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(PER_VIEW_DESKTOP);
  const [wrapW, setWrapW] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPerView(window.innerWidth < 640 ? 1 : PER_VIEW_DESKTOP);
      setWrapW(el.clientWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxIndex = Math.max(0, entries.length - perView);
  const clamped = Math.min(index, maxIndex);
  const cardW = wrapW > 0 ? wrapW / perView : 0;
  const go = (d: number) => setIndex(Math.max(0, Math.min(maxIndex, clamped + d)));

  if (entries.length === 0) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={wrapRef} className="min-h-0 flex-1 overflow-hidden">
        <motion.div
          className="flex h-full"
          animate={{ x: -clamped * cardW }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          {entries.map((c) => (
            <div
              key={c.slug}
              className="h-full flex-none px-2"
              style={{ width: cardW > 0 ? `${cardW}px` : `${100 / perView}%` }}
            >
              <button
                type="button"
                onClick={() => onPick(c.slug)}
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left outline-none ring-1 ring-white/10 transition-transform duration-500 hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                {/* Top quarter — the brand's own mark. */}
                <span
                  className="relative flex h-1/4 min-h-[64px] w-full items-center justify-center border-b border-neutral-200 px-6"
                  style={{ backgroundColor: `${c.accent}0f` }}
                >
                  {c.cardLogo ? (
                    <Image
                      src={c.cardLogo}
                      alt={c.name}
                      fill
                      sizes="320px"
                      className="object-contain p-4"
                    />
                  ) : (
                    <span
                      className={`${typeVoiceClass("creative", "display")} text-2xl`}
                      style={{ color: c.accent }}
                    >
                      {c.name}
                    </span>
                  )}
                </span>

                {/* The facts. */}
                <span className="flex min-h-0 flex-1 flex-col gap-1.5 p-4">
                  <span className={`${typeVoiceClass("creative", "display")} text-base leading-tight text-neutral-900`}>
                    {c.name}
                  </span>
                  <span className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] uppercase tracking-[0.12em] text-neutral-400`}>
                    {c.sector}
                  </span>
                  <span className="line-clamp-2 text-[0.68rem] leading-relaxed text-neutral-500">
                    {c.essence}
                  </span>

                  <span className="mt-auto flex flex-col gap-0.5 border-t border-neutral-100 pt-2">
                    {c.location && (
                      <span className="text-[0.58rem] leading-snug text-neutral-500">{c.location}</span>
                    )}
                    {c.site && (
                      <span className="text-[0.58rem] leading-snug text-neutral-500">{c.site}</span>
                    )}
                    {c.contact && (
                      <span className="text-[0.58rem] leading-snug text-neutral-500">{c.contact}</span>
                    )}
                    <span
                      className={`${typeVoiceClass("logic", "meta")} mt-1.5 inline-flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.1em]`}
                      style={{ color: c.accent }}
                    >
                      Open
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </span>
                </span>
              </button>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex shrink-0 items-center justify-between px-2">
        <span className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] uppercase tracking-[0.14em] text-white/40 tabular-nums`}>
          {clamped + 1}–{Math.min(clamped + perView, entries.length)} / {entries.length}
        </span>
        <span className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={clamped === 0}
            aria-label="Previous"
            className="rounded-full border border-white/25 px-3.5 py-2 text-sm text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white disabled:opacity-25"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={clamped >= maxIndex}
            aria-label="Next"
            className="rounded-full border border-white/25 px-3.5 py-2 text-sm text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white disabled:opacity-25"
          >
            →
          </button>
        </span>
      </div>
    </div>
  );
}
