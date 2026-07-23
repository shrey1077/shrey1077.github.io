"use client";

/**
 * PortraitSlider — a looped portrait carousel for one sub-category (≤7 frames).
 *
 * One focal portrait centered with its two neighbours peeking, prev/next arrows
 * that wrap around, a dot index, and a gentle auto-advance that pauses on hover
 * or focus. Choosing the focal frame opens it in the white MediaViewer.
 * Reduced motion disables the auto-advance (manual only).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ContentAsset } from "@/content/catalogue";
import type { CollectionAsset } from "@/types/experience";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

const MAX = 7;
const AUTO_MS = 4200;

export function PortraitSlider({ assets }: { assets: CollectionAsset[] }) {
  const reducedMotion = useReducedMotion();
  const frames = assets.filter((a) => a.kind === "image").slice(0, MAX);
  const [index, setIndex] = useState(0);
  const [viewing, setViewing] = useState<ContentAsset | null>(null);
  const paused = useRef(false);

  const n = frames.length;
  const go = useCallback((dir: number) => setIndex((i) => (i + dir + n) % n), [n]);

  useEffect(() => {
    if (reducedMotion || n <= 1 || viewing) return;
    const t = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % n);
    }, AUTO_MS);
    return () => clearInterval(t);
  }, [reducedMotion, n, viewing]);

  if (n === 0) return null;

  const at = (offset: number) => frames[(index + offset + n) % n];
  const current = frames[index];

  return (
    <div
      className="select-none"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div className="relative flex items-center justify-center gap-4 sm:gap-6">
        {/* Prev */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className={`${typeVoiceClass("logic", "meta")} z-10 shrink-0 rounded-full border border-neutral-300 px-3 py-3 text-neutral-700 outline-none transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40`}
        >
          ←
        </button>

        {/* Peek + focal + peek */}
        <div className="flex items-center gap-3 sm:gap-5">
          {n > 2 && (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => go(-1)}
              className="relative hidden aspect-[3/4] w-24 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50 opacity-50 transition-opacity hover:opacity-80 md:block lg:w-32"
            >
              <Image src={at(-1).url} alt="" fill sizes="128px" className="object-contain p-1.5" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.button
              key={current.url}
              type="button"
              onClick={() => setViewing(current)}
              aria-label={`View ${current.caption ?? current.name}`}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="group relative aspect-[3/4] w-52 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/50 focus-visible:ring-offset-2 sm:w-64 lg:w-72"
            >
              <Image
                src={current.url}
                alt={current.caption ?? current.name}
                fill
                sizes="288px"
                className="object-contain p-2 transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </motion.button>
          </AnimatePresence>

          {n > 2 && (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => go(1)}
              className="relative hidden aspect-[3/4] w-24 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50 opacity-50 transition-opacity hover:opacity-80 md:block lg:w-32"
            >
              <Image src={at(1).url} alt="" fill sizes="128px" className="object-contain p-1.5" />
            </button>
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className={`${typeVoiceClass("logic", "meta")} z-10 shrink-0 rounded-full border border-neutral-300 px-3 py-3 text-neutral-700 outline-none transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40`}
        >
          →
        </button>
      </div>

      {/* Caption + dots */}
      <div className="mt-5 flex flex-col items-center gap-3">
        {current.caption && (
          <p className={`${typeVoiceClass("logic", "meta")} max-w-md text-center text-[0.62rem] leading-relaxed text-neutral-600`}>
            {current.caption}
          </p>
        )}
        <div className="flex items-center gap-1.5">
          {frames.map((f, i) => (
            <button
              key={f.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Frame ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-neutral-900" : "w-1.5 bg-neutral-300 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      </div>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
