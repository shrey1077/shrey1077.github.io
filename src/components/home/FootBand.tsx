"use client";

/**
 * FootBand — the band along the foot of the home page, FIXED to the screen
 * the whole way down (2026-10-11), and since 2026-10-15 the way between the
 * two sides (owner: "The black band itself will now be half black with our
 * pixel effect and rainbow color on the other right half with rainbow pixel
 * effect, and movement between right and left side will now be done through
 * this band … When you are on left sections the band will be 75% black and
 * pixel effect boundary between rest of 25% rainbow color pixels and vice
 * versa for right sections. On first two slides and footer it will be at
 * 50-50%. And of course if we click on the 25% part we move to the other side
 * with animation in band as well").
 *
 *   ┌──────────── black, graphite pixels ────────────▒▓░ rainbow pixels ─┐
 *   │  Tata IIS     Brand Designs · 01 / 07           ▓░▒  AI Design →    │
 *   └────────────────────────────────────────────────▒░▓ The Extincts …  ┘
 *
 * The whole band is a field of small squares, drawn on a canvas: the logic
 * side's black, its squares now and then lighting grey, and the creative
 * side's rainbow, its squares flickering brighter — both blinking on their
 * own random beats, like every pixel button. Where they meet the edge is
 * pixelated, the two sides' squares mixing across a few cells. Where it
 * meets is SHARE of the width in black (the Flythrough sets it: 0.5 on the
 * landing and at the footer, 0.75 in a logic room, 0.25 in a creative one,
 * following the pan between the sides square by square).
 *
 * Each part carries its words: the larger names the room the camera is in;
 * the smaller names the room level with it on the other side, and a click on
 * it pans across. Since 2026-10-18 the larger carries every room on its side
 * instead, as pixel pills (ShowcaseStrip — owner: "this element needs to be
 * in the black band at bottom"); on a phone the smaller says only which way. On the landing and at the footer each half is the way into
 * its side. (The section titles in Digibra and Syne stay: logic's on black,
 * creative's on paint.) The facts that stood in its corners moved up onto the
 * brain slide (BrainFooter); the tab at the edge of the rooms (EdgeJump) is
 * unlinked — this is the way across now.
 *
 * Over the stage, under the dialogs (Z_INDEX.viewer). Everything that stands
 * on the foot is placed clear of its 7svh. Reduced motion: the squares hold
 * still; the split still follows.
 *
 * THE RIGHTS STRIP (owner, 2026-10-20: "a fixed black band just above the
 * pixelated black and color band", on the Tata slide, then "Similarly do for
 * all left section slides"): over the band, the whole width, plain black, a
 * left company slide's line, centred — "© Tata IIS. All Rights Reserved." — while it
 * is the camera's (Showcase.rights). Those slides end at its top (Flythrough,
 * RoomBody), so nothing of theirs stands under it.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { Z_INDEX } from "@/constants/design";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";

/** The band's height — a share of the screen. ⚠ HeroStage (BAND_H), the
 *  rooms' frames (.slide-frame) and every corner button clear this. */
export const BAND_SVH = 7;
/** The rights strip's height, over the band. */
export const RIGHTS_H = "clamp(1.3rem, 3svh, 1.6rem)";

/** A square, CSS px, and the half-width of the pixelated edge, in squares. */
const CELL = 7;
const EDGE = 3.5;
/** Of a square's own beat, the share it is lit. */
const LIT = 0.13;

export interface BandPart {
  title: string;
  sub?: string;
  /** Set: the part is a way to somewhere. */
  onGo?: () => void;
  /** Set: the part shows this in place of its words (the rooms' pills). */
  strip?: React.ReactNode;
}

const PAINT = RAINBOW.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
/** The rainbow at u (0 … 1 across the creative part). */
function paintAt(u: number) {
  const x = Math.max(0, Math.min(1, u)) * (PAINT.length - 1);
  const i = Math.min(PAINT.length - 2, Math.floor(x));
  const f = x - i;
  return PAINT[i].map((c, k) => Math.round(c + (PAINT[i + 1][k] - c) * f));
}

function BandField({ share, reduceMotion }: { share: MotionValue<number>; reduceMotion: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);
      const t = reduceMotion ? 0 : now / 1000;
      const s = share.get() * w;
      const span = Math.max(1, w - s);
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      const oy = (h - rows * CELL) / 2;
      for (let i = 0; i < cols; i++) {
        const cx = i * CELL + CELL / 2;
        // Across the edge, -1 … 1: the chance a square is black falls away.
        const d = (cx - s) / (EDGE * CELL);
        const paint = paintAt((cx - s) / span);
        for (let j = 0; j < rows; j++) {
          const r = hash(i + 3, j + 11);
          const black = d <= -1 ? true : d >= 1 ? false : r > (d + 1) / 2;
          const beat = 1.3 + hash(j + 5, i + 17) * 2.6;
          const lit = !reduceMotion && ((t / beat + hash(i + 29, j + 7)) % 1) < LIT;
          const x = i * CELL + 0.75;
          const y = oy + j * CELL + 0.75;
          const e = CELL - 1.5;
          if (black) {
            const a = lit ? 0.26 : r < 0.18 ? 0.07 : 0.035;
            ctx.fillStyle = `rgba(255,255,255,${a})`;
          } else {
            const a = lit ? 1 : 0.62 + 0.22 * hash(i + 41, j + 2);
            ctx.fillStyle = `rgba(${paint[0]},${paint[1]},${paint[2]},${a})`;
          }
          ctx.fillRect(x, y, e, e);
        }
      }
    };
    fit();
    let raf = 0;
    let last = 0;
    let lastShare = -1;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const sh = share.get();
      // The blink steps about twelve times a second; the split follows every
      // frame while it moves.
      if (sh !== lastShare || (!reduceMotion && now - last > 80)) {
        lastShare = sh;
        last = now;
        draw(now);
      }
    };
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(() => {
      fit();
      lastShare = -1;
    });
    ro.observe(canvas);
    // Hidden tab: nothing to draw.
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [share, reduceMotion]);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}

function Part({ part, side, major, minor }: { part: BandPart; side: "left" | "right"; major: boolean; minor: boolean }) {
  const logic = side === "left";
  const face = logic ? "face-logic tracking-[0.14em]" : "face-creative tracking-[0.03em]";
  const box = "pointer-events-auto absolute inset-y-0 flex items-center justify-center";
  if (part.strip) return <div className={`${box} inset-x-0`}>{part.strip}</div>;
  // No words at all (the first slide, since 2026-10-26): the squares alone.
  if (!part.title && !part.sub) return null;
  // The narrow part beside the pills: on a phone, only which way.
  const inner = (
    <span className={`flex min-w-0 max-w-full flex-col items-center gap-[0.2em] px-3 text-center leading-none ${minor ? "max-sm:px-1" : ""} ${major ? "" : "transition-transform duration-200 group-hover:scale-[1.04]"}`}>
      {part.sub && (
        <span
          className={`max-w-full truncate text-[clamp(0.5rem,0.75vw,0.66rem)] uppercase tracking-[0.24em] ${logic ? "text-white/55" : "text-white/85"} ${
            minor ? "max-sm:text-[0.56rem] max-sm:tracking-[0.06em] max-sm:text-white" : ""
          } [@media(max-height:31.25rem)]:hidden`}
        >
          {part.sub}
        </span>
      )}
      <span
        className={`max-w-full truncate font-bold text-white ${face} ${major ? "text-[clamp(0.72rem,1.45vw,1.15rem)]" : "text-[clamp(0.62rem,1.05vw,0.9rem)]"} ${
          logic ? "" : "[text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        } ${minor ? "max-sm:hidden" : ""}`}
      >
        {part.title}
      </span>
    </span>
  );
  if (!part.onGo) return <div className={`${box} inset-x-0`}>{inner}</div>;
  return (
    <button
      type="button"
      onClick={part.onGo}
      aria-label={`${part.sub ? `${part.sub} ` : ""}${part.title}`.replace(/[→←]/g, "").trim()}
      className={`group ${box} inset-x-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70`}
    >
      {inner}
    </button>
  );
}

export function FootBand({
  share,
  left,
  right,
  major,
  rights = null,
}: {
  /** The black part's share of the width, 0 … 1. */
  share: MotionValue<number>;
  left: BandPart;
  right: BandPart;
  /** Which part is the room the camera is in; null on the landing and at
   *  the footer, where both halves are ways in. */
  major: "left" | "right" | null;
  /** The company on the rights strip; null → no strip. */
  rights?: string | null;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const leftW = useTransform(share, (s) => `${s * 100}%`);
  const rightW = useTransform(share, (s) => `${(1 - s) * 100}%`);
  // The last company named stays on the strip while it fades out.
  const [named, setNamed] = useState(rights);
  if (rights && rights !== named) setNamed(rights);
  return (
    <>
    <div
      aria-hidden={!rights}
      className={`pointer-events-none fixed inset-x-0 flex items-center justify-center bg-black px-4 text-center transition-opacity duration-300 ease-out ${rights ? "opacity-100" : "opacity-0"}`}
      style={{ bottom: `${BAND_SVH}svh`, height: RIGHTS_H, zIndex: Z_INDEX.band }}
    >
      <p className="truncate text-[clamp(0.6rem,0.78vw,0.72rem)] tracking-[0.06em] text-white/75">
        © {named}. All Rights Reserved.
      </p>
    </div>
    <nav
      aria-label="The two sides"
      className="pointer-events-none fixed inset-x-0 bottom-0 overflow-hidden bg-neutral-950 text-[clamp(0.62rem,1.05vw,0.95rem)]"
      style={{ height: `${BAND_SVH}svh`, zIndex: Z_INDEX.band }}
    >
      <BandField share={share} reduceMotion={reduceMotion} />
      <motion.div className="absolute inset-y-0 left-0" style={{ width: leftW }}>
        <Part part={left} side="left" major={major === "left"} minor={major === "right"} />
      </motion.div>
      <motion.div className="absolute inset-y-0 right-0" style={{ width: rightW }}>
        <Part part={right} side="right" major={major === "right"} minor={major === "left"} />
      </motion.div>
    </nav>
    </>
  );
}
