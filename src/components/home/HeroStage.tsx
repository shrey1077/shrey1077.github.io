"use client";

/**
 * HeroStage — the landing, as TWO slides of the Flythrough (2026-10-03, owner).
 *
 *   slide 0  the portrait orb — its seam sweeping across — big, with the name
 *            and its one word (Shrey Singh / Designer) over it. The tools stood
 *            under it until 2026-10-10, when the owner moved them into a room
 *            of their own, My Stack (MyStack.tsx);
 *   slide 1  the brain, with its pins on two arcs round it, the pins'
 *            circuit and pencil lines, the two voices (Left brain / Right
 *            brain) between the brain and the arcs, and the facts (Chess,
 *            Education, Part-time, Hobbies) under it.
 * The first scroll moves DOWN the page (owner, 2026-10-04): the orb slide
 * rides up out of the top while the brain slide rises into place from below,
 * the PORTFOLIO mark climbing and growing with it. Every step after that moves
 * across the same plane (Flythrough, 2026-10-10): the next one down and to the
 * side, into the rooms — the whole landing slides off together.
 *
 * Common to both, standing still while the two trade places, then flying off
 * together on the next scroll:
 *   · the PORTFOLIO / 2026 mark — at half size at the foot of the orb slide,
 *     rising to full size at the top as the brain comes up (owner, 2026-10-03);
 *   · the code window, top left (half size), and the two corner lattices;
 *   · the black band along the foot, with the name.
 * The voices were common too for an hour; the owner moved them to the brain
 * slide alone (2026-10-03).
 *
 * The pins fly the camera to their rooms (PIN_OPEN_EVENT, caught by the
 * Flythrough). ⚠ This used to say the sections lived in `SidesShowcase`,
 * revealed by scrolling. That component was never wired into a route and was
 * deleted 2026-09-10; the pins have been the way in for a long time.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { BrainSequence } from "@/components/home/BrainSequence";
import { LeftRightBrain } from "@/components/home/LeftRightBrain";
import { CodeStream } from "@/components/home/CodeStream";
import { FACTS_RISE } from "@/components/home/FactsTab";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { PortraitOrb } from "@/components/home/PortraitOrb";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { BrainPins } from "@/components/home/BrainPins";
import { BrainTraces } from "@/components/home/BrainTraces";
import { useFlight } from "@/components/home/flight";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SITE } from "@/constants/site";

/** The landing brain read too large at 1:1 — sit it back a quarter, then a
 *  further tenth (2026-08-10) to give the words and pins more room, then 5%
 *  back up (2026-08-10, after the paint film came off the right flank and left
 *  the stage emptier).
 *  On a phone the opposite is true: the footage is landscape and `object-contain`
 *  fits it to the WIDTH of a portrait viewport, so at 0.75 the brain shrinks to a
 *  thumbnail in a mostly-empty screen. Push it back up past 1 instead — the
 *  footage carries plenty of margin, so nothing important crops.
 *  Both are the same 5% up, so each keeps the ratio it was tuned to.
 *  ⚠ "Phone" means ANY screen below `lg` held in PORTRAIT since 2026-10-03 —
 *  a portrait tablet has exactly the phone's problem (the brain fitted to the
 *  width, a thumbnail in a tall screen). Landscape keeps the desktop scale. */
const CENTER_SCALE = 0.70875; // 0.675 × 1.05
const CENTER_SCALE_PHONE = 1.37025; // 1.305 × 1.05

/** The brain sits a little high of dead centre (2026-08-17).
 *  ⚠ NOT free to change: LeftRightBrain, BrainTraces and the orb's placement
 *  all map frame points onto the stage through this, BRAIN_SHIFT_X and the
 *  centre scale. */
const BRAIN_RISE = -34; // px

/** …and a touch right, so the brain's own grey/colour division lands where
 *  the portrait orb's seam does.
 *  ⚠ MEASURED, not judged by eye: the boundary was sampled off the brain
 *  canvas across four scanlines (587, 591, 594, 595 — it leans slightly) and
 *  its median sat at x=594 against the orb's seam at x=621. (For part of
 *  2026-10-03 the orb was placed ON the brain's seam; it is placed by its own
 *  margins now — see ORB_TOP.) */
const BRAIN_SHIFT_X = 27; // px

/** The orb's frame (see PortraitOrb), 1200×606. */
const ORB_ASPECT = 1200 / 606;

/** The orb slide, top down (owner, 2026-10-03; reordered 2026-10-04): the name,
 *  its top 10% of the height off the top (20% until 2026-10-05, when the owner
 *  asked for the three to sit higher and closer together); the orb, BIG,
 *  under it, 20% of the width off each side; and PORTFOLIO / 2026 at the
 *  foot. (The tools stood between the orb and the mark until 2026-10-10.) (The name sat under the orb until
 *  2026-10-04.)
 *  ⚠ The orb stopped sitting on the brain's seam then — it is placed by these
 *  margins now, and flies off before the brain is up behind it anyway.
 *  ⚠ The side margins are a target, not a promise: on a screen too short for
 *  the whole stack (16:9 laptops) the orb shrinks until it clears the mark,
 *  and its sides grow past 20%. Portrait phones keep it near the full
 *  width — 20% each side would make it smaller than it was, not bigger. */
const ORB_TOP = 0.1;
const ORB_SIDE = 0.2;
/** The least room between the orb and the mark waiting at the foot. */
const CAPTION_CLEAR = 28;

/** The black band along the foot, as a share of the stage's height — the
 *  FIXED band since 2026-10-11 (FootBand, BAND_SVH); keep the two in step. */
const BAND_H = 0.07;

/** The PORTFOLIO / 2026 mark: full size at the top of the brain slide (where
 *  the wordmark always stood), HALF size at the foot of the orb slide, sitting
 *  on the band (owner, 2026-10-03). It travels between the two with the
 *  camera.
 *  ⚠ The Flythrough stands its scroll cue on the same foot over the orb slide
 *  (bottom: 7% + 14px); change one, change both. */
const MARK_TOP = 0.032;
const MARK_SMALL = 0.5;
const MARK_GAP_BELOW = 14;

/** ⚠ Split from SITE.name rather than hard-coded, the same way SiteFooter does
 *  it — the two halves take different faces, so they cannot be one string. */
const [NAME_FIRST, ...NAME_REST] = SITE.name.split(" ");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The stage's own size, from layout — never from a screen box, which would
 *  include the flight's scale. */
function useStageSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** An element's layout height (transforms ignored), kept current. */
function useLayoutHeight(ref: React.RefObject<HTMLElement | null>) {
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setH(el.offsetHeight);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

export function HeroStage() {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past.
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion() ?? false;
  const tallCompact = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  const centreScale = tallCompact ? CENTER_SCALE_PHONE : CENTER_SCALE;
  // Where the band's facts tab stands at the foot's centre (FactsTab: `lg`,
  // and not on a short screen — see .facts-tab).
  const factsTab = useMediaQuery("(min-width: 1024px) and (min-height: 501px)");

  // The camera. Outside a Flythrough (never, today) the stage rests on the brain.
  const flight = useFlight();
  const restOnBrain = useMotionValue(1);
  const p = flight?.p ?? restOnBrain;
  const current = flight?.current ?? 1;

  /* ⚠ THE FIRST STEP SCROLLS, IT DOES NOT FLY (owner, 2026-10-04): from the
     orb slide to the brain the whole stage moves DOWN the page — the orb
     slide rides up and out of the top while the brain slide rises from below
     into place, and the PORTFOLIO mark climbs with it, growing (markY,
     markScale). Past p = 1 the brain layer stands still in the slide: the
     Flythrough carries the whole landing off across the plane (2026-10-10 —
     it flew through the depth on brainDepth until then).
     For reduced motion it is a cross-fade instead of a slide. */
  const orbY = useTransform(p, (v) => (reduceMotion ? "0%" : `${-clamp01(v) * 100}%`));
  const orbOpacity = useTransform(p, (v) => (reduceMotion ? 1 - clamp01(v) : v >= 1 ? 0 : 1));
  const orbVisibility = useTransform(orbOpacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  const brainY = useTransform(p, (v) => (reduceMotion ? "0%" : `${(1 - clamp01(v)) * 100}%`));
  const brainOpacity = useTransform(p, (v) => (v < 1 ? (reduceMotion ? clamp01(v) : v > 0.001 ? 1 : 0) : 1));
  const brainVisibility = useTransform(brainOpacity, (o) => (o < 0.01 ? "hidden" : "visible"));
  const onOrb = current === 0;
  const onBrain = current === 1;

  const size = useStageSize(ref);

  // The PORTFOLIO mark's full height, and the name over the orb — both from
  // layout, so neither is guessed.
  const markRef = useRef<HTMLDivElement>(null);
  const markH = useLayoutHeight(markRef);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const captionH = useLayoutHeight(nameRef);

  // The orb slide's foot: the mark at half size, sitting on the band — or on
  // the facts tab rising out of its middle, where there is one (2026-10-11).
  const markFoot = size ? size.h * (1 - BAND_H) - MARK_GAP_BELOW - (factsTab ? FACTS_RISE : 0) : 0;
  const markTopSmall = markFoot - MARK_SMALL * markH;

  // The orb: 20% in from each side (nearly the full width on a portrait
  // phone), unless the stack (name, orb) would then run into the mark.
  const orbW = size
    ? Math.max(
        0,
        Math.min(
          // (Capped at 720px — a portrait tablet's width, 2026-10-11; it was 460,
          // which left the orb small on a tablet.)
          tallCompact ? Math.min(size.w * 0.94, 720) : size.w * (1 - 2 * ORB_SIDE),
          (markTopSmall - CAPTION_CLEAR - captionH - size.h * ORB_TOP) * ORB_ASPECT,
        ),
      )
    : 0;
  // The stack's top: ORB_TOP at least, and otherwise centred in the room over
  // the mark — on a portrait phone the orb is held by the width, and the stack
  // would sit up top over an empty half-screen (2026-10-11).
  const stackTop = size
    ? Math.max(size.h * ORB_TOP, (markTopSmall - CAPTION_CLEAR - captionH - orbW / ORB_ASPECT) / 2)
    : 0;

  // The mark rides the camera from the foot (half size) to the top (full).
  // ⚠ Its drop is a motion value, not a closure, so a resize reaches it.
  const markDrop = useMotionValue(0);
  useLayoutEffect(() => {
    if (size) markDrop.set(markTopSmall - size.h * MARK_TOP);
  }, [size, markTopSmall, markDrop]);
  const markY = useTransform([p, markDrop], ([v, drop]: number[]) => drop * (1 - clamp01(v)));
  const markScale = useTransform(p, (v) => MARK_SMALL + (1 - MARK_SMALL) * clamp01(v));
  // Shown only once its drop is in — derived in the same frame as markY, so
  // it can never paint a frame at the top before it reaches the foot.
  const markShown = useTransform(markDrop, (d) => (d > 0 ? "visible" : "hidden"));

  // The brain turns with the pointer while the landing is on screen, and
  // rests once the camera is in the rooms. (Until 2026-10-10 it kept turning
  // there for BrainDock, which lifted a live copy of it off this slide; the
  // rooms' circles hold stills now, and this brain leaves with its slide.)
  const zone = flight?.zone ?? "landing";

  return (
    <section
      ref={ref}
      aria-label="Landing"
      // ⚠ No minimum height (560/640px until 2026-10-11): the Flythrough's
      // stage is exactly one screen and clips, so on a landscape phone a
      // taller landing simply lost its foot — the band and the mark.
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Circuit board texture — under everything. */}
      <CircuitBackdrop />

      {/* The black band along the foot is no longer the landing's: since
          2026-10-11 it is FIXED along the foot of the whole home page
          (FootBand, rendered by the Flythrough), and everything here that
          stands on the foot clears it (BAND_H). */}

      {/* The corner lattices — all four corners since 2026-10-03 (owner),
          common to both slides, and UNDER the brain's layer so the pins on
          both arcs read over them. */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.35 }}
        className="pointer-events-none absolute inset-0 z-[4] hidden lg:block"
      >
        <Corner3DGrid corner="tl" />
        <Corner3DGrid corner="bl" />
        <Corner3DGrid corner="tr" />
        <Corner3DGrid corner="br" />
      </motion.div>

      {/* ── Slide 1: the brain, its pins and lines, and the facts. Waits in
          the depth behind the orb, and comes up as the orb goes by. */}
      <motion.div
        aria-hidden={!onBrain}
        inert={!onBrain}
        className="absolute inset-0 z-[5]"
        style={{
          y: brainY,
          opacity: brainOpacity,
          visibility: brainVisibility,
          pointerEvents: onBrain ? "auto" : "none",
        }}
      >
        {/* The pins' runs into the brain. ⚠ HERE, immediately before the
            footage and with no z-index, so the brain paints OVER the last
            stretch of each line — that is how they end "behind" it. It is
            handed the footage's own resting transform so it can find the
            brain. */}
        <BrainTraces scale={CENTER_SCALE} shiftX={BRAIN_SHIFT_X} rise={BRAIN_RISE} />

        {/* Left brain / Right brain — on this slide only (owner, 2026-10-03).
            ⚠ ALSO before the footage: its LINES carry no z-index, so the brain
            paints over them and they leave from behind it; its TEXT is z-30,
            over everything. See LeftRightBrain. */}
        <LeftRightBrain brain={{ scale: centreScale, shiftX: BRAIN_SHIFT_X, rise: BRAIN_RISE }} />

        {/* The footage — settles in on mount. */}
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{
            opacity: 1,
            scale: centreScale,
            x: BRAIN_SHIFT_X,
            y: BRAIN_RISE,
            originX: 0.5,
            originY: 0.5,
          }}
          transition={{
            opacity: { duration: DURATION.verySlow, ease: EASE_OUT },
            scale: { duration: reduceMotion ? 0 : DURATION.verySlow, ease: EASE_IN_OUT },
          }}
        >
          <BrainSequence active={inView && zone === "landing"} />
        </motion.div>

        {/* The sections, annotated onto the brain. */}
        <BrainPins />

        {/* The facts' tab stood here, under the brain, until 2026-10-11: it
            is part of the fixed band now (FootBand, FactsTab). */}
      </motion.div>

      {/* ── Slide 0: the name and the portrait orb (owner, 2026-10-03; the
          name moved over the orb 2026-10-04, the tools out to My Stack
          2026-10-10) — one centred
          column, its top 10% down (see ORB_TOP) or lower, centred over the
          mark where the orb leaves room (stackTop). The mark at the foot is
          common to both slides, below. */}
      <motion.div
        aria-hidden={!onOrb}
        inert={!onOrb}
        className="absolute inset-0 z-[6]"
        style={{
          y: orbY,
          opacity: orbOpacity,
          visibility: orbVisibility,
          pointerEvents: onOrb ? "auto" : "none",
        }}
      >
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: size ? stackTop : `${ORB_TOP * 100}%` }}
        >
          {/* Shrey Singh / Designer, over the orb, the two lines centred
              (owner, 2026-10-05).
              ⚠ The name is in DIGIBRA, the PORTFOLIO mark's face (owner,
              2026-10-05), in CAPITALS, and since 2026-10-11 in ONE weight —
              both words Light (.digibra-light; "SHREY" was Black until then)
              — at EXACTLY the PORTFOLIO mark's size on the brain slide
              (owner: "font size of Shrey Singh on slide 1 should be same as
              font size of portfolio on slide 2"). Change one, change both.
              "Designer" stays Helvetica. Only a hair under it: the paint runs
              to the orb frame's very top edge here. */}
          <p ref={nameRef} className="pointer-events-none flex flex-col items-center whitespace-nowrap pb-1 leading-none">
            <span className="face-logic digibra-light text-[clamp(1.9rem,4.6vw,4rem)] uppercase leading-none text-neutral-900">
              {NAME_FIRST} {NAME_REST.join(" ")}
            </span>
            <span className="mt-1 text-[clamp(0.84375rem,1.5625vw,1.40625rem)] font-normal leading-none tracking-[0.02em] text-neutral-500">
              {SITE.title}
            </span>
          </p>

          {orbW > 0 && (
            <motion.div
              style={{ width: orbW }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.verySlow, ease: EASE_OUT }}
            >
              <PortraitOrb />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Common, in front of both slides. */}

      {/* PORTFOLIO / 2026. At rest it is the brain slide's top line, top
          centre; on the orb slide it waits at the foot at half size, and the
          first scroll carries it up and grows it into place (markY,
          markScale — scaled from its top centre, so its resting box IS the
          brain slide's). Hidden until measured, so it never shows in the
          wrong place first.
          ⚠ Deliberately NOT a heading: the stage already has one h1
          (LeftRightBrain's, on the brain slide), and a second would compete
          with it for what is a wordmark.
          ⚠ Full size is TWICE the old size (owner, 2026-10-03; 3× was too
          big). LeftRightBrain's compact headlines are placed under it by the
          same numbers; change one, change both. */}
      <motion.div
        ref={markRef}
        className="pointer-events-none absolute inset-x-0 top-[3.2%] z-30 flex justify-center"
        style={{ y: markY, scale: markScale, originX: 0.5, originY: 0, visibility: markShown }}
      >
        <p className="flex flex-col items-end leading-none">
          {/* ⚠ The name over the orb takes this size (owner, 2026-10-11). */}
          <span className="face-logic text-[clamp(1.9rem,4.6vw,4rem)] font-bold leading-none tracking-[0.22em] text-neutral-900">
            PORTFOLIO
          </span>
          <span className="face-logic mt-1 text-[clamp(1rem,2vw,1.6rem)] font-bold leading-none tracking-[0.14em] text-neutral-500">
            {SITE.edition}
          </span>
        </p>
      </motion.div>

      {/* The code windows — desktop only. ⚠ HALF SIZE since 2026-10-03
          (owner): one transform on the mount, so width, type and line height
          all halve together. It clears the pins' connector band, which owns
          0–6vw down the left flank. */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.35 }}
        className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
      >
        <div className="absolute left-[8vw] top-5 origin-top-left scale-50">
          <CodeStream />
        </div>
        {/* …and its mirror on the creative side (owner, 2026-10-04): the same
            window, right-aligned, typing ideas — art, the Extincts, movies,
            music — in colour. */}
        <div className="absolute right-[8vw] top-5 origin-top-right scale-50">
          <CodeStream variant="ideas" />
        </div>
      </motion.div>
    </section>
  );
}
