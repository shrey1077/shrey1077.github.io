"use client";

/**
 * AbsSlide — three in one (owner, 2026-10-15: "ABS in top half, and Luzid and
 * Kartpipe in lower half of slide, yes 3 in one slide"): ABS Wholesale across
 * the top, the two brands built there side by side under it.
 *
 * Each panel is a row of the brand's own plates (the ABS page's), its mark
 * and a button over the corner: Luzid's and Kartpipe's open their sections of
 * the ABS page, and "View Full Project" (bottom right, like every project)
 * the page itself. The rows thin out on a portrait screen — fewer, wider
 * plates — so the slide always fits whole.
 */

import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { ABS_BRANDS, type Showcase } from "@/constants/showcase";

const WORK = "/content/clients/abs/work";

interface Panel {
  name: string;
  line: string;
  mark?: string;
  /** The panel's own button; ABS's is the slide's corner button. */
  href?: string;
  plates: string[];
}

function BrandPanel({ panel, wide }: { panel: Panel; wide?: boolean }) {
  return (
    <div className="relative min-h-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-900/10">
      {/* The plates, side by side — two for the top panel on a portrait
          screen, one each for the two below. */}
      <div
        className={`absolute inset-0 flex gap-1.5 ${
          wide ? "portrait:[&>*:nth-child(n+3)]:hidden" : "portrait:[&>*:nth-child(n+2)]:hidden"
        }`}
      >
        {panel.plates.map((src) => (
          <span key={src} className="relative min-w-0 flex-1">
            <Image src={src} alt="" fill sizes={wide ? "25vw" : "18vw"} className="object-cover" />
          </span>
        ))}
      </div>
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-transparent to-transparent" />
      {/* The brand, over the corner. */}
      <div className="absolute bottom-2.5 left-2.5 flex max-w-[calc(100%-1.25rem)] flex-col items-start gap-2 rounded-xl bg-white/90 p-2.5 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:bottom-3.5 sm:left-3.5 sm:p-3">
        <span className="flex min-w-0 items-center gap-2.5">
          {panel.mark && (
            <span className="relative block h-7 w-12 shrink-0 sm:h-9 sm:w-16">
              <Image src={panel.mark} alt="" fill sizes="64px" className="object-contain object-left" />
            </span>
          )}
          <span className="min-w-0">
            <span className="face-logic block truncate text-[clamp(0.95rem,1.6vw,1.45rem)] leading-none text-neutral-900">
              {panel.name}
            </span>
            <span className="mt-1 block truncate text-[0.66rem] text-neutral-500 max-sm:hidden">{panel.line}</span>
          </span>
        </span>
        {panel.href && (
          <PixelButton side="logic" size="sm" href={panel.href}>
            View <span className="max-sm:hidden">{panel.name}</span> <span aria-hidden>→</span>
          </PixelButton>
        )}
      </div>
    </div>
  );
}

export function AbsSlide({ item }: { item: Showcase }) {
  const [luzid, kartpipe] = ABS_BRANDS;
  const abs: Panel = {
    name: item.name,
    line: "Wholesale · Distribution — Santa Fe Springs, California",
    mark: item.mark,
    plates: ["02", "03", "04", "06"].map((n) => `${WORK}/abs-house/${n}.webp`),
  };
  const brand = (b: Showcase, folder: string, plates: string[]): Panel => ({
    name: b.name,
    line: b.sector,
    mark: b.mark,
    href: b.report.href,
    plates: plates.map((n) => `${WORK}/${folder}/${n}.webp`),
  });
  return (
    <section aria-label={`${item.name}, Luzid and Kartpipe`} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name} — with Luzid and Kartpipe</h2>
      <div className="slide-frame is-logic absolute inset-0 grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-2.5 sm:gap-3">
        <BrandPanel panel={abs} wide />
        <div className="grid min-h-0 grid-cols-2 gap-2.5 sm:gap-3">
          <BrandPanel panel={brand(luzid, "luzid", ["01", "02", "06"])} />
          <BrandPanel panel={brand(kartpipe, "kartpipe", ["01", "02", "03"])} />
        </div>
      </div>
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={item.report.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
