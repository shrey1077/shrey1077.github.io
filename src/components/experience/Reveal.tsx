"use client";

/**
 * Reveal — the experience pages' one scroll-entrance gesture.
 *
 * A calm rise-and-settle as content enters the viewport (once, never again):
 * the museum-wall equivalent of a spotlight warming as you approach a frame.
 * No bounce, no parallax — EASE_OUT and done. `prefers-reduced-motion`
 * renders statically.
 *
 * Robustness (the load-bearing rule): content must NEVER stay trapped hidden.
 * We drive the animation from our own IntersectionObserver AND a failsafe
 * timer — so a backgrounded tab, a throttled rAF loop, or an observer that
 * never fires still resolves to fully visible. `whileInView`'s pure-Framer
 * form can strand content at opacity:0 when the animation frame loop is
 * paused; this does not.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

interface RevealProps {
  /** Seconds to hold before rising (stagger within a grid). */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

/** Content is shown this long after mount no matter what — the failsafe that
 *  makes "invisible forever" impossible. Long enough that a normally-scrolling
 *  reader triggers the observer first and never sees the fallback fire. */
const FAILSAFE_MS = 1600;

export function Reveal({ delay = 0, className, children }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    let io: IntersectionObserver | undefined;
    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) setShown(true);
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
    } else {
      setShown(true); // no observer support → just show it
    }
    const failsafe = setTimeout(() => setShown(true), FAILSAFE_MS);
    return () => {
      io?.disconnect();
      clearTimeout(failsafe);
    };
  }, [shown]);

  if (reducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
