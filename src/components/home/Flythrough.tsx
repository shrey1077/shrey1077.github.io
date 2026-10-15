"use client";

/**
 * Flythrough — the landing and every room as one flight (2026-10-02, owner:
 * "vertical slides flythrough… travel in z axis to the clients page, then the
 * next scroll to projects, and so on").
 *
 * THE MOVES (2026-10-10, owner — first "an effect as if we have moved down
 * and left (when scrolled from 2 to 3) in the plane of the brain slide
 * (similarly for right side)", then "dont remove the fly through effect, just
 * the dissolve should be done in pixel effects"):
 *
 *                 [ orb ]
 *                    ↓          the page scrolls (HeroStage)
 *                [ brain ]
 *              ↙           ↘    across the brain slide's plane — the side
 *       [ Tata IIS ]     [ Arts & Crafts ]   the pointer is on picks the column
 *            ⊙                 ⊙
 *       [ Azoth ]        [ AI Projects ]       ⊙ = a fly-through, in depth,
 *            ⊙                 ⊙                   dissolving in squares
 *           …                 …
 *       [ Vivid ]        [ The Extincts Project ]
 *
 *   · from the brain into a column the camera moves DOWN AND TO THE SIDE on
 *     the brain slide's own plane: the landing slides off up and away while
 *     the first room comes in from the lower corner, the view lifting a
 *     little through the move (CAMERA_DIP). Which side is the visitor's: a
 *     scroll with the pointer over the Left brain goes left, over the Right
 *     brain right (a touch: where the finger lands);
 *   · every step down a column is the FLY-THROUGH: the next room waits back
 *     in the depth (AHEAD_Z) and flies forward to fill the screen while the
 *     current one rushes past the camera (PASS_Z), the two handing over in
 *     squares (pixelDissolve, clipping each room);
 *   · every move, the pan across between the columns included, lights a wave
 *     of glass tiles over the squares as they turn, across the whole screen
 *     (PixelVeil).
 *
 * THE ROOMS (owner, 2026-10-15). One slide per project on the left — the
 * nine of constants/showcase.ts, in the owner's order — and one per body of
 * work on the right (four), each in four quadrants (ShowcaseRoom). Until then
 * each side had three section rooms of cards (Clients · Projects · My Stack;
 * AI Videos · Arts & Crafts · The Extincts Project). Along the top of each
 * side runs its strip (ShowcaseStrip): it comes in with the side's first
 * room — from the foot of the brain slide, where the Projects pin stands —
 * and then holds still while the rooms fly through beneath it.
 *
 * ONE STEP, HOWEVER FAR — THE WARP (owner, 2026-10-15: "we can access them
 * through logos on top, at that time, there should be a single slide
 * transition and not go through multiple slides quickly"). A choice in the
 * strip, the sections menu (SectionMenu) or a pin flies straight there: for
 * the length of the flight the two ends of the jump stand in as neighbours
 * (`slotOf`), every slide between is hidden, and the camera the slides and
 * the veil read (`cam`) runs one slide's step while the page scrolls the
 * whole way underneath. Onto the other side it pans across first, the room
 * arriving the one chosen, and lands the page on it after.
 *
 * THE RUN. A tall block, one screen of scroll per slide, holding a sticky
 * full-screen stage. Scroll position through the block is the camera:
 *   · the landing is slides 0 and 1: the portrait orb, then the brain with
 *     its pins (HeroStage); the next scroll takes it off across the plane;
 *   · then the rooms — as long as the side the camera is on (`runLast`: the
 *     two columns are no longer the same length), held long enough for both
 *     ends while a jump crosses sides;
 *   · past the last slide the block simply scrolls away into the footer.
 * The camera is a real translateZ under perspective, and every position and
 * clip is written through motion values — no React work per frame.
 *
 * SWITCHING SIDE is sideways: a pan — this room slides off one way, the other
 * side's slides in from the other. The sections menu and the arrow keys ← →
 * do it; the keys to the room level with this one, or the other side's last
 * where it is shorter. (The brain's circle in each column's outer foot,
 * BrainDock, did it until 2026-10-15; its corners hold the Stack and Tools
 * buttons now, KitButton.) Back up on the orb the track resets to logic.
 *
 * ONE SCROLL, ONE SLIDE. Inside the run a wheel gesture is taken over and flies
 * exactly one slide, with a lock that outlasts a trackpad's inertia tail so one
 * swipe can't skip three slides. Anything inside a slide that scrolls on its
 * own gets the wheel first until it hits its end. Keys step the same way.
 * Touch, the scrollbar and anything else scroll natively and are eased onto
 * the nearest slide when they come to rest.
 *
 * Reduced motion: no take-over, no movement, no depth, no squares — slides
 * crossfade with the scroll, and a switch of side cuts rather than pans.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { FlightContext, HERO_SLIDES, PERSPECTIVE } from "@/components/home/flight";
import { PixelVeil } from "@/components/home/PixelVeil";
import { FLY_EASE, PAN_CELL, clipFor, easeTime, gridFor } from "@/components/home/pixelDissolve";
import { FootBand } from "@/components/home/FootBand";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { SectionParticles } from "@/components/home/SectionParticles";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { MOOD_BG, MoodField } from "@/components/home/MoodField";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { ProjectSlide } from "@/components/home/ProjectSlide";
import { AzothSlide } from "@/components/home/AzothSlide";
import { AbsSlide } from "@/components/home/AbsSlide";
import { ZabrakuSlide } from "@/components/home/ZabrakuSlide";
import { NewsMobileSlide } from "@/components/home/NewsMobileSlide";
import { ExtinctsSlide } from "@/components/home/ExtinctsSlide";
import { ArtSlide, type ArtThumb } from "@/components/home/ArtSlide";
import { AiSlide } from "@/components/home/AiSlide";
import { WritingsSlide } from "@/components/home/WritingsSlide";
import { EdgeJump } from "@/components/home/EdgeJump";
import { ShowcaseStrip } from "@/components/home/ShowcaseStrip";
import { SectionMenu } from "@/components/home/SectionMenu";
import { KitButton } from "@/components/home/KitButton";
import { NearContext, useFirstScreenUp, usePageSettled } from "@/components/home/nearness";
import { CREATIVE_SHOWCASE, LOGIC_SHOWCASE, type Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

export type Track = "logic" | "creative";

/** The two columns, top room first. */
const LOGIC = LOGIC_SHOWCASE;
const CREATIVE = CREATIVE_SHOWCASE;
const roomsOf = (t: Track) => (t === "logic" ? LOGIC : CREATIVE);
/** The landing takes the first HERO_SLIDES (the orb, then the brain); the
 *  rooms start after it. */
const FIRST_ROOM = HERO_SLIDES;
const BRAIN = FIRST_ROOM - 1;
/** The last slide of a side's run. */
const lastFor = (t: Track) => FIRST_ROOM + roomsOf(t).length - 1;

interface Room {
  item: Showcase;
  level: number;
  track: Track;
  index: number;
}
const ROOMS: Room[] = [
  ...LOGIC.map((item, level) => ({ item, level, track: "logic" as const, index: FIRST_ROOM + level })),
  ...CREATIVE.map((item, level) => ({ item, level, track: "creative" as const, index: FIRST_ROOM + level })),
];
const roomAt = (index: number, t: Track) => ROOMS.find((r) => r.index === index && r.track === t);

/** Seconds for one slide's flight on the landing (the orb to the brain); each
 *  further slide adds FLY_EXTRA, up to FLY_MAX_SLIDES' worth. */
const FLY_BASE = 0.95;
/** …and for one into or between the rooms, which turn over in squares —
 *  long enough to watch them go (owner, 2026-10-10: "very quick"). A warp,
 *  however far, is one of these. */
const FLY_ROOMS = 1.6;
const FLY_EXTRA = 0.3;
const FLY_MAX_SLIDES = 6;
/** Seconds for the sideways pan between the two tracks. */
const PAN = 1.4;
/** How far the camera lifts through a move across the plane (from the brain
 *  into a column, and the pan): the view is this much smaller mid-way and
 *  settles back as it lands. The fly-throughs need none — they are depth. */
const CAMERA_DIP = 0.06;
/** px of depth per slide still to come — the next room waits ~0.4× — and px
 *  toward the camera per slide gone by, so a passed room swells as it goes
 *  (with PERSPECTIVE, flight.ts). */
const AHEAD_Z = 1700;
const PASS_Z = 800;
/** A wheel event this soon after the last belongs to the same gesture. */
const GESTURE_GAP_MS = 220;
/** ⚠ THE LOCK HAS A CAP (speed fix 6, 2026-10-13, with the owner's OK). One
 *  push moves one slide, and the rest of that push's wheel events are
 *  swallowed — but until then they were swallowed for as long as they kept
 *  coming within GESTURE_GAP_MS, so a long trackpad glide, or a wheel kept
 *  turning because nothing seemed to happen, held the page still (6 s of
 *  steady scrolling moved ONE slide: the "freeze"). Now, once the flight has
 *  landed and this long has passed, a wheel still PUSHING is a new push and
 *  moves on; one dying away (momentum's tail) is still the old one. The
 *  flights themselves are untouched. */
const LOCK_CAP_MS = 450;
/** Pushing, not dying away, measured against the largest delta in the last
 *  PUSH_WINDOW_MS: either STEADY and strong — at least PUSH_STEADY_PX and not
 *  falling below PUSH_HOLD of that peak (a wheel kept turning) — or RISING
 *  past it by PUSH_RISE (fingers back on the pad). Momentum only ever falls,
 *  and its last crumbs, flat at a few px, are neither. */
const PUSH_WINDOW_MS = 300;
const PUSH_STEADY_PX = 15;
const PUSH_HOLD = 0.98;
const PUSH_RISE = 1.1;
/** How far a finger travels before a swipe counts, px. */
const SWIPE_PX = 24;
/** Native scrolling that stops this long counts as at rest. */
const SETTLE_MS = 140;
/** Slide positions this close to a whole number count as on that slide. */
const EPS = 0.02;

/** Fired to fly somewhere: a slide by index (0 = the orb), optionally
 *  switching track, or a room by its showcase id. */
const GO_EVENT = "flythrough:go";
type GoDetail = number | { k: number; track?: Track } | { id: string };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** A jump of more than one slide, or across the sides (see THE WARP). From
 *  slide `a` on track `ta` to `b` on `tb`; the two ends stand in as the
 *  neighbours A and B while it lasts. A `pan` holds the camera on A while the
 *  sides pan, then lands the page on b. */
interface Warp {
  a: number;
  b: number;
  ta: Track;
  tb: Track;
  pan: boolean;
  A: number;
  B: number;
}

/** Where a slide stands for the camera: its own index, or — in a warp — its
 *  stand-in; null for every slide the warp passes over. `track` is null for
 *  the landing. */
function slotOf(w: Warp | null, index: number, track: Track | null): number | null {
  if (!w) return index;
  const end = (k: number, t: Track) => index === k && (track === null ? k < FIRST_ROOM : k >= FIRST_ROOM && track === t);
  if (end(w.a, w.ta)) return w.A;
  if (end(w.b, w.tb)) return w.B;
  return null;
}

/** The camera's scale at camera `v` and pan `tx`: it lifts through a move
 *  across the plane — from the brain into a column, and the pan — and
 *  settles as it lands. Shared by the stage and the rooms' squares, which
 *  have to undo it to stay put on the screen. */
function cameraLift(v: number, tx: number, reduceMotion: boolean) {
  if (reduceMotion) return 1;
  const into = v > BRAIN && v < FIRST_ROOM ? Math.sin(Math.PI * (v - BRAIN)) : 0;
  const across = Math.sin(Math.PI * clamp01(tx));
  return 1 - CAMERA_DIP * Math.max(into, across);
}

/** True when the wheel should scroll something inside the slide first. */
function canScrollInside(target: EventTarget | null, root: HTMLElement, dir: number): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== root) {
    if (el instanceof HTMLElement && el.scrollHeight > el.clientHeight + 1) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === "auto" || oy === "scroll") {
        const room =
          dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0;
        if (room) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * One slide, posed by the camera (`cam`, in slides) and the pan between the
 * columns (trackX, 0 logic … 1 creative):
 *   · the LANDING stands still to the brain slide, then rides up and away
 *     across the plane — right when the camera heads for the logic column,
 *     left for the creative;
 *   · a ROOM: the first of each column comes in across the plane from its
 *     lower corner (the step from the brain); every room after it waits back
 *     in the depth and flies forward; and every room, once the camera passes
 *     it, rushes past. On those fly-through steps both rooms are CLIPPED to
 *     the squares (pixelDissolve). The pan between columns rides on top.
 * Where it stands is its SLOT — its index, or its stand-in during a warp.
 * Two layers: the outer one moves across the plane and carries the clip and
 * the perspective; the inner one flies in depth. A slide wholly gone is
 * hidden. Reduced motion: no movement, no squares — a crossfade, and the pan
 * cuts.
 */
function Slide({
  kind,
  index,
  track = null,
  warpRef,
  warpTick,
  cam,
  trackX,
  side = 0,
  pan,
  heading = "logic",
  reduceMotion,
  current,
  className = "",
  children,
}: {
  kind: "landing" | "room";
  index: number;
  /** A room's track; null for the landing. */
  track?: Track | null;
  warpRef: React.RefObject<Warp | null>;
  /** Bumped whenever a warp starts or ends, so the poses are re-read. */
  warpTick: MotionValue<number>;
  cam: MotionValue<number>;
  trackX: MotionValue<number>;
  /** A room's column: −1 the logic one (left), 1 the creative one (right). */
  side?: -1 | 0 | 1;
  /** Sideways offset in screen widths (−1 off left … 1 off right) — the
   *  track pan. The landing has none. */
  pan?: MotionValue<number>;
  /** The track a pan is heading for — so a room knows, mid-pan, whether it
   *  is the column going or the one arriving. */
  heading?: Track;
  reduceMotion: boolean;
  /** The slide the camera is on — the only one that takes the pointer. */
  current: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const box = useRef({ w: 0, h: 0 });
  const lastClip = useRef("none");
  const still = useMotionValue(0);
  const offset = pan ?? still;
  const room = kind === "room";
  const slot = () => slotOf(warpRef.current, index, track);

  // Across the plane, in screen sizes. A slide the warp passes over is sent
  // well off (and hidden below).
  const posX = useTransform([cam, trackX, offset, warpTick], ([v, tx, o]: number[]) => {
    const k = slot();
    if (k === null) return 2;
    if (!room) return reduceMotion ? 0 : (tx > 0.5 ? -1 : 1) * clamp01(v - k);
    return reduceMotion ? o : o + side * clamp01(FIRST_ROOM - v);
  });
  const posY = useTransform([cam, warpTick], ([v]: number[]) => {
    const k = slot();
    if (reduceMotion || k === null) return 0;
    return room ? clamp01(FIRST_ROOM - v) : -clamp01(v - k);
  });
  const x = useTransform(posX, (q) => `${q * 100}%`);
  const y = useTransform(posY, (q) => `${q * 100}%`);
  // In depth: waiting ahead, or rushing past. The first room of a column
  // comes in across the plane, not out of the depth.
  const z = useTransform([cam, warpTick], ([v]: number[]) => {
    const k = slot();
    if (reduceMotion || !room || k === null) return 0;
    const d = k - v;
    if (d >= 0) return k === FIRST_ROOM ? 0 : -Math.min(1, d) * AHEAD_Z;
    return -Math.max(-1, d) * PASS_Z;
  });
  // The one passing is stacked over the one arriving behind it.
  const zIndex = useTransform([cam, warpTick], ([v]: number[]) => {
    const k = slot();
    return room ? (k === null ? 0 : 100 - Math.round((k - v) * 10)) : 20;
  });
  const opacity = useTransform([cam, offset, warpTick], ([v, o]: number[]) => {
    if (!reduceMotion) return 1;
    const k = slot() ?? index;
    if (!room) return clamp01(k + 1 - v);
    return Math.abs(o) > 0.5 ? 0 : clamp01(1 - Math.abs(k - v));
  });
  const visibility = useTransform([cam, posX, posY, opacity, warpTick], ([v, qx, qy, op]: number[]) => {
    const k = slot();
    if (k === null || op < 0.01 || Math.abs(qx) > 0.999 || Math.abs(qy) > 0.999) return "hidden";
    if (room && !reduceMotion) {
      const d = k - v;
      // Flown past, or not yet begun — the next room's turn to come forward.
      if (d <= -1 + 1e-3 || (k !== FIRST_ROOM && d >= 1 - 1e-3)) return "hidden";
    }
    return "visible";
  });

  // ⚠ A slide out of sight is see-through as well as hidden: a 3D scene
  // inside one (the Zabraku robot, SplineScene) draws into a canvas that sets
  // its own visibility and showed through the slides around it. Opacity on an
  // ancestor is the one thing nothing inside can undo.
  const shown = useTransform(visibility, (v) => (v === "hidden" ? 0 : 1));

  // The squares: written straight to the DOM, only on a fly-through step.
  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const read = () => {
      box.current = { w: el.offsetWidth, h: el.offsetHeight };
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const headingRef = useRef(heading);
  useEffect(() => {
    headingRef.current = heading;
  }, [heading]);
  const applyClip = () => {
    const el = outerRef.current;
    if (!el || !room) return;
    const v = cam.get();
    const o = offset.get();
    const k = slot();
    let clip = "none";
    const { w, h } = box.current;
    const a = Math.abs(o);
    if (k !== null) {
      const d = k - v;
      // A slide within a whisker of its place counts as there: no squares.
      const role = d < -0.004 && d > -1 ? "out" : d > 0.004 && d < 1 && k !== FIRST_ROOM ? "in" : null;
      if (role && !reduceMotion && a < 0.999 && w && h) {
        clip = clipFor(gridFor(w, h), easeTime(role === "out" ? -d : 1 - d), role) || "inset(50%)";
      } else if (!role && !reduceMotion && Math.abs(d) < 0.5 && a > 0.001 && a < 0.999 && w && h) {
        // A PAN across between the tracks (owner, 2026-10-14: "the left to
        // right transition in our pixel transition effect, smaller pixels"):
        // the column going dissolves out and the one arriving grows in, in
        // the smaller squares (PAN_CELL = CELL ÷ φ), the wave from the side
        // it arrives on. The squares are held on the SCREEN — under the
        // veil's tiles — while the room slides and the camera lifts beneath
        // them. The slide across itself is untouched.
        const toCreative = headingRef.current === "creative";
        const arriving = (side === 1) === toCreative;
        clip =
          clipFor(
            gridFor(w, h, PAN_CELL),
            easeTime(arriving ? 1 - a : a),
            arriving ? "in" : "out",
            toCreative ? "right" : "left",
            -o * w,
            0,
            cameraLift(v, trackX.get(), reduceMotion),
          ) || "inset(50%)";
      }
    }
    if (clip === lastClip.current) return;
    lastClip.current = clip;
    el.style.clipPath = clip;
  };
  useMotionValueEvent(cam, "change", applyClip);
  useMotionValueEvent(offset, "change", applyClip);
  useMotionValueEvent(warpTick, "change", applyClip);

  return (
    <motion.div
      ref={outerRef}
      aria-hidden={!current}
      inert={!current}
      className="absolute inset-0"
      style={{
        x,
        y,
        zIndex,
        visibility,
        opacity: shown,
        // ⚠ Here, not on the stage: a perspective only reaches an element's
        // direct children, and the inner layer is the one that flies.
        perspective: PERSPECTIVE,
        pointerEvents: current ? "auto" : "none",
      }}
    >
      <motion.div className={`absolute inset-0 ${className}`} style={{ z, opacity }}>
        {children}
      </motion.div>
    </motion.div>
  );
}


export function Flythrough({
  children,
  artThumbs,
  covers,
}: {
  /** The landing — slides 0 and 1. */
  children: React.ReactNode;
  /** Arts & Crafts' pieces, small (scripts/make-art-thumbs.mjs). */
  artThumbs: ArtThumb[];
  /** Each writing's first page, by slug — read at build time (app/page.tsx). */
  covers: Record<string, string | undefined>;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const runRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // ── The track: which line of rooms the camera is on, and the pan between
  //    them (0 = logic, 1 = creative), which the slides, the grounds and the
  //    corner buttons all read.
  const [track, setTrack] = useState<Track>("logic");
  const trackRef = useRef<Track>("logic");
  const trackX = useMotionValue(0);
  const panAnim = useRef<{ stop: () => void } | null>(null);
  const [panning, setPanning] = useState(false);
  useMotionValueEvent(trackX, "change", (v) => setPanning(v > 0.001 && v < 0.999));
  const switchTrack = useCallback(
    (t: Track, instant = false, onDone?: () => void) => {
      if (trackRef.current === t) {
        onDone?.();
        return;
      }
      trackRef.current = t;
      setTrack(t);
      panAnim.current?.stop();
      const to = t === "creative" ? 1 : 0;
      if (instant || reduceMotion) {
        trackX.set(to);
        onDone?.();
      } else panAnim.current = animate(trackX, to, { duration: PAN, ease: FLY_EASE, onComplete: onDone });
    },
    [reduceMotion, trackX],
  );
  const logicPan = useTransform(trackX, (v) => -v);
  const creativePan = useTransform(trackX, (v) => 1 - v);
  const logicGroundX = useTransform(trackX, (v) => `${-v * 100}%`);
  const creativeGroundX = useTransform(trackX, (v) => `${(1 - v) * 100}%`);

  // ── The run's length: the side the camera is on, or — while a jump
  //    crosses between sides — long enough for both ends (`hold`).
  const [hold, setHold] = useState<number | null>(null);
  // The room a jump across sides is panning in — the band names it already.
  const [arriving, setArriving] = useState<Room | null>(null);
  const runLast = Math.max(lastFor(track), hold ?? 0);
  const runLastRef = useRef(runLast);
  /** Where the run starts on the page, and one slide's scroll (100svh). */
  const geomRef = useRef({ top: 0, step: 1 });
  const measure = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    geomRef.current = {
      top: run.getBoundingClientRect().top + window.scrollY,
      step: run.offsetHeight / (runLastRef.current + 1) || 1,
    };
  }, []);
  /** The camera's place on the page, in slides — unclamped. */
  const position = useCallback(() => (window.scrollY - geomRef.current.top) / geomRef.current.step, []);

  // ── The camera. `p` is the page's own place in the run, which the landing
  //    reads (FlightContext); `cam` is what the slides and the veil read — the
  //    same, except through a warp (see THE WARP).
  const p = useMotionValue(0);
  const cam = useMotionValue(0);
  const warpRef = useRef<Warp | null>(null);
  const warpTick = useMotionValue(0);

  // Set while a flight is under way, so the landing's track reset below
  // never undoes a pin's or the menu's own choice of track mid-flight.
  const flyingRef = useRef(false);
  // …and the same as state, for the slides that start something heavy (the
  // robot, the globe) only once the camera has LANDED on them — never
  // mid-flight, where its setting-up would stall the move.
  const [moving, setMoving] = useState(false);
  const setFlying = useCallback((v: boolean) => {
    flyingRef.current = v;
    setMoving(v);
  }, []);

  // The slide the camera is nearest — only changes on a crossing.
  const [current, setCurrent] = useState(0);
  // Whether the camera has left the landing — the grounds are only worth
  // running from then on.
  const [roomsLive, setRoomsLive] = useState(false);
  // Whether the page has scrolled on past the rooms, into the footer — the
  // fixed band goes back to the name there.
  const [pastRun, setPastRun] = useState(false);

  // ── When each slide's pictures may download (speed fix 4, nearness): the
  //    brain slide's once the first screen is up or the camera leaves the orb;
  //    a room's once the camera is a step from it or flying to it — `reach`,
  //    the furthest slide that has been in reach — and every room's once the
  //    page has settled.
  const [leftOrb, setLeftOrb] = useState(false);
  const [reach, setReach] = useState(0);
  const extendReach = useCallback((k: number) => setReach((r) => Math.max(r, k + 1)), []);
  const firstScreenUp = useFirstScreenUp();
  const pageSettled = usePageSettled();

  /** Read the page's place into the camera, and everything that follows it. */
  const sync = useCallback(() => {
    const raw = position();
    const last = runLastRef.current;
    const v = Math.max(0, Math.min(last, raw));
    p.set(v);
    const w = warpRef.current;
    let c: number;
    if (!w) {
      cam.set(v);
      c = Math.round(v);
    } else if (w.pan) {
      cam.set(w.A);
      c = w.a;
    } else {
      const f = clamp01((v - w.a) / (w.b - w.a));
      cam.set(w.A + (w.B - w.A) * f);
      c = f < 0.5 ? w.a : w.b;
    }
    if (v > 0) setLeftOrb(true);
    c = Math.min(last, Math.max(0, c));
    setCurrent(c);
    if (c >= BRAIN) extendReach(c);
    const camNow = cam.get();
    setRoomsLive(camNow > BRAIN + EPS);
    if (!w) setPastRun(raw > last + 0.35);
    // Back up on the orb, the track rests on logic again. (Not on the brain
    // slide: there the side the pointer is on has just chosen it.)
    if (v < BRAIN - EPS && trackRef.current !== "logic" && !flyingRef.current) switchTrack("logic", true);
  }, [cam, extendReach, p, position, switchTrack]);
  useMotionValueEvent(scrollY, "change", sync);

  // The run's geometry: on mount, as anything resizes, and whenever its
  // length changes — then whatever was waiting for the length runs.
  const afterLength = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    runLastRef.current = runLast;
    measure();
    const fn = afterLength.current;
    afterLength.current = null;
    fn?.();
    sync();
  }, [runLast, measure, sync]);
  useEffect(() => {
    const run = runRef.current;
    if (!run) return;
    // ⚠ A resize changes one slide's scroll (100svh), so the same scroll
    // position lands between two slides — and a slide half-way through its
    // squares has holes in it (on Azoth's dark artwork they read as
    // see-through patches, owner 2026-10-15). At rest, the page is put back
    // on the slide it was on.
    const re = () => {
      const before = position();
      measure();
      const k = Math.round(before);
      if (!flyingRef.current && !warpRef.current && before > -EPS && before < runLastRef.current + 0.5) {
        const top = geomRef.current.top + Math.min(k, runLastRef.current) * geomRef.current.step;
        if (Math.abs(window.scrollY - top) > 0.5) window.scrollTo({ top, behavior: "instant" });
      }
      sync();
    };
    const ro = new ResizeObserver(re);
    ro.observe(run);
    window.addEventListener("resize", re);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", re);
    };
  }, [measure, sync, position]);

  // Each ground only runs while its track can be seen — a film decoding off
  // screen is a waste.
  const circuitLive = roomsLive && (track === "logic" || panning);
  const creativeLive = roomsLive && (track === "creative" || panning);
  const zone = current < FIRST_ROOM ? "landing" : track;
  const here = arriving ?? (current >= FIRST_ROOM ? roomAt(current, track) : undefined);

  // The camera lifts through a move across the plane — from the brain into a
  // column, and the pan — and settles as it lands.
  const cameraScale = useTransform([cam, trackX], ([v, tx]: number[]) => cameraLift(v, tx, reduceMotion));

  // The strips ride in with their side's first room — up from the foot of
  // the brain slide — then hold still over the rooms, and pan with the side.
  const stripY = useTransform(cam, (v) => (reduceMotion ? "0%" : `${clamp01(FIRST_ROOM - v) * 100}%`));
  const logicStripX = useTransform([cam, trackX], ([v, tx]: number[]) =>
    `${((reduceMotion ? 0 : -clamp01(FIRST_ROOM - v)) - tx) * 100}%`,
  );
  const creativeStripX = useTransform([cam, trackX], ([v, tx]: number[]) =>
    `${((reduceMotion ? 0 : clamp01(FIRST_ROOM - v)) + 1 - tx) * 100}%`,
  );
  const stripOpacity = useTransform(cam, (v) => (reduceMotion ? clamp01(v - BRAIN) : 1));
  const stripVisibility = useTransform(cam, (v) => (v <= BRAIN + 0.002 ? "hidden" : "visible"));

  useEffect(() => {
    const run = runRef.current;
    if (!run) return;

    let anim: { stop: () => void } | null = null;
    let lastWheel = 0;
    let gestureSpent = false;
    // The cap (LOCK_CAP_MS): when the last flight landed, and the recent
    // deltas, [time, |deltaY|], over the last PUSH_WINDOW_MS.
    let landedAt = 0;
    let recent: [number, number][] = [];
    let touching = false;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const onLanding = () => position() < FIRST_ROOM - 0.5;

    // On the brain slide the way down is the visitor's: the half the pointer
    // is over (the Left brain or the Right) picks the column. Nothing of
    // either column is on screen yet, so the track is simply set.
    let pointerX = -1;
    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX;
    };
    const pickSide = (x: number) => {
      if (Math.abs(position() - BRAIN) > EPS) return;
      switchTrack(x > window.innerWidth / 2 ? "creative" : "logic", true);
    };

    const scrollTop = (k: number) => geomRef.current.top + k * geomRef.current.step;

    /** Fly the page to slide `k`. `single` times it as one slide's step
     *  however far it goes (a warp); `onLanded` runs as it lands. */
    const flyTo = (k: number, opts: { single?: boolean; onLanded?: () => void } = {}) => {
      measure();
      const to = Math.max(0, Math.min(runLastRef.current, k));
      const target = scrollTop(to);
      const from = window.scrollY;
      anim?.stop();
      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: "instant" });
        opts.onLanded?.();
        return;
      }
      setFlying(true);
      // The rooms on the way, and the one it lands in, start their pictures now.
      if (to >= BRAIN) extendReach(to);
      const slides = opts.single ? 1 : Math.abs(target - from) / (geomRef.current.step || 1);
      // Into or between the rooms the squares need the longer flight.
      const base = Math.max(to, position()) > BRAIN + EPS ? FLY_ROOMS : FLY_BASE;
      anim = animate(from, target, {
        duration: base + FLY_EXTRA * Math.max(0, Math.min(FLY_MAX_SLIDES, slides) - 1),
        ease: FLY_EASE,
        onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }),
        onComplete: () => {
          setFlying(false);
          landedAt = performance.now();
          opts.onLanded?.();
        },
      });
    };

    const setWarp = (w: Warp | null) => {
      warpRef.current = w;
      warpTick.set(warpTick.get() + 1);
      sync();
    };

    /** Go to slide `b` on track `tb` in one move — see THE WARP. */
    const goTo = (b: number, tb: Track) => {
      if (flyingRef.current || (trackX.get() > 0.001 && trackX.get() < 0.999)) return;
      const pos = position();
      const here = Math.round(pos);
      const ta = trackRef.current;
      // Within the landing, or down to the orb: the ordinary flight.
      if ((b < FIRST_ROOM && here < FIRST_ROOM) || b < BRAIN) {
        flyTo(b);
        return;
      }
      // From the orb, the landing stands in as the brain: the page runs the
      // orb up into the brain on its way (its own move), then the warp.
      const a = Math.max(here, BRAIN);
      extendReach(b);
      // Across sides from the landing: nothing of either column is on screen,
      // so the track is simply set.
      const crossing = tb !== ta && b >= FIRST_ROOM;
      if (crossing && a < FIRST_ROOM) switchTrack(tb, true);
      const sameTrack = !crossing || a < FIRST_ROOM;
      // The run long enough for both ends until it lands.
      const need = Math.max(lastFor(ta), lastFor(tb));
      const land = () => {
        setHold(null);
        setArriving(null);
      };
      const start = (fn: () => void) => {
        if (need > runLastRef.current) {
          afterLength.current = fn;
          setHold(need);
        } else {
          setHold(need);
          fn();
        }
      };

      if (reduceMotion) {
        start(() => {
          switchTrack(tb, true);
          flyTo(b, { onLanded: land });
        });
        return;
      }

      if (sameTrack) {
        // A neighbour, or the step between the brain and a first room: the
        // ordinary flight.
        if (Math.abs(b - a) <= 1 && Math.abs(pos - a) <= EPS) {
          start(() => flyTo(b, { onLanded: land }));
          return;
        }
        const s = Math.sign(b - a) || 1;
        const A = b < FIRST_ROOM ? FIRST_ROOM : a;
        const B = b < FIRST_ROOM ? b : a < FIRST_ROOM ? FIRST_ROOM : a + s;
        start(() => {
          // In flight BEFORE the warp is read in — or, from the orb, the
          // landing's track reset (sync) would undo the side just chosen.
          setFlying(true);
          setWarp({ a, b, ta: tb, tb, pan: false, A, B });
          flyTo(b, {
            single: true,
            onLanded: () => {
              setWarp(null);
              land();
            },
          });
        });
        return;
      }

      // Across: pan, the arriving side showing the room chosen, then land
      // the page on it.
      start(() => {
        setFlying(true);
        if (b !== a) setWarp({ a, b, ta, tb, pan: true, A: a, B: a });
        setArriving(roomAt(b, tb) ?? null);
        switchTrack(tb, false, () => {
          measure();
          window.scrollTo({ top: scrollTop(b), behavior: "instant" });
          setWarp(null);
          setFlying(false);
          landedAt = performance.now();
          land();
        });
      });
    };

    const goToId = (id: string) => {
      const r = ROOMS.find((x) => x.item.id === id);
      if (r) goTo(r.index, r.track);
    };

    /** The slide one step from `pos` in `dir`, or null to let the page scroll
     *  natively (leaving the run at either end, or nowhere near it). */
    const stepFrom = (pos: number, dir: number): number | null => {
      const last = runLastRef.current;
      if (pos < -EPS || pos > last + 0.6) return null;
      if (dir > 0 && pos >= last - EPS) return null;
      if (dir < 0 && pos <= EPS) return null;
      const n = Math.round(pos);
      if (Math.abs(pos - n) <= EPS) return n + dir;
      // Between slides: settle onto the next one in the direction of travel.
      return dir > 0 ? Math.ceil(pos) : Math.floor(pos);
    };

    // A dialog (the sections list, the Stack and Tools pop-ups, the Extincts
    // reader) marks the root `data-modal` while open; the wheel and the keys
    // are its then.
    const modal = () => !!document.documentElement.dataset.modal;

    const onWheel = (e: WheelEvent) => {
      if (reduceMotion || e.ctrlKey || modal()) return;
      const now = performance.now();
      const delta = Math.abs(e.deltaY);
      recent = recent.filter(([t]) => now - t <= PUSH_WINDOW_MS);
      const peak = recent.reduce((m, [, d]) => Math.max(m, d), 0);
      recent.push([now, delta]);
      if (now - lastWheel > GESTURE_GAP_MS && !flyingRef.current) gestureSpent = false;
      else if (
        gestureSpent &&
        !flyingRef.current &&
        now - landedAt > LOCK_CAP_MS &&
        ((delta >= PUSH_STEADY_PX && delta >= peak * PUSH_HOLD) || (delta >= 4 && delta > peak * PUSH_RISE))
      )
        gestureSpent = false;
      lastWheel = now;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const target = stepFrom(position(), dir);
      if (target === null) return;
      if (canScrollInside(e.target, run, dir)) return;
      e.preventDefault();
      if (flyingRef.current || gestureSpent) return;
      gestureSpent = true;
      if (dir > 0) pickSide(e.clientX);
      flyTo(target);
    };

    const onKey = (e: KeyboardEvent) => {
      if (modal() || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // ← → switch track, in the rooms only: to the room level with this
      // one, or the other side's last where it is shorter.
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !onLanding()) {
        const pos = position();
        if (pos > runLastRef.current + 0.6) return;
        e.preventDefault();
        const other: Track = e.key === "ArrowRight" ? "creative" : "logic";
        if (other === trackRef.current) return;
        goTo(Math.min(Math.round(pos), lastFor(other)), other);
        return;
      }
      if (reduceMotion) return;
      const dir =
        e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)
          ? 1
          : e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)
            ? -1
            : 0;
      if (!dir) return;
      const target = stepFrom(position(), dir);
      if (target === null) return;
      e.preventDefault();
      if (flyingRef.current) return;
      if (dir > 0 && pointerX >= 0) pickSide(pointerX);
      flyTo(target);
    };

    // Native scrolling that comes to rest between two slides is eased onto the
    // nearer one. Never mid-touch: a finger held still is not "at rest".
    const onScroll = () => {
      clearTimeout(settle);
      if (reduceMotion || flyingRef.current || warpRef.current) return;
      settle = setTimeout(() => {
        if (flyingRef.current || touching || warpRef.current) return;
        const pos = position();
        if (pos <= EPS || pos >= runLastRef.current - EPS) return;
        if (Math.abs(pos - Math.round(pos)) > EPS) flyTo(Math.round(pos));
        // A hair off (rounding, a zoom): set it exactly on the slide, or its
        // squares stay a hair from whole.
        else if (Math.abs(pos - Math.round(pos)) > 0.0005) window.scrollTo({ top: scrollTop(Math.round(pos)), behavior: "instant" });
      }, SETTLE_MS);
    };
    // ONE SWIPE, ONE SLIDE (owner, 2026-10-15: "one scroll moves you exactly
    // to the next slide, or back, no stoppage in between"). Inside the run a
    // swipe no longer scrolls the page natively — it used to, coming to rest
    // wherever the finger let go and easing on from there. Once a finger has
    // gone SWIPE_PX up or down, the camera flies exactly one slide, and the
    // rest of that swipe is spent. A swipe that is mostly sideways is left
    // alone, as is everything past either end of the run (the footer) and
    // anything a dialog has (data-modal). A flight under way is never
    // stopped by a finger now: it lands.
    let swipe: { x: number; y: number; spent: boolean } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touching = true;
      const t = e.touches[0];
      swipe = t && e.touches.length === 1 ? { x: t.clientX, y: t.clientY, spent: false } : null;
      // On the brain slide, the half the finger lands on picks the column.
      if (t) pickSide(t.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!swipe || reduceMotion || modal() || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dy = swipe.y - t.clientY;
      const dx = swipe.x - t.clientX;
      const dir = Math.sign(dy);
      if (!dir || (!swipe.spent && Math.abs(dx) > Math.abs(dy))) return;
      const target = stepFrom(position(), dir);
      if (target === null) return;
      if (e.cancelable) e.preventDefault();
      if (swipe.spent || flyingRef.current || Math.abs(dy) < SWIPE_PX) return;
      swipe.spent = true;
      flyTo(target);
    };
    const onTouchEnd = () => {
      touching = false;
      swipe = null;
      onScroll();
    };

    // Every pin flies to its room: Projects to the first project, each
    // creative pin to its own. Null (a pin closing) needs nothing.
    const onPin = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      if (!id) return;
      const r =
        id === "projects"
          ? ROOMS.find((x) => x.track === "logic" && x.level === 0)
          : ROOMS.find((x) => x.item.sectionId === id);
      if (r) goTo(r.index, r.track);
    };
    const onGo = (e: Event) => {
      const d = (e as CustomEvent<GoDetail>).detail;
      if (typeof d === "number") goTo(d, trackRef.current);
      else if ("id" in d) goToId(d.id);
      else goTo(d.k, d.track ?? trackRef.current);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    window.addEventListener(GO_EVENT, onGo);
    return () => {
      anim?.stop();
      clearTimeout(settle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(PIN_OPEN_EVENT, onPin);
      window.removeEventListener(GO_EVENT, onGo);
    };
  }, [reduceMotion, switchTrack, extendReach, measure, position, sync, trackX, warpTick, setFlying]);

  const goId = (id: string) => window.dispatchEvent(new CustomEvent<GoDetail>(GO_EVENT, { detail: { id } }));
  const goHome = () => window.dispatchEvent(new CustomEvent<GoDetail>(GO_EVENT, { detail: { k: BRAIN } }));

  // What the fixed band along the foot carries: the room the camera is in,
  // or — on the landing and past the rooms — the name.
  const bandRoom = here && !pastRun ? { label: here.item.short, side: track } : null;
  const inRooms = current >= FIRST_ROOM && !pastRun;

  // The way across from here (EdgeJump): the room level with this one on
  // the other side — the right side's last, where it is shorter.
  const level = here?.level ?? 0;
  const acrossFromLogic = CREATIVE[Math.min(level, CREATIVE.length - 1)];
  const acrossFromCreative = LOGIC[Math.min(level, LOGIC.length - 1)];
  return (
    <FlightContext.Provider value={{ p, current, zone, reduceMotion }}>
    <div ref={runRef} className="relative w-full" style={{ height: `${(runLast + 1) * 100}svh` }}>
      <div
        // --strip-h: the strip's height, which every slide keeps clear of
        // (.slide-frame) — two rows of marks on a phone, one above.
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-white [--strip-h:5.4rem] sm:[--strip-h:3.75rem]"
      >
        {/* The two grounds, one per track, side by side, each panning with
            its track; behind the landing both are covered entirely.
            · LOGIC: the landing's own — white, the faint circuit film, a
              lattice in each corner, with its drifting field of falling
              nodes in dark grey (SectionParticles; half as many since
              2026-10-15).
            · CREATIVE: the Mood Field — rainbow veins drifting over white,
              stirred by the pointer (MoodField). */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-white" style={{ x: logicGroundX }}>
          {circuitLive && <CircuitBackdrop />}
          <div className="absolute inset-0 hidden lg:block">
            <Corner3DGrid corner="tl" />
            <Corner3DGrid corner="bl" />
            <Corner3DGrid corner="tr" />
            <Corner3DGrid corner="br" />
          </div>
          {circuitLive && <SectionParticles />}
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ x: creativeGroundX, backgroundColor: MOOD_BG }}
        >
          {creativeLive && <MoodField />}
        </motion.div>

        {/* (The blinking direction squares stood here, 2026-10-14 → 15 —
            CornerPixels, unlinked: "a bit too much".) */}

        {/* Everything that travels, under one camera — its lift (cameraScale)
            applies to all of it at once. */}
        <motion.div className="absolute inset-0" style={{ scale: cameraScale }}>
        {/* The landing — slides 0 and 1 in one: it stands still while its
            own two layers (the orb, then the brain) trade places inside it,
            and leaves across the plane on the step after. See HeroStage. */}
        <Slide
          kind="landing"
          index={BRAIN}
          warpRef={warpRef}
          warpTick={warpTick}
          cam={cam}
          trackX={trackX}
          reduceMotion={reduceMotion}
          current={current < FIRST_ROOM}
          className="bg-gallery"
        >
          <NearContext.Provider value={firstScreenUp || leftOrb}>{children}</NearContext.Provider>
        </Slide>

        {ROOMS.map(({ item, track: t, index }) => {
          const logic = t === "logic";
          const live = current === index && track === t;
          // Whether this slide is the camera's, and has been landed on.
          const arrived = live && !moving;
          return (
            <Slide
              key={item.id}
              kind="room"
              index={index}
              track={t}
              warpRef={warpRef}
              warpTick={warpTick}
              cam={cam}
              trackX={trackX}
              side={logic ? -1 : 1}
              pan={logic ? logicPan : creativePan}
              heading={track}
              reduceMotion={reduceMotion}
              current={live}
            >
              <NearContext.Provider value={pageSettled || index <= reach}>
                {/* Left: the project's page, on the whole slide. Right: each
                    room its own (owner, 2026-10-15). The four quadrants
                    (ShowcaseRoom) are unlinked. */}
                {logic ? (
                  item.id === "azoth-biotech" ? (
                    <AzothSlide item={item} />
                  ) : item.id === "abs" ? (
                    <AbsSlide item={item} />
                  ) : item.id === "zabraku" ? (
                    <ZabrakuSlide item={item} live={live} arrived={arrived} />
                  ) : item.id === "newsmobile" ? (
                    <NewsMobileSlide item={item} live={live} arrived={arrived} reduceMotion={reduceMotion} />
                  ) : item.id === "vivid" ? (
                    <ProjectSlide item={item} extra={{ label: "Visit vividprotech.com", href: "https://vividprotech.com" }} />
                  ) : (
                    <ProjectSlide item={item} />
                  )
                ) : item.id === "the-extincts-project" ? (
                  <ExtinctsSlide reduceMotion={reduceMotion} />
                ) : item.id === "arts-and-crafts" ? (
                  <ArtSlide thumbs={artThumbs} active={live && !reduceMotion} />
                ) : item.id === "ai-projects" ? (
                  <AiSlide reduceMotion={reduceMotion} />
                ) : (
                  <WritingsSlide covers={covers} />
                )}
              </NearContext.Provider>
            </Slide>
          );
        })}

        {/* The strips along the top — "Projects" and its marks on the left,
            the creative rooms on the right — over the rooms, in from the
            foot of the brain slide with the first room. */}
        <NearContext.Provider value={pageSettled || reach >= FIRST_ROOM}>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[120]"
            style={{ x: logicStripX, y: stripY, opacity: stripOpacity, visibility: stripVisibility }}
            aria-hidden={!(inRooms && track === "logic")}
            inert={!(inRooms && track === "logic")}
          >
            <ShowcaseStrip side="logic" items={LOGIC} activeId={track === "logic" ? (here?.item.id ?? null) : null} onGo={goId} />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute inset-0 z-[120]"
            style={{ x: creativeStripX, y: stripY, opacity: stripOpacity, visibility: stripVisibility }}
            aria-hidden={!(inRooms && track === "creative")}
            inert={!(inRooms && track === "creative")}
          >
            <ShowcaseStrip
              side="creative"
              items={CREATIVE}
              activeId={track === "creative" ? (here?.item.id ?? null) : null}
              onGo={goId}
            />
          </motion.div>
        </NearContext.Provider>
        </motion.div>

        {/* The glass tiles that light over the squares as every move turns
            them, across the whole screen. */}
        <PixelVeil p={cam} trackX={trackX} track={track} firstRoom={FIRST_ROOM} reduceMotion={reduceMotion} />

        {/* My Stack in the bottom-left corner of the left side, My Tools in
            the bottom-right of the right — each a pop-up over the top. */}
        <KitButton side="logic" show={inRooms} away={track !== "logic" && !panning} x={logicGroundX} reduceMotion={reduceMotion} />
        <KitButton side="creative" show={inRooms} away={track !== "creative" && !panning} x={creativeGroundX} reduceMotion={reduceMotion} />

        {/* The way across to the room level with this one, at the middle of
            the edge facing the other side (EdgeJump). */}
        <EdgeJump
          side="logic"
          label={acrossFromLogic.short}
          show={inRooms}
          away={track !== "logic" && !panning}
          x={logicGroundX}
          onGo={() => goId(acrossFromLogic.id)}
          reduceMotion={reduceMotion}
        />
        <EdgeJump
          side="creative"
          label={acrossFromCreative.short}
          show={inRooms}
          away={track !== "creative" && !panning}
          x={creativeGroundX}
          onGo={() => goId(acrossFromCreative.id)}
          reduceMotion={reduceMotion}
        />

        {/* The sections button, top right, from the first room on — any room
            from any room, in one step. (The three circles at the top centre,
            BrainNav, did this until 2026-10-15.) */}
        <SectionMenu
          show={inRooms}
          side={track}
          activeId={here?.item.id ?? null}
          onGo={goId}
          onHome={goHome}
          reduceMotion={reduceMotion}
        />

        {/* Say the way on is down: over the orb at every size, and over the
            brain too below `lg`, where it has no pins (on a desktop the facts
            sit there). Gone the moment the camera reaches the rooms.
            ⚠ Over the orb it stands in the RIGHT corner, on the same foot as
            the PORTFOLIO mark that takes the middle there (HeroStage: band 7%
            + 14px) — and says only "Scroll" on a phone, where the full label
            would run into the mark. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 z-[150] flex transition-opacity duration-500 ${
            current === 0 ? "bottom-[calc(7%+14px)] justify-end pr-[5vw]" : "bottom-[8.5%] justify-center"
          } ${current === 0 ? "opacity-100" : current < FIRST_ROOM ? "opacity-100 lg:opacity-0" : "opacity-0"}`}
        >
          <div className="flex flex-col items-center gap-1">
            <span className={`${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.3em] text-neutral-500`}>
              Scroll<span className={current === 0 ? "max-sm:hidden" : undefined}> to explore</span>
            </span>
            <motion.span
              className="block text-neutral-500"
              animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </div>
        </div>
      </div>

      {/* The black band along the foot — fixed to the screen for the whole
          page, over the stage and under the dialogs (FootBand). */}
      <FootBand room={bandRoom} />
    </div>
    </FlightContext.Provider>
  );
}
