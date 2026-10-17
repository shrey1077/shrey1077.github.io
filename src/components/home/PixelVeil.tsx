"use client";

/**
 * PixelVeil — the tiles that light over the squares as a move turns them
 * (2026-10-10, owner: "add like a half inch square pixels effect in
 * flythrough, very smooth and high tech"; then, the same day: "very quick,
 * and i need it across the width of the screen").
 *
 * One canvas over the whole stage, drawn only while a move is under way. Each
 * square of the grid (pixelDissolve) lights as a glass tile at its own moment
 * and goes out again — brightest at the half of its turn, which on a step
 * between rooms is exactly when the room flying past has gone from that
 * square and the next has not yet arrived in it, so the tile covers the
 * hand-over. The wave covers the WHOLE screen, ground included:
 *   · between two rooms — the fly-through — from the middle outward;
 *   · from the orb to the brain (since 2026-10-14, owner: "need the pixel
 *     transition effect in between slide 1 and 2"), from below, where the
 *     brain rises from;
 *   · from the brain into a column, from the lower corner the room comes in
 *     from; on a pan across, from the side the new column comes in from —
 *     in SMALLER squares, CELL ÷ φ (PAN_CELL; owner, 2026-10-14).
 * The tiles: a pale glass face with a graphite hairline, a few with a dark
 * "data" core and a few lit solid — the site's own greys. On the creative
 * side those few dark ones are PAINT instead (owner, 2026-10-10: "the very
 * few random pixels that are black in color should be in rainbow colors"):
 * the rainbow of the creative ground (MoodField's RAINBOW), each square
 * taking the colour of its place in a sweep across the screen.
 *
 * Driven straight from the camera's motion values — it scrubs with the
 * scroll, backward as well as forward, and never re-renders React. Reduced
 * motion: nothing.
 */

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";
import { CELL, PAN_CELL, easeTime, flyInTime, flyOutTime, gridFor, turned, type WaveFrom } from "@/components/home/pixelDissolve";
import { RAINBOW } from "@/components/home/MoodField";

/** Shares of the squares that carry a dark core, and that light solid. */
const CORE_SHARE = 0.09;
const SOLID_SHARE = 0.035;

/** The rainbow as 0–255 RGB, and the colour at `u` turns round it. */
const PAINT = RAINBOW.map((hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
});
function paintAt(u: number): string {
  const t = (((u % 1) + 1) % 1) * PAINT.length;
  const i = Math.floor(t);
  const f = t - i;
  const a = PAINT[i];
  const b = PAINT[(i + 1) % PAINT.length];
  return `${Math.round(a[0] + (b[0] - a[0]) * f)}, ${Math.round(a[1] + (b[1] - a[1]) * f)}, ${Math.round(a[2] + (b[2] - a[2]) * f)}`;
}

export function PixelVeil({
  p,
  trackX,
  track,
  firstRoom,
  reduceMotion,
}: {
  /** The camera, in slides. */
  p: MotionValue<number>;
  /** The pan between the tracks, 0 (logic) … 1 (creative). */
  trackX: MotionValue<number>;
  /** The track the pan is heading for — which side the new view comes from. */
  track: "logic" | "creative";
  /** The first room's slide: the step INTO it is the one across the plane;
   *  every step after it is a fly-through. */
  firstRoom: number;
  reduceMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const raf = useRef(0);
  const trackRef = useRef(track);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  const draw = () => {
    raf.current = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (reduceMotion || !w || !h) return;

    // Which move is under way, how far through it (in time), and where its
    // wave comes from.
    const tx = trackX.get();
    const v = p.get();
    let f = 0;
    let from: WaveFrom | null = null;
    let cell = CELL;
    if (tx > 0.002 && tx < 0.998) {
      const toCreative = trackRef.current === "creative";
      f = toCreative ? tx : 1 - tx;
      from = toCreative ? "right" : "left";
      cell = PAN_CELL;
    } else {
      const base = Math.floor(v);
      f = v - base;
      if (base === firstRoom - 1) from = tx > 0.5 ? "below-right" : "below-left";
      else if (base >= firstRoom) from = "centre";
      // The orb to the brain: the brain rises from below.
      else if (base === firstRoom - 2) from = "below";
    }
    if (!from || f <= 0.002 || f >= 0.998) {
      canvas.style.visibility = "hidden";
      return;
    }
    canvas.style.visibility = "visible";

    // A move on the creative side lights its accents in paint, not graphite:
    // a pan by where it is heading, a step by the track it is on.
    const creative = tx > 0.002 && tx < 0.998 ? trackRef.current === "creative" : tx > 0.5;

    const grid = gridFor(w, h, cell);
    const side = grid.cell;
    // A fly-through turns each square twice — the room going rim-first, the
    // one coming rim-last (2026-10-17) — and a tile lights at either turn.
    const fly = from === "centre";
    const start = grid.start(fly ? "rim-first" : from);
    const startIn = fly ? grid.start("rim-last") : null;
    const g = easeTime(f);
    // Each turn on its own half of the move (staggered, as the rooms' are).
    const gOut = fly ? flyOutTime(g) : g;
    const gIn = flyInTime(g);
    for (let k = 0; k < grid.n; k++) {
      const t = turned(start, k, gOut);
      const t2 = startIn ? turned(startIn, k, gIn) : 0;
      const live = t > 0 && t < 1;
      const live2 = t2 > 0 && t2 < 1;
      if (!live && !live2) continue;
      // 0 → 1 → 0, smooth at both ends; the brighter of the two turns.
      const a = Math.max(live ? Math.sin(Math.PI * t) : 0, live2 ? Math.sin(Math.PI * t2) : 0);
      // The tile swells a little as it lights.
      const e = side * (0.72 + 0.28 * a) - 2;
      const x = grid.x[k] + (side - e) / 2;
      const y = grid.y[k] + (side - e) / 2;
      const r = grid.seed[k];
      // The accent's colour: graphite, or the paint of this square's place.
      const ink =
        r < SOLID_SHARE + CORE_SHARE
          ? creative
            ? paintAt((grid.x[k] + side / 2) / w * 0.9 + (grid.y[k] + side / 2) / h * 0.3)
            : "24, 24, 27"
          : "";
      if (r < SOLID_SHARE) {
        ctx.fillStyle = `rgba(${ink}, ${(creative ? 0.88 : 0.78) * a})`;
        ctx.fillRect(x, y, e, e);
        continue;
      }
      ctx.fillStyle = `rgba(244, 244, 245, ${0.86 * a})`;
      ctx.fillRect(x, y, e, e);
      ctx.strokeStyle = `rgba(24, 24, 27, ${0.32 * a})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, e - 1, e - 1);
      if (r < SOLID_SHARE + CORE_SHARE) {
        const c = e * 0.26;
        ctx.fillStyle = `rgba(${ink}, ${(creative ? 0.9 : 0.7) * a})`;
        ctx.fillRect(x + (e - c) / 2, y + (e - c) / 2, c, c);
      }
    }
  };

  const schedule = () => {
    if (!raf.current) raf.current = requestAnimationFrame(draw);
  };
  useMotionValueEvent(p, "change", schedule);
  useMotionValueEvent(trackX, "change", schedule);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      schedule();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[125] h-full w-full"
      style={{ visibility: "hidden" }}
    />
  );
}
