/**
 * SystemBand — band 02 of the Tata IIS page: the mark's change of voice.
 *
 * ⚠ RE-SET 2026-10-03 (owner: "I like the content of 02, but the typographic
 * composition is poor — make it impeccable"). Same words, new composition:
 *
 *   · ONE GRID. A margin column carries the band's number, its label and its
 *     rail words, and stays pinned while the band scrolls past (desktop); every
 *     other line in the band starts on the SAME left edge beside it. Before,
 *     the head sat inset by the number while the three movements under it ran
 *     from the page edge, so nothing lined up.
 *   · A REAL HIERARCHY. Each movement opens on a full-width rule with its index
 *     (02.1–02.3) and a serif title; the small letterspaced caps are kept for
 *     labels only, where they had been doing the work of headings too.
 *   · 02.1 Before and after — one specimen: the two marks centred at the same
 *     size in two halves of a single plate, an arrow on the seam between them,
 *     then the two steps as a numbered pair under the halves.
 *   · 02.2 What the rulebook fixes — the paragraph's lead-in, its five rules as
 *     a ruled list (its own clauses, word for word), its close; the book beside.
 *   · 02.3 One vision, three identities — the paragraph, then the family tree
 *     across the full measure, the campus palettes as swatches.
 *
 * The faces are the page's own two: the Playfair display for headings,
 * Helvetica Condensed for everything else (see TataExperience).
 *
 * ⚠ The claims are sourced — see TATA_LOGO_STORY. The old mark's face is
 * deliberately unnamed.
 *
 * Server Component; BrandBook and TataRoomLink bring their own client
 * boundaries.
 */

import Image from "next/image";
import { BrandBook } from "@/components/client/tata/BrandBook";
import { TataRoomLink } from "@/components/client/tata/TataRoomLink";
import { CAMPUS_INK_AREA, inkBox } from "@/constants/tataExperience";
import {
  TATA_BRAND_BOOK,
  TATA_DNA,
  TATA_IDENTITIES,
  TATA_LOCKUP,
  TATA_LOGO_STORY,
  TATA_SYSTEM,
} from "@/constants/tataStory";

/** Same inset as every other band, so the page's left edge holds. */
const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
/** Labels: small letterspaced caps. Labels only — never a heading. */
const LABEL = "tata-body text-[0.62rem] uppercase tracking-[0.24em] text-neutral-500";
/** The campus marks in the family tree: equal INK, as everywhere on the page
 *  (inkBox), but at a size that holds its own inside the tree's plate — the
 *  page-wide CAMPUS_INK_AREA reads as a footnote there. */
const TREE_INK_AREA = CAMPUS_INK_AREA * 1.75;
/** Running text: one size and one measure through the whole band. */
const TEXT = "tata-body text-[0.95rem] leading-[1.7] text-neutral-700";

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

  return (
    <section aria-labelledby="tata-system-title" className="border-t border-neutral-200/70 bg-neutral-100/40">
      <div className={`${SHELL} grid grid-cols-1 gap-y-10 py-16 lg:grid-cols-12 lg:gap-x-10 lg:py-24`}>
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
          {/* ── The opening ── */}
          <h2
            id="tata-system-title"
            className="tata-display text-[clamp(2.3rem,4.4vw,3.75rem)] leading-[1.02] text-neutral-900"
          >
            {TATA_SYSTEM.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="tata-body mt-7 max-w-[52ch] text-[1.08rem] leading-[1.65] text-neutral-700">
            {TATA_SYSTEM.body}
          </p>

          {/* ── 02.1 — before and after ── */}
          <div className="mt-20 lg:mt-24">
            <MovementHead index="02.1" title="Before and after" />

            {/* One specimen plate, split down the middle. The two marks share a
                box height so what changes is the FACE, not the size. */}
            <div className="relative mt-8 grid grid-cols-1 border border-neutral-300/70 bg-white/70 sm:grid-cols-2">
              {states.map((state, i) => (
                <figure
                  key={state.label}
                  className={`flex flex-col px-7 pb-7 pt-6 sm:px-10 sm:pb-9 ${
                    i === 1 ? "border-t border-neutral-300/70 sm:border-l sm:border-t-0" : ""
                  }`}
                >
                  <span className={LABEL}>{state.label}</span>
                  <span className="relative my-10 block h-16 w-full sm:my-14 sm:h-[4.5rem]">
                    <Image
                      src={state.mark}
                      alt={state.markAlt}
                      fill
                      sizes="(max-width: 640px) 80vw, 34vw"
                      className="object-contain"
                    />
                  </span>
                  <figcaption className="tata-body text-center text-[0.82rem] leading-relaxed text-neutral-500">
                    {state.caption}
                  </figcaption>
                </figure>
              ))}
              {/* The turn, on the seam. */}
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 hidden size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-neutral-300 bg-white text-sm text-neutral-600 sm:grid"
              >
                →
              </span>
            </div>

            {/* How it happened — a numbered pair under the two halves. */}
            <ol className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {story.steps.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span aria-hidden className="tata-display text-[1.75rem] leading-none text-neutral-300">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="tata-body text-[0.7rem] uppercase tracking-[0.22em] text-neutral-900">
                      {step.title}
                    </h4>
                    <p className={`${TEXT} mt-2.5 max-w-[46ch]`}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 02.2 — what the rulebook fixes ── */}
          <div className="mt-20 lg:mt-24">
            <MovementHead index="02.2" title={TATA_DNA.kicker} />
            <div className="mt-8 grid grid-cols-1 items-center gap-x-12 gap-y-12 lg:grid-cols-10">
              <div className="lg:col-span-4">
                <p className={`${TEXT} max-w-[44ch]`}>{TATA_DNA.lead}</p>
                <ol className="mt-5 border-t border-neutral-300/80">
                  {TATA_DNA.rules.map((rule, i) => (
                    <li key={rule} className="flex gap-5 border-b border-neutral-300/80 py-3.5">
                      <span className="tata-body w-6 shrink-0 pt-[0.2rem] text-[0.65rem] tracking-[0.1em] text-neutral-400 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="tata-body text-[0.95rem] leading-snug text-neutral-800">{rule}</span>
                    </li>
                  ))}
                </ol>
                <p className={`${TEXT} mt-6`}>{TATA_DNA.close}</p>
                <div className="mt-6">
                  <TataRoomLink room="brand-guidelines">View brand guidelines</TataRoomLink>
                </div>
              </div>

              <div className="lg:col-span-6">
                <BrandBook
                  title={TATA_BRAND_BOOK.title}
                  plates={TATA_BRAND_BOOK.plates}
                  mockup={TATA_BRAND_BOOK.mockup}
                />
                <p className={`${LABEL} mt-10 text-center text-neutral-400`}>
                  {TATA_BRAND_BOOK.plates.length} plates · click the book to open
                </p>
              </div>
            </div>
          </div>

          {/* ── 02.3 — one vision, three identities ──
              ⚠ The three marks are the SUPPLIED files — the comp's are redrawn
              and wrong in the details. */}
          <div className="mt-20 lg:mt-24">
            <MovementHead index="02.3" title={TATA_IDENTITIES.kicker} />
            <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-10">
              <p className={`${TEXT} max-w-[52ch] lg:col-span-6`}>{TATA_IDENTITIES.body}</p>
              <div className="lg:col-span-4 lg:justify-self-end lg:pt-1">
                <TataRoomLink room="brand-guidelines">Explore brand system</TataRoomLink>
              </div>
            </div>

            {/* The family tree. */}
            <div className="mt-12 border border-neutral-300/70 bg-white/70 px-6 pb-10 pt-10 sm:px-10">
              <div className="flex flex-col items-center">
                <span className={LABEL}>The parent</span>
                <span className="relative mt-5 block h-14 w-full max-w-[16rem]">
                  <Image
                    src={TATA_LOCKUP.parent.logo}
                    alt={`${TATA_LOCKUP.parent.label} logo`}
                    fill
                    sizes="256px"
                    className="object-contain"
                  />
                </span>

                {/* The bracket that makes the three read as one family. */}
                <svg
                  aria-hidden
                  viewBox="0 0 100 16"
                  preserveAspectRatio="none"
                  className="mt-7 hidden h-6 w-1/2 text-neutral-300 sm:block"
                >
                  <path
                    d="M50 0 V6 M0.5 6 H99.5 M0.5 6 V16 M99.5 6 V16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <div className="mt-8 grid w-full grid-cols-1 gap-12 sm:mt-6 sm:grid-cols-2 sm:gap-10">
                  {TATA_LOCKUP.campuses.map((c) => {
                    const box = inkBox(c.ink, TREE_INK_AREA);
                    return (
                      <div key={c.label} className="flex flex-col items-center text-center">
                        <span className={LABEL}>{c.label}</span>
                        <span className="mt-6 flex h-28 w-full items-center justify-center">
                          <span className="relative block" style={{ height: `${box.height}px`, width: `${box.width}px` }}>
                            <Image src={c.logo} alt={`${c.label} logo`} fill sizes="240px" className="object-contain" />
                          </span>
                        </span>
                        <p className="tata-body mt-5 max-w-[36ch] text-[0.88rem] leading-relaxed text-neutral-600">
                          {c.line}
                        </p>
                        {/* The campus palette, from its own rulebook. */}
                        <ul className="mt-6 flex items-start justify-center gap-5">
                          {c.colours.map((col) => (
                            <li key={col.hex} className="flex flex-col items-center gap-2">
                              <span
                                aria-hidden
                                className="block h-7 w-11 ring-1 ring-black/5"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="tata-body text-[0.58rem] uppercase tracking-[0.16em] text-neutral-500">
                                {col.name}
                              </span>
                              <span className="tata-body -mt-1.5 text-[0.55rem] uppercase tracking-[0.08em] text-neutral-400 tabular-nums">
                                {col.hex}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
