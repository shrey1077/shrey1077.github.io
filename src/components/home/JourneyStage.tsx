"use client";

/**
 * JourneyStage — the homepage after the hero: a fly-through into the brain,
 * then a 2D plane the camera zig-zags down through all eight sections.
 *
 * Spec and the decisions behind it: docs/HANDOFF/16_SCROLL_JOURNEY_SPEC.md
 *
 * THE SHAPE. One very tall section (JOURNEY_VH screens) with a STICKY viewport
 * inside it. Scrolling the tall section moves a camera; the sticky viewport is
 * what the camera sees. That is the whole mechanism — there is no scroll
 * hijacking, no wheel handler, and no scroll-snap. The page scrolls normally
 * and the position is read, which is why a keyboard, a trackpad, a scrollbar
 * drag and a jump-link all work without special cases.
 *
 * TWO PHASES, split at FLY_END:
 *   A. The fly-through. `journey.webm` plays forward while the whole frame
 *      scales up toward the brain's left extremity, and fades out as it goes.
 *   B. The plane. Eight exsecs at zig-zag coordinates (see constants/journey);
 *      the camera translates from one to the next, easing in and out at each
 *      so it SETTLES on a section rather than sliding past it.
 *
 * ⚠ THE PLAYHEAD IS SET, NOT PLAYED. `video.currentTime` is driven from scroll
 * rather than calling play(), because the clip has to be able to run BACKWARDS
 * when the visitor scrolls up. This is the same seek-per-frame that made the
 * old pointer scrub stutter — the difference is that this clip is 2.3s and
 * fully buffered, and the motion is monotonic, so each seek lands a frame or
 * two from the last rather than anywhere in a 6s file. Writes are skipped when
 * the target has not moved a meaningful amount (SEEK_EPS).
 *
 * ⚠ NARROW SCREENS GET NO PLANE. Below `lg` the whole thing collapses to a
 * plain vertical stack with the sections alternating left/right — the owner's
 * instruction, and the only sane answer: a horizontal camera move on a phone is
 * either invisible or motion sickness.
 *
 * ⚠ REDUCED MOTION GETS THE STACK TOO, for the same reason it gets everything
 * else: the journey IS the navigation here, so switching the animation off
 * cannot be allowed to switch the sections off with it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CareerTimeline } from "@/components/home/CareerTimeline";
import { PublicationShelf } from "@/components/home/PublicationShelf";
import { LogofolioWall } from "@/components/home/LogofolioWall";
import { ArtCollections } from "@/components/home/ArtCollections";
import { BrandCardSlider } from "@/components/home/BrandCardSlider";
import { ExtinctsDeck } from "@/components/home/ExtinctsDeck";
import { clientsInSection } from "@/constants/clients";
import { PUBLICATIONS } from "@/constants/publications";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { JOURNEY, JOURNEY_VH, FLY_END, stopIndexOf } from "@/constants/journey";
import { typeVoiceClass } from "@/constants/typography";
import type { ArtCollection, LogoMark, MarkPlate } from "@/content/catalogue";
import type { NavSectionId } from "@/types/navigation";

/** Don't touch `currentTime` for movements smaller than this — a seek costs
 *  more than the frame it would gain. */
const SEEK_EPS = 1 / 60;

/** How far the fly-through zooms before it hands over.
 *
 *  ⚠ CAPPED BY THE SOURCE, NOT BY TASTE. The master is 1280x720 and the hero
 *  already renders it at ~1:1, so every unit of this is magnification past
 *  native. At 2.6 the softening is still reading as motion; pushing to a true
 *  full-screen fly-through turns the brain to mush. The last stretch fades out
 *  (see FADE_FROM) so the softest frames are never the ones on screen. */
const FLY_ZOOM = 2.6;
/** Where in phase A the frame starts dissolving, as a fraction of that phase. */
const FADE_FROM = 0.55;

/** Ease in AND out, so the camera settles on each stop. */
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function JourneyStage({
  artCollections,
  logos,
  extinctsSlides,
  publicationCovers,
  markPlates,
}: {
  artCollections: ArtCollection[];
  logos: LogoMark[];
  extinctsSlides: string[];
  publicationCovers: Record<string, string | undefined>;
  markPlates: Record<string, MarkPlate>;
}) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [plane, setPlane] = useState(false);

  /* Is there room for a plane? Matches the `lg` breakpoint the pins use. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const read = () => setPlane(mq.matches && !reduceMotion);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [reduceMotion]);

  /* The camera. Driven straight off scroll position in a rAF loop rather than
     from a scroll event, so it cannot fall behind on a fast flick and so the
     work is capped at one frame's worth however many events arrive. */
  useEffect(() => {
    if (!plane) return;
    const section = sectionRef.current;
    if (!section) return;

    let lastSeek = -1;

    const frame = () => {
      const rect = section.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? clamp01(-rect.top / span) : 0;

      // ── phase A: the fly-through ──
      const a = clamp01(p / FLY_END);
      const fly = flyRef.current;
      const video = videoRef.current;
      if (fly) {
        const scale = 1 + (FLY_ZOOM - 1) * easeInOut(a);
        const fade = a < FADE_FROM ? 1 : 1 - (a - FADE_FROM) / (1 - FADE_FROM);
        fly.style.transform = `scale(${scale.toFixed(4)})`;
        fly.style.opacity = clamp01(fade).toFixed(3);
        fly.style.visibility = a >= 1 ? "hidden" : "visible";
      }
      if (video && video.duration) {
        const t = a * video.duration;
        if (Math.abs(t - lastSeek) > SEEK_EPS) {
          video.currentTime = t;
          lastSeek = t;
        }
      }

      // ── phase B: the plane ──
      const b = clamp01((p - FLY_END) / (1 - FLY_END));
      const steps = JOURNEY.length - 1;
      const raw = b * steps;
      const i = Math.min(steps - 1, Math.floor(raw));
      const k = steps > 0 ? easeInOut(clamp01(raw - i)) : 0;
      const from = JOURNEY[Math.min(i, steps)];
      const to = JOURNEY[Math.min(i + 1, steps)];
      const col = from.col + (to.col - from.col) * k;
      const row = from.row + (to.row - from.row) * k;
      const pane = planeRef.current;
      if (pane) {
        // The camera centres the current cell: translate by its position,
        // in cell units, expressed as a percentage of one cell.
        pane.style.transform = `translate3d(${(-col * 100).toFixed(3)}%, ${(-row * 100).toFixed(3)}%, 0)`;
      }

      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [plane]);

  /* Click-to-jump. The pins still open sections; on the plane that means
     scrolling to that stop's slice of the tall section. */
  const jumpTo = useCallback(
    (id: NavSectionId) => {
      const section = sectionRef.current;
      if (!section) return;
      const idx = stopIndexOf(id);
      if (idx < 0) return;
      if (!plane) {
        document.getElementById(`exsec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const span = section.offsetHeight - window.innerHeight;
      const steps = JOURNEY.length - 1;
      const b = steps > 0 ? idx / steps : 0;
      const p = FLY_END + b * (1 - FLY_END);
      window.scrollTo({ top: section.offsetTop + p * span, behavior: "smooth" });
    },
    [plane],
  );

  useEffect(() => {
    const onPin = (e: Event) => {
      const id = (e as CustomEvent<NavSectionId | null>).detail;
      if (id) jumpTo(id);
    };
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, [jumpTo]);

  /* ⚠ These are SectionPanel's OWN renderers, deliberately — not SectionBody's.
     SectionBody belongs to the parked SidesShowcase chain and is a poorer
     renderer: it sends `publications` to "coming soon" and gives `logofolio`
     the flat grid instead of the wall. Routing the plane through it would have
     silently downgraded two of the eight rooms. The four sections with a
     dedicated renderer get the same one the overlay gives them. */
  const body = (id: NavSectionId) => {
    if (id === "career-path") return <CareerTimeline />;
    if (id === "publications")
      return <PublicationShelf publications={PUBLICATIONS} covers={publicationCovers} />;
    if (id === "logofolio") return <LogofolioWall logos={logos} markPlates={markPlates} />;
    if (id === "art") return <ArtCollections collections={artCollections} />;
    if (id === "the-extincts-project" && extinctsSlides.length > 0)
      return <ExtinctsDeck slides={extinctsSlides} />;
    if (id === "clients" || id === "projects")
      return <BrandCardSlider entries={clientsInSection(id)} />;
    return (
      <p className={`${typeVoiceClass("creative", "meta")} text-base text-white/70`}>
        Coming soon — this room is still being hung.
      </p>
    );
  };

  /* ── The stack: narrow screens and reduced motion ──
     Sections alternate left and right, which is the zig-zag flattened. */
  if (!plane) {
    return (
      <section aria-label="Sections" className="w-full bg-neutral-950">
        {JOURNEY.map((s) => (
          <div
            key={s.id}
            id={`exsec-${s.id}`}
            className={`flex min-h-[85svh] w-full flex-col justify-center px-6 py-14 sm:px-10 ${
              s.col === 1 ? "items-end text-right" : "items-start text-left"
            }`}
          >
            <h2 className={`${typeVoiceClass("logic", "meta")} mb-4 text-[0.6rem] uppercase tracking-[0.2em] text-white/45`}>
              {s.label}
            </h2>
            <div className="h-[60svh] w-full min-h-0">{body(s.id)}</div>
          </div>
        ))}
      </section>
    );
  }

  /* ── The plane ── */
  return (
    <section
      ref={sectionRef}
      aria-label="Sections"
      className="relative w-full bg-neutral-950"
      style={{ height: `${JOURNEY_VH * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* Phase A — the fly-through. Sits above the plane and dissolves. */}
        <div
          ref={flyRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 will-change-transform"
          style={{ transformOrigin: "22% 50%" }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            src="/brain/journey.webm"
            muted
            playsInline
            preload="auto"
            // ⚠ Never autoplayed — the playhead is driven from scroll. See the
            //   header's note on why this seeks rather than plays.
          />
        </div>

        {/* Phase B — the plane. One cell per stop, positioned in cell units;
            the wrapper translates, so only ONE element ever animates. */}
        <div
          ref={planeRef}
          className="absolute inset-0 will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {JOURNEY.map((s) => (
            <div
              key={s.id}
              id={`exsec-${s.id}`}
              // ⚠ `h-full w-full`, NOT `inset-0`. `inset-0` also sets right:0
              //   and bottom:0, which stay in force when left/top are
              //   overridden — so a cell at left:100% had its width computed as
              //   (parent - left - right) and collapsed. Measured before the
              //   fix: every cell was 154x112px instead of a full viewport, and
              //   the sections inside them rendered into a zero-height box.
              className="absolute flex h-full w-full flex-col px-[6vw] py-[7vh]"
              style={{ left: `${s.col * 100}%`, top: `${s.row * 100}%` }}
            >
              <h2 className={`${typeVoiceClass("logic", "meta")} mb-4 shrink-0 text-[0.62rem] uppercase tracking-[0.22em] text-white/45`}>
                {s.label}
              </h2>
              <div className="min-h-0 flex-1">{body(s.id)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
