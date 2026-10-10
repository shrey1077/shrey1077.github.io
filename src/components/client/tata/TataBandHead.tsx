/**
 * TataBandHead — the head of a full-width band on the Tata IIS page: the
 * number, the kicker and headline, and the paragraph, in one row; the band's
 * work then runs the full measure beneath it.
 *
 * Band 03, the handbook, uses it: its circle of points round the page needs
 * the whole width. Bands 04–07 did too until 2026-10-05, when their heads
 * moved into a margin column beside the work to save the height (SideBand).
 */

import type { TataBand } from "@/constants/tataStory";

const KICKER = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

export function TataBandHead({
  band,
  id,
  aside,
  dark = false,
}: {
  band: TataBand;
  /** The heading's id, for the section's aria-labelledby. */
  id: string;
  /** Something small under the paragraph — a link, a count. */
  aside?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-end gap-x-10 gap-y-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
      {/* The number is decoration — the heading carries the meaning. */}
      <p
        aria-hidden
        className={`tata-display self-start text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.85] ${
          dark ? "text-white/25" : "text-neutral-300"
        }`}
      >
        {band.number}
      </p>
      <div>
        <span className={dark ? KICKER.replace("text-neutral-500", "text-white/55") : KICKER}>{band.kicker}</span>
        <h2
          id={id}
          className={`tata-display mt-4 text-[clamp(1.55rem,2.7vw,2.25rem)] leading-[1.12] ${
            dark ? "text-white" : "text-neutral-900"
          }`}
        >
          {band.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
      </div>
      <div className="max-w-[52ch]">
        <p className={`tata-body text-[0.95rem] leading-relaxed ${dark ? "text-white/70" : "text-neutral-700"}`}>
          {band.body}
        </p>
        {aside && <div className="mt-5">{aside}</div>}
      </div>
    </div>
  );
}
