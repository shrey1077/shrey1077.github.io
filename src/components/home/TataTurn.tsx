"use client";

/**
 * TataTurn — the student turning to face the camera, scrubbed by the
 * pointer, for the Tata slide (owner, 2026-10-16: "use the zero to this point
 * footage to replace the background and image of student … and the movement
 * of mouse in the right half of screen horizontally to correspond to the cut
 * video, with initial frame linked to left most position (in right half of
 * the slide) and final to right most").
 *
 * The cut's frames are stills (scripts/prepare-tata-turn.mjs) drawn to a
 * canvas: a video seeks too slowly to follow a mouse. The pointer's place
 * across the RIGHT HALF of the slide picks the frame — its left edge the
 * first, the slide's right edge the last; anywhere left of it, the first —
 * and the shown frame eases toward it, so a quick flick of the mouse still
 * reads as a turn. Where there is no mouse (a touch screen) the turn plays by
 * itself, there and back, with a rest at each end. Reduced motion: the first
 * frame, still.
 *
 * `fit`: "cover" fills the box with the whole frame (the slide's ground on a
 * wide screen); "student" shows the frame's right part — the student — whole
 * in the box, against its right edge (a tall screen's middle).
 * The frames wait for the slide to be near, the first one first.
 */

import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { NearContext } from "@/components/home/nearness";

const DIR = "/content/clients/tata-iis/hero/turn";
/** Frames 0 … 29 of the film (the owner's cut; scripts/prepare-tata-turn.mjs). */
const FRAMES = 30;
const SRC_W = 1920;
const SRC_H = 1080;
/** The share of the frame the student mode keeps, from its right edge. */
const STUDENT_FROM = 0.4;
/** How quickly the shown frame closes on the pointer's, per second. */
const FOLLOW = 7;
/** Touch screens: a pass, there or back, and the rest at each end (ms). */
const PASS_MS = 1700;
const REST_MS = 1600;

export function TataTurn({ live, reduceMotion, fit, className = "" }: { live: boolean; reduceMotion: boolean; fit: "cover" | "student"; className?: string }) {
  const near = useContext(NearContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>(Array.from({ length: FRAMES }, () => null));
  const shown = useRef(0); // the frame on the canvas, as a float
  const drawn = useRef(-1);
  const size = useRef({ w: 0, h: 0, dpr: 1 });

  const draw = (force = false) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !size.current.w) return;
    let k = Math.round(shown.current);
    // The nearest frame that has arrived.
    if (!imgs.current[k]) {
      let best = -1;
      for (let d = 1; d < FRAMES && best < 0; d++) {
        if (imgs.current[k - d]) best = k - d;
        else if (imgs.current[k + d]) best = k + d;
      }
      if (best < 0) return;
      k = best;
    }
    if (k === drawn.current && !force) return;
    const img = imgs.current[k]!;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (fit === "cover") {
      const s = Math.max(w / SRC_W, h / SRC_H);
      const dw = SRC_W * s;
      const dh = SRC_H * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      const sx = SRC_W * STUDENT_FROM;
      const sw = SRC_W - sx;
      const s = Math.min(w / sw, h / SRC_H);
      const dw = sw * s;
      const dh = SRC_H * s;
      const scale = img.naturalWidth / SRC_W;
      ctx.drawImage(img, sx * scale, 0, sw * scale, SRC_H * scale, w - dw, (h - dh) / 2, dw, dh);
    }
    drawn.current = k;
  };

  // The canvas's size, kept.
  useLayoutEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const fitSize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      size.current = { w, h, dpr };
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      draw(true);
    };
    fitSize();
    const ro = new ResizeObserver(fitSize);
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw reads refs
  }, [fit]);

  // The frames: when near, the first, then the rest in order.
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const big = (canvasRef.current?.clientWidth ?? 0) * Math.min(2, window.devicePixelRatio || 1) > 1100;
    const width = big ? 1600 : 960;
    const load = (k: number) =>
      new Promise<void>((ok) => {
        if (imgs.current[k]) return ok();
        const im = new Image();
        im.decoding = "async";
        im.src = `${DIR}/${width}/${String(k).padStart(2, "0")}.webp`;
        im.onload = () => {
          if (!cancelled) {
            imgs.current[k] = im;
            draw(Math.round(shown.current) === k || drawn.current < 0);
          }
          ok();
        };
        im.onerror = () => ok();
      });
    (async () => {
      await load(0);
      for (let k = 1; k < FRAMES && !cancelled; k += 4) await Promise.all([k, k + 1, k + 2, k + 3].filter((j) => j < FRAMES).map(load));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw reads refs
  }, [near]);

  // The turn: the pointer's place across the right half, or by itself.
  useEffect(() => {
    if (!live || reduceMotion) {
      shown.current = 0;
      draw();
      return;
    }
    const c = canvasRef.current;
    if (!c) return;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let target = 0;
    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      // The slide is the canvas's section: its right half, edge to edge.
      const box = (c.closest("section") ?? c).getBoundingClientRect();
      const mid = box.left + box.width / 2;
      const f = (e.clientX - mid) / (box.right - mid);
      target = Math.max(0, Math.min(1, f)) * (FRAMES - 1);
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!mouse) {
        // There and back, by itself.
        const cycle = 2 * (PASS_MS + REST_MS);
        const t = (now - t0) % cycle;
        const ease = (u: number) => u * u * (3 - 2 * u);
        target =
          t < PASS_MS ? ease(t / PASS_MS) : t < PASS_MS + REST_MS ? 1 : t < 2 * PASS_MS + REST_MS ? 1 - ease((t - PASS_MS - REST_MS) / PASS_MS) : 0;
        target *= FRAMES - 1;
        shown.current = target;
      } else {
        shown.current += (target - shown.current) * (1 - Math.exp(-dt * FOLLOW));
      }
      draw();
    };
    if (mouse) window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw reads refs
  }, [live, reduceMotion]);

  return <canvas ref={canvasRef} aria-hidden className={`block h-full w-full ${className}`} />;
}
