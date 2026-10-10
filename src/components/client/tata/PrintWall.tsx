"use client";

/**
 * PrintWall — band 05 of the Tata IIS page: Print, all sixteen subsections on
 * one wall (2026-10-05).
 *
 * ⚠ IT REPLACED THE PRINT ROOM LAID OPEN — a theme slider, then sixteen tiles
 * that each opened a slider of their own, 2,400px of band. Here every
 * subsection is one tile and the whole wall is under a screen:
 *
 *   · In the owner's order, "from the hand to the wall" — calling cards first,
 *     stationery last — with the four deepest subsections (Boards, Posters,
 *     Brochures, Flyers) set at four times the size.
 *   · Each tile TURNS THROUGH ITS OWN PIECES, a couple of tiles at a time, so
 *     the wall shows far more than sixteen pictures without asking for a
 *     click. It turns only while on screen, holds the tile under the pointer,
 *     and stands still for reduced motion.
 *   · A click opens the subsection full size, from the piece showing, and
 *     walks every piece in it.
 *
 * The tiles are thumbnails (scripts/prepare-tata-thumbs.mjs); the viewer loads
 * the full file.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SideBand } from "@/components/client/tata/SideBand";
import { TataFader } from "@/components/client/tata/TataFader";
import { TataViewer, type TataPlate, type ViewerState } from "@/components/client/tata/TataViewer";
import type { TataBand } from "@/constants/tataStory";

export interface PrintTile {
  key: string;
  label: string;
  plates: readonly TataPlate[];
  /** Which plates the TILE turns through, when not all of them — see
   *  PrintBand's PREVIEW. The viewer always walks them all. */
  previews?: readonly number[];
}

/** How many tiles are set large — the deepest subsections. */
const BIG = 4;
/** One tick turns this many tiles; a tick every STEP_MS. With sixteen tiles
 *  each one turns about every twelve seconds. */
const PER_TICK = 2;
const STEP_MS = 1500;
/** A tile turns through at most this many pieces; the viewer has them all. */
const CYCLE = 8;
/** The order tiles take their turn in — scattered, so the change moves round
 *  the wall instead of reading left to right. */
const ORDER = [5, 12, 2, 9, 14, 0, 7, 11, 3, 15, 8, 1, 13, 6, 10, 4];

export function PrintWall({ band, tiles }: { band: TataBand; tiles: readonly PrintTile[] }) {
  const reduceMotion = useReducedMotion();
  const wallRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [tick, setTick] = useState(0);
  const [held, setHeld] = useState<{ key: string; at: number } | null>(null);
  const [viewing, setViewing] = useState<ViewerState>(null);

  const big = new Set(
    [...tiles].sort((a, b) => b.plates.length - a.plates.length).slice(0, BIG).map((t) => t.key),
  );
  const pieces = tiles.reduce((n, t) => n + t.plates.length, 0);
  const order = ORDER.filter((i) => i < tiles.length);

  useEffect(() => {
    const el = wallRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = window.setInterval(() => setTick((n) => n + 1), STEP_MS);
    return () => window.clearInterval(t);
  }, [inView, reduceMotion]);

  /** Which of its pieces tile `i` is showing: how many turns it has had,
   *  round the plates it previews. */
  const showing = (i: number, t: PrintTile) => {
    if (held?.key === t.key) return held.at;
    const q = order.indexOf(i);
    const turns = Math.max(0, Math.floor((tick * PER_TICK - q + order.length - 1) / order.length));
    const cycle = (t.previews ?? t.plates.map((_, k) => k)).slice(0, CYCLE);
    return cycle[turns % cycle.length] ?? 0;
  };

  const aside = (
    <p className="tata-body text-[0.62rem] uppercase leading-[1.9] tracking-[0.2em] text-neutral-500 tabular-nums">
      {tiles.length} subsections · {pieces} pieces
      <span className="block text-neutral-400">Each tile turns through its own · click to open</span>
    </p>
  );

  return (
    <SideBand band={band} id="tata-print-title" anchor="print" aside={aside}>
      <div ref={wallRef} className="@container">
        <ul
          className="grid auto-rows-[calc((100cqw_-_1rem)/3)] grid-cols-3 gap-2 sm:grid-flow-dense sm:auto-rows-[calc((100cqw_-_1.5rem)/4)] sm:grid-cols-4 lg:auto-rows-[calc((100cqw_-_3rem)/7)] lg:grid-cols-7"
        >
          {tiles.map((t, i) => {
            const at = showing(i, t);
            const plate = t.plates[at];
            const large = big.has(t.key);
            return (
              <li key={t.key} className={large ? "sm:col-span-2 sm:row-span-2" : ""}>
                <button
                  type="button"
                  onClick={() => setViewing({ plates: t.plates, at })}
                  onMouseEnter={() => setHeld({ key: t.key, at })}
                  onMouseLeave={() => setHeld(null)}
                  aria-label={`${t.label} — ${t.plates.length} ${t.plates.length === 1 ? "piece" : "pieces"}, open full size`}
                  className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-white/85 text-left outline-none ring-1 ring-neutral-200 transition-[box-shadow,background-color] duration-500 hover:bg-white hover:ring-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                >
                  {/* The piece, standing in the tile like a specimen. */}
                  <span className={`absolute inset-x-[9%] top-[8%] block ${large ? "bottom-[17%]" : "bottom-[27%]"}`}>
                    {plate && (
                      <TataFader
                        src={plate.thumb}
                        sizes={large ? "(max-width: 640px) 31vw, 260px" : "(max-width: 640px) 31vw, 130px"}
                        className="object-contain [filter:drop-shadow(0_5px_7px_rgba(0,0,0,0.13))] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-2.5 pb-2">
                    <span
                      className={`tata-body uppercase leading-[1.25] tracking-[0.12em] text-neutral-800 ${
                        large ? "text-[0.66rem]" : "text-[0.56rem]"
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="tata-body shrink-0 text-[0.6rem] tabular-nums text-neutral-400">{t.plates.length}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <TataViewer state={viewing} onChange={setViewing} />
    </SideBand>
  );
}
