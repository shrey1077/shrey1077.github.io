/**
 * Left-hemisphere thoughts — logic, engineering, structure, analysis.
 *
 * Surfaced by the Neuron Engine when a LEFT neuron fires: written by hand, then
 * flipped into precise type (docs/BRAIN_SYSTEM.md). The brief's examples are
 * included verbatim alongside others in the same voice. Data only — the engine
 * (systems/thoughtEngine.ts) owns selection.
 */

import type { Thought } from "@/types/thoughts";

export const LEFT_THOUGHTS: readonly Thought[] = [
  { id: "l-system", text: "Everything starts with a system.", hemisphere: "left", category: "system" },
  { id: "l-less", text: "Less complexity.", hemisphere: "left", category: "simplicity" },
  { id: "l-pattern", text: "Find the pattern.", hemisphere: "left", category: "pattern" },
  { id: "l-hierarchy", text: "Question the hierarchy.", hemisphere: "left", category: "question" },
  { id: "l-simpler", text: "Can this be simpler?", hemisphere: "left", category: "simplicity" },
  { id: "l-pixel", text: "Every pixel has a purpose.", hemisphere: "left", category: "craft" },
  { id: "l-measure", text: "Measure first. Move second.", hemisphere: "left", category: "process" },
  { id: "l-constraints", text: "Constraints sharpen the work.", hemisphere: "left", category: "restraint" },
  { id: "l-name", text: "Name it correctly.", hemisphere: "left", category: "pattern" },
  { id: "l-assume", text: "Question every assumption.", hemisphere: "left", category: "question" },
  { id: "l-remove", text: "What happens if I remove this?", hemisphere: "left", category: "restraint", weight: 0.8 },
  { id: "l-boring", text: "Boring solutions ship.", hemisphere: "left", category: "system", weight: 0.7 },
] as const;
