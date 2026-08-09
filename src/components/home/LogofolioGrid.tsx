"use client";

/**
 * LogofolioGrid — every mark, once, on a five-column wall.
 *
 * The artwork itself is pre-normalised (scripts/prepare-logofolio.mjs scales
 * each mark to the same INK AREA on a shared canvas), so a long wordmark and a
 * compact monogram carry equal weight here — the grid only has to seat them.
 *
 * Ground follows the mark: colour and black artwork sits on white, white
 * artwork ("light" tone) sits on black, so every logo stays legible.
 */

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { LogoMark } from "@/content/catalogue";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

export function LogofolioGrid({ logos }: { logos: LogoMark[] }) {
  const reduceMotion = useReducedMotion();
  if (logos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-3 lg:grid-cols-5">
      {logos.map((logo, i) => (
        <motion.figure
          key={logo.slug}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(i * 0.03, 0.5) }}
          className={`group relative flex aspect-[5/3] items-center justify-center p-4 ${
            logo.tone === "light" ? "bg-neutral-950" : "bg-white"
          }`}
        >
          <Image
            src={logo.url}
            alt={logo.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <figcaption
            className={`${typeVoiceClass("logic", "meta")} absolute inset-x-0 bottom-0 truncate px-2 pb-1.5 text-center text-[0.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
              logo.tone === "light" ? "text-white/70" : "text-neutral-400"
            }`}
          >
            {logo.name}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
