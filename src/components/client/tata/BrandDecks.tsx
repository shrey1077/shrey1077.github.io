"use client";

/**
 * BrandDecks — band 02's three rulebooks, as their own plates: Tata IIS, IIS
 * Ahmedabad, IIS Mumbai (2026-10-05).
 *
 * ⚠ IT REPLACED BrandShelf's BOOK MOCKUPS. The owner did not like them, and
 * two of the three were not even photographs — the campus books were the Tata
 * mockup with a campus mark pasted onto its cover. What stands here instead is
 * the rulebook itself: its first four plates, flat, squared up in a cascade
 * like a deck set down on the table, the cover on top. Pointing at a deck
 * fans it open; a click opens every plate full size, from the cover.
 *
 * Under each deck, who it is — the parent or a campus, its rationale in its
 * own rulebook's words, its palette — because in the compact band the decks
 * ARE "one vision, three identities".
 */

import { useState } from "react";
import Image from "next/image";
import { TataViewer, type TataPlate, type ViewerState } from "@/components/client/tata/TataViewer";

export interface BrandDeck {
  id: string;
  label: string;
  /** "The parent" or "Campus". */
  role: string;
  /** What the identity stands for, in its own rulebook's words. */
  line: string;
  colours: readonly { hex: string; name: string }[];
  /** Every plate, the cover first. */
  plates: readonly TataPlate[];
}

/** Plates in the cascade, and the step between them — as fractions of the
 *  deck's width. A plate is PLATE wide; each one behind sits STEP_X further
 *  right and STEP_Y higher, so the last one's edge meets the deck's. */
const SHOWN = 4;
const PLATE = 0.8;
const STEP_X = (1 - PLATE) / (SHOWN - 1);
const STEP_Y = 0.045;
/** The plates' own proportions (the rulebooks are A4 landscape, ~1.41:1). */
const PLATE_AR = 1600 / 1138;
const DECK_H = PLATE / PLATE_AR + STEP_Y * (SHOWN - 1);

export function BrandDecks({ decks }: { decks: readonly BrandDeck[] }) {
  const [viewing, setViewing] = useState<ViewerState>(null);

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
        {decks.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setViewing({ plates: d.plates, at: 0 })}
              aria-label={`Open the ${d.label} brand guidelines — ${d.plates.length} plates`}
              className="group block w-full cursor-zoom-in text-left outline-none"
            >
              <span className="relative block w-full" style={{ aspectRatio: `1 / ${DECK_H}` }}>
                {d.plates
                  .slice(0, SHOWN)
                  .map((p, i) => ({ p, i }))
                  .reverse()
                  .map(({ p, i }) => (
                    <span
                      key={p.url}
                      // The cover (i = 0) in front at the foot; each plate
                      // behind it a step up and to the right. Pointed at, the
                      // ones behind swing up round their lower-left corner.
                      className="absolute block origin-bottom-left bg-white shadow-[0_12px_26px_-10px_rgba(0,0,0,0.28)] ring-1 ring-black/10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:rotate(0deg)] group-hover:[transform:translate(var(--fan-x),0)_rotate(var(--fan-r))] group-focus-visible:[transform:translate(var(--fan-x),0)_rotate(var(--fan-r))]"
                      style={
                        {
                          left: `${i * STEP_X * 100}%`,
                          bottom: `${(i * STEP_Y * 100) / DECK_H}%`,
                          width: `${PLATE * 100}%`,
                          aspectRatio: `${PLATE_AR}`,
                          "--fan-x": `${i * 3}%`,
                          "--fan-r": `${i * -2.6}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <Image src={p.thumb} alt="" fill sizes="(max-width: 640px) 80vw, 26vw" className="object-cover" />
                    </span>
                  ))}
              </span>
              <span className="mt-6 block border-t border-neutral-300/80 pt-3 group-focus-visible:border-neutral-900">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="tata-body text-[0.6rem] uppercase tracking-[0.22em] text-neutral-500">{d.role}</span>
                  <span className="tata-body shrink-0 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500 tabular-nums transition-colors group-hover:text-neutral-900">
                    {d.plates.length} plates · Open
                  </span>
                </span>
                <span className="tata-display mt-1.5 block text-[1.2rem] leading-tight text-neutral-900">{d.label}</span>
              </span>
            </button>
            <p className="tata-body mt-2.5 text-[0.85rem] leading-relaxed text-neutral-600">{d.line}</p>
            {d.colours.length > 0 && (
              <ul aria-label={`${d.label} palette`} className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {d.colours.map((col) => (
                  <li key={col.hex} className="flex items-center gap-2">
                    <span aria-hidden className="block size-4 ring-1 ring-black/5" style={{ backgroundColor: col.hex }} />
                    <span className="tata-body text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      {col.name} <span className="tabular-nums text-neutral-400">{col.hex}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <TataViewer state={viewing} onChange={setViewing} />
    </>
  );
}
