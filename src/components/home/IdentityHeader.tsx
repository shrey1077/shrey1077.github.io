"use client";

/**
 * IdentityHeader — the hero's identity layer.
 *
 * Top-left: the large black ProfileNav (photo + name + phone + socials). The
 * header is pointer-events-none so it never blocks the canvas's mouse rotation;
 * ProfileNav opts its own pointer events back in.
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { ProfileNav } from "@/components/home/ProfileNav";

export function IdentityHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.2 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-start px-6 pt-6 sm:px-10 sm:pt-8"
    >
      <ProfileNav />
    </motion.header>
  );
}
