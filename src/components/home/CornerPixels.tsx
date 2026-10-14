"use client";

/**
 * CornerPixels — a few blinking squares in each corner of the screen the
 * visitor can go toward (owner, 2026-10-14: "9-10 pixel on each corner where
 * navigation is available, they should be blinking").
 *
 * Which corners (the Flythrough says):
 *   · the orb slide — both lower corners: the way on is down;
 *   · the brain slide — both lower corners, and both upper (back up to the orb);
 *   · a logic room — both right corners (across to the creative column) and
 *     both upper (up, a room back or to the brain);
 *   · a creative room — the mirror: both left corners, and both upper.
 *   · past the rooms, at the footer — none.
 *
 * Each corner holds a little right-angled triangle of ten squares (4 + 3 + 2
 * + 1), its right angle in the corner, so it points the way out; each square
 * blinks on its own beat (.corner-pixel, globals.css) — stepped, digital.
 * Graphite on the landing and the logic side; the rainbow of the creative
 * ground (MoodField's RAINBOW) on the creative side. The lower ones stand on
 * the fixed band (FootBand, 7svh); everything is pointer-inert and hidden from
 * assistive tech. Reduced motion: still, not blinking.
 */

import { RAINBOW } from "@/components/home/MoodField";

export type Corner = "tl" | "tr" | "bl" | "br";

/** A square, the gap between squares, and the inset from the screen's edge, px. */
const PX = 10;
const GAP = 3;
const INSET = 14;
const PITCH = PX + GAP;

/** The triangle: cells (i across from the corner, j up or down from it) with
 *  i + j ≤ 3 — exactly ten. */
const CELLS: [number, number][] = [];
for (let j = 0; j < 4; j++) for (let i = 0; i < 4 - j; i++) CELLS.push([i, j]);

const ORDER: Corner[] = ["tl", "tr", "bl", "br"];

/** A fixed pseudo-random number in [0, 1) per square. */
function rnd(a: number, b: number) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function CornerPixels({ corners, creative }: { corners: readonly Corner[]; creative: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[140]">
      {ORDER.map((c, ci) => {
        const top = c[0] === "t";
        const left = c[1] === "l";
        return (
          <div
            key={c}
            className="absolute transition-opacity duration-500"
            style={{
              opacity: corners.includes(c) ? 1 : 0,
              width: 4 * PITCH - GAP,
              height: 4 * PITCH - GAP,
              ...(top ? { top: INSET } : { bottom: `calc(7svh + ${INSET}px)` }),
              ...(left ? { left: INSET } : { right: INSET }),
            }}
          >
            {CELLS.map(([i, j], k) => {
              const r = rnd(ci + 3, k + 1);
              const colour = creative
                ? RAINBOW[Math.floor(rnd(k + 5, ci + 9) * RAINBOW.length)]
                : r < 0.3
                  ? "#71717a"
                  : "#18181b";
              return (
                <span
                  key={k}
                  className="corner-pixel absolute block"
                  style={
                    {
                      width: PX,
                      height: PX,
                      background: colour,
                      ...(left ? { left: i * PITCH } : { right: i * PITCH }),
                      ...(top ? { top: j * PITCH } : { bottom: j * PITCH }),
                      "--blink": `${(1.1 + r * 1.3).toFixed(2)}s`,
                      "--delay": `${(-rnd(k + 2, ci + 4) * 2).toFixed(2)}s`,
                    } as unknown as React.CSSProperties
                  }
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
