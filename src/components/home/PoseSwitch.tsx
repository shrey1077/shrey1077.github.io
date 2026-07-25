"use client";

/**
 * PoseSwitch — the three-state control that replaced the old 25vw center
 * column and flip strips, handing that width back to the section panels.
 *
 * Three marks sit at the bottom-right of the brain's area, just above the
 * panels' top edge. The ACTIVE state is a rounded rectangle two circles wide;
 * the two inactive states are single circles. Switching state morphs one into
 * the other, so the control reads as one travelling pill rather than three
 * lights.
 *
 *   logic    graphite
 *   middle   half graphite, half paint — the seam itself
 *   creative the living paint gradient
 */

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";
import { useSceneStore } from "@/state/useSceneStore";
import type { HeroPose } from "@/types/scene";

const STATES: { pose: HeroPose; label: string }[] = [
  { pose: "logic", label: "the logic side" },
  { pose: "center", label: "the middle" },
  { pose: "creative", label: "the creative side" },
];

/** One circle wide, and the active pill's two-circle width. */
const DOT = 18;
const PILL = DOT * 2 + 8;

export function PoseSwitch() {
  const reduceMotion = useReducedMotion();
  const heroPose = useSceneStore((s) => s.heroPose);
  const setHeroPose = useSceneStore((s) => s.setHeroPose);

  return (
    <div
      className={[
        "pointer-events-auto absolute right-[4vw] z-30 flex items-center gap-2.5",
        // With panels up it rides just above their top edge (the Clients
        // boundary); on the landing that band belongs to the headline, so it
        // drops to sit just above the two doors instead.
        heroPose === "center" ? "bottom-[calc(7%+0.9rem)]" : "bottom-[calc(50%+0.9rem)]",
      ].join(" ")}
      role="group"
      aria-label="Choose a hemisphere"
    >
      {STATES.map(({ pose, label }) => {
        const active = heroPose === pose;
        return (
          <button
            key={pose}
            type="button"
            onClick={() => setHeroPose(pose)}
            aria-label={label}
            aria-pressed={active}
            className="group relative outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
            style={{ height: DOT }}
          >
            <motion.span
              aria-hidden
              animate={{ width: active ? PILL : DOT }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: EASE_OUT }}
              className={[
                "block overflow-hidden rounded-full transition-opacity duration-300",
                active ? "opacity-100" : "opacity-45 group-hover:opacity-80",
                // The middle state is the seam: graphite meeting paint.
                pose === "center" ? "brain-paint" : "",
                pose === "logic" ? "bg-neutral-900" : "",
              ].join(" ")}
              style={{
                height: DOT,
                ...(pose === "creative"
                  ? { backgroundImage: "linear-gradient(115deg,#ff2e8b,#ff8a00,#00a6a6,#3f6ad8)" }
                  : {}),
              }}
            >
              {/* Middle: graphite over the left half, paint showing on the right. */}
              {pose === "center" && (
                <span aria-hidden className="block h-full w-1/2 bg-neutral-900" />
              )}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
