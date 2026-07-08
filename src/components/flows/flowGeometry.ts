/**
 * flowGeometry — seeded procedural generators for the brain's flow systems.
 *
 * Pure functions (no React, no DOM): given a seeded RNG (utils/random), they
 * return SVG path strings / small element specs. The flow components
 * (LogicalFlow, DetailLayer) place and animate the output. Every generator is
 * deterministic in its seed, so a spawned item is stable for its lifetime while
 * the stream as a whole never obviously repeats (each spawn gets a fresh seed).
 *
 * Coordinates are in each item's OWN small viewBox (default 200×140); the
 * component scales/places the item. See docs/BRAIN_SYSTEM.md.
 */

import { randomInRange, type SeededRandom } from "@/utils/random";

export const ITEM_VIEW = { w: 200, h: 140 } as const;

/* ── Logical: orthogonal circuit trace with pads/vias ─────────────────── */

export interface CircuitTrace {
  /** The main trace path (Manhattan routing). */
  d: string;
  /** Pad/via positions along the trace. */
  pads: { x: number; y: number }[];
}

/** A circuit trace that starts at the item's right edge (toward the brain) and
 *  routes left in axis-aligned steps — a signal leaving the cortex. */
export function circuitTrace(next: SeededRandom): CircuitTrace {
  const { w, h } = ITEM_VIEW;
  let x = w - 4;
  let y = randomInRange(next, h * 0.3, h * 0.7);
  const pts: [number, number][] = [[x, y]];
  const pads: { x: number; y: number }[] = [];
  const steps = Math.floor(randomInRange(next, 4, 7));
  for (let i = 0; i < steps; i += 1) {
    // alternate horizontal / vertical moves, always trending left
    if (i % 2 === 0) {
      x -= randomInRange(next, 22, 44);
    } else {
      y += randomInRange(next, -34, 34);
    }
    x = Math.max(6, x);
    y = Math.max(10, Math.min(h - 10, y));
    pts.push([x, y]);
    if (next() < 0.5) pads.push({ x, y });
  }
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  return { d, pads };
}

/* ── Logical: small node graph (polygon of nodes + chords) ────────────── */

export interface NodeGraph {
  nodes: { x: number; y: number }[];
  edges: [number, number][];
}

export function nodeGraph(next: SeededRandom): NodeGraph {
  const { w, h } = ITEM_VIEW;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const r = randomInRange(next, 32, 52);
  const count = Math.floor(randomInRange(next, 5, 8));
  const start = next() * Math.PI * 2;
  const nodes = Array.from({ length: count }, (_, i) => {
    const a = start + (i / count) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.8 };
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < count; i += 1) edges.push([i, (i + 1) % count]); // ring
  // a few chords
  const chords = Math.floor(randomInRange(next, 1, 3));
  for (let i = 0; i < chords; i += 1) {
    const a = Math.floor(next() * count);
    const b = (a + 2 + Math.floor(next() * (count - 3))) % count;
    edges.push([a, b]);
  }
  return { nodes, edges };
}

/* ── Creative: looping ink scribble / organic path ────────────────────── */

/** A continuous looping scribble — lots of curl, drawn in one stroke. Used by
 *  the DetailLayer and creative neuron events. */
export function inkScribble(next: SeededRandom, loops = 3): string {
  const { w, h } = ITEM_VIEW;
  let x = randomInRange(next, w * 0.2, w * 0.4);
  let y = randomInRange(next, h * 0.4, h * 0.6);
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  const segs = loops * 4 + Math.floor(randomInRange(next, 2, 5));
  let angle = next() * Math.PI * 2;
  for (let i = 0; i < segs; i += 1) {
    angle += randomInRange(next, -1.6, 1.9); // curl
    const len = randomInRange(next, 16, 34);
    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;
    const c1x = x + Math.cos(angle - 0.6) * len * 0.5;
    const c1y = y + Math.sin(angle - 0.6) * len * 0.5;
    const c2x = nx - Math.cos(angle + 0.6) * len * 0.5;
    const c2y = ny - Math.sin(angle + 0.6) * len * 0.5;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
    y = ny;
  }
  return d;
}

/* ── Curated content pools ────────────────────────────────────────────── */

/** Mathematical notation, in reading order of "complexity". Serif rendering. */
export const MATH_GLYPHS = [
  "E = mc²",
  "∇·E = ρ/ε₀",
  "φ = ∮ E · dA",
  "∑ xᵢ = 0",
  "∂f/∂x",
  "f(x) → y",
  "π ≈ 3.14159",
  "√2",
  "a² + b² = c²",
  "lim x→∞",
] as const;

/** Short code fragments (mono). Kept syntactically plausible, semantically calm. */
export const CODE_FRAGMENTS = [
  "function simplify(x) {\n  return reduce(x);\n}",
  "const system = compose(\n  parts,\n);",
  "map(input, refine)",
  "if (noise) remove(noise);",
  "grid.align(everything)",
  "return less;",
] as const;

/** Binary / matrix blocks (mono). */
export const MATRIX_BLOCKS = [
  "1 0 0\n0 1 0\n0 0 1",
  "1010\n0110\n1101",
  "[ 1  0 ]\n[ 0  1 ]",
] as const;

/**
 * Tiny sketchbook doodles as SVG path data (in ITEM_VIEW space), drawn in a
 * single quick stroke each. Loose on purpose — a designer's margin marks.
 */
export const DOODLE_PATHS = [
  // paper plane
  "M 40 90 L 150 50 L 95 95 L 150 50 L 90 120 L 95 95 Z",
  // lightbulb
  "M 100 40 a 26 26 0 1 0 0.1 0 M 88 88 l 24 0 M 90 98 l 20 0 M 100 66 l 0 16",
  // musical note
  "M 120 40 l 0 60 a 14 12 0 1 1 -6 -11 l 0 -40 l 22 -8 l 0 40 a 14 12 0 1 1 -6 -11 l 0 -22",
  // spiral
  "M 100 70 q 18 0 18 18 q 0 24 -30 24 q -40 0 -40 -40 q 0 -52 56 -52",
  // eye
  "M 50 70 q 50 -40 100 0 q -50 40 -100 0 M 100 70 a 12 12 0 1 0 0.1 0",
  // star
  "M 100 40 l 10 30 l 32 2 l -25 20 l 9 31 l -26 -18 l -26 18 l 9 -31 l -25 -20 l 32 -2 Z",
  // camera
  "M 56 62 h 88 v 52 h -88 Z M 78 62 l 8 -12 h 22 l 8 12 M 100 88 a 15 15 0 1 0 0.1 0 M 134 70 h 6",
  // bird (gesture)
  "M 52 82 q 24 -28 48 -6 q 24 -22 48 -6",
  // mushroom
  "M 58 80 q 42 -48 84 0 q -42 16 -84 0 M 88 80 q -2 28 -8 40 q 20 8 40 0 q -6 -12 -8 -40",
  // open book
  "M 100 56 q -26 -12 -48 -5 l 0 58 q 22 -7 48 5 q 26 -12 48 -5 l 0 -58 q -22 -7 -48 5 Z M 100 56 l 0 58",
  // bicycle
  "M 64 102 a 21 21 0 1 0 0.1 0 M 136 102 a 21 21 0 1 0 0.1 0 M 64 102 l 26 -32 l 32 32 M 90 70 l 10 32 M 90 70 l 20 0",
  // fish
  "M 58 80 q 36 -30 76 0 q -36 30 -76 0 M 134 80 l 22 -15 l 0 30 Z M 84 73 a 3 3 0 1 0 0.1 0",
  // mountains
  "M 44 106 l 32 -46 l 20 26 l 20 -32 l 40 52 Z M 70 74 l 6 -6 l 8 8",
  // coffee cup
  "M 62 66 h 60 v 28 a 18 18 0 0 1 -18 18 h -24 a 18 18 0 0 1 -18 -18 Z M 122 74 a 12 12 0 0 1 0 22 M 80 54 q 4 -8 0 -14 M 98 54 q 4 -8 0 -14",
] as const;

export function pick<T>(next: SeededRandom, arr: readonly T[]): T {
  return arr[Math.floor(next() * arr.length)];
}

/**
 * A loose, hand-drawn circle around (cx, cy) — an open loop that slightly
 * overshoots and never perfectly closes, the way a marker circles a note. Used
 * to ring a surfaced thought (NeuronThought).
 */
export function handCircle(
  next: SeededRandom,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): string {
  const start = -0.5 + next() * 0.4; // start angle (radians)
  const turns = 1 + 0.12 + next() * 0.12; // slight overshoot past one turn
  const steps = 40;
  const wob = 0.06; // radius wobble
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const a = start + (i / steps) * turns * Math.PI * 2;
    const wobble = 1 + Math.sin(a * 3 + start) * wob;
    const x = cx + Math.cos(a) * rx * wobble;
    const y = cy + Math.sin(a) * ry * wobble;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}
