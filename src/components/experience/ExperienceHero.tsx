/**
 * ExperienceHero — the opening identity block of an experience page.
 *
 * A brand-accent kicker · eyebrow (logic meta) · display title (the client's
 * own brand voice via `--brand-font`, optionally UPPERCASE via
 * `--brand-transform`, falling back to Fraunces) · tagline · optional stats
 * row (mono facts led by bold accent numerals) — the case-study convention of
 * opening on the engagement's numbers.
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
      <div className="flex items-center gap-3">
        {/* Brand-accent kicker — the one spot of the client's colour up top. */}
        <span
          aria-hidden
          className="h-px w-8"
          style={{ backgroundColor: "var(--brand-accent, #171717)" }}
        />
        <span className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-500`}>
          {eyebrow}
        </span>
      </div>
      <h1
        className="mt-5 text-5xl text-neutral-900 sm:text-7xl"
        style={{
          fontFamily: "var(--brand-font, var(--font-fraunces))",
          letterSpacing: "var(--brand-tracking, -0.025em)",
          textTransform: "var(--brand-transform, none)" as React.CSSProperties["textTransform"],
        }}
      >
        {title}
      </h1>
      {tagline && (
        <p className="mt-5 max-w-xl text-base font-light text-neutral-600">
          {tagline}
        </p>
      )}
      {stats && stats.length > 0 && (
        <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-neutral-200 pt-6">
          {stats.map((stat) => (
            // flex-col-reverse keeps valid dt→dd source order, value on top.
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt
                className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-500`}
              >
                {stat.label}
              </dt>
              <dd
                className="text-3xl font-medium tabular-nums sm:text-4xl"
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
