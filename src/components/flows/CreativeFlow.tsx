"use client";

/**
 * CreativeFlow — the right hemisphere's living colour (Phase 4).
 *
 * Paint continuously EMERGES from the right hemisphere and flows outward
 * (Phase 4.2): each wash is born at the fissure, travels right as it spreads,
 * and dissolves before the navigation — then respawns. Staggered phases and
 * detuned speeds keep the stream continuous and never obviously looping.
 * A single <canvas>, soft radial smears in the creative palette.
 *
 * Performance: throttled to ~30fps (FLOW_LIMITS.creativeFps), paused entirely
 * when disabled/off-screen, a small fixed number of washes, one canvas. DPR-
 * aware. Reduced motion paints one static frame. Decorative (aria-hidden).
 * See docs/BRAIN_SYSTEM.md.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { CREATIVE_PALETTE } from "@/constants/brain";
import { FLOW_LIMITS } from "@/constants/systems";
import { createSeededRandom } from "@/utils/random";

interface Wash {
  /** Vertical anchor (fraction of canvas height) the journey wobbles around. */
  ay: number;
  /** Vertical wobble amplitude / detuned rate — organic, never repeating. */
  dy: number;
  rateY: number;
  phase: number;
  /** Slow rotation rate — the smear curls as it travels. */
  spin: number;
  /** Outward journey: fraction-per-second speed and a stagger offset [0,1). */
  speed: number;
  phase0: number;
  /** Wash radius (fraction of height) and colour. */
  radius: number;
  color: string;
  alpha: number;
}

const WASH_COUNT = 10;

/** The outward journey (fractions of the right-half canvas): each wash is BORN
 *  at the fissure, travels rightward as it fades in, and dies out well before
 *  the navigation's brush strokes — then respawns at the fissure. Staggered
 *  phases + detuned speeds make the stream continuous and never obviously
 *  looping. */
const JOURNEY = { startX: 0.03, travel: 0.5 } as const;

/** Horizontal confine (fraction of the right-half canvas) — a safety net that
 *  feathers any remaining pigment to nothing before the nav brush strokes. */
const CONFINE = { fadeStart: 0.3, fadeEnd: 0.6 } as const;

function buildWashes(): Wash[] {
  const next = createSeededRandom(0x5eed1);
  return Array.from({ length: WASH_COUNT }, (_, i) => {
    const color = CREATIVE_PALETTE[i % CREATIVE_PALETTE.length];
    return {
      ay: 0.14 + next() * 0.66, // spawn heights spread over the hemisphere
      dy: 0.03 + next() * 0.07,
      rateY: 0.02 + next() * 0.04,
      phase: next() * Math.PI * 2,
      spin: (next() < 0.5 ? -1 : 1) * (0.015 + next() * 0.05),
      speed: 0.012 + next() * 0.017, // one crossing every ~35–80s
      phase0: i / WASH_COUNT + next() * 0.06, // even stagger, slightly broken
      radius: 0.1 + next() * 0.14,
      color,
      alpha: 0.09 + next() * 0.11,
    };
  });
}

/** Paint splatter (the reference): a field of small droplets sprayed off the
 *  brain's right edge. Seeded once; each droplet twinkles in and out on its own
 *  slow cycle, so the spray is alive without ever moving mechanically. */
interface Droplet {
  x: number;
  y: number;
  /** Radius as a fraction of canvas height. */
  r: number;
  color: string;
  phase: number;
  /** Twinkle rate (radians/s) — periods of ~40–120s. */
  rate: number;
  alpha: number;
}

const SPRAY_COUNT = 90;

function buildSpray(): Droplet[] {
  const next = createSeededRandom(0xd0b5);
  return Array.from({ length: SPRAY_COUNT }, () => ({
    // Biased hard toward the brain's edge, thinning outward like real spray.
    x: 0.03 + Math.pow(next(), 1.6) * 0.32,
    y: 0.06 + next() * 0.88,
    r: 0.0016 + next() * 0.0055,
    color: CREATIVE_PALETTE[Math.floor(next() * CREATIVE_PALETTE.length)],
    phase: next() * Math.PI * 2,
    rate: 0.05 + next() * 0.11,
    alpha: 0.22 + next() * 0.42,
  }));
}

function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

export function CreativeFlow({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const washes = buildWashes();
    const spray = buildSpray();
    let raf = 0;
    let lastDraw = 0;
    const frameMs = 1000 / FLOW_LIMITS.creativeFps;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "multiply";
      const time = t / 1000;
      const TAU = Math.PI * 2;
      for (const wash of washes) {
        // The outward journey: born at the fissure (p=0), travelling right,
        // gone by p=1 — a sin(π·p) envelope fades each end so the loop reads
        // as paint continuously emerging and escaping, never restarting.
        const p = (wash.phase0 + time * wash.speed) % 1;
        const px = JOURNEY.startX + p * JOURNEY.travel;
        const py =
          wash.ay +
          Math.cos(time * wash.rateY * TAU + wash.phase) * wash.dy +
          Math.cos(time * wash.rateY * 0.39 * TAU + wash.phase * 1.3) * wash.dy * 0.55;
        const cx = px * w;
        const cy = py * h;
        // Spread as it escapes (radius grows along the journey) and stretch
        // into a slowly rotating smear — thick acrylic drifting underwater.
        const r = wash.radius * h * (0.65 + 0.7 * p);
        const elong = 1 + 0.5 * Math.sin(time * wash.rateY * 0.8 + wash.phase);
        const [rr, gg, bb] = hexToRgb(wash.color);
        const a = wash.alpha * Math.sin(Math.PI * p);
        if (a <= 0.002) continue;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, `rgba(${rr},${gg},${bb},${a})`);
        grad.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * wash.spin + wash.phase);
        ctx.scale(1 + 0.45 * elong, 1 - 0.18 * elong);
        ctx.fillStyle = grad;
        ctx.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
        ctx.restore();
      }
      // Splatter droplets — sprayed off the brain's edge, each on its own slow
      // twinkle so the field is alive but never mechanical.
      for (const d of spray) {
        const a = d.alpha * (0.5 + 0.5 * Math.sin(time * d.rate + d.phase));
        if (a <= 0.02) continue;
        const [rr, gg, bb] = hexToRgb(d.color);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, Math.max(0.6, d.r * h), 0, TAU);
        ctx.fill();
      }
      // Confine the wash to the brain side: keep colour near the fissure and
      // erase it before the creative nav column, so the page stays white there.
      ctx.globalCompositeOperation = "destination-in";
      const mask = ctx.createLinearGradient(0, 0, w, 0);
      mask.addColorStop(0, "rgba(0,0,0,1)");
      mask.addColorStop(CONFINE.fadeStart, "rgba(0,0,0,1)");
      mask.addColorStop(CONFINE.fadeEnd, "rgba(0,0,0,0)");
      ctx.fillStyle = mask;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    };

    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      draw(0);
      return () => window.removeEventListener("resize", onResize);
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - lastDraw < frameMs) return;
      lastDraw = t;
      draw(t);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2"
    />
  );
}
