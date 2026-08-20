"use client";

/**
 * ImagineParticles — the hero's "Imagine", rendered as rising liquid.
 *
 * Adapted from the Originkit "Juice Effect" the owner supplied on 2026-08-20.
 * The physics are theirs: particles rise and fall in two interleaved layers,
 * wobble sinusoidally, occasionally break away, and are repelled by the
 * pointer. An SVG goo filter (blur → steep alpha matrix → composite) fuses
 * neighbours into blobs, which is far cheaper than drawing blob paths.
 *
 * What changed, and why:
 *
 * ⚠ THE MASK IS TEXT, NOT AN IMAGE. The original loads an `image` URL, draws it
 * to an offscreen canvas and clips particles to its alpha. Shipping a PNG of
 * the word would have frozen its size and its font. The mask is drawn here from
 * the live element instead — same family, weight and pixel size, read off
 * `getComputedStyle` — so the word stays Juturu, stays vector-crisp, and
 * re-renders itself whenever the hero resizes.
 *
 * ⚠ NO BACKGROUND. The original paints a container; this one is transparent, so
 * the brain and the circuit ground read straight through the gaps between
 * particles.
 *
 * ⚠ COLOUR COMES FROM THE SPLATTER. `.brain-paint`'s eight stops are sampled
 * per particle by horizontal position, so the word carries the right
 * hemisphere's palette left-to-right instead of the original's single
 * `particleColor`.
 *
 * ⚠ THE FONT MUST BE LOADED FIRST. Juturu is a webfont; measuring or drawing
 * before it arrives silently masks the word in the fallback sans, which is a
 * different width and shape. The mask waits on `document.fonts.load` for the
 * exact font string, so a slow font can never bake a wrong silhouette.
 *
 * ⚠ Reduced motion renders NOTHING and reports it, so the caller can leave the
 * original gradient word visible rather than showing an empty hole.
 *
 * The distance field is kept from the original: it tapers particle size near
 * the glyph edges so the word's outline reads soft rather than sawtoothed.
 */

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** `.brain-paint`'s stops, in order — the right hemisphere's palette. */
const PAINT = [
  "#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518",
  "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0",
];

/** Tuning. Density is deliberately below the supplied preset's 37: this runs
 *  behind the hero for as long as the page is open, and 37 put ~2200 arcs and a
 *  full-surface SVG filter on every frame. */
const DENSITY = 26;
/** ⚠ Particle radius is DERIVED from the word's height, not fixed. The hero
 *  scales the word with the viewport — measured, its box runs from 61px tall on
 *  a narrow pane to 103px on a desktop — and a fixed 11px radius is wider than
 *  a letter stroke at the small end, which turned "Imagine" into a blob. Tied
 *  to the height it stays the same fraction of a stroke at every size. */
const sizeFor = (h: number) => Math.max(3.5, Math.min(14, h * 0.115));
const SPEED = 4;
/** ⚠ 30, a THIRD of the 90 it shipped with — the owner found that circle far
 *  too wide on 2026-08-21. This is the radius in which the pointer shoves
 *  particles aside, so it reads directly as the size of the disturbance around
 *  the cursor. Dropping it also tightens the effect: at 90 the push reached
 *  most of the word at once, so the whole thing heaved rather than parting. */
const HOVER_RADIUS = 30;
const BREAK_CHANCE = 50;
const ALPHA_THR = 50;

interface P {
  x: number; y: number; vx: number; vy: number;
  baseSize: number; jitterPhase: number; jitterAmp: number;
  dir: "up" | "down"; repX: number; repY: number; colour: string;
}

export function ImagineParticles({
  word,
  fontFrom,
  onActive,
}: {
  /** The word to mask with — the same string the hidden element renders. */
  word: string;
  /** The element whose computed font and box the mask copies. */
  fontFrom: React.RefObject<HTMLElement | null>;
  /** Told whether the effect is actually drawing, so the caller knows whether
   *  to hide the original word. Never called with `true` under reduced motion. */
  onActive?: (active: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [fontCss, setFontCss] = useState("");
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const distRef = useRef<Float32Array | null>(null);
  const particlesRef = useRef<P[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, px: -9999, py: -9999, speed: 0, on: false });
  const rafRef = useRef<number | null>(null);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
  const filterId = `imagine-goo-${id}`;

  const { w, h } = dims;

  /* Box + font, measured off the real element so the mask can never drift from
     the layout it is standing in for. */
  useEffect(() => {
    const el = fontFrom.current;
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      // ⚠ offsetWidth/Height, NOT getBoundingClientRect. This word lives inside
      // a spring-scaled `motion.div`, and a client rect includes that transform
      // — measured mid-flight it read 215x96 against a true layout box of
      // 229x103. The mask would then be baked at the scaled size and scaled
      // AGAIN by the wrapper, so the liquid would drift off its own letters.
      // Offset sizes ignore transforms, which is exactly what a mask wants.
      setDims({ w: el.offsetWidth, h: el.offsetHeight });
      setFontCss(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fontFrom]);

  /* The mask, and the distance field taken from it. */
  useEffect(() => {
    if (!w || !h || !fontCss) return;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.font = fontCss;
      ctx.textBaseline = "alphabetic";
      const m = ctx.measureText(word);
      const asc = m.actualBoundingBoxAscent;
      const desc = m.actualBoundingBoxDescent;
      // Centre the INK in the box rather than the line box: a Juturu descender
      // hangs well below the baseline, so aligning on the line would push the
      // word visibly high.
      ctx.fillStyle = "#fff";
      ctx.fillText(word, m.actualBoundingBoxLeft, h / 2 + (asc - desc) / 2);
      maskRef.current = c;

      // Chamfer distance transform from the nearest transparent pixel.
      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, w, h).data;
      } catch {
        distRef.current = null;
        return;
      }
      const dist = new Float32Array(w * h);
      const INF = 1e9;
      for (let i = 0; i < w * h; i++) dist[i] = data[i * 4 + 3] < ALPHA_THR ? 0 : INF;
      const D1 = 1, D2 = 1.4142;
      for (let y = 1; y < h; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          let v = dist[i];
          if (dist[i - w] + D1 < v) v = dist[i - w] + D1;
          if (dist[i - 1] + D1 < v) v = dist[i - 1] + D1;
          if (dist[i - w - 1] + D2 < v) v = dist[i - w - 1] + D2;
          if (dist[i - w + 1] + D2 < v) v = dist[i - w + 1] + D2;
          dist[i] = v;
        }
      }
      for (let y = h - 2; y >= 0; y--) {
        for (let x = w - 2; x >= 1; x--) {
          const i = y * w + x;
          let v = dist[i];
          if (dist[i + w] + D1 < v) v = dist[i + w] + D1;
          if (dist[i + 1] + D1 < v) v = dist[i + 1] + D1;
          if (dist[i + w + 1] + D2 < v) v = dist[i + w + 1] + D2;
          if (dist[i + w - 1] + D2 < v) v = dist[i + w - 1] + D2;
          dist[i] = v;
        }
      }
      distRef.current = dist;
    };

    // ⚠ Wait for Juturu. Drawing before it loads masks the fallback sans.
    if (document.fonts?.load) {
      document.fonts.load(fontCss, word).then(build).catch(build);
    } else {
      build();
    }
    return () => {
      cancelled = true;
    };
  }, [w, h, fontCss, word]);

  /* Particles. */
  useEffect(() => {
    if (!w || !h) return;
    const count = Math.round(DENSITY * 60);
    const list: P[] = [];
    for (let i = 0; i < count; i++) {
      const up = i % 2 === 0;
      const x = Math.random() * w;
      list.push({
        x,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: up ? -(0.9 + Math.random() * 0.3) : 0.9 + Math.random() * 0.3,
        baseSize: 0.75 + Math.random() * 0.7,
        jitterPhase: Math.random() * Math.PI * 2,
        jitterAmp: 0.015 + Math.random() * 0.03,
        dir: up ? "up" : "down",
        repX: 0,
        repY: 0,
        // Colour by horizontal position, so the palette runs across the word.
        colour: PAINT[Math.min(PAINT.length - 1, Math.floor((x / w) * PAINT.length))],
      });
    }
    particlesRef.current = list;
  }, [w, h]);

  /* The loop. */
  useEffect(() => {
    if (reduceMotion) {
      onActive?.(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || !w || !h) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina bloats fillrate ~4x for no gain — the goo blur softens it anyway.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    onActive?.(true);
    const pSize = sizeFor(h);
    const speedMul = 0.05 + Math.pow((SPEED - 1) / 9, 1.3) * 2.35;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      const ps = particlesRef.current;
      const mouse = mouseRef.current;
      mouse.speed *= 0.88;
      const breakProb = (BREAK_CHANCE / 100) * dt;
      const hovering = mouse.on;
      const distMap = distRef.current;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.dir === "down") { if (p.vy > 1.6) p.vy = 1.6; }
        else if (p.vy < -1.6) p.vy = -1.6;

        p.vx += Math.sin(p.jitterPhase + now * 0.0015) * p.jitterAmp;
        p.vx *= 0.96;
        if (Math.random() < breakProb) {
          p.vx += (Math.random() - 0.5) * 1.8;
          p.vy += (Math.random() - 0.5) * 0.6;
        }

        let inZone = false;
        if (hovering) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 0 && d2 < HOVER_RADIUS * HOVER_RADIUS) {
            const d = Math.sqrt(d2);
            const nx = dx / d, ny = dy / d;
            const push = (1 - d / HOVER_RADIUS) * mouse.speed * 0.05;
            p.repX += nx * push;
            p.repY += ny * push;
            p.repX += (nx * (HOVER_RADIUS - d) - p.repX) * 0.06;
            p.repY += (ny * (HOVER_RADIUS - d) - p.repY) * 0.06;
            inZone = true;
          }
        }
        if (!inZone) { p.repX *= 0.97; p.repY *= 0.97; }

        p.x += p.vx * speedMul * 60 * dt;
        p.y += p.vy * speedMul * 60 * dt;

        const band = h * 0.15;
        const fromEdge = Math.min(p.y, h - p.y);
        const vert = fromEdge >= band ? 1 : Math.max(0.25, fromEdge / band);
        let alphaF = 1;
        if (distMap) {
          const ix = Math.max(0, Math.min(w - 1, Math.floor(p.x)));
          const iy = Math.max(0, Math.min(h - 1, Math.floor(p.y)));
          alphaF = Math.max(0.25, Math.min(1, distMap[iy * w + ix] / (pSize * 1.5)));
        }
        const size = pSize * p.baseSize * Math.min(vert, alphaF);

        const margin = pSize * 2;
        if (p.dir === "down") {
          if (p.y > h + margin) { p.y = -Math.random() * (h * 0.15); p.x = Math.random() * w; }
        } else if (p.y < -margin) {
          p.y = h + Math.random() * (h * 0.15);
          p.x = Math.random() * w;
        }
        if (p.x < -margin) p.x = w + margin;
        if (p.x > w + margin) p.x = -margin;

        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x + p.repX, p.y + p.repY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Clip the liquid to the word.
      const mask = maskRef.current;
      if (mask) {
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = "source-over";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      onActive?.(false);
    };
    // `onActive` is declared honestly rather than suppressed: the caller passes
    // a `useState` setter, whose identity is stable, so the loop does not
    // restart on every parent render.
  }, [w, h, reduceMotion, onActive]);

  if (reduceMotion) return null;

  // The goo blur tracks the particle size for the same reason.
  const blur = Math.max(0.3, Math.min(sizeFor(h) * 0.35, 5 * 0.35));

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-auto absolute inset-0"
      onPointerMove={(e) => {
        const r = hostRef.current?.getBoundingClientRect();
        if (!r) return;
        const mx = ((e.clientX - r.left) * (r.width ? w / r.width : 1));
        const my = ((e.clientY - r.top) * (r.height ? h / r.height : 1));
        const m = mouseRef.current;
        if (m.px > -9999) {
          const ddx = mx - m.px, ddy = my - m.py;
          m.speed = Math.sqrt(ddx * ddx + ddy * ddy);
        }
        m.px = mx; m.py = my; m.x = mx; m.y = my; m.on = true;
      }}
      onPointerLeave={() => {
        const m = mouseRef.current;
        m.on = false;
        m.x = m.y = m.px = m.py = -9999;
        m.speed = 0;
      }}
    >
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0"
        style={{ filter: `url(#${filterId})` }}
      />
    </div>
  );
}
