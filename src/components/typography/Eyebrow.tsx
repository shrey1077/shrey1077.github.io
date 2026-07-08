/**
 * Eyebrow — a small numbered section label in the logic voice.
 *
 * The recurring structural marker of the interface ("01 — Brand", "03 —
 * Catalogue", "CLIENTS"). Pure markup with the Constitution's meta classes, so
 * it works in Server Components (no motion, no client boundary).
 */

import { typeVoiceClass } from "@/constants/typography";

interface EyebrowProps {
  /** Optional two-digit index rendered before the label ("01"). */
  index?: string;
  children: string;
  className?: string;
}

export function Eyebrow({ index, children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400 ${className}`.trim()}
    >
      {index ? `${index} — ` : ""}
      {children}
    </span>
  );
}
