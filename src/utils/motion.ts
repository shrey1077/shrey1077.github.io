/**
 * Motion utilities — shared Framer Motion variant factories.
 *
 * The interface has exactly two entrance gestures (docs/MOTION.md): a quiet
 * fade-rise, and a parent that staggers its children's fade-rises. Every
 * surface that settles in (nav columns, identity header, sheet content,
 * experience sections) builds from these two factories instead of hand-rolling
 * variants — one feel, defined once.
 *
 * Pure data helpers (no React) so they can be used by any client component.
 */

import type { Variants } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** A quiet fade + small rise into place. */
export function fadeRiseVariants(
  options: { distance?: number; duration?: number; delay?: number } = {},
): Variants {
  const { distance = 8, duration = DURATION.settle, delay = 0 } = options;
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: EASE_OUT, duration, delay },
    },
  };
}

/** A parent orchestrating staggered child settles (children use
 *  `fadeRiseVariants`). */
export function staggerContainerVariants(
  options: { stagger?: number; delay?: number } = {},
): Variants {
  const { stagger = 0.08, delay = 0 } = options;
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}
