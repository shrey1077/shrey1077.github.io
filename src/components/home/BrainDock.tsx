"use client";

/**
 * BrainDock — the landing's brain, carried into the rooms (2026-10-03, owner:
 * "make the circle bigger, 80% of the screen height, and only a semicircle
 * visible … I would love to see slide 3's video animating from slide 2").
 *
 * ONE brain for the whole run, outside the slides, posed by the camera:
 *   · up to the brain slide it is not drawn — the landing has its own brain;
 *   · flying from the brain slide to the first room it LIFTS OFF the landing,
 *     exactly where the landing's brain stood, and shrinks and slides into a
 *     round window 80% of the screen tall, centred ON an edge, so only half of
 *     it is on screen;
 *   · on the logic track that edge is the RIGHT one — the grey brain and its
 *     circuitry show; on the creative track it is the LEFT — the colour half
 *     and its splash. Between the two it is the HINGE of the sideways pan
 *     (Flythrough's two parallel tracks): it swings from one edge to the
 *     other with the rooms, and the brain turns as it goes.
 * No mask: the screen edge is what hides the other half. (A per-frame cut to
 * one hemisphere — BrainWindow, white beyond the seam — lasted an hour.)
 *
 * THE WAY ACROSS. Inside the visible half sits "Click to <the room level with
 * this one, on the other track>" and an arrow blinking toward it (owner,
 * 2026-10-03). The whole half-window is the button.
 *
 * The picture is a live COPY of the landing's canvas (BrainSequence, tagged
 * `data-brain`), which keeps turning in the rooms on its own (its "left" and
 * "right" modes). So the hand-over at the brain slide is pixel-exact, and the
 * dock costs one blit per new frame and no extra frames in memory.
 *
 * Below `lg` the window is smaller and sits up beside each room's header,
 * still half off the edge.
 *
 * Everything is written straight to the DOM from the motion values — nothing
 * here re-renders on scroll.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, type MotionValue } from "framer-motion";
import { BRAIN_CENTRE, toStage } from "@/components/home/BrainTraces";
import { BRAIN_FRAME_H, BRAIN_FRAME_W } from "@/components/home/BrainSequence";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { typeVoiceClass } from "@/constants/typography";

/** The frame point that sits on the window's centre: the seam, at the middle
 *  of the brain's height (it spans rows ~118–613). */
const FOCUS = { x: BRAIN_CENTRE.x, y: 366 };
/** How much of the frame (px, square) the docked window shows across. */
const WINDOW_FRAME = 660;
/** The clip's radius before it starts to close — wide enough that the whole
 *  frame shows, as it does on the landing. */
const OPEN_R = 820;
/** The landing brain's feathered right edge, repeated so the hand-over is
 *  exact. Keep in step with BrainSequence's FEATHER. */
const FEATHER = "linear-gradient(to right, #000 0%, #000 88%, transparent 100%)";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function BrainDock({
  p,
  trackX,
  enter,
  pose,
  reduceMotion,
  across,
  onAcross,
}: {
  /** The camera, in slides. */
  p: MotionValue<number>;
  /** The pan between the tracks: 0 logic (docked right), 1 creative (left). */
  trackX: MotionValue<number>;
  /** The brain slide's index: the dock lifts off the landing between this
   *  and the next. */
  enter: number;
  /** The landing footage's resting transform (HeroStage). */
  pose: { scale: number; scalePhone: number; shiftX: number; rise: number };
  reduceMotion: boolean;
  /** Where the button inside leads: the room level with this one, its face,
   *  and which way the arrow points. */
  across: { label: string; face: "logic" | "creative"; toward: "left" | "right" };
  onAcross: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const compact = useMediaQuery("(max-width: 1023px)");
  const tallCompact = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  // Which edge it is docked at — only to paint the ring (white or paint).
  const [creative, setCreative] = useState(false);
  const shown = useRef(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pose the window for a camera position and a pan.
  const apply = (v: number, tx: number) => {
    const root = rootRef.current;
    const disc = discRef.current;
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    if (!root || !disc || !canvas || !button || !size) return;
    const { w, h } = size;
    const visible = v > enter + 1e-4;
    shown.current = visible;
    root.style.visibility = visible ? "visible" : "hidden";
    setCreative(tx > 0.5);
    if (!visible) return;

    // Landing pose: the footage as HeroStage places it.
    const cs = tallCompact ? pose.scalePhone : pose.scale;
    const fit = Math.min(w / BRAIN_FRAME_W, h / BRAIN_FRAME_H);
    const land = toStage(FOCUS.x, FOCUS.y, w, h, cs, pose.shiftX, pose.rise);
    const landS = fit * cs;

    // Docked: 80% of the stage tall, centred on an edge (desktop); smaller and
    // level with the room's header below `lg`.
    const d = compact ? Math.min(w * 0.5, 240) : h * 0.8;
    const dockY = compact ? Math.max(h * 0.08, 80) + d / 2 : h / 2;
    const dockS = d / WINDOW_FRAME;
    const dockR = WINDOW_FRAME / 2;

    let t = clamp01(v - enter);
    if (reduceMotion) t = t < 0.5 ? 0 : 1;
    const e = ease(t);
    // Across with the pan: the right edge (logic) → the left (creative), a
    // little smaller mid-way so it reads as swinging rather than sliding.
    const dockX = lerp(w, 0, tx);
    const dip = 1 - 0.18 * Math.sin(Math.PI * tx);

    const s = lerp(landS, dockS * dip, e);
    const r = lerp(OPEN_R, dockR, e); // frame px
    const x = lerp(land.x, dockX, e);
    const y = lerp(land.y, dockY, e);

    canvas.style.transform = `translate(${x - FOCUS.x * s}px, ${y - FOCUS.y * s}px) scale(${s})`;
    canvas.style.clipPath = `circle(${r}px at ${FOCUS.x}px ${FOCUS.y}px)`;
    const R = r * s;
    disc.style.transform = `translate(${x - R}px, ${y - R}px)`;
    disc.style.width = disc.style.height = `${2 * R}px`;
    // The ring and the shadow arrive as it docks.
    disc.style.setProperty("--dock-ring", String(e));

    // The button covers the window, and shows only while it is docked and
    // still — not mid-lift-off, not mid-pan.
    button.style.transform = disc.style.transform;
    button.style.width = button.style.height = disc.style.width;
    const settled = clamp01((t - 0.85) / 0.15) * (1 - clamp01(Math.sin(Math.PI * tx) * 4));
    button.style.opacity = String(settled);
    button.style.pointerEvents = settled > 0.6 ? "auto" : "none";
  };

  useMotionValueEvent(p, "change", (v) => apply(v, trackX.get()));
  useMotionValueEvent(trackX, "change", (tx) => apply(p.get(), tx));
  // Re-pose on resize, and once on mount.
  useEffect(() => {
    apply(p.get(), trackX.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, compact, tallCompact]);

  // Copy the landing's canvas whenever it shows a new frame, while visible.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let src: HTMLCanvasElement | null = null;
    let last = "";
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!shown.current) return;
      src ??= document.querySelector<HTMLCanvasElement>("canvas[data-brain]");
      if (!src) return;
      const f = src.dataset.frame ?? "";
      if (f === last) return;
      last = f;
      ctx.clearRect(0, 0, BRAIN_FRAME_W, BRAIN_FRAME_H);
      ctx.drawImage(src, 0, 0);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const right = across.toward === "right";

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[130] overflow-hidden" style={{ visibility: "hidden" }}>
      {/* The window's ground and ring: white light on the logic side, paint
          on the creative — a 3px rim round a disc of the landing's own wall
          colour, so the brain sits on what it sat on before. */}
      <div
        ref={discRef}
        aria-hidden
        className={`absolute left-0 top-0 rounded-full p-[3px] ${creative ? "brain-paint" : "bg-white/50"}`}
        style={{ boxShadow: "0 30px 90px rgba(0,0,0,calc(0.5 * var(--dock-ring, 0)))" }}
      >
        <div className="h-full w-full rounded-full bg-gallery" />
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden
        width={BRAIN_FRAME_W}
        height={BRAIN_FRAME_H}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: BRAIN_FRAME_W, height: BRAIN_FRAME_H, maskImage: FEATHER, WebkitMaskImage: FEATHER }}
      />

      {/* The way across — the whole window is the button; the prompt sits in
          the middle of its VISIBLE half (a quarter of the way in from the
          on-screen side), low enough to leave the brain's crown clear. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={onAcross}
        aria-label={`Go across to ${across.label}`}
        className="group absolute left-0 top-0 cursor-pointer rounded-full outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-white/80"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <span
          className={`absolute top-[72%] flex max-w-[40%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-neutral-950/80 px-4 py-3 text-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 max-lg:top-1/2 max-lg:max-w-[46%] max-lg:gap-0.5 max-lg:rounded-xl max-lg:px-2 max-lg:py-1.5 ${
            right ? "left-1/4" : "left-3/4"
          }`}
        >
          <span className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.28em] text-white/60 max-lg:hidden`}>
            Click to
          </span>
          <span
            className={`${
              across.face === "creative" ? "font-graff font-bold" : "font-digibra"
            } text-[clamp(1rem,1.5vw,1.45rem)] leading-tight max-lg:text-[0.68rem]`}
          >
            {across.label}
            <span className="max-lg:hidden"> section</span>
          </span>
          <motion.span
            aria-hidden
            className="block text-lg leading-none max-lg:text-sm"
            animate={reduceMotion ? undefined : { x: right ? [0, 7, 0] : [0, -7, 0], opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          >
            {right ? "→" : "←"}
          </motion.span>
        </span>
      </button>
    </div>
  );
}
