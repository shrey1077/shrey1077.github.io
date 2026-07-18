/**
 * ExperienceHero — the opening identity block of an experience page.
 *
 * Eyebrow (logic meta) · display title (creative serif — or the client's own
 * brand voice when the experience declares a `brandTheme`; the title reads
 * `--brand-font` and falls back to Fraunces) · tagline (plain) · optional
 * stats row (mono facts: "180+ artifacts · 13 categories…"), the case-study
 * convention of leading with the engagement's numbers.
 */

import { typeVoiceClass } from "@/constants/typography";

interface ExperienceHeroProps {
  /** Small structural line above the title ("Client — Enterprise · Systems"). */
  eyebrow: string;
  title: string;
  tagline?: string;
  /** Engagement facts, rendered as a quiet stats row under the tagline. */
  stats?: { value: string; label: string }[];
}

export function ExperienceHero({ eyebrow, title, tagline, stats }: ExperienceHeroProps) {
  return (
    <header className="py-14 sm:py-16">
      <span
        className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
      >
        {eyebrow}
      </span>
      <h1
        className="mt-4 text-5xl text-neutral-900 sm:text-7xl"
        style={{
          fontFamily: "var(--brand-font, var(--font-fraunces))",
          letterSpacing: "var(--brand-tracking, -0.025em)",
        }}
      >
        {title}
      </h1>
      {tagline && (
        <p className="mt-5 max-w-xl text-base font-light text-neutral-500">
          {tagline}
        </p>
      )}
      {stats && stats.length > 0 && (
        <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-neutral-200 pt-6">
          {stats.map((stat) => (
            // flex-col-reverse keeps valid dt→dd source order, value on top.
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt
                className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}
              >
                {stat.label}
              </dt>
              <dd
                className="text-2xl font-light tabular-nums"
                style={{ color: "var(--brand-accent, #171717)" }}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}
