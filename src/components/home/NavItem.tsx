"use client";

/**
 * NavItem — one navigation entry, styled as an extension of its hemisphere
 * (Phase 4.2).
 *
 *   • LEFT  (logic)      → a solid graphite pill; hover expands it and fine
 *                          graphite grain surfaces and drifts.
 *   • RIGHT (creativity) → a PAINTED BRUSH STROKE (the animated gradient clipped
 *                          to an organic brush shape), each item a different hue
 *                          from the hemisphere's palette; hover speeds the flow.
 *
 * White Helvetica label on both. Interaction is unchanged: hover writes
 * `hoveredNav` (the 3D brain leans toward this hemisphere), click sets
 * `activeSection` (opens the preview). The visible label is aria-hidden; the
 * accessible name is on the button.
 */

import { motion } from "framer-motion";
import type { NavSection } from "@/types/navigation";
import { useSceneStore } from "@/state/useSceneStore";

interface NavItemProps {
  section: NavSection;
}

/** Per-item painted gradient for the right brush strokes — each a different hue
 *  from the creative palette, three-stop (A→B→A) so the animated pan loops
 *  seamlessly (`.brain-paint` in globals.css supplies size + drift). */
const BRUSH_GRADIENTS: Record<string, string> = {
  art: "linear-gradient(115deg,#ff2e8b,#ff5a3c,#ff2e8b)",
  publications: "linear-gradient(115deg,#ff8a00,#f5c518,#ff8a00)",
  "the-extincts-project": "linear-gradient(115deg,#00a6a6,#7fbf2e,#00a6a6)",
  "ai-generations": "linear-gradient(115deg,#7a3fb0,#3f6ad8,#7a3fb0)",
};

export function NavItem({ section }: NavItemProps) {
  const isLeft = section.hemisphere === "left";
  const isActive = useSceneStore((s) => s.activeSection === section.id);
  const setActiveSection = useSceneStore((s) => s.setActiveSection);
  const setHoveredNav = useSceneStore((s) => s.setHoveredNav);

  const onEnter = () =>
    setHoveredNav({ id: section.id, hemisphere: section.hemisphere });
  const onLeave = () => setHoveredNav(null);

  return (
    <motion.button
      type="button"
      aria-label={section.label}
      onClick={() => setActiveSection(section.id)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      aria-controls="preview"
      aria-expanded={isActive}
      whileHover={{ scale: 1.04, x: isLeft ? 4 : -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={[
        "group pointer-events-auto relative inline-flex select-none items-center outline-none",
        isLeft
          ? "overflow-hidden rounded-full bg-neutral-900 px-5 py-2.5 shadow-[0_2px_14px_rgba(0,0,0,0.12)] lg:px-6 lg:py-3"
          : "px-7 py-3 lg:px-9 lg:py-3.5",
        isActive && isLeft
          ? "ring-2 ring-neutral-900/25 ring-offset-2 ring-offset-white"
          : "",
      ].join(" ")}
    >
      {/* Surface. LEFT: graphite grain on hover. RIGHT: a living painted brush
          stroke — the animated gradient clipped to an organic shape. */}
      {isLeft ? (
        <span
          aria-hidden
          className="brain-grain absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      ) : (
        <span
          aria-hidden
          className="brain-paint absolute inset-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.14)]"
          style={{
            backgroundImage: BRUSH_GRADIENTS[section.id],
            clipPath: "url(#brush-clip)",
            WebkitClipPath: "url(#brush-clip)",
          }}
        />
      )}

      <span
        aria-hidden
        className={[
          "font-ui relative z-10 whitespace-nowrap text-sm font-medium tracking-tight text-white lg:text-[0.95rem]",
          // On the painted strokes, a soft dark halo keeps white legible over
          // the lighter pigments (amber / lime).
          isLeft ? "" : "[text-shadow:0_1px_3px_rgba(0,0,0,0.5)]",
        ].join(" ")}
      >
        {section.label}
      </span>
    </motion.button>
  );
}
