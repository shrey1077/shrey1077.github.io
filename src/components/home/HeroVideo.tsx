"use client";

/**
 * HeroVideo — the homepage's video background (Phase 5).
 *
 * `public/videos/upscale.mp4` (re-encoded H.264 all-intra, so every frame is a
 * keyframe and seeks land instantly) fills the hero. It never plays — it is a
 * scrub surface driven by the mouse:
 *
 *   • load        → presents its MIDDLE frame (the resting pose),
 *   • mouse X      → maps across the page to the timeline (left = first frame,
 *                    right = last), eased toward with critically-damped
 *                    smoothing so the scrub feels weighty,
 *   • mouse stops  → the playhead drifts a quarter-second FORWARD, then eases
 *                    back to the frame the pointer left it on — a small breath.
 *
 * Seeks are PACED to the decoder: a new seek is only issued once the previous
 * one has landed (`!video.seeking`), which is what removes the "late / dropped
 * frame" jitter — we never queue seeks the decoder can't serve. Under
 * `prefers-reduced-motion` the video simply holds its middle frame. Decorative
 * (aria-hidden); the rAF loop idles when `active` is false (hero off-screen).
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/upscale.mp4";

/** Damped-approach rates (higher = snappier). Following the mouse is responsive;
 *  the rest settle glides. Frame-rate independent (see the exp() below). */
const FOLLOW_LAMBDA = 9;
const SETTLE_LAMBDA = 7;
/** Mouse considered "stopped" after this idle time (ms) → triggers the breath. */
const REST_MS = 90;
/** The forward breath: drift this far ahead (video seconds) for this long (ms),
 *  then ease back to where the pointer left the playhead. */
const OVERSHOOT_S = 0.25;
const OVERSHOOT_MS = 300;
/** Don't issue a seek smaller than this (seconds) — redundant-seek guard. */
const MIN_SEEK_DELTA = 0.02;

type Phase = "follow" | "overshoot" | "return";

export function HeroVideo({ active = true }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(active);
  // Keep `active` readable inside the rAF loop without re-arming the effect.
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let duration = 0;
    let mouseTarget = 0; // where the pointer wants the playhead
    let current = 0; // our smoothed playhead
    let raf = 0;
    let last = 0;
    let lastMoveT = performance.now();
    let phase: Phase = "follow";
    let restTarget = 0; // the frame the pointer rested on
    let restStart = 0;

    const clamp = (v: number) => Math.min(duration, Math.max(0, v));

    const onMeta = () => {
      duration = video.duration || 0;
      current = duration / 2; // resting pose: the middle frame
      mouseTarget = current;
      restTarget = current;
      try {
        video.currentTime = current;
      } catch {
        /* not seekable yet — the loop will catch up */
      }
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    if (reduceMotion) {
      return () => video.removeEventListener("loadedmetadata", onMeta);
    }

    const onMove = (e: PointerEvent) => {
      if (!duration) return;
      const f = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      mouseTarget = f * duration;
      lastMoveT = performance.now();
      phase = "follow";
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!duration || !activeRef.current) {
        last = t;
        return;
      }
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      const now = t;

      // Phase machine: following the mouse → (on stop) a forward breath → back.
      if (phase === "follow" && now - lastMoveT > REST_MS) {
        phase = "overshoot";
        restTarget = mouseTarget;
        restStart = now;
      } else if (phase === "overshoot" && now - restStart > OVERSHOOT_MS) {
        phase = "return";
      }

      let goal: number;
      let lambda: number;
      if (phase === "follow") {
        goal = mouseTarget;
        lambda = FOLLOW_LAMBDA;
      } else if (phase === "overshoot") {
        goal = clamp(restTarget + OVERSHOOT_S); // always a forward nudge
        lambda = SETTLE_LAMBDA + 3; // reach the peak within the window
      } else {
        goal = restTarget;
        lambda = SETTLE_LAMBDA;
      }

      current += (goal - current) * (1 - Math.exp(-lambda * dt));

      // Pace seeks to the decoder: only ask for a new frame once the last seek
      // has landed. All-intra means each seek is cheap, so this stays smooth.
      if (
        !video.seeking &&
        video.seekable.length > 0 &&
        Math.abs(current - video.currentTime) > MIN_SEEK_DELTA
      ) {
        try {
          video.currentTime = clamp(current);
        } catch {
          /* transient — retry next frame */
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [reduceMotion]);

  return (
    <video
      ref={videoRef}
      aria-hidden
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      src={VIDEO_SRC}
    />
  );
}
