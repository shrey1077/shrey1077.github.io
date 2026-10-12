/**
 * idleSweep — how the landing's two pictures move on their own (2026-10-12,
 * owner: "instead of video moving with mouse movement i want the video always
 * moving zig zag from left to right and vice versa, only when the mouse moves
 * it stops at that exact point. when mouse is inactive for 1 second it starts
 * again. Similarly for first slide picture element").
 *
 * The brain's turn (BrainSequence) and the portrait orb's seam (PortraitOrb)
 * each SWEEP, left to right and back, without end. Any movement of the pointer
 * holds the sweep where it is — not where the pointer is — and a second of
 * stillness lets it carry on from that very point, so it never jumps. Until
 * then both followed the pointer instead.
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

/** A pointer watch for one picture: `held(now)` is true for IDLE_MS after any
 *  pointer movement. Call `stop()` to remove the listener. */
export function watchPointer() {
  let last = -Infinity;
  const onMove = () => {
    last = performance.now();
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return {
    held: (now: number) => now - last < IDLE_MS,
    stop: () => window.removeEventListener("pointermove", onMove),
  };
}
