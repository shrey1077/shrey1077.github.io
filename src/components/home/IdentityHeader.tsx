"use client";

/**
 * IdentityHeader — the hero's identity layer.
 *
 *   top-left : the black ProfileNav — profile picture + name, with a menu that
 *              slides out on hover/click (its own interactive layer).
 *   top-right: "Move to explore" margin note in the thought voice, with a small
 *              arrow — the only instruction the installation gives.
 *
 * The header itself is pointer-events-none so it never blocks the canvas's
 * mouse rotation; ProfileNav opts its own pointer events back in. Settles in
 * gently alongside the navigation.
 */

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { ProfileNav } from "@/components/home/ProfileNav";

export function IdentityHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.2 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8"
    >
      {/* Identity mark — the black picture-header with its slide-out menu. */}
      <ProfileNav />

      {/* Margin note. */}
      <span
        aria-hidden
        className={`${typeVoiceClass("thought", "meta")} hidden items-baseline gap-1.5 text-lg text-neutral-500 sm:flex`}
      >
        Move to explore
        <span className="inline-block translate-y-1 rotate-45 text-base">→</span>
      </span>
    </motion.header>
  );
}
