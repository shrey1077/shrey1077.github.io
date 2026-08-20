"use client";

/**
 * ThinkMesh — the hero's "Think", as a mesh the pointer drags through.
 *
 * Adapted from the Originkit "Mesh Text Hover" the owner supplied on
 * 2026-08-20. The simulation is theirs: the word is rasterised to a texture, a
 * 96×40 grid samples it, and each vertex is pulled along the cursor's motion by
 * proximity, then sprung back with damping.
 *
 * What changed, and why:
 *
 * ⚠ COLOUR SPLIT IS OFF. The supplied preset ships chromatic aberration with
 * pink/green fringes. The owner asked to keep the word's ORIGINAL colour, and
 * that colour is deliberate — THINK_GREY is 20% black composited over the
 * page's own #f9f9f9, so the word lands on the grey it always appeared to be
 * now that it sits in front of the brain. Fringing it would undo that. The
 * uniform is still wired, so it is one flag to turn back on.
 *
 * ⚠ FONT AND COLOUR ARE READ FROM THE ELEMENT, not passed in. The supplied
 * component takes a font object and a colour string, which would mean two
 * places to change Digibra's size and two definitions of the same grey. It
 * copies `getComputedStyle` off the real span instead, so the mesh cannot
 * drift from the word it stands in for.
 *
 * ⚠ THE CANVAS IS BIGGER THAN THE WORD. Displacement reaches ±1 in clip space,
 * and a canvas cropped to the text would clip every letter the moment it was
 * dragged. The canvas is inflated by PAD around the span's box and offset back
 * so the glyphs still land where the DOM had them, with room to move.
 *
 * ⚠ THE POINTER IS TRACKED ON THE WINDOW, not on the wrapper. The supplied
 * component listens on its own element, which requires that element to accept
 * pointer events — and this one overlays a hero whose `h1` is deliberately
 * `pointer-events-none` so the pins and nav underneath stay clickable.
 *
 * Transparency needs nothing special here, unlike the firework cursor: this is
 * a plain WebGL2 draw with `clearColor(0,0,0,0)` and premultiplied blending, so
 * the page shows straight through.
 *
 * Reduced motion renders nothing and reports it, so the caller leaves the real
 * word visible.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GRID_W = 96;
const GRID_H = 40;
const DRAG = 1.8;
const SPRING_K = 0.08;
const DAMPING = 0.9;
const DT = 0.1;
/** Extra canvas around the word, as a fraction of its box, for displaced ink. */
const PAD = 0.35;

const VERT_SRC = `#version 300 es
in vec2 aPos;
in vec2 aUv;
in vec2 aDisp;
out vec2 vUv;
void main() {
  gl_Position = vec4(aPos + aDisp, 0.0, 1.0);
  vUv = aUv;
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uTex;
void main() { outColor = texture(uTex, vUv); }`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("ThinkMesh shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function ThinkMesh({
  word,
  from,
  onActive,
}: {
  word: string;
  /** The element whose box, font and colour the mesh copies. */
  from: React.RefObject<HTMLElement | null>;
  onActive?: (active: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [style, setStyle] = useState({ font: "", color: "" });

  // Measured off the real element. ⚠ offsetWidth/Height, not a client rect:
  // this word sits in a spring-scaled `motion.div`, and a client rect would
  // bake the transform into the texture size.
  useEffect(() => {
    const el = from.current;
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      setBox({ w: el.offsetWidth, h: el.offsetHeight });
      setStyle({
        font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
        color: cs.color,
      });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [from]);

  useEffect(() => {
    if (reduceMotion) {
      onActive?.(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || !box.w || !box.h || !style.font) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) {
      console.warn("ThinkMesh: WebGL2 unavailable");
      onActive?.(false);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(box.w * (1 + PAD * 2));
    const ch = Math.round(box.h * (1 + PAD * 2));
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    /* Grid. */
    const vertCount = (GRID_W + 1) * (GRID_H + 1);
    const positions = new Float32Array(vertCount * 2);
    const uvs = new Float32Array(vertCount * 2);
    for (let y = 0; y <= GRID_H; y++) {
      for (let x = 0; x <= GRID_W; x++) {
        const i = y * (GRID_W + 1) + x;
        const u = x / GRID_W;
        const v = y / GRID_H;
        positions[i * 2] = u * 2 - 1;
        positions[i * 2 + 1] = 1 - v * 2;
        uvs[i * 2] = u;
        uvs[i * 2 + 1] = v;
      }
    }
    const indices = new Uint32Array(GRID_W * GRID_H * 6);
    let k = 0;
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const a = y * (GRID_W + 1) + x;
        const b = a + 1;
        const c = a + (GRID_W + 1);
        const d = c + 1;
        indices[k++] = a; indices[k++] = c; indices[k++] = b;
        indices[k++] = b; indices[k++] = c; indices[k++] = d;
      }
    }
    const disp = new Float32Array(vertCount * 2);
    const vel = new Float32Array(vertCount * 2);

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("ThinkMesh link:", gl.getProgramInfoLog(program));
      return;
    }

    const aPos = gl.getAttribLocation(program, "aPos");
    const aUv = gl.getAttribLocation(program, "aUv");
    const aDisp = gl.getAttribLocation(program, "aDisp");
    const uTex = gl.getUniformLocation(program, "uTex");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const mk = (data: Float32Array, loc: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      return b;
    };
    const posBuf = mk(positions, aPos);
    const uvBuf = mk(uvs, aUv);
    const dispBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
    gl.bufferData(gl.ARRAY_BUFFER, disp, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aDisp);
    gl.vertexAttribPointer(aDisp, 2, gl.FLOAT, false, 0, 0);
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let cancelled = false;
    let raf = 0;

    const paint = () => {
      const c2 = document.createElement("canvas");
      c2.width = canvas.width;
      c2.height = canvas.height;
      const ctx = c2.getContext("2d");
      if (!ctx) return;
      // ⚠ Scale the font by dpr AND draw into the padded canvas: the supplied
      // version centres on the em box with `textBaseline: middle`, which for a
      // display face on a 0.82 line-height would sit the word off-centre. Ink
      // metrics put it where the DOM had it.
      const px = parseFloat(style.font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? "100");
      ctx.font = style.font.replace(/(\d+(?:\.\d+)?)px/, `${px * dpr}px`);
      ctx.fillStyle = style.color;
      ctx.textBaseline = "alphabetic";
      const m = ctx.measureText(word);
      const asc = m.actualBoundingBoxAscent;
      const desc = m.actualBoundingBoxDescent;
      ctx.fillText(
        word,
        (c2.width - (m.actualBoundingBoxRight + m.actualBoundingBoxLeft)) / 2,
        c2.height / 2 + (asc - desc) / 2,
      );
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
    };

    // ⚠ Wait for Digibra. Rasterising before it loads bakes the fallback sans
    // into the texture permanently — the effect would work and show the wrong
    // typeface.
    const fontPx = style.font.replace(/(\d+(?:\.\d+)?)px/, (_s, n) => `${parseFloat(n) * dpr}px`);
    (document.fonts?.load ? document.fonts.load(fontPx, word) : Promise.resolve())
      .then(() => { if (!cancelled) paint(); })
      .catch(() => { if (!cancelled) paint(); });

    /* Pointer, in the canvas's own -1…1 space. Tracked on the window because
       the overlay must not take pointer events off the hero. */
    const cur = { x: 99, y: 99, px: 99, py: 99, vx: 0, vy: 0, inside: false };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = 1 - ((e.clientY - r.top) / r.height) * 2;
      const near = x > -1.6 && x < 1.6 && y > -1.6 && y < 1.6;
      if (!near) { cur.inside = false; cur.x = 99; cur.y = 99; cur.vx = 0; cur.vy = 0; return; }
      if (!cur.inside) { cur.px = x; cur.py = y; cur.inside = true; }
      cur.x = x;
      cur.y = y;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    onActive?.(true);

    const tick = () => {
      cur.vx = cur.x - cur.px;
      cur.vy = cur.y - cur.py;
      if (Math.hypot(cur.vx, cur.vy) > 0.3) { cur.vx = 0; cur.vy = 0; }
      cur.px = cur.x;
      cur.py = cur.y;

      for (let i = 0; i < vertCount; i++) {
        const i2 = i * 2;
        const dx = disp[i2];
        const dy = disp[i2 + 1];
        const cx = cur.x - (positions[i2] + dx);
        const cy = cur.y - (positions[i2 + 1] + dy);
        const prox = Math.max(0, 1 / (1 + Math.hypot(cx, cy) / 0.05) - 0.1);

        let vx = vel[i2] + cur.vx * DRAG * prox;
        let vy = vel[i2 + 1] + cur.vy * DRAG * prox;
        vx -= dx * SPRING_K;
        vy -= dy * SPRING_K;
        vx *= DAMPING;
        vy *= DAMPING;
        vel[i2] = vx;
        vel[i2 + 1] = vy;
        disp[i2] = Math.max(-1, Math.min(1, dx + vx * DT));
        disp[i2 + 1] = Math.max(-1, Math.min(1, dy + vy * DT));
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, dispBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, disp);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uTex, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(uvBuf);
      gl.deleteBuffer(dispBuf);
      gl.deleteBuffer(idxBuf);
      gl.deleteTexture(tex);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      onActive?.(false);
    };
  }, [reduceMotion, box.w, box.h, style.font, style.color, word, onActive]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute block"
      // Centred on the word: the canvas is inflated by PAD on every side, so it
      // is pulled back by that same amount to keep the glyphs where they were.
      style={{ left: `${-PAD * 100}%`, top: `${-PAD * 100}%` }}
    />
  );
}
