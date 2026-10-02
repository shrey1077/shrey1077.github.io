"use client";

/**
 * Flythrough — the landing and all eight sections as one flight in depth
 * (2026-10-02, owner: "vertical slides flythrough… travel in z axis to the
 * clients page, then the next scroll to projects, and so on" — left sections
 * first, then the right side the same way).
 *
 * THE RUN. A tall block, one screen of scroll per slide, holding a sticky
 * full-screen stage. Scroll progress through the block is the camera's depth:
 *   · the hero is slide 0 — scrolling on dives it forward, toward the brain,
 *     until it rushes past the camera and is gone;
 *   · each section waits far back in z, flies forward to fill the screen, then
 *     rushes past in turn — the four LOGIC sections (Clients, Projects,
 *     Logofolio, Career Path) on the circuit board, then the four CREATIVE ones
 *     (Art, Publications, The Extincts Project, AI Generations) on the paint
 *     film; the ground crossfades between the two as the camera crosses over;
 *   · past the last slide the block simply scrolls away into the footer.
 * The camera is a real translateZ under perspective, written through motion
 * values — no React work per frame.
 *
 * ONE SCROLL, ONE SLIDE. Inside the run a wheel gesture is taken over and flies
 * exactly one slide, with a lock that outlasts a trackpad's inertia tail so one
 * swipe can't skip three slides. Rooms that scroll on their own (Career's rail,
 * the Logofolio wall, the Publications shelf, Art's collections) get the wheel
 * first until they hit their end. Keys step the same way. Touch, the scrollbar
 * and anything else scroll natively and are eased onto the nearest slide when
 * they come to rest.
 *
 * PINS. Every pin (and its compact-nav twin) flies to its slide, and so does
 * every circle of BrainNav, the three at the top of the stage. This replaced
 * SectionPanel, the band that used to open under the hero; it was deleted on
 * 2026-10-02 once both sides lived here — git has it.
 *
 * Reduced motion: no take-over, no depth — slides crossfade with the scroll.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { SectionParticles } from "@/components/home/SectionParticles";
import { PaintBurst } from "@/components/home/PaintBurst";
import { ProjectPreview } from "@/components/home/ProjectPreview";
import { BrainNav } from "@/components/home/BrainNav";
import { SectionBody, sectionEntryCount, type SectionData } from "@/components/home/SectionBody";
import { navSectionsFor } from "@/constants/navigation";
import { projectStudyById } from "@/constants/projectStudies";
import { FILM_PLATE } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

/** The flight's order: the logic sections top pin first, then the creative. */
const LOGIC = navSectionsFor("left");
const CREATIVE = navSectionsFor("right");
const SLIDES = [...LOGIC, ...CREATIVE];
/** Slide 0 is the hero, so the last slide's index is the slide count. */
const LAST = SLIDES.length;
/** The ground turns from circuit to paint between slide LOGIC.length (Career
 *  Path) and the one after it (Art). */
const CROSSOVER = LOGIC.length;

const PERSPECTIVE = 1200;
/** px of depth per slide still to come — the next one waits ~0.4× and faded. */
const AHEAD_Z = 1700;
/** px toward the camera per slide gone by — a passed slide swells and fades
 *  out by half a slide, so it reads as flown THROUGH, not slid away. */
const PASS_Z = 800;
/** A slide's fade: in over the whole approach, out over half a slide passed. */
const FADE_OUT = 2.2;

/** Seconds for one slide's flight; each further slide adds FLY_EXTRA, up to
 *  FLY_MAX_SLIDES' worth — a pin from the hero to the last room passes eight. */
const FLY_BASE = 0.8;
const FLY_EXTRA = 0.24;
const FLY_MAX_SLIDES = 6;
const FLY_EASE = [0.65, 0, 0.35, 1] as const;
/** A wheel event this soon after the last belongs to the same gesture. */
const GESTURE_GAP_MS = 220;
/** Native scrolling that stops this long counts as at rest. */
const SETTLE_MS = 140;
/** Slide positions this close to a whole number count as on that slide. */
const EPS = 0.02;

/** Fired to fly to a slide by index (0 = the hero) — BrainNav's circles. */
const GO_EVENT = "flythrough:go";

/** Rooms that size and scroll themselves (SectionBody's own renderers). */
const FILLS: ReadonlySet<string> = new Set(["logofolio", "career-path", "art", "publications"]);

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
  reduceMotion,
  current,
  origin,
  className = "",
  children,
}: {
  index: number;
  p: MotionValue<number>;
  reduceMotion: boolean;
  /** The slide the camera is on — the only one that takes the pointer. */
  current: boolean;
  origin: string;
  className?: string;
  children: React.ReactNode;
}) {
  const z = useTransform(p, (v) => {
    if (reduceMotion) return 0;
    const d = index - v;
    return d >= 0 ? -d * AHEAD_Z : -d * PASS_Z;
  });
  const opacity = useTransform(p, (v) => {
    const d = index - v;
    const o = d >= 0 ? 1 - d : 1 + d * FADE_OUT;
    return Math.max(0, Math.min(1, o));
  });
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  // Siblings composite by z-index, not by 3D depth (no preserve-3d), so the
  // slide rushing past has to be stacked over the one arriving behind it.
  const zIndex = useTransform(p, (v) => 100 - Math.round((index - v) * 10));

  return (
    <motion.div
      aria-hidden={!current}
      inert={!current}
      className={`absolute inset-0 ${className}`}
      style={{
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
  /** The hero — slide 0. */
  children: React.ReactNode;
  data: SectionData;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const runRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: runRef, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, (v) => v * LAST);

  // The slide the camera is nearest — only changes on a crossing.
  const [current, setCurrent] = useState(0);
  // Which grounds are worth running. The circuit's particles only once the
  // camera has left the hero and until it is well into the paint; the paint
  // film only from just before the crossover — a video decoding behind seven
  // opaque slides is a waste.
  const [circuitLive, setCircuitLive] = useState(false);
  const [paintLive, setPaintLive] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setCurrent(Math.min(LAST, Math.max(0, Math.round(v))));
    setCircuitLive(v > EPS && v < CROSSOVER + 1);
    setPaintLive(v > CROSSOVER - 0.6);
  });
  // The crossfade between the two grounds, over the flight Career → Art.
  const paintFade = useTransform(p, (v) => Math.max(0, Math.min(1, v - CROSSOVER)));
  const circuitFade = useTransform(paintFade, (o) => 1 - o);

  const [studyId, setStudyId] = useState<string | null>(null);
  const dialogOpen = useRef(false);
  useEffect(() => {
    dialogOpen.current = studyId !== null;
  }, [studyId]);

  useEffect(() => {
    const run = runRef.current;
    if (!run) return;

    let flying = false;
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

    const flyTo = (k: number) => {
      const { top, step } = geom();
      const target = top + Math.max(0, Math.min(LAST, k)) * step;
      const from = window.scrollY;
      anim?.stop();
      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      flying = true;
      const slides = Math.abs(target - from) / (step || 1);
      anim = animate(from, target, {
        duration: FLY_BASE + FLY_EXTRA * Math.max(0, Math.min(FLY_MAX_SLIDES, slides) - 1),
        ease: FLY_EASE,
        onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }),
        onComplete: () => {
          flying = false;
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

    const onWheel = (e: WheelEvent) => {
      if (reduceMotion || e.ctrlKey || dialogOpen.current) return;
      const now = performance.now();
      if (now - lastWheel > GESTURE_GAP_MS && !flying) gestureSpent = false;
      lastWheel = now;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const target = stepFrom(position(), dir);
      if (target === null) return;
      if (canScrollInside(e.target, run, dir)) return;
      e.preventDefault();
      if (flying || gestureSpent) return;
      gestureSpent = true;
      flyTo(target);
    };

    const onKey = (e: KeyboardEvent) => {
      if (reduceMotion || dialogOpen.current || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
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
      if (!flying) flyTo(target);
    };

    // Native scrolling that comes to rest between two slides is eased onto the
    // nearer one. Never mid-touch: a finger held still is not "at rest".
    const onScroll = () => {
      clearTimeout(settle);
      if (reduceMotion || flying) return;
      settle = setTimeout(() => {
        if (flying || touching) return;
        const pos = position();
        if (pos <= EPS || pos >= LAST - EPS) return;
        if (Math.abs(pos - Math.round(pos)) > EPS) flyTo(Math.round(pos));
      }, SETTLE_MS);
    };
    const onTouchStart = () => {
      touching = true;
      // A finger on the glass takes the page back from a flight in progress.
      anim?.stop();
      flying = false;
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };

    // Every pin flies to its slide; null (a pin closing) needs nothing.
    const onPin = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail;
      const i = SLIDES.findIndex((s) => s.id === id);
      if (i >= 0) flyTo(i + 1);
    };
    const onGo = (e: Event) => flyTo((e as CustomEvent<number>).detail);

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
  }, [reduceMotion]);

  const go = (k: number) => window.dispatchEvent(new CustomEvent(GO_EVENT, { detail: k }));

  return (
    <div ref={runRef} className="relative w-full" style={{ height: `${(LAST + 1) * 100}svh` }}>
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-neutral-950"
        style={{ perspective: PERSPECTIVE }}
      >
        {/* The two grounds the slides fly through. Logic: the circuit board,
            dim and grey, with the drifting field over it. Creative: the paint
            film at full strength — no scrim, as the creative rooms have always
            had it (legibility comes from FILM_PLATE behind the text). They
            crossfade over the flight from Career Path to Art. Behind the hero
            both are covered entirely. */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: circuitFade }}>
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
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: paintFade }}>
          {paintLive && <PaintBurst />}
        </motion.div>

        {/* Slide 0 — the hero. Dives toward the brain (origin on it). */}
        <Slide
          index={0}
          p={p}
          reduceMotion={reduceMotion}
          current={current === 0}
          origin="50% 45%"
          className="bg-gallery"
        >
          {children}
        </Slide>

        {SLIDES.map((s, i) => {
          const count = sectionEntryCount(s, data);
          const logic = s.hemisphere === "left";
          // Numbered within its own hemisphere: Logic 01–04, Creative 01–04.
          const side = logic ? LOGIC : CREATIVE;
          const n = side.indexOf(s) + 1;
          const meta = `${logic ? "Logic" : "Creative"} · ${pad(n)} / ${pad(side.length)} · ${count} ${
            count === 1 ? "entry" : "entries"
          }`;
          return (
            <Slide
              key={s.id}
              index={i + 1}
              p={p}
              reduceMotion={reduceMotion}
              current={current === i + 1}
              origin="50% 50%"
            >
              <section
                aria-label={s.label}
                className="flex h-full flex-col px-5 pb-[5vh] pt-[max(8vh,5rem)] text-white sm:px-10 lg:px-[6vw]"
              >
                {logic ? (
                  <header className="mb-[3.5vh] flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
                    <div>
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
                    <p className="font-helv max-w-md text-sm leading-relaxed text-white/65 max-sm:line-clamp-3">
                      {s.description}
                    </p>
                  </header>
                ) : (
                  // Creative: the creative face, and every block of text on its
                  // own plate — the paint film behind has no scrim.
                  <header className="mb-[3.5vh] flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
                    <div className={`${FILM_PLATE} px-6 py-4`}>
                      <p className={`${typeVoiceClass("logic", "meta")} text-[0.62rem] tracking-[0.32em] text-white/60`}>
                        {meta}
                      </p>
                      <h2 className="font-graff mt-2 text-[clamp(2.2rem,5vw,4.8rem)] font-bold leading-[0.95]">
                        {s.label}
                      </h2>
                    </div>
                    <p className={`font-helv max-w-md ${FILM_PLATE} px-5 py-4 text-sm leading-relaxed text-white/80 max-sm:line-clamp-3`}>
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
                    <SectionBody section={s} data={data} onStudy={setStudyId} variant="slide" />
                  </div>
                </div>
              </section>
            </Slide>
          );
        })}

        {/* The three circles — left brain, home, right brain — and under each
            side its four rooms (BrainNav). Hidden over the hero, which has
            its own pins. This replaced the dot rail on the right edge. */}
        <BrainNav current={current} logic={LOGIC} creative={CREATIVE} hidden={current === 0} onGo={go} />

        {/* Below `lg` there are no pins on the hero, so say the way on is
            down. Gone the moment the camera leaves. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-[8.5%] z-[150] flex flex-col items-center gap-1 transition-opacity duration-500 lg:hidden ${
            current === 0 ? "opacity-100" : "opacity-0"
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
  );
}
