"use client";

/**
 * flight — the camera the Flythrough moves, shared with the landing so its
 * own two layers (the orb, then the brain) trade places on the same clock
 * (2026-10-03). It reads the camera off FlightContext.
 *
 * The depth itself lives in the Flythrough: the rooms fly through z there,
 * dissolving in squares (2026-10-10). For part of that day every move ran
 * across the brain slide's plane instead; the step from the brain into a
 * column still does.
 */

import { createContext, useContext } from "react";
import type { MotionValue } from "framer-motion";

/** The perspective the rooms fly under (Flythrough's Slide). */
export const PERSPECTIVE = 1200;

/** The landing's slides: 0 the orb, 1 the brain. Rooms follow. */
export const HERO_SLIDES = 2;

export interface Flight {
  /** The camera, in slides (0 = the orb). */
  p: MotionValue<number>;
  /** The slide it is nearest. */
  current: number;
  /** Where that slide is: the landing, a logic room or a creative one. The
   *  landing's brain only turns while it is the landing. */
  zone: "landing" | "logic" | "creative";
  reduceMotion: boolean;
}

export const FlightContext = createContext<Flight | null>(null);

export function useFlight(): Flight | null {
  return useContext(FlightContext);
}
