"use client";

/**
 * HandbookCircle — band 03's body: the handbook's page in the centre, its six
 * points set round it on a circle, three a side (owner, 2026-10-04).
 *
 * Each point carries thumbnails of the pages it describes, and LIGHTS UP while
 * one of them is the page on display — so as the book turns on its own, the
 * light walks round the circle with it. A point, or any of its thumbnails,
 * turns the book to that page.
 *
 * The page itself is the slider it always was: two editions behind a dark
 * blue (IIS Ahmedabad) and a teal (IIS Mumbai) circle, the same page in the
 * other theme when you switch, sideways slides in the direction you went,
 * auto-advance that holds while the pointer or focus is on it and never runs
 * for reduced motion.
 *
 * ⚠ THE CIRCLE IS GEOMETRY, NOT A LOOK-ALIKE. The top and bottom points sit
 * IN from the page's edge and the middle one R from its centre, with
 * IN² + DY² = R², so all six dots lie on one circle round the page's centre —
 * the arcs drawn behind them are that circle. The numbers live in CSS
 * variables per breakpoint (lg, xl) so nothing waits on JavaScript to place
 * them. Change one, recompute DY.
 *
 * Below `lg` there is no room for a circle: the page, then the points as a
 * list, lit the same way.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";
import {
  HANDBOOK_FLIPBOOK,
  HANDBOOK_PAGE,
  HANDBOOK_SLIDES,
  type HandbookEdition,
} from "@/constants/tataHandbook";
import { TATA_HANDBOOK_EDITIONS, TATA_HANDBOOK_POINTS } from "@/constants/tataStory";

/** ms a page holds before the next slides in. */
const HOLD = 4200;
const N = HANDBOOK_SLIDES.length;
const ASPECT = HANDBOOK_PAGE.h / HANDBOOK_PAGE.w;

/** The circle, per breakpoint (rem): --p page width, --in the top/bottom
 *  dots' distance from the centre line, --r the circle's radius (the middle
 *  dot), --dy the top/bottom dots' height off the centre (√(r² − in²)),
 *  --tw a point's text width, --extra the room under the page (caption,
 *  controls, and the last point's tail). lg: p 19, in 11.5, r 16. xl: p 22, in 13.5,
 *  r 17. */
const GEOMETRY =
  "[--p:19rem] [--in:11.5rem] [--r:16rem] [--dy:11.13rem] [--tw:12rem] [--extra:9rem] xl:[--extra:7.5rem] xl:[--p:22rem] xl:[--in:13.5rem] xl:[--r:17rem] xl:[--dy:10.31rem] xl:[--tw:15rem]";
/** The page's centre, from the stage's top. */
const CY = `calc(var(--p) * ${ASPECT / 2})`;

type Point = (typeof TATA_HANDBOOK_POINTS)[number];

/** Where point i sits: 0–2 down the left, 3–5 down the right. */
function place(i: number) {
  const side = i < 3 ? -1 : 1;
  const row = i % 3; // 0 top, 1 middle, 2 bottom
  const x = row === 1 ? "var(--r)" : "var(--in)";
  const y = row === 0 ? "calc(var(--dy) * -1)" : row === 2 ? "var(--dy)" : "0rem";
  return { side, x, y };
}

export function HandbookCircle() {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({ rootMargin: "0px" });
  const [edition, setEdition] = useState<HandbookEdition>("iisa");
  /** The page, and the way we came to it: 1 forward, -1 back, 0 a switch. */
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [held, setHeld] = useState(false);

  const step = (by: number) => setSlide(([i]) => [(i + by + N) % N, by]);
  const goTo = (to: number) => setSlide(([i]) => (to === i ? [i, 0] : [to, to > i ? 1 : -1]));

  // The timer restarts after every move, so a page reached by hand gets its
  // full hold.
  useEffect(() => {
    if (reduceMotion || !inView || held) return;
    const t = setTimeout(() => setSlide(([i]) => [(i + 1) % N, 1]), HOLD);
    return () => clearTimeout(t);
  }, [reduceMotion, inView, held, index, edition]);

  // Warm the next page, and this page in the other edition.
  useEffect(() => {
    const other: HandbookEdition = edition === "iisa" ? "iism" : "iisa";
    for (const src of [HANDBOOK_SLIDES[(index + 1) % N][edition], HANDBOOK_SLIDES[index][other]]) {
      const img = new window.Image();
      img.src = src;
    }
  }, [index, edition]);

  const slide = HANDBOOK_SLIDES[index];
  const current = TATA_HANDBOOK_EDITIONS.find((e) => e.id === edition) ?? TATA_HANDBOOK_EDITIONS[0];
  const travel = reduceMotion ? 0 : 36;
  const isLit = (p: Point) => (p.pages as readonly string[]).includes(slide.slug);
  const indexOf = (slug: string) => HANDBOOK_SLIDES.findIndex((s) => s.slug === slug);

  /** One point: its number and title (a button to its first page), its text,
   *  and its pages. `align` faces it toward the page. */
  const pointBody = (p: Point, i: number, align: "left" | "right") => {
    const lit = isLit(p);
    return (
      <div className={`transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
        <button
          type="button"
          onClick={() => goTo(indexOf(p.pages[0]))}
          className={`group inline-flex cursor-pointer items-baseline gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
            align === "right" ? "flex-row-reverse" : ""
          }`}
        >
          <span className="tata-body text-[0.62rem] tracking-[0.1em] text-neutral-400 tabular-nums">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            className={`tata-body text-[0.68rem] uppercase tracking-[0.2em] transition-colors ${
              lit ? "text-neutral-900" : "text-neutral-600 group-hover:text-neutral-900"
            }`}
          >
            {p.title}
          </span>
        </button>
        <p className="tata-body mt-1.5 text-[0.82rem] leading-relaxed text-neutral-700">{p.text}</p>
        <div className={`mt-2.5 flex items-end gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
          {p.pages.map((slug) => {
            const k = indexOf(slug);
            const on = k === index;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => goTo(k)}
                aria-label={`Show ${HANDBOOK_SLIDES[k].caption}`}
                aria-current={on}
                className="relative block h-10 shrink-0 cursor-pointer overflow-hidden bg-white outline-none ring-1 transition-shadow focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                style={{
                  aspectRatio: `${HANDBOOK_PAGE.w} / ${HANDBOOK_PAGE.h}`,
                  boxShadow: on ? `0 0 0 2px ${current.colour}` : undefined,
                  ["--tw-ring-color" as string]: on ? "transparent" : "rgb(212 212 212)",
                }}
              >
                <Image src={HANDBOOK_SLIDES[k][edition]} alt="" fill sizes="32px" className="object-cover" />
              </button>
            );
          })}
          {"flipbook" in p && p.flipbook && (
            // The flipbook itself, looping; its last frame, still, for anyone
            // who has asked for less motion.
            <picture className="ml-1 block shrink-0 overflow-hidden bg-white ring-1 ring-neutral-200">
              <source media="(prefers-reduced-motion: reduce)" srcSet={HANDBOOK_FLIPBOOK.still} />
              <img
                src={HANDBOOK_FLIPBOOK.src}
                alt="The flipbook: a boy opens a cage and the birds fly free"
                width={HANDBOOK_FLIPBOOK.w}
                height={HANDBOOK_FLIPBOOK.h}
                loading="lazy"
                className="block h-11 w-auto"
              />
            </picture>
          )}
        </div>
      </div>
    );
  };

  /** The page, its caption, the editions and the arrows. */
  const book = (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label="Pages from the trainee handbook"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      className="relative z-10 mx-auto w-full max-w-[22rem] lg:w-[var(--p)] lg:max-w-none"
    >
      {/* The page, with two sheets under it so it reads as a book. */}
      <div className="relative w-full" style={{ aspectRatio: `${HANDBOOK_PAGE.w} / ${HANDBOOK_PAGE.h}` }}>
        <span aria-hidden className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-white ring-1 ring-neutral-200" />
        <span aria-hidden className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-white ring-1 ring-neutral-200" />
        <div className="absolute inset-0 overflow-hidden bg-white shadow-[0_28px_50px_-28px_rgba(0,0,0,0.4)] ring-1 ring-neutral-200">
          <AnimatePresence initial={false} custom={dir}>
            <motion.button
              key={`${edition}-${index}`}
              type="button"
              custom={dir}
              aria-label={`Next page (${index + 1} of ${N})`}
              onClick={() => step(1)}
              className="absolute inset-0 block cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/40"
              variants={{
                enter: (d: number) => ({ x: `${d * travel}%`, opacity: d ? 1 : 0 }),
                rest: { x: "0%", opacity: 1 },
                leave: (d: number) => ({ x: `${-d * travel}%`, opacity: 0 }),
              }}
              initial="enter"
              animate="rest"
              exit="leave"
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={slide[edition]}
                alt={`${current.label} trainee handbook — ${slide.caption}`}
                fill
                sizes="(max-width: 1024px) 90vw, 22rem"
                className="object-contain"
              />
            </motion.button>
          </AnimatePresence>
        </div>
      </div>

      {/* What this page is. */}
      <p aria-live="polite" className="tata-body mt-6 flex items-baseline justify-between gap-4 text-[0.82rem] text-neutral-700">
        <span>{slide.caption}</span>
        <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-400 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
        </span>
      </p>

      {/* The editions, and the way through. */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-300/80 pt-3">
        <div role="radiogroup" aria-label="Edition" className="flex items-center gap-2">
          {TATA_HANDBOOK_EDITIONS.map((e) => {
            const on = e.id === edition;
            return (
              <button
                key={e.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${e.label} edition`}
                title={e.label}
                onClick={() => {
                  if (on) return;
                  setEdition(e.id);
                  setSlide(([i]) => [i, 0]);
                }}
                className="grid size-9 cursor-pointer place-items-center rounded-full outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                style={{ boxShadow: on ? `inset 0 0 0 2px ${e.colour}` : undefined }}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${on ? "size-6" : "size-7"}`}
                  style={{ backgroundColor: e.colour }}
                />
              </button>
            );
          })}
          <span className="tata-body ml-1 text-[0.58rem] uppercase tracking-[0.2em] text-neutral-600">{current.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { by: -1, label: "Previous page", glyph: "←" },
            { by: 1, label: "Next page", glyph: "→" },
          ].map((b) => (
            <button
              key={b.by}
              type="button"
              aria-label={b.label}
              onClick={() => step(b.by)}
              className="grid size-9 cursor-pointer place-items-center rounded-full text-sm text-neutral-500 outline-none ring-1 ring-neutral-300 transition-colors hover:text-neutral-900 hover:ring-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
            >
              {b.glyph}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    /* ⚠ ONE page, placed two ways — absolutely in the circle's centre from
       lg up, in the flow above the list below it. Rendering it once per layout
       would hand the viewport observer the hidden copy and stall the
       auto-advance. */
    <div className={`${GEOMETRY} relative lg:min-h-[calc(var(--p)*1.2941+var(--extra))]`}>
      {/* The circle the dots sit on — its two side arcs, behind the page. */}
      <svg
        aria-hidden
        viewBox="-100 -100 200 200"
        className="pointer-events-none absolute hidden text-neutral-300 lg:block"
        style={{ left: "calc(50% - var(--r))", top: `calc(${CY} - var(--r))`, width: "calc(var(--r) * 2)", height: "calc(var(--r) * 2)" }}
      >
        <path
          d="M -70.71 -70.71 A 100 100 0 0 0 -70.71 70.71 M 70.71 -70.71 A 100 100 0 0 1 70.71 70.71"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* The points round it (lg and up). */}
      {TATA_HANDBOOK_POINTS.map((p, i) => {
        const { side, x, y } = place(i);
        const lit = isLit(p);
        return (
          <div key={p.title} className="hidden lg:block">
            {/* The dot, on the circle. */}
            <span
              aria-hidden
              className="absolute z-10 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500"
              style={{
                left: `calc(50% + ${side} * ${x})`,
                top: `calc(${CY} + ${y})`,
                backgroundColor: lit ? current.colour : "#ffffff",
                borderColor: lit ? current.colour : "rgb(212 212 212)",
                boxShadow: lit ? `0 0 0 5px ${current.colour}26` : undefined,
              }}
            />
            {/* The point, beside it, facing the page. */}
            <div
              className={`absolute w-[var(--tw)] ${side < 0 ? "text-right" : "text-left"}`}
              style={{
                [side < 0 ? "right" : "left"]: `calc(50% + ${x} + 1.1rem)`,
                top: `calc(${CY} + ${y} - 0.62rem)`,
              }}
            >
              {pointBody(p, i, side < 0 ? "right" : "left")}
            </div>
          </div>
        );
      })}

      <div className="lg:absolute lg:left-1/2 lg:top-0 lg:-translate-x-1/2">{book}</div>

      {/* Below lg: the points as a list under the page, lit the same way. */}
      <ol className="mt-10 grid grid-cols-1 gap-x-8 border-t border-neutral-300/80 sm:grid-cols-2 lg:hidden">
        {TATA_HANDBOOK_POINTS.map((p, i) => (
          <li key={p.title} className="flex gap-3 border-b border-neutral-300/80 py-4">
            <span
              aria-hidden
              className="mt-1 block size-2.5 shrink-0 rounded-full border transition-colors duration-500"
              style={{
                backgroundColor: isLit(p) ? current.colour : "#ffffff",
                borderColor: isLit(p) ? current.colour : "rgb(212 212 212)",
              }}
            />
            <div className="min-w-0 flex-1">{pointBody(p, i, "left")}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
