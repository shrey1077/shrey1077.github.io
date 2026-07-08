/**
 * ExperienceNavigation — the quiet in-page section index of an experience.
 *
 * A single mono-meta row of anchor links ("01 Brand · 02 Structure · …") under
 * the hero. Plain `<a href="#…">` — the page's smooth scroll-behavior carries
 * the motion, and ExperienceSection's scroll-margin keeps landings breathable.
 * Server-renderable; data comes from the composing page (ExperienceAnchor[]).
 */

import type { ExperienceAnchor } from "@/types/experience";
import { typeVoiceClass } from "@/constants/typography";

interface ExperienceNavigationProps {
  anchors: ExperienceAnchor[];
}

export function ExperienceNavigation({ anchors }: ExperienceNavigationProps) {
  if (anchors.length === 0) return null;

  return (
    <nav
      aria-label="Sections"
      className={`${typeVoiceClass("logic", "meta")} flex flex-wrap items-baseline gap-x-6 gap-y-2 pb-10 text-[0.65rem]`}
    >
      {anchors.map((a) => (
        <a
          key={a.anchor}
          href={`#${a.anchor}`}
          className="group text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900"
        >
          <span className="mr-1.5 text-neutral-300 transition-colors duration-300 group-hover:text-neutral-500">
            {a.index}
          </span>
          {a.title}
        </a>
      ))}
    </nav>
  );
}
