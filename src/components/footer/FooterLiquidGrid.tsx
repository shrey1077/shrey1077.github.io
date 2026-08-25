"use client";

/**
 * FooterLiquidGrid — the closing band's ground: a barely-there dot grid that
 * ripples away from the pointer.
 *
 * Originkit's Liquid Grid (src/components/originkit/LiquidGrid.tsx), supplied by
 * the owner on 2026-08-21. That file is vendored as-supplied so it can be
 * diffed against a future Originkit release; EVERY site-specific decision lives
 * here instead. If the effect needs retuning, retune it in this file.
 *
 * ⚠ THE COLOURS ARE INVERTED from the preset, which ships white dots on black.
 * The footer is `bg-gallery` (#f9f9f9), so the dots go black and the component's
 * own background fill is switched OFF rather than set to white — passing exactly
 * "rgba(0,0,0,0)" is the sentinel its `drawFrame` checks to skip the fill
 * entirely. That matters: painting an opaque white rectangle would hide the
 * footer's real ground and put a hard-edged panel over the page's own colour.
 *
 * ⚠ OPACITY IS 0.4 — "reduce opacity by 60%", the owner's brief. It is applied
 * to the WHOLE CANVAS rather than to `lineColor`, because the effect draws in
 * two passes: the flat dots in `lineColor` AND a glow pass whose alpha the
 * component computes itself, up to fully opaque at the ripple's crest. Dimming
 * only `lineColor` would leave that glow at full strength, so the resting grid
 * would fade while the moving part stayed loud — the opposite of feeble. The
 * dots' own 30% alpha survives underneath, so they land at ~12% effective.
 *
 * ⚠ IT MUST NOT CHANGE THE FOOTER'S HEIGHT. The canvas is `absolute inset-0`
 * inside a `relative` footer at negative z-index: it contributes nothing to
 * layout, paints above the footer's background but below its content (which is
 * what a negative z-index child does), and never takes the pointer.
 *
 * ⚠ IT IS UNMOUNTED WHEN OUT OF VIEW, and this is not a micro-optimisation.
 * The vendored component runs an UNCONDITIONAL requestAnimationFrame loop — it
 * spins for the life of the page whether or not anything is moving, and it also
 * binds `mousemove` and `click` on `window`. This is the page FOOTER, so it is
 * off-screen almost all the time. Gating on the viewport is the only way to
 * stop the homepage paying for it while the visitor is up at the brain.
 *
 * ⚠ REDUCED MOTION RENDERS NOTHING. The whole component is a pointer-driven
 * ripple; there is no meaningful still state to fall back to, and the grid is
 * decoration, so a visitor who asked for no motion simply gets the plain
 * footer ground.
 */

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useInViewport } from "@/hooks/useInViewport";

/** Client-only: the component touches `window` and `devicePixelRatio` during
 *  its first effect, and there is nothing to server-render — it is a canvas. */
const LiquidGrid = dynamic(() => import("@/components/originkit/LiquidGrid"), {
  ssr: false,
});

/** Black, at the preset's own 30% alpha (0x4D) — the inverse of its white
 *  `#FFFFFF4D`. The further 60% reduction is the canvas opacity, not this. */
const DOT_COLOR = "#0000004D";
/** The ripple's highlight. Black too, or a crest would flash light against a
 *  light ground and read as a hole rather than a wave. */
const GLOW_COLOR = "#000000";
/** The sentinel `drawFrame` checks to skip its background fill entirely. */
const NO_FILL = "rgba(0,0,0,0)";

export function FooterLiquidGrid() {
  const reduceMotion = useReducedMotion();
  const { ref, inView } = useInViewport<HTMLDivElement>({
    // Start it just before the footer arrives, so the grid is already settled
    // rather than popping in mid-scroll.
    rootMargin: "200px",
    // ⚠ false, not the hook's default true — the footer starts off-screen, and
    // defaulting to "in view" would run the loop from mount on every visit,
    // which is the exact cost this gate exists to avoid.
    initial: false,
  });

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {inView && !reduceMotion ? (
        <LiquidGrid
          background={NO_FILL}
          lineColor={DOT_COLOR}
          glowColor={GLOW_COLOR}
          style={{ opacity: 0.4 }}
        />
      ) : null}
    </div>
  );
}
