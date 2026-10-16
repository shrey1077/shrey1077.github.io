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

interface Brand {
  id: string;
  name: string;
  logo: string;
  /** The logo's shape (width ÷ height), for its box. */
  aspect: number;
  href: string;
  plates: string[];
}

/** A window's plates: every n-th of the brand's, from its own start; a short
 *  set is turned round so every window shows something different first. */
function windowsOf(all: string[], n: number): string[][] {
  if (all.length >= n * 2) return Array.from({ length: n }, (_, w) => all.filter((_, i) => i % n === w));
  return Array.from({ length: n }, (_, w) => [...all.slice(w % all.length), ...all.slice(0, w % all.length)]);
}

function SlideWindow({ run, reverse, active, tall }: { run: string[]; reverse: boolean; active: boolean; tall: number }) {
  // The plates run twice over, so sliding by one run loops without a seam; a
  // short run is repeated until there are enough to fill the window.
  const want = tall + 2;
  const loop = run.length < want ? Array.from({ length: want }, (_, i) => run[i % run.length]) : run;
  return (
    <li className="art-row group relative w-[var(--col)] shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/10" style={{ height: `calc(var(--col) * ${tall} + ${(tall - 1) * 0.5}rem)` }}>
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
function BrandWindows({ brand, shown, active, n, tall }: { brand: Brand; shown: boolean; active: boolean; n: number; tall: number }) {
  const reduceMotion = !active;
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 12, duration: 0.6, reduceMotion });
  return (
    <div ref={ref} aria-hidden={!shown} className={`absolute inset-0 flex items-center justify-center ${shown ? "" : "invisible"}`}>
      <ul className="flex items-start gap-[var(--gap)]" aria-label={`${brand.name} — work`}>
        {windowsOf(brand.plates, n).map((run, i) => (
          <SlideWindow key={i} run={run} reverse={i % 2 === 1} active={active && shown} tall={tall} />
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
      aspect: 480 / 409,
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
    { id: "luzid", name: luzid.name, logo: luzid.mark ?? "", aspect: 2.4, href: luzid.report.href ?? "/clients/abs#luzid", plates: plates("luzid", 7) },
    { id: "kartpipe", name: kartpipe.name, logo: "/content/clients/abs/kartpipe-logo-black.png", aspect: 1143 / 527, href: kartpipe.report.href ?? "/clients/abs#kartpipe", plates: plates("kartpipe", 3) },
  ];
  const [pick, setPick] = useState("abs");
  const brand = brands.find((b) => b.id === pick) ?? brands[0];
  // Five windows; three on a phone held upright.
  const narrow = useMediaQuery("(orientation: portrait) and (max-width: 639px)");
  const n = narrow ? 3 : 5;
  const tall = narrow ? 4 : 2;

  return (
    <section aria-label={`${item.name}, Luzid and Kartpipe`} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name} — with Luzid and Kartpipe</h2>
      <div className="slide-frame is-logic absolute inset-0 flex items-stretch gap-[clamp(0.75rem,3vw,3rem)]">
        {/* The three logos, one above the other: a pick. */}
        <div role="tablist" aria-label="Brands" aria-orientation="vertical" className="flex w-[clamp(4.5rem,15vw,12rem)] shrink-0 flex-col justify-center gap-[clamp(0.75rem,4vh,2.5rem)]">
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
                className={`group relative block w-full rounded-xl px-2 py-2 outline-none transition-[background-color,opacity,filter] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/50 ${
                  on ? "bg-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.5)] ring-2 ring-neutral-900" : "opacity-55 grayscale hover:opacity-100 hover:grayscale-0"
                }`}
              >
                <span className="relative mx-auto block w-full" style={{ aspectRatio: String(b.aspect), maxHeight: "clamp(2.5rem,13vh,6.5rem)" }}>
                  <Image src={b.logo} alt="" fill sizes="12rem" className="object-contain" />
                </span>
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

        {/* The picked brand's windows. --col: one square's side — the room's
            width shared by the windows, or whatever lets a window's squares
            fit its height, whichever is smaller. */}
        <div
          className="relative min-w-0 flex-1 [--gap:clamp(0.4rem,1.6vw,1.25rem)] [container-type:size]"
          style={{ ["--col" as string]: `min(calc((100cqw - ${n - 1} * var(--gap)) / ${n}), calc((100cqh - ${(tall - 1) * 0.5}rem) / ${tall}), 14rem)` }}
        >
          {brands.map((b) => (
            <BrandWindows key={b.id} brand={b} shown={b.id === pick} active={active} n={n} tall={tall} />
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
