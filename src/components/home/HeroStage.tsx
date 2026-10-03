"use client";

/**
 * HeroStage — the landing, as TWO slides of the Flythrough (2026-10-03, owner).
 *
 *   slide 0  the portrait orb and the tools — moved up from the footer, the
 *            orb still following the pointer;
 *   slide 1  the brain, with its pins on two arcs round it, the pins'
 *            circuit and pencil lines, the two voices (Left brain / Right
 *            brain) between the brain and the arcs, and the facts (Chess,
 *            Education, Part-time, Hobbies) under it.
 * The first scroll flies the orb past the camera and brings the brain up out
 * of the depth behind it, by the same numbers every room flies by (flight.ts).
 *
 * Common to both, standing still while the two trade places, then flying off
 * together on the next scroll:
 *   · the PORTFOLIO / Shrey Singh wordmark, top centre;
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

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { BrainSequence } from "@/components/home/BrainSequence";
import { LeftRightBrain } from "@/components/home/LeftRightBrain";
import { CodeStream } from "@/components/home/CodeStream";
import { AboutFacts } from "@/components/home/AboutFacts";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { PortraitOrb } from "@/components/home/PortraitOrb";
import { ToolLogos } from "@/components/home/ToolLogos";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { BrainPins, PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { BRAIN_CENTRE, BrainTraces, toStage } from "@/components/home/BrainTraces";
import { HERO_SLIDES, PERSPECTIVE, useDepth, useFlight } from "@/components/home/flight";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SITE } from "@/constants/site";
import { NAV_SECTIONS } from "@/constants/navigation";
import type { NavSectionId } from "@/types/navigation";

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
 *  its median sat at x=594 against the orb's seam at x=621. Since 2026-10-03
 *  the orb is placed ON the brain's seam (slide 0 → 1), so the two agree by
 *  construction wherever this goes. */
const BRAIN_SHIFT_X = 27; // px

/** The footage's resting transform, for BrainDock, which lifts the brain off
 *  this exact spot when the camera leaves for the rooms. */
export const BRAIN_POSE = {
  scale: CENTER_SCALE,
  scalePhone: CENTER_SCALE_PHONE,
  shiftX: BRAIN_SHIFT_X,
  rise: BRAIN_RISE,
} as const;

/** Where the orb's DISC sits inside its frame, as fractions of the frame (see
 *  PortraitOrb: the disc spans 29.86–63.62% of the width, centred on 46.74%;
 *  the frame is 1200×606). The frame is mostly tracery and splatter, so it is
 *  the disc that is put on the brain's seam, not the frame's middle. */
const ORB_ASPECT = 1200 / 606;
const ORB_DISC_X = 0.4674;
/** Portrait phones: what the tools need under the orb (the gap, the label,
 *  up to two rows of marks), and how far above the 8.5% line they must stop
 *  to clear the Flythrough's "Scroll to explore" cue that stands there. */
const PHONE_TOOLS_H = 96;
const PHONE_CUE_CLEAR = 48;

/** ⚠ Split from SITE.name rather than hard-coded, the same way SiteFooter does
 *  it — the two halves take different faces, so they cannot be one string. */
const [NAME_FIRST, ...NAME_REST] = SITE.name.split(" ");

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

export function HeroStage() {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past.
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion() ?? false;
  const tallCompact = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  const centreScale = tallCompact ? CENTER_SCALE_PHONE : CENTER_SCALE;

  // The camera. Outside a Flythrough (never, today) the stage rests on the brain.
  const flight = useFlight();
  const restOnBrain = useMotionValue(1);
  const p = flight?.p ?? restOnBrain;
  const current = flight?.current ?? 1;
  const orbDepth = useDepth(p, 0, reduceMotion);
  const brainDepth = useDepth(p, 1, reduceMotion);
  const onOrb = current === 0;
  const onBrain = current === 1;

  const size = useStageSize(ref);
  const seam = size
    ? toStage(BRAIN_CENTRE.x, BRAIN_CENTRE.y, size.w, size.h, centreScale, BRAIN_SHIFT_X, BRAIN_RISE)
    : null;
  // The orb: up to 40% of the width (the middle the two voices leave free),
  // never taller than ~42% of the stage; on a portrait phone, nearly the width
  // — unless the screen is short, when the tools under it would run into the
  // scroll cue (8.5% off the foot): then it shrinks until they clear it.
  const orbW =
    size && seam
      ? tallCompact
        ? Math.min(
            size.w * 0.94,
            460,
            2 * (size.h * (1 - 0.085) - PHONE_CUE_CLEAR - PHONE_TOOLS_H - seam.y) * ORB_ASPECT,
          )
        : Math.min(Math.max(size.w * 0.4, 288), 608, size.h * 0.42 * ORB_ASPECT)
      : 0;
  const orbH = orbW / ORB_ASPECT;

  /* Which section is open, for the footing band. ⚠ Read off the same
     PIN_OPEN_EVENT bus the pins already publish on, rather than lifting state
     — the band is a listener, not a new source of truth, so it cannot
     disagree with what is actually open. */
  const [openId, setOpenId] = useState<NavSectionId | null>(null);
  useEffect(() => {
    const onPin = (e: Event) => setOpenId((e as CustomEvent<NavSectionId | null>).detail);
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);
  const openLabel = openId ? NAV_SECTIONS.find((n) => n.id === openId)?.label : null;

  // The brain's sequence runs through the whole flight: past the landing
  // nobody sees it here, but BrainDock shows a live copy of it beside every
  // room, rocking toward that room's side.
  const zone = flight?.zone ?? "landing";
  const brainMode = zone === "logic" ? "left" : zone === "creative" ? "right" : "pointer";
  // …and this one steps aside the instant the camera leaves the brain slide:
  // from there the dock carries the same picture, from the same spot.
  const footageShown = useTransform(p, (v) => (v > HERO_SLIDES - 1 + 1e-4 ? 0 : 1));

  return (
    <section
      ref={ref}
      aria-label="Landing"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden sm:min-h-[640px]"
      // ⚠ Its own perspective: the orb and the brain fly INSIDE this slide,
      // and a perspective only reaches an element's direct children.
      style={{ backgroundColor: "transparent", perspective: PERSPECTIVE }}
    >
      {/* Circuit board texture — under everything. */}
      <CircuitBackdrop />

      {/* The black footing. Runs the FULL width, under everything else, so the
          words, the pins and the corner furniture all read on top of it. It
          carries the name — or, while a section is open, that section's
          title, in Digibra (owner, 2026-08-25) — so it is not `aria-hidden`. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 grid h-[7%] place-items-center bg-neutral-950">
        <p
          key={openLabel ?? "wordmark"}
          className="flex items-baseline gap-[0.3em] text-[clamp(0.7rem,1.5vw,1.15rem)] leading-none"
        >
          {openLabel ? (
            <span className="font-digibra font-bold tracking-[0.16em] text-white">{openLabel}</span>
          ) : (
            <>
              <span className="font-digibra font-bold tracking-[0.12em] text-white">{NAME_FIRST}</span>
              <span className="font-graff font-bold tracking-[0.02em] text-white">{NAME_REST.join(" ")}</span>
            </>
          )}
        </p>
      </div>

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
          z: brainDepth.z,
          opacity: brainDepth.opacity,
          visibility: brainDepth.visibility,
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

        {/* The footage — settles in on mount. Handed to BrainDock as the
            camera leaves (footageShown). */}
        <motion.div className="absolute inset-0" style={{ opacity: footageShown }}>
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
          <BrainSequence active={inView} mode={brainMode} />
        </motion.div>
        </motion.div>

        {/* The sections, annotated onto the brain. */}
        <BrainPins />

        {/* The facts — Chess, Education, Part-time and Hobbies as ONE section,
            centred under the brain just above the black band, and smaller
            (owner, 2026-10-03). ⚠ Smaller by ONE transform, origin bottom, so
            every size inside comes down together and the block stays anchored
            to the band as its height changes from fact to fact. Desktop only:
            below `lg` the footer carries them. */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[8.2vh] left-1/2 hidden w-[28rem] -translate-x-1/2 lg:block"
        >
          <div className="origin-bottom scale-[0.6]">
            <AboutFacts align="center" />
          </div>
        </div>
      </motion.div>

      {/* ── Slide 0: the portrait orb and the tools (moved up from the footer,
          owner 2026-10-03). The orb's DISC is put on the brain's seam, so the
          voices' lines leave from its centre here and from the brain's on the
          next slide, and the brain comes up exactly behind it. */}
      <motion.div
        aria-hidden={!onOrb}
        inert={!onOrb}
        className="absolute inset-0 z-[6]"
        style={{
          z: orbDepth.z,
          opacity: orbDepth.opacity,
          visibility: orbDepth.visibility,
          pointerEvents: onOrb ? "auto" : "none",
        }}
      >
        {seam && orbW > 0 && (
          <>
            <motion.div
              className="absolute"
              style={{ left: seam.x - orbW * ORB_DISC_X, top: seam.y - orbH / 2, width: orbW }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.verySlow, ease: EASE_OUT }}
            >
              <PortraitOrb />
            </motion.div>
            <div
              className="font-graff absolute flex w-[min(92vw,46rem)] -translate-x-1/2 flex-col items-center gap-3"
              style={{ left: seam.x, top: seam.y + orbH / 2 + (tallCompact ? 18 : 26) }}
            >
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-neutral-900">Tools</p>
              <ToolLogos height={tallCompact ? 18 : 22} className="justify-center gap-x-6 gap-y-3" />
            </div>
          </>
        )}
      </motion.div>

      {/* ── Common, in front of both slides. */}

      {/* PORTFOLIO / Shrey Singh, top centre. ⚠ Deliberately NOT a heading:
          the stage already has one h1 (LeftRightBrain's, on the brain slide),
          and a second would compete with it for what is a wordmark.
          ⚠ TWICE the old size (owner, 2026-10-03; 3× was too big).
          LeftRightBrain's compact headlines are placed under it by the same
          numbers; change one, change both. */}
      <div className="pointer-events-none absolute inset-x-0 top-[3.2%] z-30 flex justify-center">
        <p className="flex flex-col items-end leading-none">
          <span className="font-digibra text-[clamp(1.9rem,4.6vw,4rem)] font-bold leading-none tracking-[0.22em] text-neutral-900">
            PORTFOLIO
          </span>
          <span className="font-graff mt-1 text-[clamp(1rem,2vw,1.6rem)] font-bold tracking-[0.14em] text-neutral-500">
            {SITE.name}
          </span>
        </p>
      </div>

      {/* The code window — desktop only. ⚠ HALF SIZE since 2026-10-03
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
      </motion.div>
    </section>
  );
}
