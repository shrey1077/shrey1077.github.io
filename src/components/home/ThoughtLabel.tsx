"use client";

/**
 * ThoughtLabel — the museum wall label beneath the sculpture (Phase 3B).
 *
 * The homepage's first thought — "Every project begins as a thought." — is not
 * a headline; it performs the Typography Constitution itself: written by hand,
 * held for a breath, then flipped letter-by-letter into set type. The line IS
 * the portfolio's thesis, demonstrated rather than stated.
 *
 * Timed to begin after the canvas has settled (the sculpture first, then the
 * label). Desktop only (lg+): the small-screen hero keeps its two clean bands.
 * Non-interactive; screen readers get the sentence immediately via aria-label.
 */

import { TypeReveal } from "@/components/typography/TypeReveal";

/** The homepage's opening thought. Future phases may rotate these (idea engine). */
const FIRST_THOUGHT = "Every project begins as a thought.";

/** Begin after the canvas fade (1.4s) has mostly settled. */
const THOUGHT_DELAY_S = 1.6;

export function ThoughtLabel() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[7%] z-10 hidden justify-center lg:flex"
    >
      <TypeReveal
        text={FIRST_THOUGHT}
        voice="thought"
        variant="label"
        reveal="pipeline"
        delay={THOUGHT_DELAY_S}
        finalVoice="logic"
        finalVariant="meta"
        // Wrapper size feeds the handwritten letters (they inherit); the final
        // letters carry their own smaller size — thought condensing into
        // precise type.
        className="text-center text-2xl leading-relaxed text-neutral-700"
        finalClassName="text-[0.62rem] text-neutral-500"
      />
    </div>
  );
}
