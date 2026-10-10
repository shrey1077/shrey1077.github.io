"use client";

/**
 * Flythrough — the landing and every section as one flight (2026-10-02, owner:
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
 *       [ Clients ]     [ AI Videos ]   the pointer is on picks the column
 *            ⊙               ⊙
 *       [ Projects ]    [ Arts & Crafts ]       ⊙ = a fly-through, in depth,
 *            ⊙               ⊙                      dissolving in squares
 *       [ My Stack ]    [ The Extincts Project ]
 *
 *   · from the brain into a column the camera moves DOWN AND TO THE SIDE on
 *     the brain slide's own plane: the landing slides off up and away while
 *     the first room comes in from the lower corner, the view lifting a
 *     little through the move (CAMERA_DIP). Which side is the visitor's: a
 *     scroll with the pointer over the Left brain goes to Clients, over the
 *     Right brain to AI Videos (a touch: where the finger lands);
 *   · every step down a column is the FLY-THROUGH: the next room waits back
 *     in the depth (AHEAD_Z) and flies forward to fill the screen while the
 *     current one rushes past the camera (PASS_Z). Their hand-over — a fade
 *     until 2026-10-10 — is a DISSOLVE IN HALF-INCH SQUARES: the room flying
 *     past shrinks away square by square, from the middle outward, as the
 *     next one grows in behind it (pixelDissolve, clipping each room);
 *   · every move, the pan across between the columns included, lights a wave
 *     of glass tiles over the squares as they turn, across the whole screen
 *     (PixelVeil). The flights into and down the columns take FLY_ROOMS, long
 *     enough to watch the squares go.
 * (For part of 2026-10-10 the columns were wholly planar, every step a slide
 * down the plane — the owner wanted the fly-through back.)
 *
 * THE RUN. A tall block, one screen of scroll per slide, holding a sticky
 * full-screen stage. Scroll progress through the block is the camera:
 *   · the landing is slides 0 and 1 (2026-10-03): the portrait orb, then the
 *     brain with its pins and the facts, which rises as the orb scrolls away
 *     — the wordmark and the band standing still across both (HeroStage); the
 *     next scroll takes the whole landing off across the plane;
 *   · then the rooms — see above;
 *   · past the last slide the block simply scrolls away into the footer.
 * The camera is a real translateZ under perspective, and every position and
 * clip is written through motion values — no React work per frame.
 *
 * TWO PARALLEL TRACKS (owner, 2026-10-03). The rooms are two columns, LEVEL
 * with each other — three a side since 2026-10-10:
 *
 *        logic (left)        creative (right)
 *        Clients        ↔    AI Videos
 *        Projects       ↔    Arts & Crafts
 *        My Stack       ↔    The Extincts Project
 *
 * Scrolling flies down whichever track you are on. Switching is SIDEWAYS: the
 * brain's circle in each column's outer foot carries "Click to <the room
 * level with this one>" and a blinking arrow, and a click pans the stage —
 * this room slides off one way, its partner slides in from the other, each
 * with its circle (BrainDock). The arrow keys ← → switch too. Each column's
 * ground travels with it. The run is therefore the landing plus THREE
 * levels, not six rooms. Back up on the orb the track resets to logic.
 *
 * ONE SCROLL, ONE SLIDE. Inside the run a wheel gesture is taken over and flies
 * exactly one slide, with a lock that outlasts a trackpad's inertia tail so one
 * swipe can't skip three slides. Rooms that scroll on their own (Career's rail,
 * the Logofolio wall, the Publications shelf, Art's collections) get the wheel
 * first until they hit their end. Keys step the same way. Touch, the scrollbar
 * and anything else scroll natively and are eased onto the nearest slide when
 * they come to rest.
 *
 * PINS. Every pin flies to its room — switching track first if it has to — and
 * so does every circle of BrainNav, the three at the top of the stage. This
 * replaced SectionPanel, the band that used to open under the hero; it was
 * deleted on 2026-10-02 once both sides lived here — git has it.
 *
 * Reduced motion: no take-over, no movement, no depth, no squares — slides
 * crossfade with the scroll, and a track switch cuts rather than pans.
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
import { FLY_EASE, clipFor, easeTime, gridFor } from "@/components/home/pixelDissolve";
import { BrainDock } from "@/components/home/BrainDock";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { SectionParticles } from "@/components/home/SectionParticles";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { MOOD_BG, MoodField } from "@/components/home/MoodField";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { ProjectPreview } from "@/components/home/ProjectPreview";
import { BrainNav } from "@/components/home/BrainNav";
import { SectionBody, sectionEntryCount, type SectionData } from "@/components/home/SectionBody";
import { navSectionsFor } from "@/constants/navigation";
import { projectStudyById } from "@/constants/projectStudies";
import { PAPER_PLATE } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";
import type { NavSection } from "@/types/navigation";

/** The two tracks, each top pin first. Level i is LOGIC[i] beside CREATIVE[i]. */
const LOGIC = navSectionsFor("left");
const CREATIVE = navSectionsFor("right");
const LEVELS = Math.max(LOGIC.length, CREATIVE.length);
/** The landing takes the first HERO_SLIDES (the orb, then the brain); the
 *  rooms' levels start after it. */
const FIRST_ROOM = HERO_SLIDES;
const LAST = FIRST_ROOM + LEVELS - 1;

export type Track = "logic" | "creative";
const ROOMS: { section: NavSection; level: number; track: Track }[] = [
  ...LOGIC.map((section, level) => ({ section, level, track: "logic" as const })),
  ...CREATIVE.map((section, level) => ({ section, level, track: "creative" as const })),
];

/** Seconds for one slide's flight on the landing (the orb to the brain); each
 *  further slide adds FLY_EXTRA, up to FLY_MAX_SLIDES' worth. */
const FLY_BASE = 0.95;
/** …and for one into or between the rooms, which turn over in squares —
 *  long enough to watch them go (owner, 2026-10-10: "very quick"). */
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
/** Native scrolling that stops this long counts as at rest. */
const SETTLE_MS = 140;
/** Slide positions this close to a whole number count as on that slide. */
const EPS = 0.02;

/** Fired to fly to a slide by index (0 = the orb), optionally switching
 *  track — BrainNav's circles. */
const GO_EVENT = "flythrough:go";
type GoDetail = number | { k: number; track?: Track };

/** Rooms that size and scroll themselves (SectionBody's own renderers). */
const FILLS: ReadonlySet<string> = new Set(["art", "the-extincts-project"]);

const pad = (n: number) => String(n).padStart(2, "0");

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
 * One slide, posed by the camera (p, in slides) and the pan between the
 * columns (trackX, 0 logic … 1 creative):
 *   · the LANDING stands still to the brain slide, then rides up and away
 *     across the plane — right when the camera heads for the logic column,
 *     left for the creative;
 *   · a ROOM: the first of each column comes in across the plane from its
 *     lower corner (the step from the brain); every room after it waits back
 *     in the depth and flies forward; and every room, once the camera passes
 *     it, rushes past. On those fly-through steps both rooms are CLIPPED to
 *     the squares (pixelDissolve) — the one passing shrinks away square by
 *     square, the one arriving grows in. The pan between columns rides on
 *     top.
 * Two layers: the outer one moves across the plane and carries the clip — so
 * the squares stay half an inch on screen however near the room is — and the
 * perspective; the inner one flies in depth. A slide wholly gone is hidden.
 * Reduced motion: no movement, no squares — a crossfade, and the pan cuts.
 */
function Slide({
  kind,
  index,
  p,
  trackX,
  side = 0,
  pan,
  reduceMotion,
  current,
  className = "",
  children,
}: {
  kind: "landing" | "room";
  index: number;
  p: MotionValue<number>;
  trackX: MotionValue<number>;
  /** A room's column: −1 the logic one (left), 1 the creative one (right). */
  side?: -1 | 0 | 1;
  /** Sideways offset in screen widths (−1 off left … 1 off right) — the
   *  track pan. The landing has none. */
  pan?: MotionValue<number>;
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
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const room = kind === "room";
  // The first room of a column comes in across the plane, not out of the depth.
  const first = room && index === FIRST_ROOM;

  // Across the plane, in screen sizes.
  const posX = useTransform([p, trackX, offset], ([v, tx, o]: number[]) => {
    if (!room) return reduceMotion ? 0 : (tx > 0.5 ? -1 : 1) * clamp01(v - index);
    return reduceMotion ? o : o + side * clamp01(FIRST_ROOM - v);
  });
  const posY = useTransform(p, (v) => {
    if (reduceMotion) return 0;
    return room ? clamp01(FIRST_ROOM - v) : -clamp01(v - index);
  });
  const x = useTransform(posX, (q) => `${q * 100}%`);
  const y = useTransform(posY, (q) => `${q * 100}%`);
  // In depth: waiting ahead, or rushing past.
  const z = useTransform(p, (v) => {
    if (reduceMotion || !room) return 0;
    const d = index - v;
    if (d >= 0) return first ? 0 : -Math.min(1, d) * AHEAD_Z;
    return -Math.max(-1, d) * PASS_Z;
  });
  // The one passing is stacked over the one arriving behind it.
  const zIndex = useTransform(p, (v) => (room ? 100 - Math.round((index - v) * 10) : 20));
  const opacity = useTransform([p, offset], ([v, o]: number[]) => {
    if (!reduceMotion) return 1;
    if (!room) return clamp01(index + 1 - v);
    return Math.abs(o) > 0.5 ? 0 : clamp01(1 - Math.abs(index - v));
  });
  const visibility = useTransform([p, posX, posY, opacity], ([v, qx, qy, op]: number[]) => {
    if (op < 0.01 || Math.abs(qx) > 0.999 || Math.abs(qy) > 0.999) return "hidden";
    if (room && !reduceMotion) {
      const d = index - v;
      // Flown past, or not yet begun — the next room's turn to come forward.
      if (d <= -1 + 1e-3 || (!first && d >= 1 - 1e-3)) return "hidden";
    }
    return "visible";
  });

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
  const applyClip = (v: number, o: number) => {
    const el = outerRef.current;
    if (!el || !room) return;
    let clip = "none";
    const d = index - v;
    const role = d < 0 && d > -1 ? "out" : d > 0 && d < 1 && !first ? "in" : null;
    const { w, h } = box.current;
    if (role && !reduceMotion && Math.abs(o) < 0.999 && w && h) {
      clip = clipFor(gridFor(w, h), easeTime(role === "out" ? -d : 1 - d), role) || "inset(50%)";
    }
    if (clip === lastClip.current) return;
    lastClip.current = clip;
    el.style.clipPath = clip;
  };
  useMotionValueEvent(p, "change", (v) => applyClip(v, offset.get()));
  useMotionValueEvent(offset, "change", (o) => applyClip(p.get(), o));

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
  data,
}: {
  /** The landing — slides 0 and 1. */
  children: React.ReactNode;
  data: SectionData;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const runRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: runRef, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => v * LAST);

  // ── The track: which line of rooms the camera is on, and the pan between
  //    them (0 = logic, 1 = creative), which the slides, the grounds and the
  //    dock all read.
  const [track, setTrack] = useState<Track>("logic");
  const trackRef = useRef<Track>("logic");
  const trackX = useMotionValue(0);
  const panAnim = useRef<{ stop: () => void } | null>(null);
  const [panning, setPanning] = useState(false);
  useMotionValueEvent(trackX, "change", (v) => setPanning(v > 0.001 && v < 0.999));
  const switchTrack = useCallback(
    (t: Track, instant = false) => {
      if (trackRef.current === t) return;
      trackRef.current = t;
      setTrack(t);
      panAnim.current?.stop();
      const to = t === "creative" ? 1 : 0;
      if (instant || reduceMotion) trackX.set(to);
      else panAnim.current = animate(trackX, to, { duration: PAN, ease: FLY_EASE });
    },
    [reduceMotion, trackX],
  );
  const logicPan = useTransform(trackX, (v) => -v);
  const creativePan = useTransform(trackX, (v) => 1 - v);
  // The camera lifts through a move across the plane — from the brain into a
  // column, and the pan — and settles as it lands.
  const cameraScale = useTransform([p, trackX], ([v, tx]: number[]) => {
    if (reduceMotion) return 1;
    const into = v > FIRST_ROOM - 1 && v < FIRST_ROOM ? Math.sin(Math.PI * (v - (FIRST_ROOM - 1))) : 0;
    const across = Math.sin(Math.PI * Math.max(0, Math.min(1, tx)));
    return 1 - CAMERA_DIP * Math.max(into, across);
  });
  const logicGroundX = useTransform(trackX, (v) => `${-v * 100}%`);
  const creativeGroundX = useTransform(trackX, (v) => `${(1 - v) * 100}%`);

  // Set while a flight is under way, so the landing's track reset below
  // never undoes a pin's or the nav's own choice of track mid-flight.
  const flyingRef = useRef(false);

  // The slide the camera is nearest — only changes on a crossing.
  const [current, setCurrent] = useState(0);
  // Whether the camera has left the landing — the grounds are only worth
  // running from then on.
  const [roomsLive, setRoomsLive] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setCurrent(Math.min(LAST, Math.max(0, Math.round(v))));
    const inRooms = v > FIRST_ROOM - 1 + EPS;
    setRoomsLive(inRooms);
    // Back up on the orb, the track rests on logic again. (Not on the brain
    // slide: there the side the pointer is on has just chosen it.)
    if (v < FIRST_ROOM - 1 - EPS && trackRef.current !== "logic" && !flyingRef.current) switchTrack("logic", true);
  });
  // Each ground only runs while its track can be seen — a film decoding off
  // screen is a waste.
  const circuitLive = roomsLive && (track === "logic" || panning);
  const creativeLive = roomsLive && (track === "creative" || panning);
  const zone = current < FIRST_ROOM ? "landing" : track;
  const level = Math.max(0, Math.min(LEVELS - 1, current - FIRST_ROOM));

  const [studyId, setStudyId] = useState<string | null>(null);
  const dialogOpen = useRef(false);
  useEffect(() => {
    dialogOpen.current = studyId !== null;
  }, [studyId]);

  useEffect(() => {
    const run = runRef.current;
    if (!run) return;

    let anim: { stop: () => void } | null = null;
    let lastWheel = 0;
    let gestureSpent = false;
    let touching = false;
    let settle: ReturnType<typeof setTimeout> | undefined;

    /** Where the run starts on the page, and how far one slide scrolls. */
    const geom = () => {
      const top = run.getBoundingClientRect().top + window.scrollY;
      const step = (run.offsetHeight - window.innerHeight) / LAST;
      return { top, step };
    };
    const position = () => {
      const { top, step } = geom();
      return step > 0 ? (window.scrollY - top) / step : 0;
    };
    const onLanding = () => position() < FIRST_ROOM - 0.5;

    // On the brain slide the way down is the visitor's: the half the pointer
    // is over (the Left brain or the Right) picks the column. Nothing of
    // either column is on screen yet, so the track is simply set.
    let pointerX = -1;
    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX;
    };
    const pickSide = (x: number) => {
      if (Math.abs(position() - (FIRST_ROOM - 1)) > EPS) return;
      switchTrack(x > window.innerWidth / 2 ? "creative" : "logic", true);
    };

    const flyTo = (k: number) => {
      const { top, step } = geom();
      const to = Math.max(0, Math.min(LAST, k));
      const target = top + to * step;
      const from = window.scrollY;
      anim?.stop();
      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      flyingRef.current = true;
      const slides = Math.abs(target - from) / (step || 1);
      // Into or between the rooms the squares need the longer flight.
      const base = Math.max(to, position()) > FIRST_ROOM - 1 + EPS ? FLY_ROOMS : FLY_BASE;
      anim = animate(from, target, {
        duration: base + FLY_EXTRA * Math.max(0, Math.min(FLY_MAX_SLIDES, slides) - 1),
        ease: FLY_EASE,
        onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }),
        onComplete: () => {
          flyingRef.current = false;
        },
      });
    };

    /** The slide one step from `pos` in `dir`, or null to let the page scroll
     *  natively (leaving the run at either end, or nowhere near it). */
    const stepFrom = (pos: number, dir: number): number | null => {
      if (pos < -EPS || pos > LAST + 0.6) return null;
      if (dir > 0 && pos >= LAST - EPS) return null;
      if (dir < 0 && pos <= EPS) return null;
      const n = Math.round(pos);
      if (Math.abs(pos - n) <= EPS) return n + dir;
      // Between slides: settle onto the next one in the direction of travel.
      return dir > 0 ? Math.ceil(pos) : Math.floor(pos);
    };

    // A dialog portalled outside the run (the Extincts reader) marks the root
    // `data-modal` while open; the wheel and the keys are its then.
    const modal = () => dialogOpen.current || !!document.documentElement.dataset.modal;

    const onWheel = (e: WheelEvent) => {
      if (reduceMotion || e.ctrlKey || modal()) return;
      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP_MS && !flyingRef.current) gestureSpent = false;
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
      // ← → switch track, in the rooms only.
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !onLanding()) {
        const pos = position();
        if (pos > LAST + 0.6) return;
        e.preventDefault();
        switchTrack(e.key === "ArrowRight" ? "creative" : "logic");
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
      if (reduceMotion || flyingRef.current) return;
      settle = setTimeout(() => {
        if (flyingRef.current || touching) return;
        const pos = position();
        if (pos <= EPS || pos >= LAST - EPS) return;
        if (Math.abs(pos - Math.round(pos)) > EPS) flyTo(Math.round(pos));
      }, SETTLE_MS);
    };
    const onTouchStart = (e: TouchEvent) => {
      touching = true;
      // A finger on the glass takes the page back from a flight in progress.
      anim?.stop();
      flyingRef.current = false;
      // On the brain slide, the half the finger lands on picks the column.
      const x = e.touches[0]?.clientX;
      if (x !== undefined) pickSide(x);
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };

    // Every pin flies to its room, on its own track; null (a pin closing)
    // needs nothing. From the landing the track is simply set — nothing of
    // either track is on screen to pan.
    const onPin = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      const room = ROOMS.find((r) => r.section.id === id);
      if (!room) return;
      switchTrack(room.track, onLanding());
      flyTo(FIRST_ROOM + room.level);
    };
    const onGo = (e: Event) => {
      const d = (e as CustomEvent<GoDetail>).detail;
      const { k, track: t } = typeof d === "number" ? { k: d, track: undefined } : d;
      if (t) switchTrack(t, onLanding());
      flyTo(k);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
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
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(PIN_OPEN_EVENT, onPin);
      window.removeEventListener(GO_EVENT, onGo);
    };
  }, [reduceMotion, switchTrack]);

  const go = (k: number, t?: Track) =>
    window.dispatchEvent(new CustomEvent<GoDetail>(GO_EVENT, { detail: t ? { k, track: t } : k }));

  // The dock's prompt: the room LEVEL with this one, on the other track.
  // Each circle's prompt: the room LEVEL with this one, on the other track.
  const logicAcross = CREATIVE[level]?.label ?? CREATIVE[0].label;
  const creativeAcross = LOGIC[level]?.label ?? LOGIC[0].label;

  return (
    <FlightContext.Provider value={{ p, current, zone, reduceMotion }}>
    <div ref={runRef} className="relative w-full" style={{ height: `${(LAST + 1) * 100}svh` }}>
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-white"
      >
        {/* The two grounds, one per track, side by side, each panning with
            its track; behind the landing both are covered entirely.
            · LOGIC: the landing's own — white, the faint circuit film, a
              lattice in each corner (owner, 2026-10-05: "my bg from first two
              slides, rather than this black bg" — the dimmed circuit board
              and its dark scrim until then; git has them), with its drifting
              field in dark grey (SectionParticles).
            · CREATIVE: the Mood Field — rainbow veins drifting over white,
              stirred by the pointer (owner, 2026-10-10; MoodField). The
              landing's white ground until then, and the paint-burst film
              before 2026-10-03. */}
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

        {/* The landing — slides 0 and 1 in one: it stands still while its
            own two layers (the orb, then the brain) trade places inside it,
            and leaves across the plane on the step after. See HeroStage. */}
        {/* Everything that travels, under one camera — its lift (cameraScale)
            applies to all of it at once. */}
        <motion.div className="absolute inset-0" style={{ scale: cameraScale }}>
        <Slide
          kind="landing"
          index={FIRST_ROOM - 1}
          p={p}
          trackX={trackX}
          reduceMotion={reduceMotion}
          current={current < FIRST_ROOM}
          className="bg-gallery"
        >
          {children}
        </Slide>

        {ROOMS.map(({ section: s, level: lv, track: t }) => {
          const index = FIRST_ROOM + lv;
          const count = sectionEntryCount(s, data);
          const logic = t === "logic";
          const side = logic ? LOGIC : CREATIVE;
          const meta = `${logic ? "Logic" : "Creative"} · ${pad(lv + 1)} / ${pad(side.length)} · ${
            count === 0 ? "coming soon" : `${count} ${count === 1 ? "entry" : "entries"}`
          }`;
          return (
            <Slide
              key={s.id}
              kind="room"
              index={index}
              p={p}
              trackX={trackX}
              side={logic ? -1 : 1}
              pan={logic ? logicPan : creativePan}
              reduceMotion={reduceMotion}
              current={current === index && track === t}
            >
              {/* The room keeps its foot clear of the brain's circle in the
                  column's outer corner (BrainDock: its offset + its size + air);
                  creative mirrored, with its header right-aligned. (Until
                  2026-10-10 it kept a side clear of the dock's half-window.) */}
              <section
                aria-label={s.label}
                data-side={t}
                className="room-pad flex h-full px-5 pb-[calc(max(1rem,3.5vh)+5.5rem+1.5vh)] pt-[max(8vh,5rem)] text-neutral-900 sm:px-10 md:pb-[calc(max(1rem,3.5vh)+max(6rem,min(15vh,9.375rem))+1.5vh)] lg:px-[5vw]"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  {logic ? (
                    <header className="mb-[3.5vh] flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
                      <div className="flex w-full items-center justify-between gap-4 lg:w-auto">
                        <div className="min-w-0">
                          <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-neutral-500`}>
                            {meta}
                          </p>
                          <h2 className="room-title face-logic mt-2 text-[clamp(2.4rem,5.4vw,5.2rem)] leading-[0.95]">
                            {s.label}
                          </h2>
                          {s.tagline && (
                            <p className={`room-tagline ${typeVoiceClass("logic", "meta")} mt-3 text-[0.62rem] tracking-[0.3em] text-neutral-500`}>
                              {s.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="room-desc font-helv max-w-md text-sm leading-relaxed text-neutral-600 max-sm:line-clamp-3">
                        {s.description}
                      </p>
                    </header>
                  ) : (
                    // Creative: the creative face, dark on the landing's light
                    // ground, each block on a paper plate over the circuit film,
                    // and all of it right-aligned, on the right.
                    <header className="mb-[3.5vh] flex flex-col items-end gap-3 text-right">
                      <div className="flex w-full items-center justify-end gap-4">
                        <div className={`${PAPER_PLATE} min-w-0 px-6 py-4`}>
                          <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-neutral-500`}>
                            {meta}
                          </p>
                          <h2 className="room-title face-creative mt-2 text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.01em]">
                            {s.label}
                          </h2>
                        </div>
                      </div>
                      <p className={`room-desc font-helv max-w-md ${PAPER_PLATE} px-5 py-4 text-sm leading-relaxed text-neutral-700 max-sm:line-clamp-3`}>
                        {s.description}
                      </p>
                    </header>
                  )}
                  {/* Boards are centred in what is left of the screen when short
                      (five client cards) and scroll when not. The rooms with
                      their own renderer (FILLS) size and scroll themselves, so
                      they get the whole body — a centring wrapper would leave
                      their `h-full` resolving to nothing. */}
                  {/* ⚠ No overscroll-contain: on touch a swipe that runs off the end of
                      a list must carry on into the page, or a phone could never
                      leave a room whose body fills the screen. */}
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <div className={FILLS.has(s.id) ? "h-full" : "flex min-h-full flex-col justify-center"}>
                      <SectionBody
                        section={s}
                        data={data}
                        onStudy={setStudyId}
                        variant="slide"
                        align={logic ? "left" : "right"}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </Slide>
          );
        })}
        </motion.div>

        {/* The glass tiles that light over the squares as every move turns
            them, across the whole screen. */}
        <PixelVeil p={p} trackX={trackX} track={track} firstRoom={FIRST_ROOM} reduceMotion={reduceMotion} />

        {/* The brain's circle in each column's outer foot — appearing a beat
            after the camera arrives — and the way across to the other track. */}
        <BrainDock
          inRooms={current >= FIRST_ROOM}
          logicPan={logicPan}
          creativePan={creativePan}
          logicAcross={logicAcross}
          creativeAcross={creativeAcross}
          onAcross={() => switchTrack(track === "logic" ? "creative" : "logic")}
          reduceMotion={reduceMotion}
        />

        {/* The three circles — left brain, home, right brain — and under each
            side its four rooms (BrainNav). Hidden over the landing, which has
            its own pins. This replaced the dot rail on the right edge. */}
        <BrainNav
          current={current}
          track={track}
          firstRoom={FIRST_ROOM}
          logic={LOGIC}
          creative={CREATIVE}
          hidden={current < FIRST_ROOM}
          onGo={go}
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

      {/* Outside the sticky stage on purpose: the stage's `perspective` (and
          each slide's transform) would make this `position: fixed` dialog
          fixed to THEM instead of the viewport. */}
      <ProjectPreview
        study={studyId ? (projectStudyById(studyId) ?? null) : null}
        plates={studyId ? (data.studyPlates[studyId] ?? []) : []}
        onClose={() => setStudyId(null)}
      />
    </div>
    </FlightContext.Provider>
  );
}
