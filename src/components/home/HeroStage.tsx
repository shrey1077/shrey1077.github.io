"use client";

/**
 * HeroStage — the full-viewport landing.
 *
 * The brain rests on its calibrated middle frame, mouse-scrubbable. The name is
 * stacked on it ("Shrey" on the crown, "Singh" at the base). Around it:
 *   • top-left   — a code window (logic).
 *   • top-right  — was the ECard; parked 2026-08-09, see below.
 *   • right      — the right brain's thought box.
 *   • bottom-left  — the about-me facts (logic).
 *   • bottom-right — the hobbies (creative).
 *   • the two left corners — faint 3D lattices.
 *
 * There is no click-to-choose pose machine — the sections live below, in
 * SidesShowcase, revealed by scrolling. Desktop only for now.
 */

import { motion, useReducedMotion } from "framer-motion";
import { BrainSequence } from "@/components/home/BrainSequence";
import { HeroName } from "@/components/home/HeroName";
import { CodeStream } from "@/components/home/CodeStream";
import { AboutFacts } from "@/components/home/AboutFacts";
import { HobbiesRotator } from "@/components/home/HobbiesRotator";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { ThoughtBox } from "@/components/home/ThoughtBox";
import { PortraitOrb } from "@/components/home/PortraitOrb";
import { BrainPins } from "@/components/home/BrainPins";
import { useIsPhone } from "@/hooks/useMediaQuery";

/** The landing brain read too large at 1:1 — sit it back a quarter, then a
 *  further tenth (2026-08-10) to give the words and pins more room, then 5%
 *  back up (2026-08-10, after the paint film came off the right flank and left
 *  the stage emptier).
 *  On a phone the opposite is true: the footage is landscape and `object-contain`
 *  fits it to the WIDTH of a portrait viewport, so at 0.75 the brain shrinks to a
 *  thumbnail in a mostly-empty screen. Push it back up past 1 instead — the
 *  footage carries plenty of margin, so nothing important crops.
 *  Both are the same 5% up, so each keeps the ratio it was tuned to. */
const CENTER_SCALE = 0.70875; // 0.675 × 1.05
const CENTER_SCALE_PHONE = 1.37025; // 1.305 × 1.05

export function HeroStage() {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past.
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion();
  const isPhone = useIsPhone();
  const centreScale = isPhone ? CENTER_SCALE_PHONE : CENTER_SCALE;

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

      {/* The black footing. Runs the FULL width — it started as a mask under
          the brain artwork on the left and carries across the right flank so
          the stage closes on one band rather than half of one. It sits above
          the circuit backdrop and below everything else, so the words, the
          pins and the corner furniture all read on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[7%] bg-neutral-950"
      />

      {/* The name — BEFORE the footage in the DOM (no positive z-index), so the
          brain crosses in FRONT of the letters. */}
      <HeroName />

      {/* Video background — settles in on mount. */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1, scale: centreScale, originX: 0.5, originY: 0.5 }}
        transition={{
          opacity: { duration: DURATION.verySlow, ease: EASE_OUT },
          scale: { duration: reduceMotion ? 0 : DURATION.verySlow, ease: EASE_IN_OUT },
        }}
      >
        <BrainSequence active={inView} />
      </motion.div>

      {/* The ECard (IdentityHeader) sat here until 2026-08-09 — parked at the
          owner's request. Re-mount with <IdentityHeader /> to bring it back. */}

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
        <div className="absolute left-[8vw] top-5">
          <CodeStream />
        </div>

        {/* The creative mirror of the code window. Sits above the section
            artwork, which was moved down (COL.creative.top in BrainPins) to
            clear it. */}
        <div className="absolute right-[6vw] top-5">
          <ThoughtBox />
        </div>
        <div className="absolute bottom-[9vh] left-[8vw]">
          <AboutFacts />
        </div>

        {/* The owner, split down the middle and following the pointer. Centred
            under the brain, hung so the artwork's lower reach stops at the top
            of the black footing band.
            ⚠ It does NOT overlap the band any more, and that is deliberate.
            The ring artwork is far taller than the bare circle was (the disc is
            only 36% of the frame's width, the rest is tracery and splatter), so
            sitting the circle on the line would push ~120px of artwork below
            the stage floor — and the line ring's tracery is BLACK, which would
            vanish against the band anyway. */}
        <div className="pointer-events-none absolute bottom-[7%] left-1/2 w-[clamp(20rem,34vw,29rem)] -translate-x-1/2">
          <PortraitOrb />
        </div>

        {/* The hand-drawn bubbles sat here until 2026-08-10. Removed once the
            film went full strength — the corner belongs to the artwork now.
            SpeechBubbles is kept, unmounted, for if they come back. */}
        {/* Tagged because HeroName clamps Imagine's descender above whatever
            sits in this corner — it measures this box rather than assuming a
            height, so moving the rotator moves the word's floor with it. */}
        <div
          data-hero-furniture="right-bottom"
          className="absolute bottom-[9vh] right-10 flex justify-end"
        >
          <HobbiesRotator />
        </div>

        {/* The four corner aphorisms ("measure twice" and friends) were removed
            2026-08-10. The right-hand pair is to be replaced by the animated
            speech bubbles; CornerText itself is kept for that. */}
      </motion.div>
    </section>
  );
}
