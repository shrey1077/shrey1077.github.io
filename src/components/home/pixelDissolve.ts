/**
 * pixelDissolve — the half-inch squares every move of the Flythrough turns
 * over on (2026-10-10, owner: "the pixel effect between transitions is very
 * quick, and i need it across the width of the screen … dont remove the fly
 * through effect, just the dissolve should be done in pixel effects").
 *
 * The screen is one grid of CELL px squares, and each square has its own
 * moment in a move. Two things read that one timing, so they always agree:
 *   · the rooms' CLIP (Flythrough's Slide): on a step between two rooms the
 *     one flying past shrinks away square by square while the one arriving
 *     grows in, square by square, behind it — the fly-through's dissolve,
 *     done in pixels instead of a fade;
 *   · the VEIL (PixelVeil): a glass tile that lights over each square at the
 *     moment it turns, so the wave reads across the whole screen — over the
 *     white ground too, where a room has nothing to dissolve.
 *
 * The order the squares go in is fixed per screen size: from the middle
 * outward on a fly-through (it opens like a tunnel), from the side the new
 * view comes in on a move across the plane — each blended with a slow noise,
 * so neighbours turn in drifting clusters rather than in rings or rows, and
 * ranked so the squares turn at an even rate from the first to the last.
 *
 * Timing is in TIME, not distance: the flights ease (FLY_EASE), and squares
 * spread evenly over the eased camera would all turn in its fast middle.
 * `easeTime` takes the camera's progress back to the share of the flight's
 * time gone, so the squares turn at a steady pace from take-off to landing.
 */

/** The square, CSS px (≈ half an inch at 96 dpi). */
export const CELL = 48;
/** Of a move, the share one square takes to turn over. The last starts at
 *  1 − WINDOW, so it has just turned as the move lands. */
export const WINDOW = 0.36;
/** The flights' ease, as a CSS cubic-bezier — Flythrough's flights and pans. */
export const FLY_EASE = [0.65, 0, 0.35, 1] as const;

/** Where a move's wave comes from: the middle (a fly-through), or a side. */
export type WaveFrom = "centre" | "below" | "below-left" | "below-right" | "left" | "right";

const FROM: Record<Exclude<WaveFrom, "centre">, { x: number; y: number }> = {
  below: { x: 0, y: 1 },
  "below-left": { x: -1, y: 1 },
  "below-right": { x: 1, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** A fixed pseudo-random number in [0, 1) per lattice point. */
function hash(i: number, j: number) {
  const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Smooth value noise in [0, 1): `scale` cells to a lattice step. */
function noise(i: number, j: number, scale: number) {
  const x = i / scale;
  const y = j / scale;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const a = hash(x0 + 17, y0 + 5);
  const b = hash(x0 + 18, y0 + 5);
  const c = hash(x0 + 17, y0 + 6);
  const d = hash(x0 + 18, y0 + 6);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/** Cubic bezier coordinate for control values a, b (ends at 0 and 1). */
function bez(t: number, a: number, b: number) {
  const u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
}

/** The share of a flight's TIME gone when the camera is `f` of the way. */
export function easeTime(f: number) {
  if (f <= 0) return 0;
  if (f >= 1) return 1;
  const [x1, y1, x2, y2] = FLY_EASE;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (bez(m, y1, y2) < f) lo = m;
    else hi = m;
  }
  return bez((lo + hi) / 2, x1, x2);
}

export interface Grid {
  w: number;
  h: number;
  n: number;
  /** Each square's top-left corner. */
  x: Float32Array;
  y: Float32Array;
  /** A fixed random number per square — the veil's accents. */
  seed: Float32Array;
  /** When each square starts to turn, in [0, 1 − WINDOW], per wave. */
  start: (from: WaveFrom) => Float32Array;
}

let cached: Grid | null = null;

/** The grid for a screen size, laid out from the middle so the squares sit
 *  symmetrically. One at a time is cached — there is one stage. */
export function gridFor(w: number, h: number): Grid {
  if (cached && cached.w === w && cached.h === h) return cached;
  const cols = Math.ceil(w / CELL) + 1;
  const rows = Math.ceil(h / CELL) + 1;
  const ox = (w - cols * CELL) / 2;
  const oy = (h - rows * CELL) / 2;
  const n = cols * rows;
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const seed = new Float32Array(n);
  const drift = new Float32Array(n);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const k = i * rows + j;
      x[k] = ox + i * CELL;
      y[k] = oy + j * CELL;
      seed[k] = hash(i + 101, j + 37);
      drift[k] = noise(i, j, 5);
    }
  }

  const waves = new Map<WaveFrom, Float32Array>();
  const start = (from: WaveFrom) => {
    const hit = waves.get(from);
    if (hit) return hit;
    // How far along the wave each square is, 0 where it starts … 1.
    const along = new Float32Array(n);
    const half = Math.hypot(w, h) / 2;
    for (let k = 0; k < n; k++) {
      const cx = x[k] + CELL / 2 - w / 2;
      const cy = y[k] + CELL / 2 - h / 2;
      if (from === "centre") {
        along[k] = Math.min(1, Math.hypot(cx, cy) / half);
      } else {
        const d = FROM[from];
        const len = Math.hypot(d.x, d.y);
        const reach = (Math.abs(d.x) * w + Math.abs(d.y) * h) / len;
        along[k] = clamp01(0.5 - (cx * d.x + cy * d.y) / len / reach);
      }
    }
    // Blend with the drifting noise, then rank, so the squares turn at an
    // even rate however the blend is spread.
    const mix = from === "centre" ? 0.45 : 0.32;
    const key = new Float32Array(n);
    for (let k = 0; k < n; k++) key[k] = (1 - mix) * along[k] + mix * drift[k] + (seed[k] - 0.5) * 0.05;
    const order = Array.from({ length: n }, (_, k) => k).sort((a, b) => key[a] - key[b]);
    const s = new Float32Array(n);
    order.forEach((k, r) => {
      s[k] = (n > 1 ? r / (n - 1) : 0) * (1 - WINDOW);
    });
    waves.set(from, s);
    return s;
  };

  cached = { w, h, n, x, y, seed, start };
  return cached;
}

/** How far square `k` has turned, 0 … 1, at time-share `g` of the move. */
export function turned(start: Float32Array, k: number, g: number) {
  return clamp01((g - start[k]) / WINDOW);
}

/**
 * The clip for a room on a step between rooms, at time-share `g`: "out" for
 * the one flying past (each square shrinks away over the first half of its
 * turn), "in" for the one arriving (each grows in over the second half). The
 * veil's tile is brightest at the half, over the hand-over.
 * Returns "none" when nothing is clipped yet, "" when nothing is left.
 */
export function clipFor(grid: Grid, g: number, role: "out" | "in"): string {
  const s = grid.start("centre");
  let path = "";
  let whole = 0;
  for (let k = 0; k < grid.n; k++) {
    const t = turned(s, k, g);
    const size = role === "out" ? 1 - smooth(clamp01(t * 2)) : smooth(clamp01(t * 2 - 1));
    if (size <= 0.002) continue;
    if (size >= 0.998) {
      whole++;
      // A hair over the square, so whole neighbours meet without a seam.
      path += `M${(grid.x[k] - 0.5).toFixed(1)} ${(grid.y[k] - 0.5).toFixed(1)}h${CELL + 1}v${CELL + 1}h-${CELL + 1}z`;
      continue;
    }
    const e = CELL * size;
    const ix = grid.x[k] + (CELL - e) / 2;
    const iy = grid.y[k] + (CELL - e) / 2;
    path += `M${ix.toFixed(1)} ${iy.toFixed(1)}h${e.toFixed(1)}v${e.toFixed(1)}h-${e.toFixed(1)}z`;
  }
  if (whole === grid.n) return "none";
  return path ? `path("${path}")` : "";
}
