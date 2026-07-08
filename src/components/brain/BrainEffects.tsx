"use client";

/**
 * BrainEffects — the brain's effects subsystem (reserved mount point).
 *
 * Rendered INSIDE the brain group (so effects inherit its rotation/scale).
 * This is where the Phase 3 systems attach, each gated on `currentPhase`:
 *
 *   • procedural circuits crawling the LEFT hemisphere,
 *   • paint flow bleeding from the RIGHT hemisphere,
 *   • neuron sparks / idea particles rising from the fissure,
 *   • the Thought Engine's visualized thoughts (systems/thoughtEngine.ts,
 *     constants/thoughts/) — since Phase 4, the neuron flows own this on the
 *     DOM layer; a future 3D visualization could attach here.
 *
 * CONTRACT: effects are additive children — they must never mutate the brain
 * meshes or geometry, and their per-frame work follows the hot-path rules in
 * docs/BRAIN_SYSTEM.md. Renders nothing today, deliberately: an empty group
 * costs nothing and gives future systems a stable, named home.
 */

export function BrainEffects() {
  return null;
}
