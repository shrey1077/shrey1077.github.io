"use client";

/**
 * HeroVideo — the homepage's video background (Phase 5).
 *
 * `public/videos/upscale.mp4` fills the hero behind the DOM overlays. The
 * video never plays: it is a scrub surface —
 *
 *   • on load it presents its MIDDLE frame (the resting pose),
 *   • mouse X across the page maps to the timeline (left edge = first frame,
 *     right edge = last frame), eased toward with critically-damped smoothing
 *     in a rAF loop so the scrub feels weighty, never twitchy.
 *
 * Seeks are throttled to meaningful deltas (~30ms of video) to avoid decoder
 * thrash. Under `prefers-reduced-motion` the video simply holds its middle
 * frame. Decorative (aria-hidden); pauses its rAF loop when `active` is false
 * (hero off-screen).
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/upscale.mp4";

/** Damping lambda for the scrub easing — higher = snappier catch-up. */
const SCRUB_LAMBDA = 5;
/** Don't issue a seek smaller than this (seconds) — decoder churn guard. */
const MIN_SEEK_DELTA = 0.03;

export function HeroVideo({ active = true }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let duration = 0;
    let target = 0; // where the mouse wants the playhead
    let current = 0; // our smoothed playhead
    let raf = 0;
    let last = 0;

    const onMeta = () => {
      duration = video.duration || 0;
      // The resting pose: the middle frame.
      current = duration / 2;
      target = current;
      video.currentTime = current;
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    if (reduceMotion) {
      // Reduced motion: hold the middle frame, no scrubbing.
      return () => video.removeEventListener("loadedmetadata", onMeta);
    }

    const onMove = (e: PointerEvent) => {
      if (!duration) return;
      const f = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      target = f * duration;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!duration || !active) return;
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      // Frame-rate-independent damped approach toward the mouse's target.
      current += (target - current) * (1 - Math.exp(-SCRUB_LAMBDA * dt));
      if (Math.abs(current - video.currentTime) > MIN_SEEK_DELTA && video.seekable.length) {
        video.currentTime = current;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [active, reduceMotion]);

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
