"use client";

/**
 * Stacked Carousel — Originkit, supplied by the owner (2026-11-02: "Use this
 * code for ABS pics display on main page slide of ABS"), vendored and fitted:
 *
 *   · each picture is set on a square card before it goes to the GPU — whole
 *     on `mat` if its shape is far from square, cropped to fill if near it —
 *     with rounded corners, at most `texSize` px, so a deck of forty-odd
 *     posts stays light;
 *   · the deck draws only while `active` (its slide on screen, the tab seen)
 *     and gives its GL context back when it goes;
 *   · the WHEEL is left to the page — on this site it turns the slides — so
 *     the deck drifts by itself (`speed`), and a card under the pointer turns
 *     flat to the camera and the drift holds, as Originkit's does;
 *   · reduced motion: no drift and no fly-in;
 *   · no minimum size; the props settle into a ref after render, not during.
 * The camera, the deck's layout, the hover and the picking are Originkit's,
 * as given.
 */

import * as React from "react";
import { useEffect, useRef } from "react";

const CAMERA_DISTANCE = 900;
const PERSPECTIVE = 45;
const DECK_MIN = 20;
const DAMPING = 0.05;
const HOVER_GAP = 0;
const POS_X = 0;
const POS_Y = 0;
const SPEED_AT_50 = 18;
const SPEED_AT_100 = 108;
const FLATTEN_DUR = 1.2;

export interface CarouselImage {
  src: string;
  /** Width ÷ height. */
  a: number;
}

interface Props {
  images: CarouselImage[];
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  speed?: number;
  direction?: "forward" | "backward";
  camera?: { tilt?: number; angle?: number };
  /** The ground a picture far from its card's shape stands on. */
  mat?: string;
  /** The longest side of a card's texture, px. */
  texSize?: number;
  active?: boolean;
  reduceMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Resolved {
  items: CarouselImage[];
  visibleCount: number;
  imageWidth: number;
  imageHeight: number;
  zSpacing: number;
  autoScrollSpeed: number;
  viewAngleX: number;
  viewAngleY: number;
}

function resolve(p: Props): Resolved {
  const dial = Math.min(100, Math.max(0, p.speed ?? 50));
  const over = (dial - 50) / 50;
  const rate = dial <= 50 ? SPEED_AT_50 * (dial / 50) : SPEED_AT_50 + (SPEED_AT_100 - SPEED_AT_50) * over * over;
  return {
    items: p.images,
    visibleCount: Math.max(DECK_MIN, p.images.length),
    imageWidth: Math.max(1, Math.round(p.cardWidth ?? 420)),
    imageHeight: Math.max(1, Math.round(p.cardHeight ?? 300)),
    zSpacing: p.gap ?? 100,
    autoScrollSpeed: p.reduceMotion ? 0 : p.direction === "backward" ? -rate : rate,
    viewAngleX: p.camera?.tilt ?? 50,
    viewAngleY: p.camera?.angle ?? 0,
  };
}

type M4 = Float32Array;
const m4Identity = (): M4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

function m4Mul(a: M4, b: M4, out: M4): M4 {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4],
      b1 = b[c * 4 + 1],
      b2 = b[c * 4 + 2],
      b3 = b[c * 4 + 3];
    out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

function m4Perspective(fovDeg: number, aspect: number, near: number, far: number, out: M4): M4 {
  const f = 1 / Math.tan(((fovDeg * Math.PI) / 180) * 0.5);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function m4RotXYZ(rx: number, ry: number, rz: number, out: M4): M4 {
  const cx = Math.cos(rx),
    sx = Math.sin(rx);
  const cy = Math.cos(ry),
    sy = Math.sin(ry);
  const cz = Math.cos(rz),
    sz = Math.sin(rz);
  out[0] = cy * cz;
  out[1] = sx * sy * cz + cx * sz;
  out[2] = -cx * sy * cz + sx * sz;
  out[3] = 0;
  out[4] = -cy * sz;
  out[5] = -sx * sy * sz + cx * cz;
  out[6] = cx * sy * sz + sx * cz;
  out[7] = 0;
  out[8] = sy;
  out[9] = -sx * cy;
  out[10] = cx * cy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

function eulerOfInverse(r: M4, out: { x: number; y: number; z: number }) {
  const m11 = r[0],
    m12 = r[1],
    m13 = r[2];
  const m22 = r[5],
    m23 = r[6];
  const m32 = r[9],
    m33 = r[10];
  out.y = Math.asin(Math.max(-1, Math.min(1, m13)));
  if (Math.abs(m13) < 0.9999999) {
    out.x = Math.atan2(-m23, m33);
    out.z = Math.atan2(-m12, m11);
  } else {
    out.x = Math.atan2(m32, m22);
    out.z = 0;
  }
}

const VERT = `
attribute vec2 aPos;
uniform mat4 uMVP;
varying vec2 vUV;
void main() {
    vUV = aPos + 0.5;
    gl_Position = uMVP * vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUV;
uniform sampler2D uTex;
uniform float uHasTex;
void main() {
    vec4 c = uHasTex > 0.5 ? texture2D(uTex, vUV) : vec4(0.15, 0.15, 0.15, 1.0);
    float a = c.a;
    if (a < 0.02) discard;
    gl_FragColor = vec4(c.rgb, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/** A picture set on its card: rounded, cropped to fill if near the card's
 *  shape, whole on the mat if not. */
function cardOf(img: HTMLImageElement, a: number, cardA: number, size: number, mat: string): HTMLCanvasElement {
  const W = cardA >= 1 ? size : Math.round(size * cardA);
  const H = cardA >= 1 ? Math.round(size / cardA) : size;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const r = Math.min(W, H) * 0.05;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, r);
  ctx.clip();
  const near = Math.abs(Math.log(a / cardA)) < 0.38;
  if (near) {
    // Cover.
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    ctx.fillStyle = mat;
    ctx.fillRect(0, 0, W, H);
    const pad = Math.min(W, H) * 0.06;
    const s = Math.min((W - pad * 2) / img.naturalWidth, (H - pad * 2) / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }
  return c;
}

export function StackedCarousel(props: Props) {
  const { mat = "#5c0d16", texSize = 448, active = true, className = "", style } = props;
  const p = resolve(props);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ ...p, mat, texSize, active });
  useEffect(() => {
    propsRef.current = { ...p, mat, texSize, active };
  });
  const gateRef = useRef<() => void>(() => {});
  useEffect(() => {
    gateRef.current();
  }, [active]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const glOrNull = canvas.getContext("webgl", { alpha: true, antialias: true, depth: true, premultipliedAlpha: false });
    if (!glOrNull) return;
    const gl: WebGLRenderingContext = glOrNull;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const aPos = gl.getAttribLocation(prog, "aPos");
    const uMVP = gl.getUniformLocation(prog, "uMVP");
    const uTex = gl.getUniformLocation(prog, "uTex");
    const uHasTex = gl.getUniformLocation(prog, "uHasTex");
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(uTex, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let alive = true;
    interface Slot {
      tex: WebGLTexture;
      ready: boolean;
    }
    const c0 = propsRef.current;
    const cardA = c0.imageWidth / c0.imageHeight;
    const slots: Slot[] = c0.items.map((it) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([38, 38, 38, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const slot: Slot = { tex, ready: false };
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cardOf(img, it.a, cardA, c0.texSize, c0.mat));
        slot.ready = true;
      };
      img.src = it.src;
      return slot;
    });

    let vw = 1;
    let vh = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = Math.max(1, host.clientWidth);
      vh = Math.max(1, host.clientHeight);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let ndcX = -9999;
    let ndcY = -9999;
    let overHost = false;
    let targetScroll = 0;
    let currentScroll = 0;
    let hovered = -1;
    interface Flatten {
      v: number;
      from: number;
      to: number;
      t: number;
    }
    let flat: Flatten[] = [];
    let fTan = 1;
    let fAspect = 1;
    let fCamZ = CAMERA_DISTANCE;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndcY = -((e.clientY - r.top) / r.height) * 2 + 1;
      overHost = true;
    };
    const onLeave = () => {
      ndcX = -9999;
      ndcY = -9999;
      overHost = false;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    const proj = m4Identity();
    const view = m4Identity();
    const model = m4Identity();
    const rootRot = m4Identity();
    const localRot = m4Identity();
    const worldRot = m4Identity();
    const vp = m4Identity();
    const mvp = m4Identity();
    const flatEuler = { x: 0, y: 0, z: 0 };
    let lastRx = NaN;
    let lastRy = NaN;
    let intro = propsRef.current.autoScrollSpeed === 0 ? 1 : 0;
    let last = performance.now();
    let raf = 0;

    interface Item {
      i: number;
      x: number;
      y: number;
      z: number;
      bz: number;
      sx: number;
      sy: number;
      wz: number;
    }
    let items: Item[] = [];
    const order: number[] = [];

    function buildModel(it: Item, f: number, grow: number, out: M4): M4 {
      const wx = rootRot[0] * it.x + rootRot[4] * it.y + rootRot[8] * it.z;
      const wy = rootRot[1] * it.x + rootRot[5] * it.y + rootRot[9] * it.z;
      const wz = rootRot[2] * it.x + rootRot[6] * it.y + rootRot[10] * it.z;
      m4RotXYZ(flatEuler.x * f, flatEuler.y * f, flatEuler.z * f, localRot);
      m4Mul(rootRot, localRot, worldRot);
      const sx = it.sx * grow;
      const sy = it.sy * grow;
      out[0] = worldRot[0] * sx;
      out[1] = worldRot[1] * sx;
      out[2] = worldRot[2] * sx;
      out[3] = 0;
      out[4] = worldRot[4] * sy;
      out[5] = worldRot[5] * sy;
      out[6] = worldRot[6] * sy;
      out[7] = 0;
      out[8] = worldRot[8];
      out[9] = worldRot[9];
      out[10] = worldRot[10];
      out[11] = 0;
      out[12] = wx;
      out[13] = wy;
      out[14] = wz;
      out[15] = 1;
      return out;
    }

    function pick(nx: number, ny: number): number {
      const rox = 0,
        roy = 0,
        roz = fCamZ;
      const rdx = nx * fTan * fAspect;
      const rdy = ny * fTan;
      const rdz = -1;
      let hit = -1;
      let hitT = Infinity;
      for (const it of items) {
        if (Number.isNaN(it.z)) continue;
        const grow = hovered === it.i ? 1.2 : 1;
        buildModel(it, flat[it.i] ? flat[it.i].v : 0, grow, model);
        const ax = model[0],
          ay = model[1],
          az = model[2];
        const bx = model[4],
          by = model[5],
          bz = model[6];
        const cxw = model[12];
        const cyw = model[13];
        const czw = model[14];
        const nxw = ay * bz - az * by;
        const nyw = az * bx - ax * bz;
        const nzw = ax * by - ay * bx;
        const den = rdx * nxw + rdy * nyw + rdz * nzw;
        if (den > -1e-8) continue;
        const t = ((cxw - rox) * nxw + (cyw - roy) * nyw + (czw - roz) * nzw) / den;
        if (t <= 0 || t >= hitT) continue;
        const px = rox + rdx * t - cxw;
        const py = roy + rdy * t - cyw;
        const pz = roz + rdz * t - czw;
        const u = (px * ax + py * ay + pz * az) / (ax * ax + ay * ay + az * az);
        const v = (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz);
        if (Math.abs(u) <= 0.5 && Math.abs(v) <= 0.5) {
          hitT = t;
          hit = it.i;
        }
      }
      return hit;
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const c = propsRef.current;
      intro = Math.min(1, intro + dt / 2.4);
      const introProg = intro < 0.5 ? 4 * intro ** 3 : 1 - Math.pow(-2 * intro + 2, 3) / 2;
      const count = Math.max(1, Math.round(c.visibleCount));
      if (flat.length !== count) flat = Array.from({ length: count }, () => ({ v: 0, from: 0, to: 0, t: 1 }));
      if (items.length !== count)
        items = Array.from({ length: count }, (_, i) => ({ i, x: POS_X, y: POS_Y, z: NaN, bz: NaN, sx: c.imageWidth, sy: c.imageHeight, wz: 0 }));

      const lf = 1 - Math.pow(1 - DAMPING, dt * 60);
      currentScroll += (targetScroll - currentScroll) * lf;
      if (hovered === -1) targetScroll += c.autoScrollSpeed * dt;

      const rx = (c.viewAngleX * Math.PI) / 180;
      const ry = (c.viewAngleY * Math.PI) / 180;
      if (rx !== lastRx || ry !== lastRy) {
        m4RotXYZ(rx, ry, 0, rootRot);
        eulerOfInverse(rootRot, flatEuler);
        lastRx = rx;
        lastRy = ry;
      }
      const camZ = CAMERA_DISTANCE;
      const totalDepth = Math.max(1, count * c.zSpacing);
      const maxZ = camZ - 50;
      const minZ = maxZ - totalDepth;
      const aspect = vw / vh;
      m4Perspective(PERSPECTIVE, aspect, 0.1, 20000, proj);
      view[14] = -camZ;
      m4Mul(proj, view, vp);
      fTan = Math.tan(((PERSPECTIVE * Math.PI) / 180) * 0.5);
      fAspect = aspect;
      fCamZ = camZ;

      const hit = overHost ? pick(ndcX, ndcY) : -1;
      const prevHovered = hovered;
      hovered = hit;
      if (hovered !== prevHovered) {
        if (prevHovered >= 0 && flat[prevHovered]) {
          const t = flat[prevHovered];
          t.from = t.v;
          t.to = 0;
          t.t = 0;
        }
        if (hovered >= 0 && flat[hovered]) {
          const t = flat[hovered];
          t.from = t.v;
          t.to = 1;
          t.t = 0;
        }
      }
      for (const t of flat) {
        if (t.t >= 1) continue;
        t.t = Math.min(1, t.t + dt / FLATTEN_DUR);
        const e = 1 - Math.pow(1 - t.t, 3);
        t.v = t.from + (t.to - t.from) * e;
      }
      if (hovered >= 0) targetScroll += (currentScroll - targetScroll) * Math.min(lf * 1.5, 1);

      const diag = Math.hypot(c.imageWidth, c.imageHeight);
      const pushSpread = diag * 0.5 + HOVER_GAP;
      let hoveredZ = 0;
      if (hovered >= 0) {
        const o = hovered * c.zSpacing + currentScroll;
        hoveredZ = ((((o - minZ) % totalDepth) + totalDepth) % totalDepth) + minZ;
      }

      for (const it of items) {
        const i = it.i;
        const o = i * c.zSpacing + currentScroll;
        const norm = ((((o - minZ) % totalDepth) + totalDepth) % totalDepth) + minZ;
        const first = Number.isNaN(it.bz);
        const prevBz = first ? norm : it.bz;
        it.bz = norm;
        let tz = norm;
        let ty = POS_Y;
        let tsx = c.imageWidth;
        let tsy = c.imageHeight;
        const depthFactor = (maxZ - norm) / totalDepth;
        const itemProg = Math.max(0, Math.min(1, (introProg - depthFactor * 0.4) / 0.6));
        const ease = 1 - Math.pow(1 - itemProg, 3);
        const inv = 1 - ease;
        tz -= 300 * inv;
        ty -= 60 * inv;
        tsx *= 0.4 + 0.6 * ease;
        tsy *= 0.4 + 0.6 * ease;
        let distFromHover = 0;
        if (hovered >= 0) {
          if (i === hovered) {
            tz += 60;
          } else {
            distFromHover = tz - hoveredZ;
            if (distFromHover > totalDepth / 2) distFromHover -= totalDepth;
            if (distFromHover < -totalDepth / 2) distFromHover += totalDepth;
            if (distFromHover < -0.1) tz -= pushSpread;
            else if (distFromHover > 0.1) tz += pushSpread;
          }
        }
        const jumped =
          first ||
          Math.abs(norm - prevBz) > totalDepth * 0.5 ||
          (introProg > 0.99 && Math.abs(tz - it.z) > pushSpread * 0.8 && Math.abs(distFromHover) > totalDepth * 0.35);
        if (jumped) {
          it.z = tz;
          it.y = ty;
          it.sx = tsx;
          it.sy = tsy;
        } else {
          it.z += (tz - it.z) * lf;
          it.y += (ty - it.y) * lf;
          it.sx += (tsx - it.sx) * lf;
          it.sy += (tsy - it.sy) * lf;
        }
        it.wz = rootRot[2] * it.x + rootRot[6] * it.y + rootRot[10] * it.z;
      }

      order.length = 0;
      for (let i = 0; i < items.length; i++) order.push(i);
      order.sort((a, b) => {
        if (a === hovered) return 1;
        if (b === hovered) return -1;
        return items[a].wz - items[b].wz;
      });

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (const idx of order) {
        const it = items[idx];
        buildModel(it, flat[idx].v, 1, model);
        m4Mul(vp, model, mvp);
        gl.uniformMatrix4fv(uMVP, false, mvp);
        const slot = slots.length ? slots[idx % slots.length] : null;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, slot ? slot.tex : null);
        gl.uniform1f(uHasTex, slot && slot.ready ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    };

    const gate = () => {
      if (alive && propsRef.current.active && !document.hidden) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    gateRef.current = gate;
    document.addEventListener("visibilitychange", gate);
    gate();

    return () => {
      alive = false;
      gateRef.current = () => {};
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", gate);
      for (const s of slots) gl.deleteTexture(s.tex);
      gl.deleteBuffer(quad);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // The deck is built once per mount; the props it reads live in propsRef.
  }, []);

  return (
    <div ref={hostRef} className={`relative h-full w-full overflow-hidden [isolation:isolate] ${className}`} style={style}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}
