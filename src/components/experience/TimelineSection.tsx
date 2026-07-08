/**
 * TimelineSection — a section body laying work out chronologically.
 *
 * Framework only (Phase 2.6): renders `TimelineEntry[]` down a hairline spine
 * with dot terminals (the system's line language), or an elegant placeholder
 * while empty. Will also serve the future Career Path section.
 */

import type { TimelineEntry } from "@/types/experience";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface TimelineSectionProps {
  entries: TimelineEntry[];
}

export function TimelineSection({ entries }: TimelineSectionProps) {
  if (entries.length === 0) {
    return (
      <p className={`${META} text-xs text-neutral-400`}>Timeline forthcoming</p>
    );
  }

  return (
    <ol className="relative ml-1 flex flex-col gap-10 border-l border-neutral-200 pl-8">
      {entries.map((entry) => (
        <li key={`${entry.when}-${entry.title}`} className="relative">
          {/* Dot on the spine — the rule-and-dot language of the navigation. */}
          <span
            aria-hidden
            className="absolute -left-8 top-1.5 size-[5px] -translate-x-1/2 rounded-full bg-neutral-300"
          />
          <span className={`${META} text-[0.6rem] text-neutral-400`}>{entry.when}</span>
          <h3 className="mt-1 text-base font-medium text-neutral-900">{entry.title}</h3>
          {entry.note && (
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
              {entry.note}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
