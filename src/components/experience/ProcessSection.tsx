/**
 * ProcessSection — a section body walking through how the work was made.
 *
 * Framework only (Phase 2.6): renders `ProcessStep[]` as a quiet numbered
 * sequence with hairline separators, or an elegant placeholder while a client
 * has no process data yet. Future phases may add scroll-linked step reveals —
 * inside this component, callers unchanged.
 */

import type { ProcessStep } from "@/types/experience";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface ProcessSectionProps {
  steps: ProcessStep[];
}

export function ProcessSection({ steps }: ProcessSectionProps) {
  if (steps.length === 0) {
    return (
      <p className={`${META} text-xs text-neutral-400`}>Process forthcoming</p>
    );
  }

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="grid grid-cols-[3rem_1fr] gap-4 border-t border-neutral-200 py-6 first:border-t-0 first:pt-0"
        >
          <span className={`${META} pt-1 text-[0.6rem] tabular-nums text-neutral-400`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-base font-medium text-neutral-900">{step.title}</h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-500">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
