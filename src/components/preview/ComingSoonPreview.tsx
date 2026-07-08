"use client";

/**
 * ComingSoonPreview — the placeholder body for sections not yet implemented.
 *
 * Every nav section except Clients renders this in Phase 2.x. Deliberately
 * quiet: the section name (logic meta) and a serif "Coming soon", nothing more.
 */

import { typeVoiceClass } from "@/constants/typography";

interface ComingSoonPreviewProps {
  label: string;
}

export function ComingSoonPreview({ label }: ComingSoonPreviewProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <span
        className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
      >
        {label}
      </span>
      <p
        className={`${typeVoiceClass("creative", "meta")} mt-4 text-3xl font-light text-neutral-900 sm:text-4xl`}
      >
        Coming soon
      </p>
    </div>
  );
}
