"use client";

/**
 * HeroStage — the ~90vh homepage hero: the video background + its navigation.
 *
 * Phase 5 replaced the WebGL brain scene with a mouse-scrubbed video background
 * (HeroVideo). The former 3D pipeline (components/brain, components/scene) and
 * the DOM flow systems (components/flows) were removed in the same pass; the
 * "before cleanup" git checkpoint restores them if ever needed.
 */

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { BrainNavigation } from "@/components/home/BrainNavigation";
import { IdentityHeader } from "@/components/home/IdentityHeader";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** Video background — client-only (its scrub loop drives a DOM <video>), and
 *  code-split so the hero's first paint is just the white gallery wall. */
const HeroVideo = dynamic(
  () => import("@/components/home/HeroVideo").then((m) => m.HeroVideo),
  { ssr: false, loading: () => null },
);

export function HeroStage() {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past (reading a preview below).
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      aria-label="Interactive brain navigation"
      // min-h guards pathologically short viewports so the nav never clips.
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-white"
    >
      {/* Video background — a single slow opacity settle on mount so it arrives
          rather than pops in. */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.verySlow, ease: EASE_OUT }}
      >
        <HeroVideo active={inView} />
      </motion.div>

      {/* Identity mark + "Move to explore" margin note. */}
      <IdentityHeader />

      {/* DOM navigation overlay. */}
      <BrainNavigation />
    </section>
  );
}
