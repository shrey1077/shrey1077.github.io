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
import { SpeechBubbles } from "@/components/home/SpeechBubbles";
import { HobbiesRotator } from "@/components/home/HobbiesRotator";
import { Corner3DGrid } from "@/components/home/Corner3DGrid";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { BrainPins } from "@/components/home/BrainPins";
import { useIsPhone } from "@/hooks/useMediaQuery";

/** The landing brain read too large at 1:1 — sit it back a quarter, then a
 *  further tenth (2026-08-10) to give the words and pins more room.
 *  On a phone the opposite is true: the footage is landscape and `object-contain`
 *  fits it to the WIDTH of a portrait viewport, so at 0.75 the brain shrinks to a
 *  thumbnail in a mostly-empty screen. Push it back up past 1 instead — the
 *  footage carries plenty of margin, so nothing important crops. */
const CENTER_SCALE = 0.675;
const CENTER_SCALE_PHONE = 1.305;

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

        {/* Logic side (left) — code below the top-left profile card. */}
        <div className="absolute left-10 top-[29%]">
          <CodeStream />
        </div>
        <div className="absolute bottom-[9vh] left-10">
          <AboutFacts />
        </div>

        {/* Creative side (right) — hand-drawn bubbles in the freed top-right,
            replacing the plain thought text that used to sit here. */}
        <div className="absolute right-10 top-[5%] flex justify-end">
          <SpeechBubbles />
        </div>
        <div className="absolute bottom-[9vh] right-10 flex justify-end">
          <HobbiesRotator />
        </div>

        {/* The four corner aphorisms ("measure twice" and friends) were removed
            2026-08-10. The right-hand pair is to be replaced by the animated
            speech bubbles; CornerText itself is kept for that. */}
      </motion.div>
    </section>
  );
}
