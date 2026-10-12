"use client";

/**
 * RealityWall — band 06 of the Tata IIS page: Mockups to reality, every
 * installed piece at once (2026-10-05).
 *
 * ⚠ IT REPLACED RealityPairs, which showed one design-and-photograph pair at
 * a time, large, with the unpaired pieces in a strip below — 1,400px of band
 * for twelve photographs. Here all twelve stand in three justified rows, each
 * at its own proportions, and the band is about a screen:
 *
 *   · A piece whose design the archive holds carries it INSET in its corner,
 *     so design and reality read together without a click. Pointing at the
 *     tile swaps them — the design large, the photograph inset.
 *   · A click opens the piece full size; the viewer walks every picture in
 *     the band, each design just before its photograph.
 *
 * Below `lg` the rows give way to a plain grid of even tiles, three across:
 * three justified rows on a phone would be thumbnails.
 */

import { useState } from "react";
import Image from "next/image";
import { TataViewer, type TataPlate, type ViewerState } from "@/components/client/tata/TataViewer";

export interface RealityTile {
  slug: string;
  caption: string;
  kind: string;
  photo: TataPlate;
  design?: TataPlate;
}

/** Rows on the wall at `lg`. */
const ROWS = 3;

/** The tiles cut into `k` rows, in order, as evenly as their widths allow —
 *  every row is one height, so a row's width is the sum of its aspects. */
function rowsOf(tiles: readonly RealityTile[], k: number): RealityTile[][] {
  const ar = tiles.map((t) => t.photo.w / t.photo.h);
  const goal = ar.reduce((a, b) => a + b, 0) / k;
  let best: number[] = [];
  let bestCost = Infinity;
  // Every way to cut n into k runs — twelve tiles, three rows: 55 ways.
  const walk = (from: number, cuts: number[]) => {
    if (cuts.length === k - 1) {
      const edges = [0, ...cuts, tiles.length];
      let cost = 0;
      for (let r = 0; r < k; r++) {
        const sum = ar.slice(edges[r], edges[r + 1]).reduce((a, b) => a + b, 0);
        cost += (sum - goal) ** 2;
      }
      if (cost < bestCost) {
        bestCost = cost;
        best = edges;
      }
      return;
    }
    for (let c = from + 1; c < tiles.length - (k - 1 - cuts.length) + 1; c++) walk(c, [...cuts, c]);
  };
  walk(0, []);
  return Array.from({ length: k }, (_, r) => tiles.slice(best[r], best[r + 1]));
}

export function RealityWall({ tiles }: { tiles: readonly RealityTile[] }) {
  const [viewing, setViewing] = useState<ViewerState>(null);
  const rows = rowsOf(tiles, Math.min(ROWS, tiles.length));
  // The viewer's walk: each design just before its photograph.
  const walk: TataPlate[] = tiles.flatMap((t) =>
    t.design
      ? [{ ...t.design, name: `${t.caption} — the design` }, { ...t.photo, name: `${t.caption} — on campus` }]
      : [{ ...t.photo, name: `${t.caption} — on campus` }],
  );
  const open = (t: RealityTile) =>
    setViewing({ plates: walk, at: walk.findIndex((p) => p.url === t.photo.url) });

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:block lg:space-y-2">
        {rows.map((row, r) => (
          <div key={r} className="contents lg:flex lg:gap-2">
            {row.map((t) => {
              const ar = t.photo.w / t.photo.h;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => open(t)}
                  aria-label={`${t.caption}, ${t.kind.toLowerCase()}${t.design ? ", with its design" : ""} — open full size`}
                  style={{ "--ar": ar } as React.CSSProperties}
                  className="group relative block aspect-[4/5] min-w-0 cursor-zoom-in overflow-hidden bg-neutral-900 outline-none ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-neutral-900/50 lg:aspect-[var(--ar)] lg:[flex:var(--ar)_1_0%]"
                >
                  {/* The photograph. With a design, it trades places with it
                      under the pointer. */}
                  <span
                    className={`absolute inset-0 block transition-opacity duration-500 ${
                      t.design ? "group-hover:opacity-0 group-focus-visible:opacity-0" : ""
                    }`}
                  >
                    <Image
                      src={t.photo.thumb}
                      alt={`${t.caption}, ${t.kind.toLowerCase()}`}
                      fill
                      sizes="(max-width: 1024px) 46vw, 300px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </span>

                  {t.design && (
                    <>
                      {/* The design, large — shown under the pointer. */}
                      <span className="absolute inset-0 block bg-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Image src={t.design.thumb} alt={`${t.caption} — the design`} fill sizes="300px" className="object-contain p-3" />
                      </span>
                      {/* The other one, inset in the corner: the design at rest,
                          the photograph under the pointer. */}
                      <span className="absolute bottom-2 left-2 block w-[38%] max-w-[7.5rem] shadow-[0_6px_16px_rgba(0,0,0,0.35)] ring-1 ring-white/80">
                        <span
                          className="relative block bg-white"
                          style={{ aspectRatio: `${t.design.w} / ${t.design.h}` }}
                        >
                          <span className="absolute inset-0 block transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0">
                            <Image src={t.design.thumb} alt="" fill sizes="120px" className="object-contain" />
                          </span>
                          <span className="absolute inset-0 block bg-neutral-900 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                            <Image src={t.photo.thumb} alt="" fill sizes="120px" className="object-cover" />
                          </span>
                        </span>
                      </span>
                    </>
                  )}

                  {/* What it is — named under the pointer. */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 flex translate-y-[-0.25rem] flex-col items-start gap-0.5 bg-gradient-to-b from-black/60 to-transparent px-2.5 pb-6 pt-2 text-left opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <span className="tata-body text-[0.52rem] uppercase tracking-[0.2em] text-white/75">{t.kind}</span>
                    <span className="tata-body text-[0.8rem] leading-tight text-white">{t.caption}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <TataViewer state={viewing} onChange={setViewing} />
    </div>
  );
}
