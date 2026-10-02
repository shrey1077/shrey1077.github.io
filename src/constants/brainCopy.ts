/**
 * The landing's two voices — "Left brain" and "Right brain" (2026-10-02).
 *
 * The layout and the cadence follow a reference the owner supplied: a headline
 * word over "brain", then a stack of short "I am …" lines. ⚠ THE LINES ARE
 * ORIGINAL, written for this portfolio. The reference is a well-known print
 * ad whose copy belongs to its makers, so it is not reproduced here.
 *
 * ⚠ FIVE LINES A SIDE, AND EACH ENDS ON ITS KEY WORD (owner, 2026-10-03): the
 * LAST WORD of every line is set bold (LeftRightBrain's `BoldLast`), so write
 * each line to land on the word that should carry it. Trailing punctuation
 * stays regular weight.
 */

export interface BrainVoice {
  /** The big word: "Left" / "Right". */
  word: string;
  lines: string[];
}

export const LEFT_BRAIN: BrainVoice = {
  word: "Left",
  lines: [
    "I am the left brain. I am logic.",
    "I think in grids, systems and structure.",
    "I measure twice and cut with precision.",
    "Every pixel has a reason, every layer a name.",
    "I turn a tangled brief into a clear plan.",
  ],
};

export const RIGHT_BRAIN: BrainVoice = {
  word: "Right",
  lines: [
    "I am the right brain. I am colour.",
    "I dream in film, in paint, in light.",
    "I prompt, I sketch, I break the grid.",
    "I bring back what the world has lost.",
    "I am everything I imagine.",
  ],
};
