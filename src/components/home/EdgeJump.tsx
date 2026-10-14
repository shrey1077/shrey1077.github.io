"use client";

/**
 * EdgeJump — the way across to the slide level with this one on the other
 * side (owner, 2026-10-15: "an option to jump to left/right parallel section
 * from both sides sections, with blinking pixels near the respective edge
 * center with text").
 *
 * A slim tab at the middle of the edge that faces the other side — the RIGHT
 * edge on the left side's slides, the LEFT edge on the right side's — with a
 * pixel arrow blinking above the name of where it goes, the name running down
 * the edge. Graphite on the left, paint on the right; dark on hover, like
 * every button. The left side is longer than the right, so from a project
 * with no creative room level with it the tab goes to the right side's last.
 * It pans with its side and comes and goes in squares (usePixelPresence) as
 * the camera crosses between the brain slide and the rooms.
 */

import { motion, type MotionValue } from "framer-motion";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";

/** The arrow, in pixels: a chevron pointing out of the edge. */
const ARROW: [number, number][] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [1, 3],
  [0, 4],
];

export function EdgeJump({
  side,
  label,
  show,
  away,
  x,
  onGo,
  reduceMotion,
}: {
  /** The side whose slides it stands on. */
  side: "logic" | "creative";
  /** Where it goes. */
  label: string;
  show: boolean;
  /** Its side is panned off the screen: out of reach of the keyboard too. */
  away: boolean;
  /** Its side's pan, as a CSS translate. */
  x: MotionValue<string>;
  onGo: () => void;
  reduceMotion: boolean;
}) {
  const logic = side === "logic";
  const ref = usePixelPresence<HTMLButtonElement>(show, { cell: 5, duration: 0.5, reduceMotion });
  return (
    <motion.div aria-hidden={!show || away} inert={away} className="pointer-events-none absolute inset-0 z-[135]" style={{ x }}>
      <button
        ref={ref}
        type="button"
        onClick={onGo}
        aria-label={`Across to ${label}`}
        className={`group pointer-events-auto absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-2.5 bg-white/90 px-2 py-3.5 outline-none ring-1 ring-neutral-900/15 backdrop-blur-sm transition-colors duration-200 hover:bg-neutral-950 focus-visible:bg-neutral-950 ${
          logic ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"
        } ${show ? "" : "invisible"}`}
      >
        {/* The pixel arrow, pointing out across the edge. */}
        <span aria-hidden className={`relative block h-[19px] w-[11px] text-neutral-900 group-hover:text-white group-focus-visible:text-white ${logic ? "" : "-scale-x-100"}`}>
          {ARROW.map(([i, j], k) => (
            <span
              key={k}
              className="pixel-blink absolute block h-[3px] w-[3px]"
              style={
                {
                  left: i * 4,
                  top: j * 4,
                  backgroundColor: logic ? "currentColor" : RAINBOW[(k * 2) % RAINBOW.length],
                  "--blink": `${(1 + hash(k, 3) * 1.4).toFixed(2)}s`,
                  "--delay": `${(-hash(3, k) * 2).toFixed(2)}s`,
                } as unknown as React.CSSProperties
              }
            />
          ))}
        </span>
        <span
          className={`max-h-[40svh] overflow-hidden text-ellipsis whitespace-nowrap text-[0.66rem] leading-none text-neutral-800 transition-colors duration-200 [writing-mode:vertical-rl] group-hover:text-white group-focus-visible:text-white ${
            logic ? "font-graff uppercase tracking-[0.2em]" : "face-creative font-bold tracking-[0.04em] rotate-180"
          }`}
        >
          {label}
        </span>
      </button>
    </motion.div>
  );
}
