"use client";

/**
 * HeroVideo — the homepage's video background (Phase 5, v4).
 *
 * upscale.mp4 is an all-intra turntable of the brain: t=0 is the white LOGIC
 * profile, CENTER_T the split-view resting pose, the last frame the painted
 * CREATIVE profile. The video never plays natively — a rAF loop drives
 * currentTime through three modes:
 *
 *   scrub  — while the hero pose is "center", mouse X eases the playhead
 *            through a narrow ±SCRUB_WINDOW_S around CENTER_T via a
 *            critically-damped spring (true ease-in/out, no overshoot).
 *   play   — a pose change in the store (HeroStage's click zones, the panels'
 *            flip strip) launches real-time frame-stepping (1×, backwards to 0
 *            for "logic", forward to the end for "creative"). A pose change
 *            mid-play reverses direction immediately.
 *   frozen — parked on an end pose; scrubbing stays off until the pose says
 *            otherwise.
 *
 * v4: the component no longer owns any click handling — it SUBSCRIBES to the
 * store's `heroPose` and translates pose changes into playback. Reduced
 * motion: center frame, pose changes snap. Seeks are paced to the decoder
 * (only when !video.seeking).
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useSceneStore } from "@/state/useSceneStore";
import type { HeroPose } from "@/types/scene";

const VIDEO_SRC = "/videos/upscale.mp4";

/** The user-calibrated resting frame (§3 of the v3 plan). */
const CENTER_T = 2.92;
/** ±15° of rotation, in video-seconds (≈18°/s footage sweep). */
const SCRUB_WINDOW_S = 0.8;
/** Critically-damped spring for the scrub follow — the feel knobs.
 *  Higher STIFFNESS = quicker catch-up; damping stays critical (no bounce). */
const STIFFNESS = 26;
const DAMPING = 2 * Math.sqrt(STIFFNESS); // critical — eases in AND out
/** Don't issue seeks smaller than ~half a frame (24fps ⇒ 41.7ms/frame). */
const MIN_SEEK_DELTA = 0.02;
/** Freeze on the LAST REAL FRAME, not t=duration (which can present blank). */
const END_EPS = 1 / 24;

type Mode = "scrub" | "play" | "frozen";

export function HeroVideo({ active = true }: { active?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let duration = 0;
    let lo = 0; // scrub window lower bound
    let hi = 0; // scrub window upper bound
    let mode: Mode = "scrub";
    let playDir: 1 | -1 = 1;
    let playTo = CENTER_T; // where a play run is headed
    let settle: Mode = "frozen"; // what a play run becomes on arrival
    let target = CENTER_T; // where the pointer wants the playhead (scrub mode)
    let pos = CENTER_T; // spring position (the virtual playhead)
    let vel = 0; // spring velocity
    let raf = 0;
    let last = 0;

    const clampAll = (v: number) => Math.min(duration - END_EPS, Math.max(0, v));

    /** The video-time each pose rests on. */
    const poseTime = (pose: HeroPose) =>
      pose === "logic"
        ? 0
        : pose === "creative"
          ? Math.max(0, duration - END_EPS)
          : CENTER_T;

    /** Translate a pose change into playback (or a snap, reduced motion).
     *  All three poses play there at 1×; the end poses freeze on arrival,
     *  center hands control back to the scrub spring. */
    const applyPose = (pose: HeroPose) => {
      const dest = poseTime(pose);
      settle = pose === "center" ? "scrub" : "frozen";
      if (reduceMotion || !duration) {
        pos = dest;
        vel = 0;
        target = CENTER_T;
        mode = settle;
        try {
          video.currentTime = dest;
        } catch {
          /* not seekable yet — the loop catches up */
        }
        return;
      }
      if (mode !== "play" && Math.abs(pos - dest) < 0.05) return; // already there
      mode = "play";
      playTo = dest;
      playDir = dest >= pos ? 1 : -1;
      vel = 0;
    };

    const onMeta = () => {
      duration = video.duration || 0;
      lo = Math.max(0, CENTER_T - SCRUB_WINDOW_S);
      hi = Math.min(duration - END_EPS, CENTER_T + SCRUB_WINDOW_S);
      const pose = useSceneStore.getState().heroPose;
      // Land directly on the current pose's frame (center on first load; an
      // end pose after HMR / a remount mid-session).
      pos = poseTime(pose);
      target = CENTER_T;
      mode = pose === "center" ? "scrub" : "frozen";
      try {
        video.currentTime = pos;
      } catch {
        /* not seekable yet — the loop catches up */
      }
    };
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);

    // Pose changes arrive through the store — no click handling here.
    const unsubscribe = useSceneStore.subscribe((state, prev) => {
      if (state.heroPose !== prev.heroPose) applyPose(state.heroPose);
    });

    if (reduceMotion) {
      // No scrub loop; pose changes snap via applyPose above.
      return () => {
        unsubscribe();
        video.removeEventListener("loadedmetadata", onMeta);
      };
    }

    const onMove = (e: PointerEvent) => {
      if (!duration || mode !== "scrub") return;
      const f = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      target = lo + f * (hi - lo);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (t - last) / 1000) || 0.016;
      last = t;
      if (!duration || !activeRef.current) return;

      if (mode === "play") {
        // Natural-speed frame-stepping toward the pose; all-intra keeps every
        // step cheap in both directions.
        pos = clampAll(pos + playDir * dt);
        const arrived = playDir === 1 ? pos >= playTo : pos <= playTo;
        if (arrived) {
          pos = clampAll(playTo);
          vel = 0;
          target = CENTER_T;
          mode = settle; // end poses freeze; center resumes the scrub spring
        }
      } else if (mode === "scrub") {
        // Critically-damped spring — smooth ease-in and ease-out, no bounce,
        // settles exactly on the pointer's frame (no overshoot effect).
        const accel = STIFFNESS * (target - pos) - DAMPING * vel;
        vel += accel * dt;
        pos += vel * dt;
      }
      // frozen: pos holds.

      if (
        !video.seeking &&
        video.seekable.length > 0 &&
        Math.abs(pos - video.currentTime) > MIN_SEEK_DELTA
      ) {
        try {
          video.currentTime = pos;
        } catch {
          /* transient — retry next frame */
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      unsubscribe();
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [reduceMotion]);

  /** Edge feather — the footage's background (~#f1f0f0–#f5f5f5, varying per
   *  frame) is a shade off the #f9f9f9 wall, so a hard rectangle edge shows
   *  when the video is zoomed out. Fading the outer few percent of each edge
   *  dissolves the seam losslessly (no re-encode). Two linear gradients
   *  intersected = edges only, no corner over-darkening. Browsers without
   *  `mask-composite` simply keep the hard edge (graceful). */
  const edgeFeather: React.CSSProperties = {
    maskImage:
      "linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(180deg, transparent 0%, black 6%, black 94%, transparent 100%)",
    maskComposite: "intersect",
    WebkitMaskImage:
      "linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(180deg, transparent 0%, black 6%, black 94%, transparent 100%)",
    WebkitMaskComposite: "source-in",
  };

  return (
    <video
      ref={videoRef}
      aria-hidden
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      style={edgeFeather}
      src={VIDEO_SRC}
    />
  );
}
