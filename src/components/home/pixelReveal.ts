"use client";

/**
 * pixelReveal — small things appearing and going in squares (owner,
 * 2026-10-15: the sections button "appear/disappear with pixel effect, when
 * move between 3 to 2 vice versa").
 *
 * The same idea as the rooms' dissolve (pixelDissolve) at the size of a
 * control: the element is clipped to a grid of `cell`-px squares, each
 * growing in (or shrinking away) about its own centre at its own moment —
 * mostly random, drifting a little from left to right. It keeps its own
 * small grids: pixelDissolve caches ONE grid per square size, for the stage,
 * and a button sharing it would throw that away every frame.
 *
 * usePixelPresence(show) drives one element: in when `show` turns true, out
 * when false, and `visibility: hidden` (so nothing takes the pointer) once
 * gone. Reduced motion: it simply shows or hides.
 * ⚠ Give the element the `invisible` class while `show` is false, so the
 * server's HTML starts hidden too; the inline visibility set here outranks it
 * through the move out.
 */

import { useLayoutEffect, useRef } from "react";
import { animate } from "framer-motion";
import { hash, smooth } from "@/components/home/pixelDissolve";

/** Of the move, the share one square takes to turn. */
const TURN = 0.4;

interface Order {
  w: number;
  h: number;
  cols: number;
  rows: number;
  start: Float32Array;
}

const orders = new Map<string, Order>();

function orderFor(w: number, h: number, cell: number): Order {
  const key = `${w}x${h}@${cell}`;
  const hit = orders.get(key);
  if (hit) return hit;
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const n = cols * rows;
  const keyOf = new Float32Array(n);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) keyOf[i * rows + j] = 0.72 * hash(i + 3, j + 41) + 0.28 * (i / Math.max(1, cols - 1));
  const rank = Array.from({ length: n }, (_, k) => k).sort((a, b) => keyOf[a] - keyOf[b]);
  const start = new Float32Array(n);
  rank.forEach((k, r) => {
    start[k] = (n > 1 ? r / (n - 1) : 0) * (1 - TURN);
  });
  const o = { w, h, cols, rows, start };
  if (orders.size > 24) orders.clear();
  orders.set(key, o);
  return o;
}

/** The clip at progress `g` (0 … 1): "in" grows the squares, "out" shrinks
 *  them. "none" when whole, "" when nothing is left. */
export function revealClip(w: number, h: number, cell: number, g: number, role: "in" | "out"): string {
  const o = orderFor(Math.round(w), Math.round(h), cell);
  let path = "";
  let whole = 0;
  const f = (v: number) => v.toFixed(1);
  for (let i = 0; i < o.cols; i++) {
    for (let j = 0; j < o.rows; j++) {
      const t = Math.max(0, Math.min(1, (g - o.start[i * o.rows + j]) / TURN));
      const size = role === "in" ? smooth(t) : 1 - smooth(t);
      if (size >= 0.998) whole++;
      if (size <= 0.002) continue;
      const e = cell * size + (size >= 0.998 ? 0.6 : 0);
      const x = i * cell + (cell - e) / 2;
      const y = j * cell + (cell - e) / 2;
      path += `M${f(x)} ${f(y)}h${f(e)}v${f(e)}h-${f(e)}z`;
    }
  }
  if (whole === o.cols * o.rows) return "none";
  return path ? `path("${path}")` : "";
}

export function usePixelPresence<T extends HTMLElement>(
  show: boolean,
  { cell = 6, duration = 0.6, reduceMotion = false }: { cell?: number; duration?: number; reduceMotion?: boolean } = {},
) {
  const ref = useRef<T>(null);
  // How far in the element is, 0 … 1 — so a turn back mid-way starts from there.
  const shown = useRef(show ? 1 : 0);
  const anim = useRef<{ stop: () => void } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    anim.current?.stop();
    const target = show ? 1 : 0;
    if (reduceMotion || shown.current === target) {
      shown.current = target;
      el.style.clipPath = "";
      el.style.visibility = show ? "visible" : "hidden";
      return;
    }
    el.style.visibility = "visible";
    const from = shown.current;
    anim.current = animate(from, target, {
      duration: duration * Math.abs(target - from),
      ease: "linear",
      onUpdate: (v) => {
        shown.current = v;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        // In: the squares grow over the move; out: they shrink — the same
        // order both ways, so a reversal is seamless.
        const clip = show ? revealClip(w, h, cell, v, "in") : revealClip(w, h, cell, 1 - v, "out");
        el.style.clipPath = clip === "" ? "inset(50%)" : clip;
      },
      onComplete: () => {
        el.style.clipPath = "";
        if (!show) el.style.visibility = "hidden";
      },
    });
    return () => anim.current?.stop();
  }, [show, cell, duration, reduceMotion]);

  return ref;
}
