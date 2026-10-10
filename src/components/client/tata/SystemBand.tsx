/**
 * SystemBand — band 02 of the Tata IIS page: the mark's change of voice.
 *
 * ⚠ RE-SET 2026-10-03 (owner: "I like the content of 02, but the typographic
 * composition is poor — make it impeccable"), then made COMPACT the same day
 * (owner: "almost half"). The grid and the hierarchy stand:
 *
 *   · ONE GRID. A margin column carries the band's number, its label and its
 *     rail words, pinned while the band scrolls past (desktop); every other
 *     line in the band starts on the SAME left edge beside it.
 *   · A REAL HIERARCHY. Each movement opens on a full-width rule with its index
 *     (02.1, 02.2) and a serif title; the small letterspaced caps are labels
 *     only, never headings.
 *
 * What went compact: the opening sets its headline and paragraph side by
 * side; 02.1 sets its specimen beside its two steps rather than over them;
 * and the rulebook and the identities are ONE movement now, 02.2 — the three
 * rulebooks, one per identity, as their own plates fanned (BrandDecks, since
 * 2026-10-05; the book mockups before them went on the owner's word). The
 * Tata book's "what the rulebook fixes" text went on the owner's word; the
 * family tree went because it showed the same three marks again under the
 * books, and what it said of each identity (rationale, palette) now stands
 * under that identity's deck.
 *
 * The faces are the page's own two: the Playfair display for headings,
 * Helvetica Condensed for everything else (see TataExperience).
 *
 * ⚠ The claims are sourced — see TATA_LOGO_STORY. The old mark's face is
 * deliberately unnamed.
 *
 * Server Component; BrandDecks brings its own client boundary.
 */

import Image from "next/image";
import { BrandDecks, type BrandDeck } from "@/components/client/tata/BrandDecks";
import { tataPlate } from "@/constants/tataPlates";
import { TATA_IDENTITIES, TATA_LOGO_STORY, TATA_RULEBOOKS, TATA_SYSTEM } from "@/constants/tataStory";

/** Same inset as every other band, so the page's left edge holds. */
const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
/** Labels: small letterspaced caps. Labels only — never a heading. */
const LABEL = "tata-body text-[0.62rem] uppercase tracking-[0.24em] text-neutral-500";
/** Running text: one size and one measure through the whole band. */
const TEXT = "tata-body text-[0.95rem] leading-[1.7] text-neutral-700";
/** The space between movements. */
const MOVEMENT = "mt-12 lg:mt-14";

/** A movement's head: a rule across the full measure, its index, its title. */
function MovementHead({ index, title }: { index: string; title: string }) {
  return (
    <header className="flex items-baseline gap-5 border-t border-neutral-300/80 pt-5">
      <span className="tata-body w-12 shrink-0 text-[0.7rem] tracking-[0.12em] text-neutral-400 tabular-nums">
        {index}
      </span>
      <h3 className="tata-display text-[clamp(1.4rem,2.1vw,1.85rem)] leading-[1.15] text-neutral-900">{title}</h3>
    </header>
  );
}

export function SystemBand() {
  const story = TATA_LOGO_STORY;
  const states = [story.before, story.after];
  const decks: BrandDeck[] = TATA_RULEBOOKS.map((book) => ({
    ...book,
    plates: book.plates.map((src, i) => tataPlate(src, `${book.label} brand guidelines — plate ${i + 1}`)),
  }));

  return (
    <section id="brand" aria-labelledby="tata-system-title" className="scroll-mt-4 border-t border-neutral-200/70 bg-neutral-100/40">
      <div className={`${SHELL} grid grid-cols-1 gap-y-8 py-12 lg:grid-cols-12 lg:gap-x-10 lg:py-16`}>
        {/* ── The margin: number, label, rail. Pinned while the band scrolls. ── */}
        <aside className="lg:col-span-2">
          <div className="flex items-baseline gap-5 lg:sticky lg:top-24 lg:block">
            <p aria-hidden className="tata-display text-[clamp(2.8rem,5.5vw,4.5rem)] leading-[0.85] text-neutral-300">
              {TATA_SYSTEM.number}
            </p>
            <p className={`${LABEL} lg:mt-5`}>{TATA_SYSTEM.kicker}</p>
            {TATA_SYSTEM.rail && (
              <ul aria-hidden className={`${LABEL} mt-10 hidden leading-[2.3] text-neutral-400 lg:block`}>
                {TATA_SYSTEM.rail.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-10">
          {/* ── The opening: headline and paragraph side by side. ── */}
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-10 lg:items-end">
            <h2
              id="tata-system-title"
              className="tata-display text-[clamp(2.3rem,4.4vw,3.75rem)] leading-[1.02] text-neutral-900 lg:col-span-4"
            >
              {TATA_SYSTEM.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="tata-body max-w-[52ch] text-[1.05rem] leading-[1.65] text-neutral-700 lg:col-span-6">
              {TATA_SYSTEM.body}
            </p>
          </div>

          {/* ── 02.1 — before and after: the specimen, its steps beside it. ── */}
          <div className={MOVEMENT}>
            <MovementHead index="02.1" title="Before and after" />
            <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-10 lg:items-center">
              {/* One specimen plate, split down the middle. The two marks share
                  a box height so what changes is the FACE, not the size. */}
              <div className="relative grid grid-cols-1 border border-neutral-300/70 bg-white/70 sm:grid-cols-2 lg:col-span-6">
                {states.map((state, i) => (
                  <figure
                    key={state.label}
                    className={`flex flex-col px-6 pb-6 pt-5 sm:px-8 ${
                      i === 1 ? "border-t border-neutral-300/70 sm:border-l sm:border-t-0" : ""
                    }`}
                  >
                    <span className={LABEL}>{state.label}</span>
                    <span className="relative my-7 block h-12 w-full sm:h-14">
                      <Image
                        src={state.mark}
                        alt={state.markAlt}
                        fill
                        sizes="(max-width: 640px) 80vw, 24vw"
                        className="object-contain"
                      />
                    </span>
                    <figcaption className="tata-body text-center text-[0.8rem] leading-relaxed text-neutral-500">
                      {state.caption}
                    </figcaption>
                  </figure>
                ))}
                {/* The turn, on the seam. */}
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-neutral-300 bg-white text-sm text-neutral-600 sm:grid"
                >
                  →
                </span>
              </div>

              {/* How it happened — a numbered pair. */}
              <ol className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 lg:col-span-4 lg:grid-cols-1">
                {story.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span aria-hidden className="tata-display text-[1.5rem] leading-none text-neutral-300">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="tata-body text-[0.7rem] uppercase tracking-[0.22em] text-neutral-900">
                        {step.title}
                      </h4>
                      <p className="tata-body mt-2 text-[0.9rem] leading-[1.6] text-neutral-700">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ── 02.2 — one vision, three identities: the three rulebooks, the
              parent first. Click one to open it. ── */}
          <div className={MOVEMENT}>
            <MovementHead index="02.2" title={TATA_IDENTITIES.kicker} />
            <p className={`${TEXT} mt-6 max-w-[60ch]`}>{TATA_IDENTITIES.body}</p>
            <div className="mt-10">
              <BrandDecks decks={decks} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
