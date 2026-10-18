"use client";

/**
 * BrainDock — the brain in the corner of the rooms (2026-10-10, owner: "the
 * brain video is moved into circle and shifted to right of screen is not
 * good, remove it, instead when we have moved to left … the brain should
 * appear later in the black circle at left bottom and fixed on the left most
 * frame of the original brain video, similarly and mirrored for right side").
 *
 * One circle per track, in its OUTER bottom corner — on WHITE (owner, the
 * same day: "on the smaller brain artwork in internal sections, keep a white
 * bg"; it was black for its first hour):
 *   · logic — bottom LEFT, holding the brain footage's first frame (000, the
 *     pointer at the far left: the grey half, its circuitry trailing off to
 *     the left edge);
 *   · creative — bottom RIGHT, holding the last (047, the pointer at the far
 *     right: the colour half, its paint flying off to the right edge).
 * Stills, not the live footage — the frames are the ones the landing already
 * preloads, so they cost nothing more. The landing's brain no longer lifts
 * off into the rooms: it stays on its slide and leaves with it, and this one
 * APPEARS once the camera has arrived (a beat after the flight lands).
 *
 * Each circle rides its column's pan, so a switch of track slides one out and
 * the other in. THE WAY ACROSS is still here: the circle and its tab are one
 * button — "Click to <the room level with this one, on the other track>",
 * its arrow blinking toward it.
 *
 * Until 2026-10-10 this was a live copy of the landing's canvas that lifted
 * off the brain slide into a window half off the right edge — git has it.
 */

// Waits for its room (speed fix 4, nearness).
import { RoomImage as Image } from "@/components/home/nearness";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { typeVoiceClass } from "@/constants/typography";

/** Frame px across the circle, and the frame point at its centre. The frames
 *  are 1280×720; both crops stay clear of the export rule in rows 718–719. */
const CROP = 700;
const FRAMES = {
  logic: { src: "/brain/frames/000.webp", cx: 600, cy: 360 },
  creative: { src: "/brain/frames/047.webp", cx: 560, cy: 360 },
} as const;
const FRAME_W = 1280;
const FRAME_H = 720;

/** The circle's diameter: 5.5rem on a phone, 15vh (96–150px) from `md`.
 *  ⚠ Kept in step with the rooms' foot padding (Flythrough), which clears
 *  it. */
const DOCK_SIZE = "size-[5.5rem] md:size-[max(6rem,min(15vh,9.375rem))]";

function Corner({
  side,
  shown,
  pan,
  across,
  onAcross,
  reduceMotion,
}: {
  side: "logic" | "creative";
  shown: boolean;
  /** This column's offset, in stage widths. */
  pan: MotionValue<number>;
  across: string;
  onAcross: () => void;
  reduceMotion: boolean;
}) {
  const logic = side === "logic";
  const f = FRAMES[side];
  const x = useTransform(pan, (v) => `${v * 100}%`);
  const visibility = useTransform(pan, (v) => (Math.abs(v) > 0.999 ? "hidden" : "visible"));

  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ x, visibility }}>
      <motion.button
        type="button"
        onClick={onAcross}
        aria-label={`Go across to ${across}`}
        tabIndex={shown ? 0 : -1}
        className={`group pointer-events-auto absolute bottom-[calc(7svh+max(0.75rem,2.5vh))] flex cursor-pointer items-center gap-3 outline-none lg:gap-4 ${
          logic ? "left-[max(1rem,2.5vw)] flex-row" : "right-[max(1rem,2.5vw)] flex-row-reverse"
        }`}
        style={{ pointerEvents: shown ? "auto" : "none", transformOrigin: logic ? "0% 100%" : "100% 100%" }}
        initial={false}
        animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }}
        transition={
          shown
            ? { delay: reduceMotion ? 0 : 0.7, duration: reduceMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.25, ease: "easeOut" }
        }
      >
        {/* The circle: a ring — graphite on the logic side, paint on the
            creative — round a white disc holding the still. */}
        <span
          className={`dock-circle relative block shrink-0 rounded-full p-[3px] ${DOCK_SIZE} shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-[1.04] group-focus-visible:ring-2 group-focus-visible:ring-neutral-900/50 group-focus-visible:ring-offset-2 ${
            logic ? "bg-gradient-to-br from-neutral-400 via-neutral-700 to-neutral-950" : "brain-paint"
          }`}
        >
          <span className="relative block h-full w-full overflow-hidden rounded-full bg-white">
            <span
              className="absolute block transition-transform duration-700 group-hover:scale-[1.06]"
              style={{
                width: `${(FRAME_W / CROP) * 100}%`,
                height: `${(FRAME_H / CROP) * 100}%`,
                left: `${(-(f.cx - CROP / 2) / CROP) * 100}%`,
                top: `${(-(f.cy - CROP / 2) / CROP) * 100}%`,
                transformOrigin: `${(f.cx / FRAME_W) * 100}% ${(f.cy / FRAME_H) * 100}%`,
              }}
            >
              <Image src={f.src} alt="" fill sizes="300px" className="object-fill" />
            </span>
          </span>
        </span>

        {/* The way across. */}
        <span
          className={`dock-tab flex flex-col gap-0.5 rounded-full bg-neutral-950/80 px-5 py-2 text-white ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm lg:px-6 lg:py-3 ${
            logic ? "items-start text-left" : "items-end text-right"
          }`}
        >
          <span className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.28em] text-white/60 max-lg:hidden`}>
            Click to
          </span>
          <span
            className={`${
              logic ? "face-creative font-bold" : "face-logic"
            } text-[clamp(0.8rem,1.2vw,1.2rem)] leading-tight`}
          >
            {across}
            <span className="max-lg:hidden"> section</span>
          </span>
          <motion.span
            aria-hidden
            className="block text-base leading-none lg:text-lg"
            animate={reduceMotion ? undefined : { x: logic ? [0, 7, 0] : [0, -7, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            {logic ? "→" : "←"}
          </motion.span>
        </span>
      </motion.button>
    </motion.div>
  );
}

export function BrainDock({
  inRooms,
  logicPan,
  creativePan,
  logicAcross,
  creativeAcross,
  onAcross,
  reduceMotion,
}: {
  /** Whether the camera is in the rooms — the circles appear a beat after. */
  inRooms: boolean;
  /** Each column's offset, in stage widths (Flythrough's pan). */
  logicPan: MotionValue<number>;
  creativePan: MotionValue<number>;
  /** The room level with this one on the OTHER track, seen from each side. */
  logicAcross: string;
  creativeAcross: string;
  onAcross: () => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[130] overflow-hidden">
      <Corner side="logic" shown={inRooms} pan={logicPan} across={logicAcross} onAcross={onAcross} reduceMotion={reduceMotion} />
      <Corner
        side="creative"
        shown={inRooms}
        pan={creativePan}
        across={creativeAcross}
        onAcross={onAcross}
        reduceMotion={reduceMotion}
      />
    </div>
  );
}
