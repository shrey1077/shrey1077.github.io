"use client";

/**
 * BrainHalfShade — a shade over the half of the brain slide the pointer is on,
 * behind the brain (owner, 2026-10-19: "on second slide, i want 10% opacity
 * black rectangle (faded towards screen center edge) behind brain video
 * artwork, on one half of the screen, where the mouse pointer is currently
 * present").
 *
 * Black at 10% from the screen's outer edge, fading out to nothing at the
 * centre line, so the two halves meet without a seam. The pointer crossing
 * the middle moves it across, a short fade out and in; a tap does the same
 * on a touch screen. Nothing shows until the pointer is first seen.
 */

import { useEffect, useState } from "react";

const SHADE = "rgba(0, 0, 0, 0.1)";
/** Where across its half the shade begins to fade toward the centre. */
const SOLID_TO = "55%";

export function BrainHalfShade() {
  const [side, setSide] = useState<"left" | "right" | null>(null);
  useEffect(() => {
    const at = (e: PointerEvent) => setSide(e.clientX < window.innerWidth / 2 ? "left" : "right");
    window.addEventListener("pointermove", at, { passive: true });
    window.addEventListener("pointerdown", at, { passive: true });
    return () => {
      window.removeEventListener("pointermove", at);
      window.removeEventListener("pointerdown", at);
    };
  }, []);
  const half = "pointer-events-none absolute inset-y-0 w-1/2 transition-opacity duration-500 ease-out motion-reduce:transition-none";
  return (
    <>
      <div
        aria-hidden
        className={`${half} left-0 ${side === "left" ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to right, ${SHADE} 0%, ${SHADE} ${SOLID_TO}, transparent 100%)` }}
      />
      <div
        aria-hidden
        className={`${half} right-0 ${side === "right" ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to left, ${SHADE} 0%, ${SHADE} ${SOLID_TO}, transparent 100%)` }}
      />
    </>
  );
}
