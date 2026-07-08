/**
 * Right-hemisphere thoughts — creativity, art, imagination, storytelling.
 *
 * Surfaced by the Neuron Engine when a RIGHT neuron fires, then dissolved back
 * into colour (docs/BRAIN_SYSTEM.md). The brief's examples are included
 * verbatim. Data only — the engine owns selection.
 */

import type { Thought } from "@/types/thoughts";

export const RIGHT_THOUGHTS: readonly Thought[] = [
  { id: "r-lighter", text: "What if this felt lighter?", hemisphere: "right", category: "curiosity" },
  { id: "r-thought", text: "Every project begins as a thought.", hemisphere: "right", category: "process" },
  { id: "r-curiosity", text: "Curiosity first.", hemisphere: "right", category: "curiosity" },
  { id: "r-sketch", text: "Sketch before deciding.", hemisphere: "right", category: "process" },
  { id: "r-disappear", text: "Design should disappear.", hemisphere: "right", category: "restraint" },
  { id: "r-remove", text: "What happens if I remove this?", hemisphere: "right", category: "restraint", weight: 0.8 },
  { id: "r-color", text: "Colour remembers what words forget.", hemisphere: "right", category: "craft" },
  { id: "r-empty", text: "The empty page is already a picture.", hemisphere: "right", category: "curiosity" },
  { id: "r-accident", text: "Every accident auditions.", hemisphere: "right", category: "process" },
  { id: "r-story", text: "People keep stories, not slides.", hemisphere: "right", category: "craft" },
  { id: "r-play", text: "Play is quiet research.", hemisphere: "right", category: "curiosity" },
  { id: "r-begin", text: "Begin before you're ready.", hemisphere: "right", category: "process", weight: 0.8 },
] as const;
