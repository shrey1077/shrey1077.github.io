"use client";

/**
 * CornerPixels — blinking squares at the edge of the screen pointing each way
 * the visitor can go (owner, 2026-10-14: "9-10 pixel on each corner where
 * navigation is available, they should be blinking"; then the same day:
 * "transparent in colour and double the size, like only boundaries are
 * blinking randomly … more precise … so we have 8 directions for placement").
 *
 * EIGHT PLACES, one per direction — the four corners (the diagonals) and the
 * middle of each edge (straight up, down, left and right). The Flythrough says
 * which:
 *   · the orb slide — down (the middle of the bottom edge);
 *   · the brain slide — down-left and down-right, into either column (both
 *     lower corners), and up, back to the orb;
 *   · a logic room — across to the creative column (the middle of the right
 *     edge), on down, and back up: to the brain from the first room (up and to
 *     the right, the way the camera came down), a room back from the others;
 *   · a creative room — the mirror;
 *   · past the rooms, at the footer — none.
 *
 * Each place holds ten squares — a stepped triangle, 4 + 3 + 2 + 1, its point
 * toward the way out — drawn as OUTLINES only, each blinking on its own random
 * beat (.corner-pixel, globals.css). Graphite on the landing and the logic
 * side, the rainbow of the creative ground (MoodField's RAINBOW) on the
 * creative side. The lower ones stand on the fixed band (FootBand, 7svh).
 *
 * ⚠ THE MIDDLES KEEP CLEAR. The middle of the top or bottom edge is often
 * taken — the PORTFOLIO mark at the foot of the orb slide and the top of the
 * brain slide, the brain's three circles over the rooms — so those two stand
 * just past whatever there is marked `data-nav-avoid` and showing, measured
 * as the screen changes rather than guessed. Pointer-inert and hidden from
 * assistive tech. Reduced motion: still, not blinking.
 */

import { useEffect, useRef } from "react";
import { RAINBOW } from "@/components/home/MoodField";

export type NavDir = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

/** A square, the gap between squares, and the inset from the screen's edge, px. */
const PX = 20;
const GAP = 4;
const INSET = 12;
const PITCH = PX + GAP;
/** The ten squares sit in a 4 × 4 box. */
const BOX = 4 * PITCH - GAP;
/** Room kept from anything the middles keep clear of, px. */
const CLEAR = 10;

const DIRS: NavDir[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

/** The ten squares for a direction, as (column, row) in the 4 × 4 box: a
 *  stepped triangle pointing that way — into the corner for a diagonal,
 *  toward the edge for a straight one. */
function shape(d: NavDir): [number, number][] {
  const out: [number, number][] = [];
  if (d.length === 2) {
    // A corner: i + j ≤ 3, counted from the corner.
    const right = d[1] === "e";
    const down = d[0] === "s";
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4 - j; i++) out.push([right ? 3 - i : i, down ? 3 - j : j]);
    return out;
  }
  // An edge: rows (or columns) of 1, 2, 3, 4 squares, the single one at the
  // edge, each centred — in half-steps, so the odd rows sit between squares.
  for (let r = 0; r < 4; r++) {
    for (let m = 0; m <= r; m++) {
      const along = (3 - r) / 2 + m; // centred across the 4 × 4 box
      const deep = d === "n" || d === "w" ? r : 3 - r; // the point toward the edge
      out.push(d === "n" || d === "s" ? [along, deep] : [deep, along]);
    }
  }
  return out;
}
const SHAPES = Object.fromEntries(DIRS.map((d) => [d, shape(d)])) as Record<NavDir, [number, number][]>;

/** A fixed pseudo-random number in [0, 1) per square. */
function rnd(a: number, b: number) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Where a place's box sits, before the middles make room. */
function placement(d: NavDir): React.CSSProperties {
  const band = `calc(7svh + ${INSET}px)`;
  switch (d) {
    case "n":
      return { top: INSET, left: `calc(50% - ${BOX / 2}px)` };
    case "s":
      return { bottom: band, left: `calc(50% - ${BOX / 2}px)` };
    case "e":
      return { right: INSET, top: `calc(50% - ${BOX / 2}px)` };
    case "w":
      return { left: INSET, top: `calc(50% - ${BOX / 2}px)` };
    case "ne":
      return { top: INSET, right: INSET };
    case "nw":
      return { top: INSET, left: INSET };
    case "se":
      return { bottom: band, right: INSET };
    case "sw":
      return { bottom: band, left: INSET };
  }
}

export function CornerPixels({
  dirs,
  creative,
  front,
}: {
  dirs: readonly NavDir[];
  creative: boolean;
  /** Over everything (the landing), or under the slides (a room): see the
   *  Flythrough, where it is placed before the camera for that. */
  front: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nRef = useRef<HTMLDivElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  // The middles of the top and bottom edges step past whatever is showing
  // there (data-nav-avoid): re-measured as the screen settles and changes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const stage = root.getBoundingClientRect();
      const left = stage.left + stage.width / 2 - BOX / 2;
      const right = left + BOX;
      let nTop = 0;
      let sLift = 0;
      for (const el of document.querySelectorAll<HTMLElement>("[data-nav-avoid]")) {
        if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || r.right < left || r.left > right || r.bottom < stage.top || r.top > stage.bottom) continue;
        if (r.top < stage.top + stage.height / 2) nTop = Math.max(nTop, r.bottom - stage.top + CLEAR - INSET);
        else sLift = Math.max(sLift, stage.bottom - r.top + CLEAR);
      }
      if (nRef.current) nRef.current.style.transform = `translateY(${Math.max(0, nTop)}px)`;
      if (sRef.current) {
        const band = stage.height * 0.07 + INSET;
        sRef.current.style.transform = `translateY(${-Math.max(0, sLift - band)}px)`;
      }
    };
    measure();
    const id = window.setInterval(measure, 300);
    window.addEventListener("resize", measure);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [dirs]);

  return (
    <div ref={rootRef} aria-hidden className={`pointer-events-none absolute inset-0 ${front ? "z-[140]" : "z-0"}`}>
      {DIRS.map((d, di) => (
        <div
          key={d}
          ref={d === "n" ? nRef : d === "s" ? sRef : undefined}
          className="absolute transition-opacity duration-500"
          style={{ ...placement(d), width: BOX, height: BOX, opacity: dirs.includes(d) ? 1 : 0 }}
        >
          {SHAPES[d].map(([i, j], k) => {
            const r = rnd(di + 3, k + 1);
            const colour = creative ? RAINBOW[Math.floor(rnd(k + 5, di + 9) * RAINBOW.length)] : "rgba(24, 24, 27, 0.8)";
            return (
              <span
                key={k}
                className="corner-pixel absolute block"
                style={
                  {
                    width: PX,
                    height: PX,
                    left: i * PITCH,
                    top: j * PITCH,
                    border: `1.5px solid ${colour}`,
                    "--blink": `${(1.4 + r * 2.4).toFixed(2)}s`,
                    "--delay": `${(-rnd(k + 2, di + 4) * 4).toFixed(2)}s`,
                  } as unknown as React.CSSProperties
                }
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
