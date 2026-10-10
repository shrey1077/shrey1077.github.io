"use client";

/**
 * MoodField — the creative rooms' ground (2026-10-10, owner: "Add this code to
 * the right side sections background, its magenta in color, i want it to have
 * rainbow gradient").
 *
 * Originkit's Mood Field, adapted. A WebGL field of domain-warped fractal
 * noise — coloured veins drifting over the ground — that the pointer stirs
 * (it swirls the field round itself, 90°). What changed from the original:
 *   · ONE COLOUR → A RAINBOW. The veins were a single magenta (the preset's
 *     intense colour); here they take a cyclic ramp of the brain's own paint —
 *     the eight stops of `.brain-paint` (globals.css) — swept across the
 *     screen and bent by the same warp that shapes the field, so the colour
 *     flows with it and drifts slowly round the ramp. The calm/intense mood
 *     pair went with the single colour;
 *   · ON WHITE (owner, the same day: "keep bg behind it as white"; it was the
 *     original's near-black for an hour). On a dark ground the veins' cores
 *     ADD light; on a light one that only bleaches them, so there the cores
 *     DEEPEN into their colour instead, like ink on paper — the shader picks
 *     by the ground's lightness;
 *   · the pointer is read off the WINDOW: this sits under the rooms and is
 *     never hit by the pointer itself;
 *   · drawn at a fraction of the screen's pixels (RENDER_SCALE) — the field
 *     is soft, so nothing shows of it, and it costs a third as much;
 *   · no minimum size (it was 1200×800, which overflowed a phone); the GL
 *     context is released on unmount, since the Flythrough mounts this only
 *     while the creative track can be seen. ⚠ So each run of the effect makes
 *     its OWN canvas: a canvas keeps the one context it ever had, and a
 *     released one can't be had back (React's dev double-mount would leave
 *     the field blank);
 *   · reduced motion: a still field, no stirring.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** The ground under the field, and the rainbow its veins take — the stops of
 *  `.brain-paint`, in order (the ramp wraps from the last to the first). */
export const MOOD_BG = "#ffffff";
export const RAINBOW = ["#ff2e8b", "#ff5a3c", "#ff8a00", "#f5c518", "#7fbf2e", "#00a6a6", "#3f6ad8", "#7a3fb0"];

/** Canvas pixels per CSS pixel (with the device ratio capped at 1). */
const RENDER_SCALE = 0.75;

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  iResolution;
uniform vec2  iMouse;
uniform float iTime;
uniform vec3  uRamp[8];
uniform vec3  uBg;
uniform float uScale;
uniform float uWarp;
uniform float uRidge;
uniform float uContrast;
uniform float uReach;
uniform float uHover;
uniform float uSwirl;
uniform float uPointer;

const mat2 R2 = mat2(0.80, 0.60, -0.60, 0.80);

float hash21(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p){
    float sum  = 0.0;
    float amp  = 0.5;
    float norm = 0.0;
    for (int i = 0; i < 4; i++){
        float v = vnoise(p);
        v = mix(v, abs(v * 2.0 - 1.0), uRidge);
        sum  += amp * v;
        norm += amp;
        p = R2 * p * 2.03 + 7.13;
        amp *= 0.5;
    }
    return sum / max(norm, 1e-4);
}

// The cyclic rainbow: t in turns, each stop eased into the next.
vec3 rainbow(float t){
    t = fract(t) * 8.0;
    vec3 c = uRamp[0];
    c = mix(c, uRamp[1], smoothstep(0.0, 1.0, clamp(t,       0.0, 1.0)));
    c = mix(c, uRamp[2], smoothstep(0.0, 1.0, clamp(t - 1.0, 0.0, 1.0)));
    c = mix(c, uRamp[3], smoothstep(0.0, 1.0, clamp(t - 2.0, 0.0, 1.0)));
    c = mix(c, uRamp[4], smoothstep(0.0, 1.0, clamp(t - 3.0, 0.0, 1.0)));
    c = mix(c, uRamp[5], smoothstep(0.0, 1.0, clamp(t - 4.0, 0.0, 1.0)));
    c = mix(c, uRamp[6], smoothstep(0.0, 1.0, clamp(t - 5.0, 0.0, 1.0)));
    c = mix(c, uRamp[7], smoothstep(0.0, 1.0, clamp(t - 6.0, 0.0, 1.0)));
    c = mix(c, uRamp[0], smoothstep(0.0, 1.0, clamp(t - 7.0, 0.0, 1.0)));
    return c;
}

void main(){
    float h = max(iResolution.y, 1.0);
    vec2 sp = (gl_FragCoord.xy - 0.5 * iResolution) / h;
    vec2 mp = (iMouse - 0.5 * iResolution) / h;

    float reach = max(uReach / h, 1e-4);
    vec2  d = sp - mp;
    float r = length(d);
    float infl = uPointer * uHover * exp(-(r * r) / (reach * reach));

    float ang = infl * uSwirl;
    float cs = cos(ang);
    float sn = sin(ang);
    sp = mp + mat2(cs, -sn, sn, cs) * d;
    sp += d * (infl * 0.30) / max(r, 1e-3);

    float tt = iTime * 1.55;
    vec2 p = sp * uScale;

    vec2 q = vec2(
        fbm(p + vec2(0.0, tt * 0.16)),
        fbm(p + vec2(5.2, 1.3) - vec2(tt * 0.12, 0.0))
    );
    float f = fbm(p + uWarp * q + vec2(tt * 0.05, -tt * 0.04));

    float v = pow(clamp(f, 0.0, 1.0), uContrast);
    v = clamp(v + infl * 0.22, 0.0, 1.0);

    // The colour: swept across the screen, bent by the warp, drifting round.
    float hue = sp.x * 0.42 + sp.y * 0.14 + (q.x - 0.5) * 0.9 + (q.y - 0.5) * 0.5 + tt * 0.012;
    vec3 mood = rainbow(hue);
    vec3 col = mix(uBg, mood, smoothstep(0.12, 0.92, v));
    // The cores: light added on a dark ground, the colour deepened on a light.
    float light = step(0.5, dot(uBg, vec3(0.299, 0.587, 0.114)));
    vec3 glow = col + mood * pow(v, 5.0) * 0.9;
    vec3 ink  = mix(col, mood * 0.8, pow(v, 5.0) * 0.6);
    col = mix(glow, ink, light);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

/** A CSS colour as 0–1 RGB, via a canvas — any form the browser parses. */
function toRgb(css: string, ctx: CanvasRenderingContext2D | null): [number, number, number] {
  if (!ctx) return [0, 0, 0];
  ctx.fillStyle = "#000000";
  ctx.fillStyle = css;
  const s = String(ctx.fillStyle);
  if (s[0] === "#") {
    const n = parseInt(s.slice(1, 7), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = s.match(/-?[\d.]+/g);
  return m && m.length >= 3 ? [+m[0] / 255, +m[1] / 255, +m[2] / 255] : [0, 0, 0];
}

export function MoodField({
  background = MOOD_BG,
  colors = RAINBOW,
  /** 50 is the original's pace. */
  speed = 50,
  /** 100 is the original's scale; more is finer. */
  density = 100,
  flow = { warp: 100, turbulence: 100, contrast: 100 },
  /** The preset's stirring: a 260px reach, full strength, a 90° swirl. */
  cursor = { reach: 260, hover: 100, swirl: 90 },
}: {
  background?: string;
  colors?: string[];
  speed?: number;
  density?: number;
  flow?: { warp: number; turbulence: number; contrast: number };
  cursor?: { reach: number; hover: number; swirl: number };
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  // The settings the frame loop reads — refreshed every render, so a prop
  // change reaches it without restarting GL.
  const live = useRef({ background, colors, speed, density, flow, cursor });
  useEffect(() => {
    live.current = { background, colors, speed, density, flow, cursor };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block h-full w-full";
    root.appendChild(canvas);
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });
    if (!gl) {
      canvas.remove();
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const loc = (name: string) => gl.getUniformLocation(prog, name);
    const u = {
      res: loc("iResolution"),
      mouse: loc("iMouse"),
      time: loc("iTime"),
      ramp: loc("uRamp"),
      bg: loc("uBg"),
      scale: loc("uScale"),
      warp: loc("uWarp"),
      ridge: loc("uRidge"),
      contrast: loc("uContrast"),
      reach: loc("uReach"),
      hover: loc("uHover"),
      swirl: loc("uSwirl"),
      pointer: loc("uPointer"),
    };

    const probe = document.createElement("canvas").getContext("2d");
    let bw = 0;
    let bh = 0;
    let scale = 1;
    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 1) * RENDER_SCALE;
      const w = Math.max(1, Math.round(root.clientWidth * scale));
      const h = Math.max(1, Math.round(root.clientHeight * scale));
      if (w === bw && h === bh) return false;
      bw = w;
      bh = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      return true;
    };
    resize();

    // The pointer, from the window — over this field's box or not.
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, presence: 0, want: 0 };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / Math.max(r.width, 1);
      mouse.ty = (e.clientY - r.top) / Math.max(r.height, 1);
      mouse.want = mouse.tx >= 0 && mouse.tx <= 1 && mouse.ty >= 0 && mouse.ty <= 1 ? 1 : 0;
    };
    const onLeave = () => {
      mouse.want = 0;
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    let clock = 0;
    let last = -1;
    let raf = 0;
    // The colours, parsed only when they change.
    let paint = "";
    let ramp = new Float32Array(24);
    let bg: [number, number, number] = [0, 0, 0];
    const draw = () => {
      const L = live.current;
      const key = `${L.background}|${L.colors.join()}`;
      if (key !== paint) {
        paint = key;
        const stops = Array.from({ length: 8 }, (_, i) => L.colors[i % L.colors.length] ?? MOOD_BG);
        ramp = new Float32Array(stops.flatMap((c) => toRgb(c, probe)));
        bg = toRgb(L.background, probe);
      }
      gl.uniform2f(u.res, bw, bh);
      gl.uniform2f(u.mouse, mouse.x * bw, (1 - mouse.y) * bh);
      gl.uniform1f(u.time, clock);
      gl.uniform3fv(u.ramp, ramp);
      gl.uniform3fv(u.bg, bg);
      gl.uniform1f(u.scale, (2.2 * Math.max(1, L.density)) / 100);
      gl.uniform1f(u.warp, (1.2 * Math.max(0, L.flow.warp)) / 100);
      gl.uniform1f(u.ridge, Math.min(1, (Math.max(0, L.flow.turbulence) / 100) * 0.9));
      gl.uniform1f(u.contrast, 0.5 + (2.5 * Math.max(0, L.flow.contrast)) / 200);
      gl.uniform1f(u.reach, Math.max(1, L.cursor.reach) * scale);
      gl.uniform1f(u.hover, Math.max(0, L.cursor.hover) / 100);
      gl.uniform1f(u.swirl, (Math.max(-90, Math.min(90, L.cursor.swirl)) * Math.PI) / 180);
      gl.uniform1f(u.pointer, mouse.presence);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last < 0 ? 0 : Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      resize();
      clock += dt * (Math.max(0, live.current.speed) / 50);
      const mk = 1 - Math.pow(1 - 0.18, dt * 60);
      mouse.x += (mouse.tx - mouse.x) * mk;
      mouse.y += (mouse.ty - mouse.y) * mk;
      mouse.presence += (mouse.want - mouse.presence) * mk;
      draw();
    };

    // Reduced motion: one still frame, redrawn only on a resize.
    let ro: ResizeObserver | null = null;
    if (reduceMotion) {
      clock = 7;
      draw();
      ro = new ResizeObserver(() => {
        if (resize()) draw();
      });
      ro.observe(root);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [reduceMotion]);

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 overflow-hidden" style={{ background }} />
  );
}
