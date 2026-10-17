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
 *
 * THE WINDOW TAKES THE PAGE'S SHAPE (owner, 2026-10-17: "the previewer
 * dimension will set automatically to fit page size of pdf"): as large as
 * the right two thirds allow, at the proportions of the page in it — wide
 * for the landscape spreads, tall for the portrait ones — so one whole page
 * fills it, and the scroll goes a page at a time. Where a document mixes
 * the two (Food Distribution's covers are upright, its inside pages wide),
 * the window turns to the new page's shape once the scroll settles on it.
 * The sizes come from the pages' own files (readPublicationPageSizes).
 */

import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { PUBLICATIONS } from "@/constants/publications";
import { SIX_WRITINGS } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em]`;

/** A page of a document, with its size in pixels (from the server). */
export type WritingPage = { src: string; w: number; h: number };
/** The usual page — A4 on its side — for one whose size is not known. */
const USUAL = 1400 / 987;
const ratioOf = (p: WritingPage | undefined) => (p && p.w > 0 && p.h > 0 ? p.w / p.h : USUAL);
/** Room under the window: the line of the count (h-7), the gap above it
 *  (gap-2) and the window's coloured top (4 px). On a short screen (a phone
 *  on its side) the count stands beside the window instead, in SIDE. */
const FOOT = "2.25rem - 4px";
const SIDE = "7rem";
/** How long the scroll must rest before the window takes its page's shape. */
const SETTLE_MS = 160;
/** ONE PUSH, ONE PAGE (the wheel, as the slides take it): a wheel event this
 *  soon after the last belongs to the same push… */
const PUSH_GAP_MS = 200;
/** …unless the push has gone on this long since its page turned and is still
 *  pushing (not dying away, as a trackpad's glide does): then it turns the next. */
const PUSH_CAP_MS = 650;

export function WritingsSlide({ covers }: { covers: Record<string, WritingPage[]> }) {
  const near = useContext(NearContext);
  const six = SIX_WRITINGS.map((slug) => PUBLICATIONS.find((p) => p.slug === slug)).filter((p) => !!p);
  const [pick, setPick] = useState(six[0]?.slug ?? "");
  const doc = six.find((p) => p.slug === pick) ?? six[0];
  const pages = covers[pick] ?? [];
  const winRef = useRef<HTMLOListElement>(null);
  // The page in view (the count follows the scroll), and the one whose shape
  // the window has taken (it follows once the scroll has settled).
  const [page, setPage] = useState(1);
  const [shaped, setShaped] = useState(0);
  const shapedRef = useRef(0);
  shapedRef.current = shaped;
  const settle = useRef(0);
  const r = ratioOf(pages[shaped]);
  // As large as the box allows, at the page's proportions — with the count
  // under it, or (a short screen) beside it.
  const fit = {
    "--r": r.toFixed(4),
    "--w": `min(100cqw, calc((100cqh - ${FOOT}) * ${r.toFixed(4)}))`,
    "--ws": `min(calc(100cqw - ${SIDE}), calc((100cqh - 4px) * ${r.toFixed(4)}))`,
  } as React.CSSProperties;

  // A new document starts at its first page.
  useEffect(() => {
    winRef.current?.scrollTo({ top: 0 });
  }, [pick]);
  useEffect(() => () => window.clearTimeout(settle.current), []);
  // While the window changes shape, the page it was turned to stays in it.
  useLayoutEffect(() => {
    const el = winRef.current;
    if (!el) return;
    const hold = () => {
      const kid = el.children[shapedRef.current] as HTMLElement | undefined;
      if (kid && Math.abs(el.scrollTop - kid.offsetTop) > 1) el.scrollTop = kid.offsetTop;
    };
    const ro = new ResizeObserver(hold);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // The wheel turns a page a push (a wheel's notch or a trackpad's swipe);
  // the finger and the keys scroll natively, the snap doing the same.
  useEffect(() => {
    const el = winRef.current;
    if (!el) return;
    let last = -Infinity;
    let turnedAt = -Infinity;
    let peak = 0;
    let goal = 0;
    let spent = false;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      const delta = Math.abs(e.deltaY);
      if (now - last > PUSH_GAP_MS || (now - turnedAt > PUSH_CAP_MS && delta >= peak * 0.8)) spent = false;
      last = now;
      peak = Math.max(peak, delta);
      if (spent || !e.deltaY) return;
      const kids = Array.from(el.children) as HTMLElement[];
      // From the page the last turn is still gliding to, or the one in view.
      let at = 0;
      if (now - turnedAt < 700 && goal < kids.length) at = goal;
      else
        kids.forEach((k, i) => {
          if (Math.abs(k.offsetTop - el.scrollTop) < Math.abs(kids[at].offsetTop - el.scrollTop)) at = i;
        });
      const to = Math.max(0, Math.min(kids.length - 1, at + Math.sign(e.deltaY)));
      if (to === at) return;
      spent = true;
      turnedAt = now;
      goal = to;
      peak = delta;
      el.scrollTo({ top: kids[to].offsetTop, behavior: calm.matches ? "auto" : "smooth" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  // Which page is in view, for the count; once the scroll rests, its shape.
  const onScroll = () => {
    const el = winRef.current;
    if (!el) return;
    let n = 0;
    let best = Infinity;
    Array.from(el.children).forEach((k, i) => {
      const d = Math.abs((k as HTMLElement).offsetTop - el.scrollTop);
      if (d < best) {
        best = d;
        n = i;
      }
    });
    setPage(n + 1);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setShaped(n), SETTLE_MS);
  };
  const choose = (slug: string) => {
    window.clearTimeout(settle.current);
    setPick(slug);
    setPage(1);
    setShaped(0);
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
                  onClick={() => choose(p.slug)}
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

          {/* The window: the picked document, a page at a time, in the
              shape of the page in it. */}
          <div className="flex min-h-0 items-center justify-center [container-type:size]">
            <div
              className="relative flex w-[var(--w)] flex-col gap-2 transition-[width] duration-300 ease-out motion-reduce:transition-none [@media(max-height:31.25rem)]:mr-[7rem] [@media(max-height:31.25rem)]:w-[var(--ws)]"
              style={fit}
            >
              <div className="overflow-hidden rounded-xl bg-neutral-800 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-neutral-900/20" style={{ borderTop: `4px solid ${accent}` }}>
                {/* No scroll bar: the pages snap, and the count says where. */}
                <ol
                  id="writings-window"
                  role="tabpanel"
                  aria-label={`${doc.title} — pages`}
                  ref={winRef}
                  onScroll={onScroll}
                  data-own-scroll
                  className="relative h-[calc(var(--w)/var(--r))] snap-y snap-mandatory overflow-y-auto overscroll-contain transition-[height] duration-300 ease-out [scrollbar-width:none] motion-reduce:transition-none [&::-webkit-scrollbar]:hidden [@media(max-height:31.25rem)]:h-[calc(var(--ws)/var(--r))]"
                >
                  {pages.map((p, i) => (
                    <li key={p.src} className="flex h-full snap-start snap-always items-center justify-center">
                      {near && (
                        // eslint-disable-next-line @next/next/no-img-element -- a page, whole in the window, loaded as it comes near
                        <img
                          src={p.src}
                          alt={`${doc.title} — page ${i + 1}`}
                          width={p.w || undefined}
                          height={p.h || undefined}
                          loading={i < 2 ? "eager" : "lazy"}
                          decoding="async"
                          className="block h-full w-full object-contain"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              {/* The count and the way to the whole document: under the
                  window, or beside it on a short screen. The count never
                  gives way to a long title. */}
              <div className="flex h-7 shrink-0 items-center justify-between gap-3 [@media(max-height:31.25rem)]:absolute [@media(max-height:31.25rem)]:bottom-0 [@media(max-height:31.25rem)]:left-full [@media(max-height:31.25rem)]:ml-3 [@media(max-height:31.25rem)]:h-auto [@media(max-height:31.25rem)]:w-[calc(7rem-0.75rem)] [@media(max-height:31.25rem)]:flex-col [@media(max-height:31.25rem)]:items-start">
                <p className={`${META} flex min-w-0 gap-1.5 text-neutral-600 [@media(max-height:31.25rem)]:flex-col [@media(max-height:31.25rem)]:gap-1`}>
                  <span className="min-w-0 truncate [@media(max-height:31.25rem)]:line-clamp-3 [@media(max-height:31.25rem)]:whitespace-normal">{doc.title}</span>
                  <span className="shrink-0 tabular-nums">
                    <span className="[@media(max-height:31.25rem)]:hidden">· </span>
                    {page} / {pages.length}
                  </span>
                </p>
                <Link href={`/publications/${doc.slug}`} prefetch={false} className={`${META} shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-neutral-900 ring-1 ring-neutral-900/20 transition-colors hover:bg-neutral-950 hover:text-white`}>
                  Open full ↗
                </Link>
              </div>
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
