/**
 * Brain Operating System — system registry.
 *
 * The homepage is composed of independent animation systems (docs/BRAIN_SYSTEM.md).
 * Each can be enabled/disabled here (and live via the dev panel), so the
 * installation can be tuned, profiled, or simplified without touching component
 * code. Order documents the intended layering back-to-front.
 */

export type BrainSystemId =
  | "brainCore"
  | "logicalFlow"
  | "creativeFlow"
  | "detailLayer"
  | "neuronEngine"
  | "interactionEngine"
  | "memoryTransition";

export interface BrainSystemConfig {
  id: BrainSystemId;
  /** Human label for the dev panel. */
  label: string;
  /** Default enabled state (production ships these). */
  enabled: boolean;
}

export const BRAIN_SYSTEMS: readonly BrainSystemConfig[] = [
  { id: "brainCore", label: "Brain Core", enabled: true },
  { id: "logicalFlow", label: "Logical Flow (L)", enabled: true },
  { id: "creativeFlow", label: "Creative Flow (R)", enabled: true },
  { id: "detailLayer", label: "Detail Layer (R)", enabled: true },
  { id: "neuronEngine", label: "Neuron Engine", enabled: true },
  { id: "interactionEngine", label: "Interaction", enabled: true },
  { id: "memoryTransition", label: "Memory Transition", enabled: true },
] as const;

/** Neuron firing cadence — one side fires every 5–8s (the brief). Interleaved
 *  so left and right rarely fire together. */
export const NEURON_CADENCE = {
  minGapMs: 5000,
  maxGapMs: 8000,
  /** Stagger the two sides so a left and right fire don't overlap. */
  sideOffsetMs: 3000,
} as const;

/** Global caps to keep the GPU/DOM light regardless of timing. */
export const FLOW_LIMITS = {
  /** Max simultaneously-alive logical items (circuits, glyphs, graphs). */
  logicalItems: 14,
  /** Max simultaneously-alive detail-layer doodles. */
  detailItems: 16,
  /** Creative color-breath canvas runs at this fps (not every rAF). */
  creativeFps: 30,
} as const;
