"use client";

/**
 * BrainSequence — the brain turntable as a preloaded image sequence.
 *
 * Replaces the video scrub (which stuttered: every mouse frame set
 * `video.currentTime`, and seeking VP9-with-alpha is expensive). Here the small
 * scrub window is a set of still frames, preloaded once and drawn to a canvas —
 * so scrubbing is just picking an already-decoded frame. No seeking, no lag.
 *
 * ⚠ IT SWEEPS ON ITS OWN since 2026-10-12 (owner: "instead of video moving
 * with mouse movement i want the video always moving zig zag from left to
 * right and vice versa"): the turn runs from the first frame to the last and
 * back, eased at each end, without end; any pointer movement holds it on the
 * frame it is on, and a second of stillness lets it carry on from there (see
 * idleSweep). The sweep drives the frame directly — a spring would carry it
 * on past the moment the pointer moved. Until then the pointer's X scrubbed
 * the turn, through a critically-damped spring. Reduced motion parks on the
 * middle frame.
 *
 * The canvas is tagged `data-brain`, with `data-frame` carrying the frame on
 * screen. From 2026-10-03 to 2026-10-10 BrainDock read it — the brain docked
 * beside every room was a live copy of this canvas; the rooms' circles hold
 * stills of the first and last frames now (BrainDock).
 *
 * MODES. On the landing the turn sweeps ("sweep"). The others are unused
 * since 2026-10-10 (HeroStage passes none — "sweep" is the default): they rocked
 * the brain for the rooms' live dock through the end of the turn that faced
 * the dock's side: frames
 * 0–20, the grey half turned to the viewer, beside the logic rooms ("left");
 * 27–47, the colour half, beside the creative ones ("right"). The same
 * spring carries every change, so a switch of mode turns the brain rather
 * than cutting it.
 *
 * ⚠ THE ALPHA DOES MATTER TO ONE THING, offline. BrainTraces ends the logic
 * pins' runs inside a band of these frames that was measured to be opaque in
 * ALL 48 of them, so the line ends stay hidden wherever the pointer scrubs.
 * Re-encoding changes nothing, but REPLACING the artwork means re-measuring that
 * band (the numbers and how they were taken are in BrainTraces).
 *
 * ⚠ ALL FRAMES PRELOAD EAGERLY on mount — the whole sequence lands before the
 * hero is interactive. At 9.39MB (2026-08-21, after the q75 re-encode) that is
 * most of the homepage's weight. Encoding has been tuned; this strategy has
 * not. If time-to-interactive is ever the complaint rather than total transfer,
 * this loop is the thing to change, not the encoder settings.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SWEEP_PERIOD, SWEEP_START, sweepAt, watchPointer } from "@/components/home/idleSweep";

const FRAME_COUNT = 48;
const BASE = "/brain/frames";
/** The frames' own pixel size. Exported because BrainTraces maps points given
 *  in FRAME pixels onto the stage, and has to agree with the canvas about it. */
export const BRAIN_FRAME_W = 1280;
export const BRAIN_FRAME_H = 720;
const W = BRAIN_FRAME_W;
const H = BRAIN_FRAME_H;
/** Rows cleared off the foot of every frame — see `draw`. */
const FRAME_EDGE_ROWS = 3;

/** Critically-damped spring for the scrub follow (the old video's feel). */
const STIFFNESS = 26;
const DAMPING = 2 * Math.sqrt(STIFFNESS);

/** Opaque until the far right, then a short fade — see the note on the canvas. */
const FEATHER = "linear-gradient(to right, #000 0%, #000 88%, transparent 100%)";

export type BrainMode = "sweep" | "left" | "right";

/** Seconds for one rock there and back, in the rooms. */
const ROCK_PERIOD = 7;
/** The frames each room side rocks through (see MODES). */
const ROCK: Record<Exclude<BrainMode, "sweep">, [number, number]> = {
  left: [0, 20],
  right: [47, 27],
};

export function BrainSequence({ active = true, mode = "sweep" }: { active?: boolean; mode?: BrainMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const modeRef = useRef(mode);
  useLayoutEffect(() => {
    activeRef.current = active;
    modeRef.current = mode;
  }, [active, mode]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rest = (FRAME_COUNT - 1) / 2;
    const restIdx = Math.round(rest);
    const frames: HTMLImageElement[] = [];

    const draw = (img: HTMLImageElement) => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      // ⚠ Every frame carries a full-width grey rule in its last two rows (718
      //   and 719 — an export edge, measured 2026-10-02), which read on the
      //   landing as a hairline under the brain. The owner asked for it gone;
      //   nothing of the brain reaches those rows (it ends by ~620).
      ctx.clearRect(0, H - FRAME_EDGE_ROWS, W, FRAME_EDGE_ROWS);
    };

    // Preload every frame; paint the resting frame the instant it arrives.
    let painted = false;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!painted && i === restIdx) {
          draw(img);
          painted = true;
        }
      };
      img.src = `${BASE}/${String(i).padStart(3, "0")}.webp`;
      frames[i] = img;
    }

    let target = rest,
      pos = rest,
      vel = 0,
      last = 0,
      raf = 0,
      cur = -1;

    // The sweep: how far round it has come (turns), advanced only while the
    // pointer is still — so it holds wherever the pointer catches it.
    let phase = SWEEP_START;
    const pointer = reduceMotion ? null : watchPointer();

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      if (!activeRef.current) return;

      const m = modeRef.current;
      if (m === "sweep") {
        if (pointer && !pointer.held(t)) phase += dt / SWEEP_PERIOD;
        target = sweepAt(phase) * (FRAME_COUNT - 1);
      } else {
        // Rocking in a room: from the end that shows the most of this side,
        // eased there and back (cosine), the spring smoothing any switch.
        const [a, b] = ROCK[m];
        const u = reduceMotion ? 0 : (1 - Math.cos(((t / 1000) % ROCK_PERIOD) / ROCK_PERIOD * Math.PI * 2)) / 2;
        target = a + (b - a) * u;
      }

      if (reduceMotion && m === "sweep") {
        pos = rest;
      } else if (m === "sweep") {
        // Straight onto the sweep: it is smooth already, and it must stop the
        // moment the pointer moves, not glide on.
        pos = target;
        vel = 0;
      } else if (reduceMotion) {
        pos = target;
      } else {
        // Critically-damped spring — smooth ease-in and ease-out, no overshoot.
        const accel = STIFFNESS * (target - pos) - DAMPING * vel;
        vel += accel * dt;
        pos += vel * dt;
      }

      const idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(pos)));
      if (idx !== cur) {
        const img = frames[idx];
        if (img && img.complete && img.naturalWidth) {
          draw(img);
          painted = true;
          cur = idx;
          canvas.dataset.frame = String(idx);
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      pointer?.stop();
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-brain
      width={W}
      height={H}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      style={{
        // The alpha matte leaves a pale fringe at the spray's outer edge. It
        // never showed against the old near-white ground; against the paint
        // film it reads as a white halo. Feathering only the last 12% lets the
        // fringe dissolve without touching the brain or most of the spray.
        maskImage: FEATHER,
        WebkitMaskImage: FEATHER,
      }}
    />
  );
}
