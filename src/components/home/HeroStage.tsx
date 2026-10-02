"use client";

/**
 * HeroStage — the full-viewport landing.
 *
 * The brain rests on its calibrated middle frame, mouse-scrubbable. The name is
 * stacked on it ("Shrey" on the crown, "Singh" at the base). Around it:
 *   • top-left   — a code window (logic).
 *   • top-right  — was the ECard; removed 2026-08-09, see below.
 *   • right      — was the thought box; removed with it.
 *   • bottom-left  — the about-me facts (logic).
 *   • bottom-right — the hobbies (creative).
 *   • the two left corners — faint 3D lattices.
 *
 * There is no click-to-choose pose machine — the sections are the PINS either
 * side of the brain, and clicking one flies the camera to that section's slide
 * in the Flythrough this stage is slide 0 of (2026-10-02).
 * ⚠ This used to say the sections lived in `SidesShowcase`, revealed by
 * scrolling. That component was never wired into a route and was deleted
 * 2026-09-10; the pins have been the way in for a long time.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BrainSequence } from "@/components/home/BrainSequence";
import { LeftRightBrain } from "@/components/home/LeftRightBrain";
import { CodeStream } from "@/components/home/CodeStream";
import { AboutFacts } from "@/components/home/AboutFacts";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { BrainPins, PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { BrainTraces } from "@/components/home/BrainTraces";
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

/** The brain sits a little high of dead centre (2026-08-17), to open up the
 *  band beneath it where the portrait orb now lives.
 *  ⚠ NOT free to change: LeftRightBrain and BrainTraces both map frame points
 *  onto the stage through this, BRAIN_SHIFT_X and the centre scale. */
const BRAIN_RISE = -34; // px

/** …and a touch right, so the brain's own grey/colour division lines up with
 *  the portrait orb's seam directly beneath it.
 *  ⚠ MEASURED, not judged by eye: the boundary was sampled off the brain
 *  canvas across four scanlines (587, 591, 594, 595 — it leans slightly) and
 *  its median sat at x=594 against the orb's seam at x=621. Re-measure if the
 *  orb's width or the brain's scale changes; both move this. */
const BRAIN_SHIFT_X = 27; // px

/** ⚠ Split from SITE.name rather than hard-coded, the same way SiteFooter does
 *  it — the two halves take different faces, so they cannot be one string. */
const [NAME_FIRST, ...NAME_REST] = SITE.name.split(" ");

export function HeroStage() {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past.
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion();
  const tallCompact = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  const centreScale = tallCompact ? CENTER_SCALE_PHONE : CENTER_SCALE;

  /* Which section is open, for the footing band. ⚠ Read off the same
     PIN_OPEN_EVENT bus the pins and SectionNav already publish on, rather than
     lifting state — the band is the third listener, not a new source of truth,
     so it cannot disagree with what is actually open. */
  const [openId, setOpenId] = useState<NavSectionId | null>(null);
  useEffect(() => {
    const onPin = (e: Event) => setOpenId((e as CustomEvent<NavSectionId | null>).detail);
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);
  const openLabel = openId ? NAV_SECTIONS.find((n) => n.id === openId)?.label : null;

  return (
    <section
      ref={ref}
      aria-label="Landing"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden sm:min-h-[640px]"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Circuit board texture — sits above the section background, below the brain video. */}
      <CircuitBackdrop />

      {/* The paint-explosion film sat here as the right flank's ground until
          2026-08-10 — pulled off the landing and reused behind the Art
          section's previews (SectionPanel). */}

      {/* PORTFOLIO / Shrey Singh, top centre and above the footage. The second
          line was the year, 2026, until the owner swapped in the name
          (2026-10-03).
          ⚠ Deliberately NOT a heading. The stage already has one h1 ("Think.
          Imagine."), and a second heading here would compete with it in the
          document outline for what is a wordmark, not a section title.
          The name is right-aligned to the word — `items-end` on the column, so
          the alignment holds at every size rather than being nudged by hand.
          ⚠ TWICE the old size (owner, 2026-10-03; 3× was tried and was too
          big): every term of the old clamp doubled, word and year alike. It
          fits at every width as-is — measured clear of the code box and the
          top-right pins from 1024 up, and ~280px wide on a 375px phone.
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

      {/* The black footing. Runs the FULL width — it started as a mask under
          the brain artwork on the left and carries across the right flank so
          the stage closes on one band rather than half of one. It sits above
          the circuit backdrop and below everything else, so the words, the
          pins and the corner furniture all read on top of it.
          It now also carries the wordmark, centred — so it is no longer
          `aria-hidden`: it holds real content. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 grid h-[7%] place-items-center bg-neutral-950">
        {/* ⚠ THE BAND ANSWERS THE PAGE. At rest it carries the wordmark; the
            moment a section is open it carries that section's title instead,
            in Digibra — the owner's instruction, 2026-08-25. The name is not
            deleted, it is the resting state, so the band is never empty.
            The two name halves take the two hemisphere faces, the same split
            the landing and the footer both make. */}
        <p
          key={openLabel ?? "wordmark"}
          className="flex items-baseline gap-[0.3em] text-[clamp(0.7rem,1.5vw,1.15rem)] leading-none"
        >
          {openLabel ? (
            <span className="font-digibra font-bold tracking-[0.16em] text-white">
              {openLabel}
            </span>
          ) : (
            <>
              <span className="font-digibra font-bold tracking-[0.12em] text-white">
                {NAME_FIRST}
              </span>
              <span className="font-graff font-bold tracking-[0.02em] text-white">
                {NAME_REST.join(" ")}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Left brain / Right brain — the two voices either side of the brain,
          brought forward by the pointer (2026-10-02; THINK / imagine before).
          z-30 of its own, so its lines draw over the footage from the brain's
          centre. */}
      <LeftRightBrain brain={{ scale: centreScale, shiftX: BRAIN_SHIFT_X, rise: BRAIN_RISE }} />

      {/* The logic pins' runs into the brain. ⚠ HERE, immediately before the
          footage and with no z-index, so the brain paints OVER the last stretch
          of each line — that is how they end "behind" it. Moving this after the
          footage, or into BrainPins (z-20), puts the ends on top. It is handed
          the footage's own resting transform so it can find the brain. */}
      <BrainTraces
        scale={CENTER_SCALE}
        shiftX={BRAIN_SHIFT_X}
        rise={BRAIN_RISE}
      />

      {/* Video background — settles in on mount. */}
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
        <BrainSequence active={inView} />
      </motion.div>

      {/* The ECard (IdentityHeader) sat here until 2026-08-09, parked at the
          owner's request, and both components were deleted 2026-09-10 as
          unreachable. ⚠ This used to say "re-mount with <IdentityHeader />",
          which no longer works — recover the pair from git history first. */}

      {/* The sections, annotated onto the brain. Real navigation, so it sits
          outside the aria-hidden furniture block below. */}
      <BrainPins />

      {/* The landing furniture — desktop only. */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.35 }}
        className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
      >
        <Corner3DGrid corner="tl" />
        <Corner3DGrid corner="bl" />

        {/* Logic side (left). Both of these clear the pins' connector band,
            which owns 0–6vw down the whole left flank: at left-5 the code ran
            straight through the four hairlines, and the facts sat under their
            tails. */}
        {/* ⚠ HALF SIZE since 2026-10-03 (owner). One transform on the mount,
            not re-typed sizes inside, so width, type and line height all halve
            together and the box keeps its proportions. */}
        <div className="absolute left-[8vw] top-5 origin-top-left scale-50">
          <CodeStream />
        </div>

        {/* ⚠ ThoughtBox stood here — the creative mirror of the code window —
            and was removed on 2026-08-21 by the owner's instruction. The
            component file was deleted 2026-09-10; git history has it.
            The right pins' offset that cleared it is gone too: since
            2026-09-17 both columns share one set of rows (BrainPins ROW_TOP). */}
        {/* The facts — Chess, Education, Part-time and Hobbies as ONE
            section, centred under the brain just above the black band, and
            smaller (owner, 2026-10-03 — it sat bottom-right in the same size
            for an hour first, until the creative pins took that corner back).
            ⚠ Smaller by ONE transform, origin bottom, so every size inside
            (heading, number, marks, the cycling words) comes down together and
            the block stays anchored to the band as its height changes from
            fact to fact. Below `lg` this whole layer is hidden and the footer
            carries the section instead. */}
        <div className="absolute bottom-[8.2vh] left-1/2 w-[28rem] -translate-x-1/2">
          <div className="origin-bottom scale-[0.6]">
            <AboutFacts align="center" />
          </div>
        </div>

        {/* The portrait orb lived here until 2026-08-17 — centred under the
            brain, over the footing band. It moved to SiteFooter at the
            owner's request. The brain's BRAIN_SHIFT_X above was measured to
            line its grey/colour division up with that orb's seam, so it no
            longer has anything beneath it to agree with; left as-is rather
            than reverted, because the shift also reads fine on its own. */}

        {/* The hand-drawn bubbles sat here until 2026-08-10. Removed once the
            film went full strength — the corner belongs to the artwork now.
            SpeechBubbles was deleted 2026-09-10; git history has it. */}
        {/* The four corner aphorisms ("measure twice" and friends) were removed
            2026-08-10. The right-hand pair is to be replaced by the animated
            speech bubbles; CornerText itself is kept for that. */}
      </motion.div>
    </section>
  );
}
