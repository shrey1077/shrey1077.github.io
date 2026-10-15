"use client";

/**
 * useQuietStart — when a slide's heavy scene may start (the Zabraku robot,
 * the NewsMobile globe; 2026-10-15).
 *
 * Starting one holds the page for up to half a second while it sets up. Mid
 * flight that froze the move; just after landing it froze the tail of the
 * trackpad flick that brought the camera there, and the tail's late events,
 * arriving far apart, read as a fresh push and flew on a slide too far. So a
 * scene starts only once the camera has landed (`arrived`), at least AFTER
 * ms ago, AND the wheel, swipes and keys have been still for QUIET ms. It
 * stops the moment its slide stops being the camera's (`live`).
 */

import { useEffect, useState } from "react";

export function useQuietStart(arrived: boolean, live: boolean, after = 900, quiet = 700): boolean {
  const [on, setOn] = useState(false);
  if (!live && on) setOn(false);
  useEffect(() => {
    if (!arrived) return;
    const t0 = performance.now();
    let last = t0;
    const mark = () => {
      last = performance.now();
    };
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    window.addEventListener("keydown", mark);
    const id = window.setInterval(() => {
      const now = performance.now();
      if (now - t0 >= after && now - last >= quiet) {
        window.clearInterval(id);
        setOn(true);
      }
    }, 150);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [arrived, after, quiet]);
  return on;
}
