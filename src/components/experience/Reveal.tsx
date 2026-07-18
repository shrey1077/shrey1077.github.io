"use client";

/**
 * Reveal — the experience pages' one scroll-entrance gesture.
 *
 * A calm rise-and-settle as content enters the viewport (once, never again):
 * the museum-wall equivalent of a spotlight warming as you approach a frame.
 * No bounce, no parallax — EASE_OUT and done. `prefers-reduced-motion`
 * renders statically. Wrap collection blocks and cards; keep delays tiny
 * (index * 0.05s) so grids cascade rather than queue.
 */

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

interface RevealProps {
  /** Seconds to hold before rising (stagger within a grid). */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export function Reveal({ delay = 0, className, children }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
