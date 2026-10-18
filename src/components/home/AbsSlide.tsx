"use client";

/**
 * AbsSlide — ABS Wholesale with the two brands built there, Luzid and
 * Kartpipe, three in one (owner, 2026-10-15). Its fourth version (owner,
 * 2026-10-16: "I want the three logos at the left aligned vertically. on
 * clicking the logo, 5 sliders (exactly like the 3 we have right now, decide
 * for mobile) will show work related to that brand. For ABS brand include
 * deathrow and tyson vapes ads and other brands. Use original Kartpipe
 * logo"):
 *
 *   ┌─────────┬──────────────────────────────────────┐
 *   │  ABS ◀  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐            │
 *   │         │  │■ │ │■ │ │■ │ │■ │ │■ │  five       │
 *   │  Luzid  │  │■ │ │■ │ │■ │ │■ │ │■ │  windows    │
 *   │         │  └──┘ └──┘ └──┘ └──┘ └──┘            │
 *   │ Kartpipe│                [View Full Project →] │
 *   └─────────┴──────────────────────────────────────┘
 *
 * A logo picks its brand: its work comes in across five portrait windows,
 * each two squares tall, through which the plates slide steadily — every
 * other one the other way — holding still under the pointer (the three
 * windows the slide had, five now). The windows change in squares
 * (usePixelPresence). On a phone held upright, three windows, four squares
 * tall, to fill the height the narrow screen leaves them. ABS's own
 * windows carry the brands ABS sells as well as its house work — Deathrow
 * and Tyson 2.0 first, then Puffco, Stiiizy, Himax Distro, Jungo Leaf, Polk A
 * Dot, Diamond Shruumz and the rest. Kartpipe's mark is its own wordmark,
 * lifted off its campaign plate (scripts/prepare-kartpipe-logo.mjs).
 * Reduced motion: the windows stand still.
 *
 * SINCE 2026-10-17 (owner: "i want my three logos on left to be covering
 * equal area on the screen, ie size. the sliders can have more height and
 * accomodate more content, and put a thin vertical line between logos and
 * sliders"): each logo is shown by its INK — the file's padding cut off
 * (Ink, measured off the files) — at one area for all three (a badge
 * square, a wordmark long and low, the same ink either way), in tabs of one
 * height; a hairline stands between them and the windows; and the windows
 * run the room's full height, showing as many plates as it holds.
 */

import { useState } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { ABS_BRANDS, type Showcase } from "@/constants/showcase";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const WORK = "/content/clients/abs/work";
/** Seconds for one plate to slide by. */
const SECONDS_PER_PLATE = 3.2;

/** A folder's plates, 01 … n. */
const plates = (folder: string, n: number) => Array.from({ length: n }, (_, i) => `${WORK}/${folder}/${String(i + 1).padStart(2, "0")}.webp`);

/** Several folders' plates dealt in turn, so the brands mix down a window. */
function interleave(lists: string[][]): string[] {
  const out: string[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}

/** Where a logo's ink lies in its file (px), measured off the files
 *  (.perf-tools/tmp/inkbox.mjs): the file's size, then the ink's box. */
interface Ink {
  fw: number;
  fh: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A logo by its ink: a box the ink's shape whose area is --ink² (so every
 *  logo covers the same), the file placed in it so the ink fills it. */
function InkLogo({ src, ink }: { src: string; ink: Ink }) {
  const s = Math.sqrt(ink.w / ink.h);
  return (
    <span className="relative block overflow-hidden" style={{ width: `calc(var(--ink) * ${s.toFixed(4)})`, height: `calc(var(--ink) / ${s.toFixed(4)})` }}>
      <span
        className="absolute block"
        style={{
          left: `${((-ink.x / ink.w) * 100).toFixed(3)}%`,
          top: `${((-ink.y / ink.h) * 100).toFixed(3)}%`,
          width: `${((ink.fw / ink.w) * 100).toFixed(3)}%`,
          height: `${((ink.fh / ink.h) * 100).toFixed(3)}%`,
        }}
      >
        <Image src={src} alt="" fill sizes="12rem" className="object-fill" />
      </span>
    </span>
  );
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  ink: Ink;
  href: string;
  plates: string[];
}

/** A window's plates: every n-th of the brand's, from its own start; a short
 *  set is turned round so every window shows something different first. */
function windowsOf(all: string[], n: number): string[][] {
  if (all.length >= n * 2) return Array.from({ length: n }, (_, w) => all.filter((_, i) => i % n === w));
  return Array.from({ length: n }, (_, w) => [...all.slice(w % all.length), ...all.slice(0, w % all.length)]);
}

function SlideWindow({ run, reverse, active }: { run: string[]; reverse: boolean; active: boolean }) {
  // The plates run twice over, so sliding by one run loops without a seam; a
  // short run is repeated until there are enough to fill the window — the
  // room's full height, about six squares at most (a phone held upright).
  const want = 8;
  const loop = run.length < want ? Array.from({ length: want }, (_, i) => run[i % run.length]) : run;
  return (
    <li className="art-row group relative h-[100cqh] w-[var(--col)] shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/10">
      <div
        className={`abs-track flex flex-col ${reverse ? "abs-track-reverse" : ""} ${active ? "" : "[animation-play-state:paused]"}`}
        style={{ "--abs-duration": `${loop.length * SECONDS_PER_PLATE}s` } as unknown as React.CSSProperties}
      >
        {[...loop, ...loop].map((src, i) => (
          <span key={`${src}-${i}`} className="relative mb-2 block aspect-square w-full shrink-0 overflow-hidden rounded-xl">
            <Image src={src} alt="" fill sizes="18vw" className="object-cover" />
          </span>
        ))}
      </div>
    </li>
  );
}

/** One brand's windows, arriving and leaving in squares. */
function BrandWindows({ brand, shown, active, n }: { brand: Brand; shown: boolean; active: boolean; n: number }) {
  const reduceMotion = !active;
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 12, duration: 0.6, reduceMotion });
  return (
    <div ref={ref} aria-hidden={!shown} className={`absolute inset-0 flex items-center justify-center ${shown ? "" : "invisible"}`}>
      <ul className="flex items-start gap-[var(--gap)]" aria-label={`${brand.name} — work`}>
        {windowsOf(brand.plates, n).map((run, i) => (
          <SlideWindow key={i} run={run} reverse={i % 2 === 1} active={active && shown} />
        ))}
      </ul>
    </div>
  );
}

export function AbsSlide({ item, active }: { item: Showcase; active: boolean }) {
  const [luzid, kartpipe] = ABS_BRANDS;
  const brands: Brand[] = [
    {
      id: "abs",
      name: "ABS Wholesale",
      // ABS's badge on a clear ground (the strip's sits on white).
      logo: "/content/clients/abs/abs-logo.png",
      ink: { fw: 480, fh: 409, x: 51, y: 46, w: 336, h: 335 },
      href: item.report.href ?? "/clients/abs",
      plates: interleave([
        plates("deathrow", 2),
        plates("tyson", 3),
        plates("abs-house", 6),
        plates("puffco", 12),
        plates("stiiizy", 3),
        plates("himax", 3),
        plates("jungo", 2),
        plates("polk-a-dot", 2),
        plates("shruumz", 2),
        plates("misc", 9),
      ]),
    },
    { id: "luzid", name: luzid.name, logo: luzid.mark ?? "", ink: { fw: 625, fh: 354, x: 148, y: 107, w: 329, h: 140 }, href: luzid.report.href ?? "/clients/abs#luzid", plates: plates("luzid", 7) },
    { id: "kartpipe", name: kartpipe.name, logo: "/content/clients/abs/kartpipe-logo-black.png", ink: { fw: 1143, fh: 527, x: 0, y: 0, w: 1143, h: 527 }, href: kartpipe.report.href ?? "/clients/abs#kartpipe", plates: plates("kartpipe", 3) },
  ];
  const [pick, setPick] = useState("abs");
  const brand = brands.find((b) => b.id === pick) ?? brands[0];
  // Five windows; three on a phone held upright.
  const narrow = useMediaQuery("(orientation: portrait) and (max-width: 639px)");
  const n = narrow ? 3 : 5;

  return (
    <section aria-label={`${item.name}, Luzid and Kartpipe`} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name} — with Luzid and Kartpipe</h2>
      <div className="slide-frame is-logic absolute inset-0 flex items-stretch gap-[clamp(0.75rem,3vw,3rem)]">
        {/* The three logos, one above the other: a pick. --ink: the side of
            the square each logo's ink covers — as large as the column's
            width lets the longest (Luzid's, 2.35 : 1) be, or the height the
            three tabs share, whichever is smaller. */}
        <div className="w-[clamp(4.5rem,15vw,12rem)] shrink-0 [--tabgap:clamp(0.75rem,4vh,2.5rem)] [container-type:size]">
        <div
          role="tablist"
          aria-label="Brands"
          aria-orientation="vertical"
          className="flex h-full flex-col justify-center gap-[var(--tabgap)] [--ink:min(calc((100cqw-1rem)/1.5333),calc((100cqh-2*var(--tabgap)-3rem)/3),7.5rem)]"
        >
          {brands.map((b) => {
            const on = b.id === pick;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={b.name}
                onClick={() => setPick(b.id)}
                className={`group relative flex h-[calc(var(--ink)+1rem)] w-full items-center justify-center rounded-full px-2 outline-none transition-[background-color,opacity,filter] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/50 ${
                  on ? "bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)] ring-2 ring-neutral-900" : "opacity-55 grayscale hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <InkLogo src={b.logo} ink={b.ink} />
                {/* A row of blinking pixels beside the picked one. */}
                {on && (
                  <span aria-hidden className="absolute -right-2 top-1/2 flex -translate-y-1/2 flex-col gap-[3px]">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="pixel-blink block h-[4px] w-[4px] bg-neutral-900" style={{ "--blink": `${1.2 + k * 0.4}s` } as unknown as React.CSSProperties} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        </div>

        {/* A hairline between the logos and their work. */}
        <span aria-hidden className="w-px shrink-0 self-stretch bg-neutral-900/15" />

        {/* The picked brand's windows, the room's full height. --col: one
            square's side — the room's width shared by the windows. */}
        <div
          className="relative min-w-0 flex-1 [--gap:clamp(0.4rem,1.6vw,1.25rem)] [container-type:size]"
          style={{ ["--col" as string]: `min(calc((100cqw - ${n - 1} * var(--gap)) / ${n}), 16rem)` }}
        >
          {brands.map((b) => (
            <BrandWindows key={b.id} brand={b} shown={b.id === pick} active={active} n={n} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={brand.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
