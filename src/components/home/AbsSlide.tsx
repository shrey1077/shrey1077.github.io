"use client";

/**
 * AbsSlide — ABS Wholesale with the two brands built there, Luzid and
 * Kartpipe, three in one (owner, 2026-10-15). Second version, the same day:
 * "keep three circles at top with brand logos and below them show portrait
 * sliders, 2 square images vertically, for each".
 *
 *        ( ABS )          ( Luzid )        ( Kartpipe )
 *        ┌─────┐          ┌─────┐          ┌─────┐
 *        │  ■  │          │  ■  │ ↓        │  ■  │
 *        │  ■  │ ↑        │  ■  │          │  ■  │ ↑
 *        └─────┘          └─────┘          └─────┘
 *
 * Each circle is the brand's mark (Kartpipe has none on disk: its name, set
 * in type) and opens its part of the ABS page. Under each, a portrait window
 * two squares tall, through which the brand's own plates slide steadily —
 * the middle one the other way — holding still under the pointer and while
 * the slide isn't on screen. Every plate is cropped to a square. Each column
 * is sized so the circle and its two squares fit the screen's height whole.
 * Reduced motion: the columns stand still.
 */

import Link from "next/link";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { ABS_BRANDS, type Showcase } from "@/constants/showcase";

const WORK = "/content/clients/abs/work";
/** Seconds for one plate to slide by. */
const SECONDS_PER_PLATE = 3.2;

interface Column {
  name: string;
  mark?: string;
  href: string;
  plates: string[];
}

function BrandColumn({ col, reverse, active }: { col: Column; reverse: boolean; active: boolean }) {
  // The plates run twice over, so sliding by one run loops without a seam;
  // a short run is repeated until there are enough to fill the window.
  const run = col.plates.length < 4 ? [...col.plates, ...col.plates] : col.plates;
  return (
    <li className="flex min-h-0 flex-col items-center gap-[clamp(0.5rem,2vh,1.1rem)]">
      {/* The circle. */}
      <Link
        href={col.href}
        prefetch={false}
        aria-label={`${col.name} — open its page`}
        className="group relative grid aspect-square w-[var(--disc)] shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_14px_34px_-18px_rgba(0,0,0,0.55)] ring-1 ring-neutral-900/15 outline-none transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:ring-2 hover:ring-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        {col.mark ? (
          <span className="relative block h-[58%] w-[64%]">
            <Image src={col.mark} alt="" fill sizes="120px" className="object-contain" />
          </span>
        ) : (
          <span className="face-logic px-2 text-center text-[calc(var(--disc)*0.15)] leading-none text-neutral-900">{col.name}</span>
        )}
      </Link>
      {/* The window: two squares tall. */}
      <div className="art-row group relative w-[var(--col)] shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/10" style={{ height: "calc(var(--col) * 2 + 0.5rem)" }}>
        <div
          className={`abs-track flex flex-col ${reverse ? "abs-track-reverse" : ""} ${active ? "" : "[animation-play-state:paused]"}`}
          style={{ "--abs-duration": `${run.length * SECONDS_PER_PLATE}s` } as unknown as React.CSSProperties}
        >
          {[...run, ...run].map((src, i) => (
            <span key={`${src}-${i}`} className="relative mb-2 block aspect-square w-full shrink-0 overflow-hidden rounded-xl">
              <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

export function AbsSlide({ item, active }: { item: Showcase; active: boolean }) {
  const [luzid, kartpipe] = ABS_BRANDS;
  const cols: Column[] = [
    { name: "ABS Wholesale", mark: item.mark, href: item.report.href ?? "/clients/abs", plates: ["01", "02", "03", "04", "05", "06"].map((n) => `${WORK}/abs-house/${n}.webp`) },
    { name: luzid.name, mark: luzid.mark, href: luzid.report.href ?? "/clients/abs#luzid", plates: ["01", "02", "03", "04", "06", "07"].map((n) => `${WORK}/luzid/${n}.webp`) },
    { name: kartpipe.name, href: kartpipe.report.href ?? "/clients/abs#kartpipe", plates: ["01", "02", "03"].map((n) => `${WORK}/kartpipe/${n}.webp`) },
  ];
  return (
    <section aria-label={`${item.name}, Luzid and Kartpipe`} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name} — with Luzid and Kartpipe</h2>
      {/* --col: one square's side — a third of the width less the gaps, or
          whatever lets the circle and two squares fit the frame's height,
          whichever is smaller. --disc: the circle. */}
      <div className="slide-frame is-logic absolute inset-0 flex items-center justify-center [container-type:size]">
        <ul
          className="grid grid-cols-3 items-start gap-[var(--gap)] [--gap:clamp(0.6rem,3vw,3rem)] [--col:min(calc((100cqw-2*var(--gap))/3),calc((100cqh-2.5rem)/2.6),15rem)] [--disc:calc(var(--col)*0.55)]"
        >
          {cols.map((c, i) => (
            <BrandColumn key={c.name} col={c} reverse={i === 1} active={active} />
          ))}
        </ul>
      </div>
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={item.report.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
