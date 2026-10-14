"use client";

/**
 * ArtSlide — Arts & Crafts on the right side (owner, 2026-10-15: "three rows
 * picture slider showing the works for Arts and Crafts").
 *
 * Three rows of the pieces, each sliding steadily sideways — the middle one
 * the other way — the whole height of the slide between the strip and the
 * band, every row a third of it, so it fits any screen without a scroll.
 * Each row runs its pieces twice over and slides by exactly one run, so the
 * loop has no seam. A row holds still under the pointer, and all three hold
 * still while the slide isn't the one on screen (`active`). The pieces are
 * the small copies (scripts/make-art-thumbs.mjs); a click on one opens the
 * collections in full (/arts-and-crafts), as does "View Full Collection".
 * Reduced motion: the rows stand still.
 */

import Link from "next/link";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";

export interface ArtThumb {
  collection: string;
  src: string;
  w: number;
  h: number;
}

/** Seconds a row takes to slide one piece's width, roughly — so a row of
 *  wide pieces and a row of tall ones move at the same pace. */
const SECONDS_PER_PIECE = 5.5;

/** The pieces dealt into three rows, round-robin by collection so each row
 *  mixes them. */
function deal(thumbs: ArtThumb[]): ArtThumb[][] {
  const rows: ArtThumb[][] = [[], [], []];
  thumbs.forEach((t, i) => rows[i % 3].push(t));
  return rows;
}

export function ArtSlide({ thumbs, active }: { thumbs: ArtThumb[]; active: boolean }) {
  const rows = deal(thumbs);
  return (
    <section aria-label="Arts & Crafts" data-side="creative" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">Arts &amp; Crafts</h2>
      <div className="slide-frame absolute inset-0 flex flex-col gap-2 sm:gap-3">
        {rows.map((row, r) => (
          <div key={r} className="art-row group relative min-h-0 flex-1 overflow-hidden rounded-xl">
            <div
              className={`art-track flex h-full w-max ${r === 1 ? "art-track-reverse" : ""} ${active ? "" : "[animation-play-state:paused]"}`}
              style={{ "--art-duration": `${row.length * SECONDS_PER_PIECE}s` } as unknown as React.CSSProperties}
            >
              {[...row, ...row].map((t, i) => (
                // A margin, not a gap: two runs then measure exactly twice
                // one, and the slide by half is seamless.
                <Link
                  key={`${t.src}-${i}`}
                  href="/arts-and-crafts"
                  prefetch={false}
                  tabIndex={i < row.length ? 0 : -1}
                  aria-hidden={i >= row.length}
                  aria-label={i < row.length ? `${t.collection} — open Arts & Crafts` : undefined}
                  className="relative mr-2 block h-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 outline-none ring-1 ring-neutral-900/10 transition-[filter] duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/50 sm:mr-3"
                  style={{ aspectRatio: `${t.w} / ${t.h}` }}
                >
                  <Image src={t.src} alt="" fill sizes="30vw" className="object-cover" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/arts-and-crafts">
          View Full Collection <span aria-hidden>↗</span>
        </PixelButton>
      </div>
    </section>
  );
}
