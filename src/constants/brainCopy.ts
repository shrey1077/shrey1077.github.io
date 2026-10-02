/**
 * The landing's two voices — "Left brain" and "Right brain" (2026-10-02).
 *
 * The layout and the cadence follow a reference the owner supplied: a headline
 * word over "brain", then a stack of short "I am …" lines. ⚠ THE LINES ARE
 * ORIGINAL, written for this portfolio. The reference is a well-known print
 * ad whose copy belongs to its makers, so it is not reproduced here — edit
 * these freely; nothing else reads their length beyond the stagger.
 */

export interface BrainVoice {
  /** The big word: "Left" / "Right". */
  word: string;
  lines: string[];
}

export const LEFT_BRAIN: BrainVoice = {
  word: "Left",
  lines: [
    "I am the left brain.",
    "I am the designer who measures twice.",
    "I think in grids, systems and type scales.",
    "I name every layer. I keep the guidelines open.",
    "Methodical. Structured. Precise.",
    "I turn a tangled brief into a clear plan.",
    "I believe in kerning, margins and deadlines.",
    "Logic is my sketchbook.",
    "I am structure. I am reason.",
    "I know why every pixel is where it is.",
  ],
};

export const RIGHT_BRAIN: BrainVoice = {
  word: "Right",
  lines: [
    "I am the right brain.",
    "I am colour. I am the first wild sketch.",
    "I am the film that plays when I close my eyes.",
    "I am light through a lens, paint on my hands.",
    "I prompt, I dream, I break the grid.",
    "I am the spark in a frame at three in the morning.",
    "I am texture, rhythm, the cut on the beat.",
    "I bring back the birds the world lost.",
    "I am wonder. I feel.",
    "I am everything I imagine.",
  ],
};
