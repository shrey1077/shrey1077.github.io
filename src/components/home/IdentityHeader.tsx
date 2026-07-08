"use client";

/**
 * IdentityHeader — the hero's quiet identity layer (per the design mockup).
 *
 *   top-left : script "SS" monogram · hairline divider · name (logic meta)
 *              over role (small neutral sans).
 *   top-right: "Move to explore" margin note in the thought voice, with a small
 *              arrow — the only instruction the installation gives.
 *
 * Decorative, non-interactive (pointer-events-none) so it never blocks the
 * canvas's mouse rotation. Settles in gently alongside the navigation.
 */

import { motion, useReducedMotion } from "framer-motion";
import { SITE } from "@/constants/site";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

export function IdentityHeader() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.settle, ease: EASE_OUT, delay: 0.2 }}
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8"
    >
      {/* Identity mark. */}
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`${typeVoiceClass("thought", "display")} text-3xl leading-none text-neutral-900 sm:text-4xl`}
        >
          {SITE.monogram}
        </span>
        <span aria-hidden className="h-8 w-px bg-neutral-200" />
        <span className="flex flex-col gap-0.5">
          <span
            className={`${typeVoiceClass("logic", "meta")} text-[0.65rem] text-neutral-900`}
          >
            {SITE.name}
          </span>
          <span className="text-[0.7rem] text-neutral-500">{SITE.role}</span>
        </span>
      </div>

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
