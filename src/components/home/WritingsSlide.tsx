"use client";

/**
 * WritingsSlide — Writings & Publications on the right side: the six
 * documents with pages of their own (owner's pick, 2026-10-15): the
 * Ethnography, Food Distribution, Design for Print, Packaging, Mycoveda and
 * Nirvaan. The other two — "Are There Any Takers?" and the NewsMobile bylines
 * — are on the full shelf, which "Read Them All" opens (/writings).
 *
 * A READER since 2026-10-16 (owner: "I want my 6 tabs listed on left side
 * one third and with a common pdf preview window in the rest 2/3"; six boxes,
 * three by two, until then):
 *
 *   ┌───────────────┬──────────────────────────────────┐
 *   │ ▌Ethnography   │  ┌────────────────────────────┐  │
 *   │  Food Distrib… │  │  the picked document,      │  │
 *   │  Design for P… │  │  page after page, scrolled  │  │
 *   │  Packaging     │  │  in its own window          │  │
 *   │  Mycoveda      │  └────────────────────────────┘  │
 *   │  Nirvaan       │   12 / 30 · Open full ↗          │
 *   └───────────────┴──────────────────────────────────┘
 *
 * The window scrolls by itself (`data-own-scroll`: the Flythrough leaves the
 * wheel and the finger to it while they are over it, and its overscroll is
 * contained, so the slide never moves under it); picking a tab starts the
 * new document at its first page. Pages load as they come near. On a tall
 * screen the tabs stand above the window, two rows of three.
 */

import { useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { PUBLICATIONS } from "@/constants/publications";
import { SIX_WRITINGS } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em]`;

export function WritingsSlide({ covers }: { covers: Record<string, string[]> }) {
  const near = useContext(NearContext);
  const six = SIX_WRITINGS.map((slug) => PUBLICATIONS.find((p) => p.slug === slug)).filter((p) => !!p);
  const [pick, setPick] = useState(six[0]?.slug ?? "");
  const doc = six.find((p) => p.slug === pick) ?? six[0];
  const pages = covers[pick] ?? [];
  const winRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  // A page's shape, from the first that arrives (a document's pages share
  // one): every page holds its room before its picture is in, so the window
  // can scroll — and count — from the start.
  const [ratio, setRatio] = useState<Record<string, number>>({});
  const aspect = ratio[pick] ?? 1400 / 987;

  // A new document starts at its first page.
  useEffect(() => {
    winRef.current?.scrollTo({ top: 0 });
  }, [pick]);
  // Which page is in view, for the count.
  const onScroll = () => {
    const el = winRef.current;
    if (!el) return;
    const kids = el.querySelectorAll<HTMLElement>("[data-page]");
    const mid = el.scrollTop + el.clientHeight * 0.35;
    let n = 1;
    kids.forEach((k, i) => {
      if (k.offsetTop <= mid) n = i + 1;
    });
    setPage(n);
  };
  if (!doc) return null;
  const accent = RAINBOW[(six.indexOf(doc) * 3) % RAINBOW.length];

  return (
    <section aria-label="Writings & Publications" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col gap-3">
        <div className="shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={`${META} text-neutral-500`}>Creative · 04 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.4rem,3vw,2.8rem)] font-bold leading-none text-neutral-900">Writings &amp; Publications</h2>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[clamp(0.75rem,2vw,1.75rem)] portrait:grid-cols-1 portrait:grid-rows-[auto_minmax(0,1fr)]">
          {/* The six, as tabs. */}
          <div role="tablist" aria-label="Writings" aria-orientation="vertical" className="flex min-h-0 flex-col gap-1.5 portrait:grid portrait:grid-cols-3 portrait:gap-1">
            {six.map((p, i) => {
              const on = p.slug === pick;
              const colour = RAINBOW[(i * 3) % RAINBOW.length];
              return (
                <button
                  key={p.slug}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="writings-window"
                  onClick={() => setPick(p.slug)}
                  className={`group relative flex min-h-0 flex-1 items-center gap-3 overflow-hidden rounded-full px-4 text-left outline-none ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/50 portrait:justify-center portrait:px-2 portrait:py-1.5 portrait:text-center ${
                    on ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white/85 text-neutral-900 ring-neutral-900/10 hover:bg-white"
                  }`}
                >
                  <span aria-hidden className="block h-2.5 w-2.5 shrink-0 rounded-full portrait:hidden" style={{ backgroundColor: colour }} />
                  <span className="min-w-0">
                    <span className={`${META} block truncate portrait:hidden ${on ? "text-white/55" : "text-neutral-500"} [@media(max-height:40rem)]:hidden`}>
                      {p.year} · {p.kind}
                    </span>
                    <span className="face-creative block truncate text-[clamp(0.8rem,1.35vw,1.1rem)] font-bold leading-tight portrait:text-[0.72rem]">{p.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* The window: the picked document, page after page. */}
          <div className="flex min-h-0 flex-col gap-2">
            <div
              id="writings-window"
              role="tabpanel"
              aria-label={`${doc.title} — pages`}
              ref={winRef}
              onScroll={onScroll}
              data-own-scroll
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-neutral-800 p-[clamp(0.5rem,1.4vw,1rem)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-neutral-900/20"
              style={{ borderTop: `4px solid ${accent}` }}
            >
              <ol className="flex flex-col items-center gap-[clamp(0.5rem,1.2vw,0.9rem)]">
                {pages.map((src, i) => (
                  <li key={src} data-page className="w-full bg-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" style={{ aspectRatio: String(aspect) }}>
                    {near && (
                      // eslint-disable-next-line @next/next/no-img-element -- a page, at its own shape, loaded as it comes near
                      <img
                        src={src}
                        alt={`${doc.title} — page ${i + 1}`}
                        loading={i < 2 ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={i === 0 ? (e) => { const im = e.currentTarget; if (im.naturalWidth && !ratio[pick]) setRatio((r) => ({ ...r, [pick]: im.naturalWidth / im.naturalHeight })); } : undefined}
                        className="block h-full w-full object-contain"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3">
              <p className={`${META} truncate text-neutral-600`}>
                {doc.title} · <span className="tabular-nums">{page} / {pages.length}</span>
              </p>
              <Link href={`/publications/${doc.slug}`} prefetch={false} className={`${META} shrink-0 rounded-full px-3 py-1.5 text-neutral-900 ring-1 ring-neutral-900/20 transition-colors hover:bg-neutral-950 hover:text-white`}>
                Open full ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/writings">
          Read Them All <span aria-hidden>↗</span>
        </PixelButton>
      </div>
    </section>
  );
}
