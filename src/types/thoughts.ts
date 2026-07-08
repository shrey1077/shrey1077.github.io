/**
 * Thought Engine type definitions.
 *
 * A "thought" is a fragment the brain surfaces when a neuron fires
 * (docs/BRAIN_SYSTEM.md → Neuron / Thought engines). Two independent data
 * sources feed it: constants/thoughts/leftThoughts.ts (logic) and
 * rightThoughts.ts (creative). The engine samples them weighted, honors a
 * per-thought cooldown, and avoids obvious repeats.
 */

import type { Hemisphere } from "@/types/brain";

/** Coarse grouping — lets a firing bias toward a mood without hardcoding text. */
export type ThoughtCategory =
  | "system"
  | "simplicity"
  | "pattern"
  | "question"
  | "craft"
  | "curiosity"
  | "process"
  | "restraint";

export interface Thought {
  /** Stable id (keying, cooldown tracking, analytics later). */
  id: string;
  /** The fragment itself — short enough to write, pause, and flip in ~4s. */
  text: string;
  /** Which hemisphere surfaces it. */
  hemisphere: Hemisphere;
  /** Sampling weight (default 1). Rare thoughts sit below 1. */
  weight?: number;
  /** Coarse mood. */
  category: ThoughtCategory;
  /** Minimum seconds before this exact thought may surface again. */
  cooldown?: number;
}
