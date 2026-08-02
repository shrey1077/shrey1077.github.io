"use client";

/**
 * Corner3DGrid — a faint isometric lattice tucked into a left screen corner.
 *
 * Three families of lines (x / y / z) tile the area at a large cell size and
 * fade out toward the edges, so each corner reads as a small window onto a grid
 * that extends endlessly. ~20%-black, decorative, pointer-inert for clicks.
 *
 * Hovering disturbs the NEAREST line: it ripples with a brief wave and settles
 * back over ~1s (no tilt). The two left corners share a field — a line
 * disturbed in one also ripples the matching line in the other, more faintly.
 *
 * Static under reduced motion.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const V = 340; // viewBox size
const SP = 112; // cell spacing (large squares)
const K = 4; // lines each side of centre, per family
const WAVE_AMP = 11;
const PROP_AMP = 0.45;
const THRESH = 16; // how near (local units) counts as "on" a line

type Corner = "tl" | "bl";
type Seg = { x0: number; y0: number; x1: number; y1: number };

/** Three isometric directions: 30°, 150°, vertical. */
const DIRS = [
  [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)],
  [Math.cos((5 * Math.PI) / 6), Math.sin((5 * Math.PI) / 6)],
  [0, 1],
];

const LINES: Seg[] = (() => {
  const out: Seg[] = [];
  const c = V / 2;
  for (const [dx, dy] of DIRS) {
    const px = -dy,
      py = dx; // perpendicular
    for (let k = -K; k <= K; k++) {
      const ox = c + k * SP * px;
      const oy = c + k * SP * py;
      out.push({
        x0: ox - dx * V,
        y0: oy - dy * V,
        x1: ox + dx * V,
        y1: oy + dy * V,
      });
    }
  }
  return out;
})();

/** Sampled path for a segment, waved by `amp` (0 = straight). */
function pathFor(s: Seg, amp: number): string {
  const dx = s.x1 - s.x0,
    dy = s.y1 - s.y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len,
    ny = dx / len;
  const N = 12;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const off = amp * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI); // fades at ends
    const x = s.x0 + dx * t + nx * off;
    const y = s.y0 + dy * t + ny * off;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1) + " ";
  }
  return d;
}

/** Distance from point to a segment. */
function distToSeg(px: number, py: number, s: Seg): number {
  const dx = s.x1 - s.x0,
    dy = s.y1 - s.y0;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - s.x0) * dx + (py - s.y0) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const x = s.x0 + t * dx,
    y = s.y0 + t * dy;
  return Math.hypot(px - x, py - y);
}

/* Shared field between the two left grids. */
type WaveFn = (source: Corner, idx: number, amp: number) => void;
const listeners = new Set<WaveFn>();
const emitWave: WaveFn = (source, idx, amp) =>
  listeners.forEach((l) => l(source, idx, amp));

function WaveLine({ seg, trigger, amp }: { seg: Seg; trigger: number; amp: number }) {
  const controls = useAnimationControls();
  const straight = pathFor(seg, 0);
  useEffect(() => {
    if (!trigger) return;
    controls.start({
      d: [straight, pathFor(seg, amp * WAVE_AMP), straight],
      transition: { duration: 0.9, ease: EASE_OUT },
    });
  }, [trigger, amp, seg, straight, controls]);
  return (
    <motion.path
      d={straight}
      animate={controls}
      fill="none"
      stroke="#000"
      strokeWidth={0.9}
      strokeLinecap="round"
    />
  );
}

export function Corner3DGrid({ corner }: { corner: Corner }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(() => LINES.map(() => ({ t: 0, a: 0 })));
  const lastHit = useRef(-1);

  const bump = useCallback((idx: number, amp: number) => {
    setState((prev) => prev.map((v, i) => (i === idx ? { t: v.t + 1, a: amp } : v)));
  }, []);

  // Receive ripples from the other corner.
  useEffect(() => {
    const onWave: WaveFn = (source, idx, amp) => {
      if (source !== corner) bump(idx, amp);
    };
    listeners.add(onWave);
    return () => {
      listeners.delete(onWave);
    };
  }, [corner, bump]);

  // Disturb the nearest line as the pointer crosses it.
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scale = rect.width / V;
      const lx = (e.clientX - rect.left) / scale;
      let ly = (e.clientY - rect.top) / scale;
      if (corner === "bl") ly = V - ly; // the bl grid is flipped vertically
      // Ignore the pointer when it's well outside this corner's window.
      if (lx < -THRESH || lx > V + THRESH || ly < -THRESH || ly > V + THRESH) {
        lastHit.current = -1;
        return;
      }
      let best = -1,
        bestD = THRESH;
      LINES.forEach((s, i) => {
        const d = distToSeg(lx, ly, s);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best >= 0 && best !== lastHit.current) {
        lastHit.current = best;
        bump(best, 1);
        emitWave(corner, best, PROP_AMP);
      } else if (best < 0) {
        lastHit.current = -1;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [corner, reduceMotion, bump]);

  const fade =
    "radial-gradient(circle at 16% 16%, #000 22%, rgba(0,0,0,0.35) 55%, transparent 82%)";

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute left-0 h-[min(34vw,26rem)] w-[min(34vw,26rem)] opacity-[0.11] ${
        corner === "tl" ? "top-0" : "bottom-0"
      }`}
      style={{
        maskImage: fade,
        WebkitMaskImage: fade,
        transform: corner === "bl" ? "scaleY(-1)" : undefined,
      }}
    >
      <svg viewBox={`0 0 ${V} ${V}`} width="100%" height="100%">
        {LINES.map((seg, i) => (
          <WaveLine key={i} seg={seg} trigger={state[i].t} amp={state[i].a} />
        ))}
      </svg>
    </div>
  );
}
