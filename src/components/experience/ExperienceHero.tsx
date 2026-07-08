/**
 * ExperienceHero — the opening identity block of an experience page.
 *
 * Eyebrow (logic meta) · display title (creative serif) · tagline (plain).
 * Extracted from the Phase 2.5 client header so every experience — client or
 * future section experience — opens with the same confident beat.
 */

import { typeVoiceClass } from "@/constants/typography";

interface ExperienceHeroProps {
  /** Small structural line above the title ("Client — Enterprise · Systems"). */
  eyebrow: string;
  title: string;
  tagline?: string;
}

export function ExperienceHero({ eyebrow, title, tagline }: ExperienceHeroProps) {
  return (
    <header className="py-14 sm:py-16">
      <span
        className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
      >
        {eyebrow}
      </span>
      <h1
        className={`${typeVoiceClass("creative", "display")} mt-4 text-5xl tracking-tight text-neutral-900 sm:text-7xl`}
      >
        {title}
      </h1>
      {tagline && (
        <p className="mt-5 max-w-xl text-base font-light text-neutral-500">
          {tagline}
        </p>
      )}
    </header>
  );
}
