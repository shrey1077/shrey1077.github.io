/**
 * SideBand — a numbered band of the Tata IIS page with its words in a margin
 * column and its work beside them (2026-10-05).
 *
 * ⚠ WHY THE HEAD MOVED TO THE SIDE. The owner asked for everything after the
 * handbook to show all the work "in the minimal amount of scrolls". Bands
 * 04–07 set their number, headline and paragraph in a row ABOVE the work
 * (TataBandHead, git has it) — some 250px of every band before a single piece
 * appeared. Beside the work, the same words cost no height at all, and each
 * band comes down to about one screen. The margin column is the one band 02
 * already uses, so the page's left edge still holds from 02 to the end.
 *
 * `aside` sits under the paragraph — a legend, a count, a link. The head is
 * pinned while a band taller than the screen scrolls past (desktop).
 *
 * No hooks and no client APIs, so a client band can render it too.
 */

import type { TataBand } from "@/constants/tataStory";

const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
const KICKER = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

export function SideBand({
  band,
  id,
  anchor,
  ground = "bg-white/45",
  aside,
  children,
}: {
  band: TataBand;
  /** The heading's id, for the section's aria-labelledby. */
  id: string;
  /** The section's own id — what the hero's index links to. */
  anchor?: string;
  ground?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={anchor} aria-labelledby={id} className={`scroll-mt-4 border-t border-neutral-200/70 ${ground}`}>
      <div className={`${SHELL} grid grid-cols-1 gap-y-7 py-12 lg:grid-cols-12 lg:gap-x-10 lg:py-14`}>
        <header className="lg:col-span-3">
          <div className="lg:sticky lg:top-8">
            <div className="flex items-baseline gap-4 lg:block">
              {/* The number is decoration — the heading carries the meaning. */}
              <p aria-hidden className="tata-display text-[clamp(2.6rem,4.6vw,4rem)] leading-[0.85] text-neutral-300">
                {band.number}
              </p>
              <span className={`${KICKER} lg:mt-5 lg:block`}>{band.kicker}</span>
            </div>
            <h2 id={id} className="tata-display mt-4 text-[clamp(1.55rem,2.4vw,2.1rem)] leading-[1.12] text-neutral-900">
              {band.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            {band.body && (
              <p className="tata-body mt-4 max-w-[52ch] text-[0.88rem] leading-relaxed text-neutral-700">{band.body}</p>
            )}
            {aside && <div className="mt-6">{aside}</div>}
          </div>
        </header>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}

/** The small "All 85 →" link a band's aside carries. */
export const SIDE_LINK =
  "tata-body inline-flex items-center gap-2 border-b border-neutral-300 pb-0.5 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900";
