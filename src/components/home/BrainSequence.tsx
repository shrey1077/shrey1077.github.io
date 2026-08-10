"use client";

/**
 * BrainSequence — the brain turntable as a preloaded image sequence.
 *
 * Replaces the video scrub (which stuttered: every mouse frame set
 * `video.currentTime`, and seeking VP9-with-alpha is expensive). Here the small
 * scrub window is a set of still frames, preloaded once and drawn to a canvas —
 * so scrubbing is just picking an already-decoded frame. No seeking, no lag.
 *
 * Mouse X eases the playhead across the frames via the same critically-damped
 * spring the old scrub used (smooth ease-in and ease-out, no overshoot); at rest
 * it holds the middle frame. Reduced motion parks on the middle frame.
 *
 * The canvas is tagged `data-brain` so HeroName can read its alpha to place the
 * name against the brain (same as it read the old <video>).
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const FRAME_COUNT = 48;
const BASE = "/brain/frames";
const W = 1280;
const H = 720;

/** Critically-damped spring for the scrub follow (the old video's feel). */
const STIFFNESS = 26;
const DAMPING = 2 * Math.sqrt(STIFFNESS);

/** Opaque until the far right, then a short fade — see the note on the canvas. */
const FEATHER = "linear-gradient(to right, #000 0%, #000 88%, transparent 100%)";

export function BrainSequence({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
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

    const onMove = (e: PointerEvent) => {
      const f = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      target = f * (FRAME_COUNT - 1);
    };
    if (!reduceMotion) window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      if (!activeRef.current) return;

      if (reduceMotion) {
        pos = rest;
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
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (!reduceMotion) window.removeEventListener("pointermove", onMove);
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
