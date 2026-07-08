/**
 * thoughtEngine — selection logic for the brain's surfacing thoughts.
 *
 * Given a hemisphere, returns the next thought to surface: weighted-random, but
 * with two guards so the homepage never feels like a shuffled playlist —
 *
 *   • per-thought COOLDOWN — a thought can't resurface for `cooldown` seconds
 *     (default 45), and
 *   • RECENCY — the last few picks per side are excluded outright, so nothing
 *     obviously repeats.
 *
 * Stateful (module-scoped recency/cooldown maps) but framework-free and cheap;
 * one engine instance is fine since there is one homepage. Deterministic when
 * given a seeded RNG (utils/random) — otherwise `Math.random`.
 */

import type { Hemisphere } from "@/types/brain";
import type { Thought } from "@/types/thoughts";
import { LEFT_THOUGHTS } from "@/constants/thoughts/leftThoughts";
import { RIGHT_THOUGHTS } from "@/constants/thoughts/rightThoughts";

const DEFAULT_COOLDOWN_S = 45;
/** How many recent picks per side to exclude from the next draw. */
const RECENCY_WINDOW = 4;

const pools: Record<Hemisphere, readonly Thought[]> = {
  left: LEFT_THOUGHTS,
  right: RIGHT_THOUGHTS,
};

/** Last-surfaced timestamp (seconds) per thought id. */
const lastSurfaced = new Map<string, number>();
/** Recent pick ids per side (most-recent last). */
const recent: Record<Hemisphere, string[]> = { left: [], right: [] };

function weightedPick(candidates: Thought[], next: () => number): Thought {
  const total = candidates.reduce((sum, t) => sum + (t.weight ?? 1), 0);
  let target = next() * total;
  for (const t of candidates) {
    target -= t.weight ?? 1;
    if (target <= 0) return t;
  }
  return candidates[candidates.length - 1];
}

/**
 * Pick the next thought for a side.
 * @param nowSeconds monotonic clock in seconds (performance.now()/1000).
 * @param next       0..1 RNG (seeded for reproducibility, or Math.random).
 */
export function nextThought(
  hemisphere: Hemisphere,
  nowSeconds: number,
  next: () => number = Math.random,
): Thought {
  const pool = pools[hemisphere];
  const recentIds = recent[hemisphere];

  // Eligible = off cooldown AND not in the recency window.
  let candidates = pool.filter((t) => {
    const last = lastSurfaced.get(t.id);
    const cooled = last === undefined || nowSeconds - last >= (t.cooldown ?? DEFAULT_COOLDOWN_S);
    return cooled && !recentIds.includes(t.id);
  });
  // Relax gracefully if everything is cooling: drop cooldown, keep recency;
  // then drop recency too. The pool is small enough that this is rare.
  if (candidates.length === 0) candidates = pool.filter((t) => !recentIds.includes(t.id));
  if (candidates.length === 0) candidates = [...pool];

  const chosen = weightedPick(candidates, next);

  lastSurfaced.set(chosen.id, nowSeconds);
  recentIds.push(chosen.id);
  if (recentIds.length > RECENCY_WINDOW) recentIds.shift();

  return chosen;
}

/** Reset engine memory (tests / hot-reload cleanliness). */
export function resetThoughtEngine(): void {
  lastSurfaced.clear();
  recent.left = [];
  recent.right = [];
}
