"use client";

/**
 * useQuietStart — when a slide's heavy scene may start (the Zabraku robot,
 * the NewsMobile globe; 2026-10-15).
 *
 * Starting one holds the page for a moment while it sets up. Mid flight that
 * froze the move; just after landing it froze the tail of the trackpad flick
 * that brought the camera there, and the tail's late events, arriving far
 * apart, read as a fresh push and flew on a slide too far. So a scene starts
 * once its slide is the camera's (`live`), the flight has LANDED (`moving`
 * back to 0) at least AFTER ms ago, and the wheel, swipes and keys have been
 * still for QUIET ms. It stops the moment its slide stops being the camera's.
 *
 * `moving` is a motion value (the Flythrough's), read here rather than passed
 * down as state, so a flight starting re-renders nothing.
 */

import { useEffect, useState } from "react";
import type { MotionValue } from "framer-motion";

export function useQuietStart(live: boolean, moving: MotionValue<number>, after = 300, quiet = 450): boolean {
  const [on, setOn] = useState(false);
  if (!live && on) setOn(false);
  useEffect(() => {
    if (!live) return;
    let landedAt = moving.get() === 0 ? performance.now() : Infinity;
    let last = performance.now();
    const off = moving.on("change", (v) => {
      landedAt = v === 0 ? performance.now() : Infinity;
    });
    const mark = () => {
      last = performance.now();
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", mark);
    const id = window.setInterval(() => {
      const now = performance.now();
      if (now - landedAt >= after && now - last >= quiet) {
        window.clearInterval(id);
        setOn(true);
      }
    }, 100);
    return () => {
      off();
      window.clearInterval(id);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [live, moving, after, quiet]);
  return on;
}
