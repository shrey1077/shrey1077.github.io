"use client";

/**
 * Flythrough — the landing and all eight sections as one flight in depth
 * (2026-10-02, owner: "vertical slides flythrough… travel in z axis to the
 * clients page, then the next scroll to projects, and so on").
 *
 * THE RUN. A tall block, one screen of scroll per slide, holding a sticky
 * full-screen stage. Scroll progress through the block is the camera's depth:
 *   · the landing is slides 0 and 1 (2026-10-03): the portrait orb and the
 *     tools, then the brain with its pins and the facts, which comes up out of
 *     the depth as the orb flies by — the wordmark, the code box and the band
 *     standing still across both (HeroStage, flight.ts); the next scroll flies
 *     the whole landing past the camera;
 *   · then the rooms, which wait far back in z, fly forward to fill the screen
 *     and rush past in turn;
 *   · past the last slide the block simply scrolls away into the footer.
 * The camera is a real translateZ under perspective, written through motion
 * values — no React work per frame.
 *
 * TWO PARALLEL TRACKS (owner, 2026-10-03). The rooms are not one line of eight
 * any more but two of four, side by side, LEVEL with each other:
 *
 *        logic (left)        creative (right)
 *        Clients        ↔    Art
 *        Projects       ↔    Publications
 *        Logofolio      ↔    The Extincts Project
 *        Career Path    ↔    AI Generations & Ideas
 *
 * Scrolling flies down whichever track you are on. Switching is SIDEWAYS: the
 * docked brain's window carries "Click to <the room level with this one>" and
 * a blinking arrow, and a click pans the stage — this room slides off one way,
 * its partner slides in from the other, and the brain's window swings from
 * one edge to the other as the hinge between them (BrainDock). The arrow keys
 * ← → switch too. The circuit board travels with the logic track and the paint
 * film with the creative one. The run is therefore the landing plus FOUR
 * levels, not eight rooms. Back on the landing the track resets to logic, so
 * the way down always starts at Clients.
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
 * Reduced motion: no take-over, no depth — slides crossfade with the scroll,
 * and a track switch cuts rather than pans.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import { FlightContext, HERO_SLIDES, PERSPECTIVE, useDepth } from "@/components/home/flight";
import { BrainDock } from "@/components/home/BrainDock";
import { BRAIN_POSE } from "@/components/home/HeroStage";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { SectionParticles } from "@/components/home/SectionParticles";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
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

/** Seconds for one slide's flight; each further slide adds FLY_EXTRA, up to
 *  FLY_MAX_SLIDES' worth. */
const FLY_BASE = 0.8;
const FLY_EXTRA = 0.24;
const FLY_MAX_SLIDES = 6;
const FLY_EASE = [0.65, 0, 0.35, 1] as const;
/** Seconds for the sideways pan between the two tracks. */
const PAN = 0.9;
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
const FILLS: ReadonlySet<string> = new Set(["logofolio", "career-path", "art", "publications", "the-extincts-project"]);

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

function Slide({
  index,
  p,
  pan,
  reduceMotion,
  current,
  origin,
  hold = false,
  className = "",
  children,
}: {
  index: number;
  p: MotionValue<number>;
  /** Sideways offset in screen widths (−1 off left … 1 off right) — the
   *  track pan. The landing has none. */
  pan?: MotionValue<number>;
  reduceMotion: boolean;
  /** The slide the camera is on — the only one that takes the pointer. */
  current: boolean;
  origin: string;
  /** Stand still on the way in (the landing, whose own layers fly inside). */
  hold?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { z, opacity, zIndex } = useDepth(p, index, reduceMotion, hold);
  const still = useMotionValue(0);
  const offset = pan ?? still;
  const x = useTransform(offset, (v) => `${v * 100}%`);
  // Hidden when faded out OR panned fully off screen.
  const visibility = useTransform([opacity, offset], ([o, v]) =>
    (o as number) < 0.01 || Math.abs(v as number) > 0.999 ? "hidden" : "visible",
  );

  return (
    <motion.div
      aria-hidden={!current}
      inert={!current}
      className={`absolute inset-0 ${className}`}
      style={{
        x,
        z,
        opacity,
        visibility,
        zIndex,
        transformOrigin: origin,
        pointerEvents: current ? "auto" : "none",
      }}
    >
      {children}
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
    // Back on the landing, the way down starts at Clients again.
    if (!inRooms && trackRef.current !== "logic" && !flyingRef.current) switchTrack("logic", true);
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

    const flyTo = (k: number) => {
      const { top, step } = geom();
      const target = top + Math.max(0, Math.min(LAST, k)) * step;
      const from = window.scrollY;
      anim?.stop();
      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      flyingRef.current = true;
      const slides = Math.abs(target - from) / (step || 1);
      anim = animate(from, target, {
        duration: FLY_BASE + FLY_EXTRA * Math.max(0, Math.min(FLY_MAX_SLIDES, slides) - 1),
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
      if (!flyingRef.current) flyTo(target);
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
    const onTouchStart = () => {
      touching = true;
      // A finger on the glass takes the page back from a flight in progress.
      anim?.stop();
      flyingRef.current = false;
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
      window.removeEventListener(PIN_OPEN_EVENT, onPin);
      window.removeEventListener(GO_EVENT, onGo);
    };
  }, [reduceMotion, switchTrack]);

  const go = (k: number, t?: Track) =>
    window.dispatchEvent(new CustomEvent<GoDetail>(GO_EVENT, { detail: t ? { k, track: t } : k }));

  // The dock's prompt: the room LEVEL with this one, on the other track.
  const across =
    track === "logic"
      ? { label: CREATIVE[level]?.label ?? CREATIVE[0].label, face: "creative" as const, toward: "right" as const }
      : { label: LOGIC[level]?.label ?? LOGIC[0].label, face: "logic" as const, toward: "left" as const };

  return (
    <FlightContext.Provider value={{ p, current, zone, reduceMotion }}>
    <div ref={runRef} className="relative w-full" style={{ height: `${(LAST + 1) * 100}svh` }}>
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-neutral-950"
        style={{ perspective: PERSPECTIVE }}
      >
        {/* The two grounds, one per track, side by side: the circuit board
            (dim and grey, with the drifting field over it) under the logic
            rooms, and under the creative ones the LANDING'S OWN ground —
            white, the faint circuit film, a lattice in each corner (owner,
            2026-10-03; it was the paint-burst film until then). Each pans with
            its track. Behind the landing both are covered entirely. */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ x: logicGroundX }}>
          <Image
            src="/videos/circuit-bg-poster.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-neutral-950/60" />
          {circuitLive && <SectionParticles />}
        </motion.div>
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-white" style={{ x: creativeGroundX }}>
          {creativeLive && <CircuitBackdrop />}
          <div className="absolute inset-0 hidden lg:block">
            <Corner3DGrid corner="tl" />
            <Corner3DGrid corner="bl" />
            <Corner3DGrid corner="tr" />
            <Corner3DGrid corner="br" />
          </div>
        </motion.div>

        {/* The landing — slides 0 and 1 in one: it stands still while its
            own two layers (the orb, then the brain) trade places inside it,
            and flies off on the step after. See HeroStage and flight.ts. */}
        <Slide
          index={FIRST_ROOM - 1}
          hold
          p={p}
          reduceMotion={reduceMotion}
          current={current < FIRST_ROOM}
          origin="50% 45%"
          className="bg-gallery"
        >
          {children}
        </Slide>

        {ROOMS.map(({ section: s, level: lv, track: t }) => {
          const index = FIRST_ROOM + lv;
          const count = sectionEntryCount(s, data);
          const logic = t === "logic";
          const side = logic ? LOGIC : CREATIVE;
          const meta = `${logic ? "Logic" : "Creative"} · ${pad(lv + 1)} / ${pad(side.length)} · ${count} ${
            count === 1 ? "entry" : "entries"
          }`;
          return (
            <Slide
              key={s.id}
              index={index}
              p={p}
              pan={logic ? logicPan : creativePan}
              reduceMotion={reduceMotion}
              current={current === index && track === t}
              origin="50% 50%"
            >
              {/* Logic: the room keeps clear of the dock's half-window on the
                  right edge (40vh wide at its widest, plus air); creative:
                  mirrored, with its header right-aligned. */}
              <section
                aria-label={s.label}
                className={`flex h-full px-5 pb-[5vh] pt-[max(8vh,5rem)] sm:px-10 ${
                  logic
                    ? "text-white lg:pl-[5vw] lg:pr-[calc(40vh+3vw)]"
                    : "text-neutral-900 lg:pl-[calc(40vh+3vw)] lg:pr-[5vw]"
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  {logic ? (
                    // Below `lg` the dock sits beside this header, half off the
                    // edge — the padding keeps the title clear of it.
                    <header className="mb-[3.5vh] flex flex-wrap items-end justify-between gap-x-10 gap-y-3 max-lg:pr-[calc(min(25vw,7.5rem)+0.5rem)]">
                      <div className="flex w-full items-center justify-between gap-4 lg:w-auto">
                        <div className="min-w-0">
                          <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-white/45`}>
                            {meta}
                          </p>
                          <h2 className="font-digibra mt-2 text-[clamp(2.4rem,5.4vw,5.2rem)] leading-[0.95]">
                            {s.label}
                          </h2>
                          {s.tagline && (
                            <p className={`${typeVoiceClass("logic", "meta")} mt-3 text-[0.62rem] tracking-[0.3em] text-white/55`}>
                              {s.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="font-helv max-w-md text-sm leading-relaxed text-white/65 max-sm:line-clamp-3">
                        {s.description}
                      </p>
                    </header>
                  ) : (
                    // Creative: the creative face, dark on the landing's light
                    // ground, each block on a paper plate over the circuit film,
                    // and all of it right-aligned, on the right.
                    <header className="mb-[3.5vh] flex flex-col items-end gap-3 text-right max-lg:pl-[calc(min(25vw,7.5rem)+0.5rem)]">
                      <div className="flex w-full items-center justify-end gap-4">
                        <div className={`${PAPER_PLATE} min-w-0 px-6 py-4`}>
                          <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-neutral-500`}>
                            {meta}
                          </p>
                          <h2 className="font-graff mt-2 text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[0.95]">
                            {s.label}
                          </h2>
                        </div>
                      </div>
                      <p className={`font-helv max-w-md ${PAPER_PLATE} px-5 py-4 text-sm leading-relaxed text-neutral-700 max-sm:line-clamp-3`}>
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

        {/* The landing's brain, docked at the edge through the rooms — and the
            way across to the other track. */}
        <BrainDock
          p={p}
          trackX={trackX}
          enter={FIRST_ROOM - 1}
          pose={BRAIN_POSE}
          reduceMotion={reduceMotion}
          across={across}
          onAcross={() => switchTrack(track === "logic" ? "creative" : "logic")}
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
            sit there). Gone the moment the camera reaches the rooms. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-[8.5%] z-[150] flex flex-col items-center gap-1 transition-opacity duration-500 ${
            current === 0 ? "opacity-100" : current < FIRST_ROOM ? "opacity-100 lg:opacity-0" : "opacity-0"
          }`}
        >
          <span className={`${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.3em] text-neutral-500`}>
            Scroll to explore
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
