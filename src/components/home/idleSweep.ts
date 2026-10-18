/**
 * idleSweep — how the landing's two pictures move on their own (2026-10-12,
 * owner: "instead of video moving with mouse movement i want the video always
 * moving zig zag from left to right and vice versa, only when the mouse moves
 * it stops at that exact point. when mouse is inactive for 1 second it starts
 * again. Similarly for first slide picture element").
 *
 * The brain's turn (BrainSequence) and the portrait orb's seam (PortraitOrb)
 * each SWEEP, left to right and back, without end, and a second of stillness
 * lets it carry on from wherever it is, so it never jumps. What the pointer
 * does in between differs: the orb's sweep holds where the pointer catches
 * it; since 2026-10-19 the brain turns TO the pointer instead (owner: "i want
 * the brain video to be linked to mouse horizontal movement") — so the watch
 * also keeps where across the screen the pointer last was (`at`).
 *
 * The sweep eases into each turn (a cosine), so it slows at either end and
 * swings through the middle rather than bouncing off the edges.
 */

/** Seconds for one sweep there and back. */
export const SWEEP_PERIOD = 8;
/** The pointer must be still this long before the sweep carries on. */
export const IDLE_MS = 1000;
/** Where a sweep starts, in turns: the middle, heading right — the pictures
 *  open on their even split, as they always did. */
export const SWEEP_START = 0.25;

/** The sweep's position, 0 (left) … 1 (right), at `phase` turns. */
export const sweepAt = (phase: number) => (1 - Math.cos(2 * Math.PI * phase)) / 2;

/** The phase, in turns, at which the sweep stands at `u` (0 … 1): on its way
 *  right (`rising`) or on its way back. */
export const phaseAt = (u: number, rising: boolean) => {
  const half = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * u))) / (2 * Math.PI);
  return rising ? half : 1 - half;
};

/** A pointer watch for one picture: `held(now)` is true for IDLE_MS after any
 *  pointer movement, and `at()` is where across the screen the pointer last
 *  was, 0 (left edge) … 1 (right), or null before it has moved. Call `stop()`
 *  to remove the listener. */
export function watchPointer() {
  let last = -Infinity;
  let x: number | null = null;
  const onMove = (e: PointerEvent) => {
    last = performance.now();
    x = Math.max(0, Math.min(1, e.clientX / Math.max(1, window.innerWidth)));
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return {
    held: (now: number) => now - last < IDLE_MS,
    at: () => x,
    stop: () => window.removeEventListener("pointermove", onMove),
  };
}
