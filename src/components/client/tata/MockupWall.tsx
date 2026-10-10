"use client";

/**
 * MockupWall — band 04 of the Tata IIS page: every themed mockup at once, on
 * three rows that drift past (2026-10-05).
 *
 * ⚠ IT REPLACED THE THEME SLIDER, which showed one mockup at a time behind a
 * three-way switch — sixty-eight pieces, one screen tall, and a click for each.
 * The owner asked for the work in "the minimal amount of scrolls"; on the wall
 * all of it goes by in under a screen, and nothing has to be clicked to be
 * seen.
 *
 *   · The three themes are MIXED, each spread evenly through the whole run, so
 *     every stretch of the wall shows all three voices side by side — which is
 *     the point the band makes. The legend in the margin lifts one theme out
 *     (hover to look, click to hold), dimming the other two.
 *   · Pointing at the wall stops it; the line under it names what is pointed
 *     at; a click opens it full size and walks the rest from there.
 *   · Reduced motion: the rows stand still and scroll sideways instead.
 *
 * The tiles are thumbnails (scripts/prepare-tata-thumbs.mjs); the viewer loads
 * the full file.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { SideBand, SIDE_LINK } from "@/components/client/tata/SideBand";
import { TataViewer, type TataPlate, type ViewerState } from "@/components/client/tata/TataViewer";
import type { TataBand } from "@/constants/tataStory";

export interface WallTheme {
  id: string;
  label: string;
  colour: string;
}

export type ThemedPlate = TataPlate & { theme: string };

/** Rows on the wall, and the seconds each tile takes to cross its own width —
 *  the rows are different lengths, so the time is set per tile, not per row. */
const ROWS = 3;
const SECONDS_PER_TILE = 4.2;

/** Every theme spread evenly through one run: each plate is placed at its own
 *  fraction of the way through its theme, and the run is sorted on that. */
function interleave(plates: readonly ThemedPlate[]): ThemedPlate[] {
  const count: Record<string, number> = {};
  for (const p of plates) count[p.theme] = (count[p.theme] ?? 0) + 1;
  const seen: Record<string, number> = {};
  return plates
    .map((p) => {
      const i = (seen[p.theme] = (seen[p.theme] ?? 0) + 1) - 1;
      return { p, at: (i + 0.5) / count[p.theme] };
    })
    .sort((a, b) => a.at - b.at)
    .map((x) => x.p);
}

export function MockupWall({
  band,
  plates,
  themes,
  href,
}: {
  band: TataBand;
  plates: readonly ThemedPlate[];
  themes: readonly WallTheme[];
  /** The mockups' own catalogue page. */
  href: string;
}) {
  const reduceMotion = useReducedMotion();
  const run = useMemo(() => interleave(plates), [plates]);
  const rows = useMemo(
    () => Array.from({ length: ROWS }, (_, r) => run.filter((_, i) => i % ROWS === r)),
    [run],
  );
  const [held, setHeld] = useState<string | null>(null);
  const [peek, setPeek] = useState<string | null>(null);
  const [pointed, setPointed] = useState<ThemedPlate | null>(null);
  const [viewing, setViewing] = useState<ViewerState>(null);
  const lifted = peek ?? held;
  const themeOf = (id: string) => themes.find((t) => t.id === id);

  const legend = (
    <div>
      <p className="tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500">In three themes</p>
      <ul className="mt-3 space-y-1">
        {themes.map((t) => {
          const n = plates.filter((p) => p.theme === t.id).length;
          const on = lifted === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={held === t.id}
                onMouseEnter={() => setPeek(t.id)}
                onMouseLeave={() => setPeek(null)}
                onFocus={() => setPeek(t.id)}
                onBlur={() => setPeek(null)}
                onClick={() => setHeld((h) => (h === t.id ? null : t.id))}
                className={`group flex w-full cursor-pointer items-center gap-3 py-1 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-neutral-900/30 ${
                  lifted && !on ? "opacity-45" : "opacity-100"
                }`}
              >
                <span
                  aria-hidden
                  className={`block size-3 shrink-0 rounded-full ring-2 transition-[box-shadow] ${on ? "ring-neutral-900/25" : "ring-transparent"}`}
                  style={{ backgroundColor: t.colour }}
                />
                <span className="tata-body flex-1 text-[0.8rem] text-neutral-800">{t.label}</span>
                <span className="tata-body text-[0.66rem] tabular-nums text-neutral-400">{n}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link href={href} className={`${SIDE_LINK} mt-6`}>
        All {plates.length} mockups <span aria-hidden>→</span>
      </Link>
    </div>
  );

  const tile = (p: ThemedPlate, copy: boolean) => {
    const dim = lifted !== null && p.theme !== lifted;
    return (
      <li key={`${p.url}${copy ? "~" : ""}`} className="h-full shrink-0">
        <button
          type="button"
          tabIndex={copy ? -1 : undefined}
          aria-label={copy ? undefined : `${themeOf(p.theme)?.label}: ${p.name} — open full size`}
          onClick={() => setViewing({ plates: run, at: run.indexOf(p) })}
          onMouseEnter={() => setPointed(p)}
          onFocus={() => setPointed(p)}
          className={`group/tile relative block aspect-[3/2] h-full cursor-zoom-in overflow-hidden bg-neutral-200 outline-none ring-1 ring-black/5 transition-[opacity,filter] duration-500 focus-visible:ring-2 focus-visible:ring-neutral-900/50 ${
            dim ? "opacity-20 grayscale" : "opacity-100"
          }`}
        >
          <Image
            src={p.thumb}
            alt=""
            fill
            sizes="240px"
            className="object-cover transition-transform duration-700 ease-out group-hover/tile:scale-[1.05]"
          />
          {/* The theme, as a dot in the corner — the wall mixes all three. */}
          <span
            aria-hidden
            className="absolute bottom-1.5 left-1.5 block size-2 rounded-full ring-2 ring-white/80"
            style={{ backgroundColor: themeOf(p.theme)?.colour }}
          />
        </button>
      </li>
    );
  };

  return (
    <SideBand band={band} id="tata-mockups-title" anchor="mockups" ground="bg-neutral-100/40" aside={legend}>
      <div
        role="region"
        aria-label={`All ${plates.length} mockups, moving — point at the wall to stop it`}
        className="tata-drift-wall"
        onMouseLeave={() => setPointed(null)}
      >
        <div className="space-y-2.5 [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
          {rows.map((row, r) => (
            <div
              key={r}
              className={`h-[clamp(6rem,10.5vw,9.5rem)] ${reduceMotion ? "overflow-x-auto" : "overflow-hidden"}`}
            >
              <div
                className="tata-drift flex h-full w-max"
                data-reverse={r % 2 === 1}
                style={{ "--drift": `${row.length * SECONDS_PER_TILE}s` } as React.CSSProperties}
              >
                {/* Two identical runs, each closing on one gap, so sliding the
                    track by half lands the second exactly where the first was. */}
                <ul className="flex h-full gap-2.5 pr-2.5">{row.map((p) => tile(p, false))}</ul>
                {!reduceMotion && (
                  <ul aria-hidden className="flex h-full gap-2.5 pr-2.5">
                    {row.map((p) => tile(p, true))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* What is pointed at. */}
        <p aria-hidden className="tata-body mt-4 flex min-h-[1.25rem] items-center gap-2.5 text-[0.8rem] text-neutral-700">
          {pointed ? (
            <>
              <span className="block size-2 shrink-0 rounded-full" style={{ backgroundColor: themeOf(pointed.theme)?.colour }} />
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500">{themeOf(pointed.theme)?.label}</span>
              <span className="truncate">{pointed.name}</span>
            </>
          ) : (
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-neutral-400">
              Point to stop · click to open
            </span>
          )}
        </p>
      </div>

      <TataViewer state={viewing} onChange={setViewing} />
    </SideBand>
  );
}
