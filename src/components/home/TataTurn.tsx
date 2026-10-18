"use client";

/**
 * TataTurn — the student turning to face the camera, scrubbed by the
 * pointer, for the Tata slide (owner, 2026-10-16: "use the zero to this point
 * footage to replace the background and image of student … and the movement
 * of mouse in the right half of screen horizontally to correspond to the cut
 * video, with initial frame linked to left most position (in right half of
 * the slide) and final to right most").
 *
 * The cut's frames are stills (scripts/prepare-tata-turn.mjs), scrubbed by
 * FilmScrub across the RIGHT HALF of the slide — its left edge the first
 * frame, the slide's right edge the last; anywhere left of it, the first. On a
 * touch screen the turn plays by itself, there and back, and a finger dragged
 * across the right half turns it as the mouse does. (The scrubbing lived here
 * until 2026-10-18, when the Extincts slide took a cut of its own.)
 *
 * `fit`: "cover" fills the box with the whole frame (the slide's ground on a
 * wide screen); "student" shows the frame's right part — the student — whole
 * in the box, against its right edge (a tall screen's middle).
 */

import { FilmScrub, type FilmCut } from "@/components/home/FilmScrub";

/** Frames 0 … 29 of the film (the owner's cut; scripts/prepare-tata-turn.mjs). */
const TURN: FilmCut = { dir: "/content/clients/tata-iis/hero/turn", frames: 30, w: 1920, h: 1080, big: 1600, small: 960 };
/** The share of the frame the student mode keeps, from its right edge. */
const STUDENT_FROM = 0.4;

export function TataTurn({ live, reduceMotion, fit, className = "" }: { live: boolean; reduceMotion: boolean; fit: "cover" | "student"; className?: string }) {
  return (
    <FilmScrub
      cut={TURN}
      live={live}
      reduceMotion={reduceMotion}
      fit={fit === "cover" ? "cover" : "right"}
      span="right-half"
      rightFrom={STUDENT_FROM}
      className={className}
    />
  );
}
