"use client";

/**
 * flight — the depth every slide of the Flythrough flies through, shared so the
 * landing can fly its own two layers the same way (2026-10-03).
 *
 * The landing is TWO slides since then: first the portrait orb and the tools,
 * then the brain with its pins, its lines and the facts. The wordmark, the
 * code box, the two voices and the band stay put across both, so the landing
 * is one Flythrough slide that HOLDS still for the first step and flies off
 * on the second, and inside it the orb and the brain trade places by the same
 * numbers as everything else (useDepth). It reads the camera off FlightContext.
 */

import { createContext, useContext } from "react";
import { useTransform, type MotionValue } from "framer-motion";

export const PERSPECTIVE = 1200;
/** px of depth per slide still to come — the next one waits ~0.4× and faded. */
export const AHEAD_Z = 1700;
/** px toward the camera per slide gone by — a passed slide swells and fades
 *  out by half a slide, so it reads as flown THROUGH, not slid away. */
export const PASS_Z = 800;
/** A slide's fade: in over the whole approach, out over half a slide passed. */
export const FADE_OUT = 2.2;

/** The landing's slides: 0 the orb and tools, 1 the brain. Rooms follow. */
export const HERO_SLIDES = 2;

/**
 * Depth, fade and stacking for something at slide `index`, from the camera's
 * position `p` (in slides). `hold` keeps it flat and whole on the way IN — it
 * only flies once the camera passes it (the landing's shared furniture).
 */
export function useDepth(p: MotionValue<number>, index: number, reduceMotion: boolean, hold = false) {
  const z = useTransform(p, (v) => {
    if (reduceMotion) return 0;
    const d = index - v;
    if (d >= 0) return hold ? 0 : -d * AHEAD_Z;
    return -d * PASS_Z;
  });
  const opacity = useTransform(p, (v) => {
    const d = index - v;
    const o = d >= 0 ? (hold ? 1 : 1 - d) : 1 + d * FADE_OUT;
    return Math.max(0, Math.min(1, o));
  });
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  // Siblings composite by z-index, not by 3D depth (no preserve-3d), so the
  // one rushing past has to be stacked over the one arriving behind it.
  const zIndex = useTransform(p, (v) => 100 - Math.round((index - v) * 10));
  return { z, opacity, visibility, zIndex };
}

export interface Flight {
  /** The camera, in slides (0 = the orb). */
  p: MotionValue<number>;
  /** The slide it is nearest. */
  current: number;
  /** Where that slide is: the landing, a logic room or a creative one. The
   *  landing's brain keeps turning in the rooms for BrainDock, and this tells
   *  it which way to face. */
  zone: "landing" | "logic" | "creative";
  reduceMotion: boolean;
}

export const FlightContext = createContext<Flight | null>(null);

export function useFlight(): Flight | null {
  return useContext(FlightContext);
}
