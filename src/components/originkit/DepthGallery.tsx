"use client";

/**
 * Depth Gallery — Originkit, supplied by the owner (2026-11-10: "change ABS
 * main page slide picture slider with this slider … with our current abs
 * pics"), after "Atmospheric Depth Gallery" by houmahani (Codrops, MIT);
 * vendored and fitted:
 *
 *   · the corridor is Originkit's, as given: the picture in focus sits a slot
 *     ahead of the camera and the next a slot behind it, and as the camera
 *     crosses a slot the near one swells towards the lens and fades while the
 *     far one arrives in its place, alternately left and right of centre;
 *     the pointer pushes the plates and their speed leans them (the breath);
 *   · each picture stands WHOLE in its own shape, fitted inside the box —
 *     `cardWidth` × `cardHeight`, or, left out, worked out from the frame —
 *     so a post with words on it loses nothing to a crop;
 *   · the corridor moves on by itself, a picture every `hold` seconds; and
 *     INSIDE the frame the wheel, a finger's swipe and a mouse drag fly it
 *     (owner, 2026-11-10: "if you scroll inside the red rounded box, it will
 *     move between pics, and when we scroll outside that box then it move
 *     between main page slides") — the frame is `data-own-scroll`, so the
 *     page's Flythrough leaves them to it. Down (or a swipe up) flies in, as
 *     Originkit's wheel did; let go, it comes to rest on the next picture the
 *     way it was going, never half-way between two;
 *   · the pictures are fetched a few ahead of the camera, not all at once;
 *   · it draws only while `active` (its slide on screen, the tab seen), and
 *     sets its first frame even when not, so it is there as the camera lands;
 *   · reduced motion: no stepping, no breath, no parallax — the first picture
 *     holds, and a drag still moves it;
 *   · the mood ground the original's notes describe (its code no longer
 *     painted it) is left out, and with it the colour sampling that only fed
 *     it: the frame it sits in keeps its own ground. The grain stays;
 *   · the lerps run on the clock, not the frame count, so a 120 Hz screen
 *     moves no faster than a 60 Hz one; the props settle into a ref after
 *     render, not during.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export interface GalleryImage {
  src: string;
  /** Width ÷ height. */
  a: number;
}

interface Props {
  images: GalleryImage[];
  /** The box each picture is fitted inside, px on screen at focus. */
  cardWidth?: number;
  cardHeight?: number;
  /** 0–10: the gap between plates. */
  depth?: number;
  /** 0–10: how far off centre a plate stands, left and right in turn. */
  spread?: number;
  /** Corner radius at focus, px. */
  radius?: number;
  /** Seconds a picture holds before the corridor moves on. */
  hold?: number;
  /** 0–10: film grain over the ground. */
  grain?: number;
  /** 0–10: the pointer's push on the plates. */
  pointer?: number;
  /** 0–10: the lean and swell their speed gives them. */
  breath?: number;
  /** 0–10: the vertical push in the direction of travel. */
  drift?: number;
  /** 0–10: how far a drag carries the corridor. */
  sensitivity?: number;
  /** 0–10: how slowly the corridor catches up. */
  smoothing?: number;
  /** What a plate shows while its picture loads. */
  mat?: string;
  active?: boolean;
  reduceMotion?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ── Originkit's constants ────────────────────────────────────────────────

/** Slots ahead of the camera the plate in focus sits. */
const VIEW_LEAD = 1;
/** Perspective as a multiple of the box's width. */
const PERSPECTIVE_RATIO = 3.2;
/** Depth 0–10 → the gap between plates, as a share of the perspective. */
const GAP_MIN = 0.26;
const GAP_RANGE = 0.9;
/** Spread 10 puts a plate this far off centre, as a share of the box. */
const SPREAD_RANGE = 0.6;
/** Pixels to cross one plate at a gain of 1 (Originkit's wheel, which a drag
 *  outran by DRAG_GAIN). */
const WHEEL_SPAN = 650;
const WHEEL_MIN = 0.4;
const WHEEL_RANGE = 1.6;
const DRAG_GAIN = 1.8;
/** Slots per 60 Hz frame that count as flat out. */
const VELOCITY_MAX = 0.03;
const VELOCITY_DAMPING = 0.12;
const POINTER_SMOOTHING = 0.08;
const BREATH_SMOOTHING = 0.14;
const DRIFT_SMOOTHING = 0.05;
const BREATH_GAIN = 1.1;
/** The breath at 5: a 2.6° lean and a 3% swell. */
const BREATH_TILT_DEG = 2.6;
const BREATH_SCALE = 0.03;
/** Extra pointer taken per slot of depth. */
const DEPTH_INFLUENCE = 0.05;
/** Grain at 10, as an overlay alpha, and its tile's edge. */
const GRAIN_RANGE = 0.28;
const GRAIN_TILE = 128;

// ── This site's ──────────────────────────────────────────────────────────

/** One 60 Hz frame, ms: the unit Originkit's per-frame lerps were set in. */
const FRAME_MS = 1000 / 60;
/** Room kept clear inside the frame, as a share of its shorter side. */
const MARGIN = 0.06;
/** Plates fetched round the camera: one behind, three ahead. */
const REACH = [-1, 0, 1, 2, 3];
/** After a drag, the corridor waits this many holds before moving on. */
const AFTER_DRAG = 1.5;
/** The wheel has stopped when no turn has come for this long, ms. */
const WHEEL_IDLE = 160;
/** A scroll or drag shorter than this share of a slot goes back where it
 *  began; longer, on to the next picture the way it went. One notch of a
 *  mouse wheel (~0.2 slot) is enough. */
const SETTLE_MIN = 0.1;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
/** Positive modulo: a corridor scrolled backwards still lands on a plate. */
const wrap = (v: number, span: number) => ((v % span) + span) % span;
/** A per-frame lerp `k`, over `dt` ms instead of one frame. */
const lerpOver = (k: number, dt: number) => 1 - Math.pow(1 - k, dt / FRAME_MS);

/** The grain's noise tile, made once per page and shared. */
let grainUrl: string | null = null;
function grainTile(): string | null {
  if (grainUrl) return grainUrl;
  const canvas = document.createElement("canvas");
  canvas.width = GRAIN_TILE;
  canvas.height = GRAIN_TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const noise = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = Math.round(Math.random() * 255);
    noise.data[i] = v;
    noise.data[i + 1] = v;
    noise.data[i + 2] = v;
    noise.data[i + 3] = 255;
  }
  ctx.putImageData(noise, 0, 0);
  grainUrl = canvas.toDataURL();
  return grainUrl;
}

/** What the frame loop reads — refreshed after every render, so a change of
 *  prop never tears the loop down. */
interface Frame {
  count: number;
  gap: number;
  scaleK: number;
  spreadPx: number;
  ease: number;
  dragToSlot: number;
  wheelToSlot: number;
  pointerAmount: number;
  driftAmount: number;
  breathTilt: number;
  breathScale: number;
  /** ms; 0, no stepping. */
  hold: number;
  active: boolean;
}

/** What moves, kept across the loop's restarts. */
interface Motion {
  last: number;
  previous: number;
  velocity: number;
  breath: number;
  drift: number;
  pointer: { x: number; y: number };
  nextStep: number;
  dragging: boolean;
  /** Where the corridor stood when a scroll or drag began. */
  from: number;
  focus: number;
}

export function DepthGallery({
  images,
  cardWidth,
  cardHeight,
  depth = 5,
  spread = 5,
  radius = 16,
  hold = 3.4,
  grain = 3,
  pointer = 5,
  breath = 5,
  drift = 5,
  sensitivity = 6.1,
  smoothing = 10,
  mat = "#5c0d16",
  active = true,
  reduceMotion = false,
  className = "",
  style,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const plateNodes = useRef<(HTMLDivElement | null)[]>([]);
  const target = useRef(0);
  const current = useRef(0);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const motion = useRef<Motion>({
    last: 0,
    previous: 0,
    velocity: 0,
    breath: 0,
    drift: 0,
    pointer: { x: 0, y: 0 },
    nextStep: 0,
    dragging: false,
    from: 0,
    focus: -1,
  });
  const frame = useRef<Frame | null>(null);

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const grainRef = useRef<HTMLDivElement | null>(null);

  // The dissolve is always between two plates, so one picture is given a
  // second copy of itself to fly into.
  const list = images.length === 1 ? [images[0], images[0]] : images;
  const count = list.length;

  /** The plates whose pictures are asked for: the reach round the camera,
   *  and every one asked for before (kept, so a picture is never dropped). */
  const [want, setWant] = useState<ReadonlySet<number>>(() => new Set(count ? REACH.map((d) => wrap(d, count)) : []));

  /* ---- the frame's size */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const read = () => {
      const w = node.clientWidth;
      const h = node.clientHeight;
      setSize((s) => (s && s.w === w && s.h === h ? s : { w, h }));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  /* ---- the grain, laid on after mount (a random first paint would not
   *  match the server's) */
  useEffect(() => {
    const node = grainRef.current;
    const tile = grainTile();
    if (node && tile) node.style.backgroundImage = `url(${tile})`;
  }, []);

  /* ---- the box: given, or the most the frame holds. At rest the plate in
   *  focus stands `spread` off centre and the pointer pushes it further, so
   *  half the frame must hold its half-width and both. */
  const spreadShare = (clamp(spread, 0, 10) / 10) * SPREAD_RANGE;
  const pointerShare = reduceMotion ? 0 : (clamp(pointer, 0, 10) / 10) * 0.11 * (1 + DEPTH_INFLUENCE);
  const room = size ? Math.min(size.w, size.h) * MARGIN : 0;
  const boxW = cardWidth ?? (size ? Math.max(40, (size.w / 2 - room) / (0.5 + spreadShare + pointerShare)) : 0);
  const boxH = cardHeight ?? (size ? Math.max(40, (size.h - 2 * room) * 0.94) : 0);

  const perspective = Math.max(boxW, 120) * PERSPECTIVE_RATIO;
  const gap = perspective * (GAP_MIN + (clamp(depth, 0, 10) / 10) * GAP_RANGE);
  // The box is what the plate in focus measures on screen, so each plate is
  // cut oversize by the perspective divide it takes at the focus distance.
  const scaleK = (perspective + gap) / perspective;
  const wheelToSlot = (WHEEL_MIN + (clamp(sensitivity, 0, 10) / 10) * WHEEL_RANGE) / WHEEL_SPAN;
  const dragToSlot = wheelToSlot * DRAG_GAIN;
  const breathOn = reduceMotion ? 0 : clamp(breath, 0, 10) / 5;

  const next: Frame = {
    count,
    gap,
    scaleK,
    spreadPx: spreadShare * boxW,
    ease: 0.16 - (clamp(smoothing, 0, 10) / 10) * 0.135,
    dragToSlot,
    wheelToSlot,
    pointerAmount: reduceMotion ? 0 : (clamp(pointer, 0, 10) / 10) * 0.11 * boxW,
    driftAmount: reduceMotion ? 0 : (clamp(drift, 0, 10) / 10) * 0.035 * boxH,
    breathTilt: breathOn * BREATH_TILT_DEG,
    breathScale: breathOn * BREATH_SCALE,
    hold: reduceMotion ? 0 : Math.max(0.5, hold) * 1000,
    active,
  };
  useLayoutEffect(() => {
    frame.current = next;
  });

  /* ---- the frame loop: while active and seen; one frame regardless, so
   *  the plates stand in place before the slide is the camera's */
  useEffect(() => {
    const m = motion.current;
    let raf = 0;

    /** One plate at one slot. Side and depth come off the slot, never the
     *  picture's index: the same picture is a different place each lap. */
    const place = (f: Frame, index: number, slot: number, opacity: number, ahead: number) => {
      const node = plateNodes.current[index];
      if (!node) return;
      const distance = ahead + VIEW_LEAD;
      const z = -distance * f.gap;
      const influence = opacity * (1 + distance * DEPTH_INFLUENCE);
      const side = wrap(slot, 2) === 0 ? -1 : 1;
      const x = side * f.spreadPx * f.scaleK + m.pointer.x * f.pointerAmount * influence;
      const y = m.pointer.y * f.pointerAmount * 0.5 * influence + m.drift * f.driftAmount;
      const lean = m.breath * opacity;
      const tiltX = -m.pointer.y * f.breathTilt * lean;
      const tiltY = m.pointer.x * f.breathTilt * lean;
      const pulse = 1 + f.breathScale * lean;
      node.style.visibility = "visible";
      node.style.willChange = "transform, opacity";
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg) scale(${pulse.toFixed(4)})`;
    };

    const tick = (now: number) => {
      const f = frame.current;
      if (!f || f.count < 2) return;
      const dt = m.last ? Math.min(now - m.last, 100) : FRAME_MS;
      m.last = now;

      // Moving on: a step every hold, from a resting place.
      if (f.hold && f.active && !m.dragging) {
        if (!m.nextStep) m.nextStep = now + f.hold;
        else if (now >= m.nextStep) {
          target.current = Math.round(target.current) + 1;
          m.nextStep = now + f.hold;
        }
      }

      current.current += (target.current - current.current) * lerpOver(f.ease, dt);

      // The corridor has no end, so the position is folded back onto a lap
      // — two for an odd list, so no plate changes sides as it folds.
      const span = f.count % 2 === 0 ? f.count : f.count * 2;
      if (current.current < -span || current.current > span) {
        const laps = Math.floor(current.current / span) * span;
        current.current -= laps;
        target.current -= laps;
        m.previous -= laps;
        m.from -= laps;
      }
      const position = current.current;

      // Speed off the drawn position, not the target, so a throw the lerp is
      // still catching keeps the corridor breathing.
      const raw = ((position - m.previous) * FRAME_MS) / dt;
      m.previous = position;
      m.velocity += (raw - m.velocity) * lerpOver(VELOCITY_DAMPING, dt);
      if (Math.abs(m.velocity) < 1e-6) m.velocity = 0;
      const speed = clamp(Math.abs(m.velocity) / VELOCITY_MAX, 0, 1);
      const signed = clamp(m.velocity / VELOCITY_MAX, -1, 1);
      m.breath += (speed * BREATH_GAIN - m.breath) * lerpOver(BREATH_SMOOTHING, dt);
      m.drift += (signed - m.drift) * lerpOver(DRIFT_SMOOTHING, dt);
      const p = lerpOver(POINTER_SMOOTHING, dt);
      m.pointer.x += (pointerTarget.current.x - m.pointer.x) * p;
      m.pointer.y += (pointerTarget.current.y - m.pointer.y) * p;

      const slot = Math.floor(position);
      const blend = position - slot;
      const focus = wrap(slot, f.count);
      const following = wrap(slot + 1, f.count);

      // The pictures round the new focus are asked for.
      if (focus !== m.focus) {
        m.focus = focus;
        const reach = REACH.map((d) => wrap(focus + d, f.count));
        setWant((had) => (reach.every((i) => had.has(i)) ? had : new Set([...had, ...reach])));
      }

      // Only the pair is painted; the rest are taken out of the compositor.
      for (let i = 0; i < f.count; i += 1) {
        if (i === focus || i === following) continue;
        const node = plateNodes.current[i];
        if (!node || node.style.visibility === "hidden") continue;
        node.style.visibility = "hidden";
        node.style.willChange = "auto";
        node.style.opacity = "0";
      }
      place(f, focus, slot, 1 - blend, -blend);
      place(f, following, slot + 1, blend, 1 - blend);
    };

    const running = () => !!frame.current?.active && !document.hidden;
    const loop = (now: number) => {
      tick(now);
      raf = running() ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (raf || !running()) return;
      m.last = 0;
      m.nextStep = 0;
      raf = requestAnimationFrame(loop);
    };

    m.last = 0;
    m.nextStep = 0;
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", wake);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [active, size, count]);

  /* ---- inside the frame: the wheel and a drag (mouse or finger) fly the
   *  corridor, and the pointer pushes the plates */
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const m = motion.current;
    let id: number | null = null;
    let lastY = 0;
    let idle = 0;

    /** A scroll or drag begins: the corridor stops moving on by itself. */
    const begin = () => {
      if (!m.dragging) m.from = target.current;
      m.dragging = true;
    };
    /** …and ends: on to the next picture the way it went, or back. */
    const settle = () => {
      m.dragging = false;
      const d = target.current - m.from;
      target.current = Math.abs(d) < SETTLE_MIN ? Math.round(m.from) : d > 0 ? Math.ceil(target.current - 1e-6) : Math.floor(target.current + 1e-6);
      const f = frame.current;
      m.nextStep = f?.hold ? performance.now() + f.hold * AFTER_DRAG : 0;
    };

    const onWheel = (e: WheelEvent) => {
      const f = frame.current;
      if (!f || e.ctrlKey) return;
      e.preventDefault();
      begin();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      target.current += delta * f.wheelToSlot;
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, WHEEL_IDLE);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || id !== null) return;
      id = e.pointerId;
      lastY = e.clientY;
      begin();
      node.setPointerCapture(e.pointerId);
      node.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      // A finger doesn't hover, so only a mouse pushes the plates.
      if (e.pointerType !== "touch") {
        const box = node.getBoundingClientRect();
        if (box.width && box.height) {
          pointerTarget.current.x = ((e.clientX - box.left) / box.width) * 2 - 1;
          pointerTarget.current.y = -(((e.clientY - box.top) / box.height) * 2 - 1);
        }
      }
      if (id !== e.pointerId) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      const f = frame.current;
      // Dragging up advances the camera, as a wheel turned down did.
      if (f) target.current -= dy * f.dragToSlot;
    };
    const onUp = (e: PointerEvent) => {
      if (id !== e.pointerId) return;
      id = null;
      settle();
      if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
      node.style.cursor = "";
    };
    const onLeave = () => {
      pointerTarget.current.x = 0;
      pointerTarget.current.y = 0;
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointercancel", onUp);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      window.clearTimeout(idle);
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerup", onUp);
      node.removeEventListener("pointercancel", onUp);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      // Its own scroll: the page's Flythrough leaves the wheel and a swipe
      // that begin in here to it, and the browser doesn't pan the page.
      data-own-scroll
      className={`relative h-full w-full cursor-grab touch-none select-none overflow-hidden ${className}`}
      style={style}
    >
      {/* Film grain over the ground, under the plates. */}
      {grain > 0 && (
        <div
          ref={grainRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
            opacity: (clamp(grain, 0, 10) / 10) * GRAIN_RANGE,
          }}
        />
      )}

      {/* The corridor. */}
      {size && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ perspective: `${perspective}px`, perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d" }}
        >
          {list.map((img, i) => {
            // The picture's own shape, as large as the box allows.
            const w = Math.min(boxW, boxH * img.a) * scaleK;
            const h = (Math.min(boxW, boxH * img.a) / img.a) * scaleK;
            return (
              <div
                key={i}
                ref={(el) => {
                  plateNodes.current[i] = el;
                }}
                className="absolute left-1/2 top-1/2 overflow-hidden"
                style={{
                  width: w,
                  height: h,
                  // Centred with margins: the loop owns `transform`.
                  marginLeft: -w / 2,
                  marginTop: -h / 2,
                  borderRadius: Math.max(radius, 0) * scaleK,
                  background: mat,
                  backfaceVisibility: "hidden",
                  visibility: "hidden",
                  opacity: 0,
                }}
              >
                {want.has(i) && (
                  // eslint-disable-next-line @next/next/no-img-element -- sized by the loop's plate, at the box's size
                  <img src={img.src} alt="" draggable={false} decoding="async" className="pointer-events-none block h-full w-full object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
