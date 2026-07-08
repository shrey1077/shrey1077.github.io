"use client";

/**
 * HeroStage — the ~90vh homepage hero: the interactive brain + its navigation.
 *
 * (Replaces Phase 1's `HomeExperience`, which was a full-viewport fixed canvas.
 * Phase 2 makes the document scrollable, so the canvas is now bound to this hero
 * section instead — when a preview opens, the hero scrolls up and "the homepage
 * remains above".)
 *
 * Responsibilities:
 *   • Lazily load the WebGL scene (`ssr: false` — three.js can't render on the
 *     server), with a pure-white fallback so first paint is never anything but
 *     the gallery background.
 *   • Overlay the DOM navigation (BrainNavigation).
 *   • Mount the Leva DebugPanel ONLY in development (dynamic import ⇒ Leva is
 *     absent from the production bundle).
 *   • Pause the render loop when the hero scrolls out of view (perf).
 */

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { BrainNavigation } from "@/components/home/BrainNavigation";
import { IdentityHeader } from "@/components/home/IdentityHeader";
import { ThoughtLabel } from "@/components/home/ThoughtLabel";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** The Brain OS flow systems (left logical / right creative / neuron thoughts).
 *  Client-only and dynamically imported so the SVG/canvas machinery is
 *  code-split out of the initial payload. */
const BrainSystems = dynamic(
  () => import("@/components/flows/BrainSystems").then((m) => m.BrainSystems),
  { ssr: false, loading: () => null },
);

const IS_DEV = process.env.NODE_ENV !== "production";

/** Video background (Phase 5) — replaces the WebGL scene as the hero's
 *  centerpiece. The 3D pipeline (`scene/SceneCanvas` and everything under
 *  `components/brain/`) is preserved intact; to restore it, swap this import
 *  back to the dynamic SceneCanvas below. */
const HeroVideo = dynamic(
  () => import("@/components/home/HeroVideo").then((m) => m.HeroVideo),
  { ssr: false, loading: () => null },
);

/** Debug panel — client-only AND dev-only. In production this renders nothing
 *  and pulls in no Leva code. */
const DebugPanel = IS_DEV
  ? dynamic(() => import("@/components/debug/DebugPanel"), { ssr: false })
  : () => null;

export function HeroStage() {
  // Keep rendering while any part of the hero is near the viewport; pause once
  // it is well out of view (visitor is reading a preview below).
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      aria-label="Interactive brain navigation"
      // min-h guards pathologically short viewports: the hero keeps enough room
      // for brain + navigation and the page scrolls a little instead of
      // clipping. On normal devices 90vh > 600px, so nothing changes.
      className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-white"
    >
      {/* WebGL canvas. A single, slow opacity settle on mount — the installation
          "arrives" instead of popping in. Below lg the canvas takes the hero's
          upper band and the navigation the lower band (a height-sized brain and
          a nav block can't share the same vertical space on small screens);
          at lg+ the canvas fills the hero and the nav flanks the brain. */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-[42%] lg:inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION.verySlow, ease: EASE_OUT }}
      >
        <HeroVideo active={inView} />
      </motion.div>

      {/* The living flow systems flank the brain — lg+ only, where the canvas
          fills the hero (below lg the nav takes the lower band and the flanks
          would collide with it). */}
      <div className="hidden lg:block">
        <BrainSystems active={inView} />
      </div>

      {/* Identity mark + "Move to explore" margin note. */}
      <IdentityHeader />

      {/* DOM navigation overlay, flanking the brain. */}
      <BrainNavigation />

      {/* The first thought — the Constitution performing itself (lg+). */}
      <ThoughtLabel />

      <DebugPanel />
    </section>
  );
}
