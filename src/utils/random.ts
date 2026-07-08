/**
 * Deterministic pseudo-random number generation.
 *
 * The brain's ink-hatch texture is generated procedurally (see
 * components/brain/useHemisphereTexture.ts). We want that generation to be
 * *deterministic* — identical on every load — so the art direction is stable,
 * reproducible, and never flickers between refreshes. `Math.random()` cannot
 * give us that, so we use a tiny seeded generator.
 *
 * mulberry32: a compact, fast, well-distributed 32-bit PRNG. More than good
 * enough for visual noise; not for cryptography.
 */

/**
 * Create a seeded random generator. Returns a function that yields the next
 * float in [0, 1) each call.
 *
 * @param seed Any integer. The same seed always produces the same sequence.
 */
/** A 0..1 generator — from `createSeededRandom` (reproducible) or `Math.random`. */
export type SeededRandom = () => number;

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convenience: a seeded float in [min, max). */
export function randomInRange(
  next: () => number,
  min: number,
  max: number,
): number {
  return min + next() * (max - min);
}
