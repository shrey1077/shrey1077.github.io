"use client";

/**
 * HeroStage — the full-viewport homepage stage (Phase 5 v4).
 *
 * The stage runs a three-pose machine (store `heroPose`):
 *
 *   center   — landing. The brain rests on its calibrated middle frame,
 *              mouse-scrubbable; the split HEADLINE occupies the flanks
 *              (no navigation is shown on first load — deliberate).
 *   logic    — a LEFT-half click. The video plays back to its first frame
 *              (white brain) while the whole footage zooms out to the upper
 *              half; the four logic sections rise as B&W panels below, with
 *              the painted 5% strip on their right edge.
 *   creative — a RIGHT-half click (or the painted strip). The video plays to
 *              its last frame (painted brain); the creative sections rise as
 *              painted panels, graphite strip on the left leading back.
 *
 * Clicks on interactive elements or inside the panels never switch poses.
 * v4 removed BrainNavigation/PreviewPane from the homepage — the panels ARE
 * the navigation now.
 */

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IdentityHeader } from "@/components/home/IdentityHeader";
import { HeroHeadline } from "@/components/home/HeroHeadline";
import { BrainThoughts } from "@/components/home/BrainThoughts";
import {
  SectionPanels,
  type ArtPreview,
  type ClientWorkMap,
} from "@/components/home/SectionPanels";
import { useInViewport } from "@/hooks/useInViewport";
import { DURATION, EASE_IN_OUT, EASE_OUT } from "@/constants/motion";
import { useSceneStore } from "@/state/useSceneStore";
import type { HeroPose } from "@/types/scene";

/** Video background — client-only (its scrub loop drives a DOM <video>), and
 *  code-split so the hero's first paint is just the white gallery wall. */
const HeroVideo = dynamic(
  () => import("@/components/home/HeroVideo").then((m) => m.HeroVideo),
  { ssr: false, loading: () => null },
);

/** How far the footage "zooms out" once a hemisphere is chosen — scaled from
 *  the top edge so the brain settles into the upper half above the panels. */
const POSE_SCALE = 0.55;
/** The landing brain read too large at 1:1 — sit it back a quarter. The stage
 *  paints itself the footage's OWN background colour (`--hero-bg`, sampled live
 *  in HeroVideo), so the smaller frame dissolves into the page with no seam. */
const CENTER_SCALE = 0.75;

export function HeroStage({
  workMap,
  artPreviews,
}: {
  workMap: ClientWorkMap;
  artPreviews: ArtPreview[];
}) {
  // Keep the scrub loop running while the hero is near the viewport; idle it
  // once the visitor has scrolled well past.
  const { ref, inView } = useInViewport<HTMLElement>({ rootMargin: "200px 0px" });
  const reduceMotion = useReducedMotion();
  const heroPose = useSceneStore((s) => s.heroPose);
  const setHeroPose = useSceneStore((s) => s.setHeroPose);

  const choose = (pose: HeroPose) => {
    if (heroPose !== pose) setHeroPose(pose);
  };

  /** Background clicks choose a hemisphere; interactive elements and the
   *  panel system keep their own behavior. */
  const onStageClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.target as Element | null;
    if (el?.closest("a, button, [role='button'], input, textarea, [data-panels]"))
      return;
    choose(e.clientX < window.innerWidth / 2 ? "logic" : "creative");
  };

  return (
    <section
      ref={ref}
      aria-label="Interactive brain navigation"
      onClick={onStageClick}
      className={[
        "relative h-[100svh] min-h-[640px] w-full overflow-hidden",
        heroPose === "center" ? "cursor-pointer" : "",
      ].join(" ")}
      // Falls back to the gallery wall until the first frame is sampled.
      style={{ backgroundColor: "var(--hero-bg, #f9f9f9)", transition: "background-color 120ms linear" }}
    >
      {/* Video background — settles in on mount; zooms out (scaled from the
          top edge) once a hemisphere is chosen. */}
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{
          opacity: 1,
          scale: heroPose === "center" ? CENTER_SCALE : POSE_SCALE,
          y: heroPose === "center" ? "0vh" : "2vh",
          // Centre shrinks in place; the pose zoom scales from the top edge so
          // the brain settles into the upper half above the panels.
          originX: 0.5,
          originY: heroPose === "center" ? 0.5 : 0,
        }}
        transition={{
          opacity: { duration: DURATION.verySlow, ease: EASE_OUT },
          scale: {
            duration: reduceMotion ? 0 : DURATION.verySlow,
            ease: EASE_IN_OUT,
          },
          y: {
            duration: reduceMotion ? 0 : DURATION.verySlow,
            ease: EASE_IN_OUT,
          },
        }}
      >
        <HeroVideo active={inView} />
      </motion.div>

      {/* Identity mark + margin note. */}
      <IdentityHeader />

      {/* Keyboard path to the pose machine (the stage's halves are mouse
          territory; these are the accessible equivalents). */}
      <div className="sr-only">
        <button type="button" onClick={() => choose("logic")}>
          Enter the logic side
        </button>
        <button type="button" onClick={() => choose("creative")}>
          Enter the creative side
        </button>
        <button type="button" onClick={() => choose("center")}>
          Return to the middle
        </button>
      </div>

      {/* The landing headline — leaves the moment a side is chosen. */}
      <AnimatePresence>
        {heroPose === "center" && <HeroHeadline key="headline" />}
      </AnimatePresence>

      {/* Stand still and the hemispheres start thinking out loud. */}
      <BrainThoughts />

      {/* The section panels — rise once a hemisphere is committed. */}
      <AnimatePresence>
        {heroPose !== "center" && (
          <SectionPanels key="panels" workMap={workMap} artPreviews={artPreviews} />
        )}
      </AnimatePresence>
    </section>
  );
}
