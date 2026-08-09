"use client";

/**
 * ExtinctsDeck — the jury presentation, played as a fly-through.
 *
 * The original deck runs on a fly-through transition, so it is shown the same
 * way here rather than as a static gallery: each slide arrives from depth,
 * holds, and recedes as the next comes forward. Three slides are alive at once
 * (the one behind, the one reading, the one leaving), which is what gives the
 * move its sense of travelling through the deck rather than flipping it.
 *
 * It auto-advances on the house 5s cadence, pauses on hover or focus, and
 * settles into a plain cross-fade under `prefers-reduced-motion`. Arrow keys
 * and the rail both scrub; clicking a slide opens it full-screen.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/constants/motion";

const HOLD_MS = 5000;

export function ExtinctsDeck({ slides }: { slides: string[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const paused = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      if (!paused.current && !full) setIndex((i) => (i + 1) % count);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [count, full]);

  useEffect(() => {
    const step = (d: number) => setIndex((i) => (i + d + count) % count);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Escape") setFull(false);
    };
    const el = wrapRef.current;
    el?.addEventListener("keydown", onKey as EventListener);
    if (full) window.addEventListener("keydown", onKey);
    return () => {
      el?.removeEventListener("keydown", onKey as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, [full, count]);

  if (count === 0) return null;

  // Depth: the incoming slide starts small and far, the outgoing one rushes
  // past the camera. Reduced motion drops the travel and just cross-fades.
  const variants = reduceMotion
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: { opacity: 0, scale: 0.72, z: -400, y: 28 },
        center: { opacity: 1, scale: 1, z: 0, y: 0 },
        exit: { opacity: 0, scale: 1.35, z: 320, y: -16 },
      };

  return (
    <div
      ref={wrapRef}
      className="flex w-full flex-col"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      {/* Explicit 16:9 rather than flex-1: this panel's parent is a block,
          so a percentage height would collapse the stage to nothing. */}
      <div className="relative aspect-[16/9] w-full" style={{ perspective: 1400 }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.button
            key={slides[index]}
            type="button"
            onClick={() => setFull(true)}
            aria-label={`Slide ${index + 1} of ${count} — open full screen`}
            className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.35 : 0.95, ease: EASE_OUT }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Image
              src={slides[index]}
              alt={`The Extincts Project — slide ${index + 1}`}
              fill
              sizes="(max-width: 768px) 92vw, 46vw"
              className="rounded-xl object-contain"
              priority={index === 0}
            />
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Rail — position, scrub, and the count. */}
      <div className="mt-3 flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="rounded-full border border-white/25 px-2.5 py-1 text-[0.7rem] text-white/70 outline-none transition-colors duration-200 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
        >
          ←
        </button>
        <div className="flex min-w-0 flex-1 gap-[3px]">
          {slides.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group h-4 min-w-0 flex-1 outline-none"
            >
              <span
                className={`block h-[3px] w-full rounded-full transition-colors duration-300 ${
                  i === index ? "bg-white" : "bg-white/20 group-hover:bg-white/45"
                }`}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="rounded-full border border-white/25 px-2.5 py-1 text-[0.7rem] text-white/70 outline-none transition-colors duration-200 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
        >
          →
        </button>
        <span className="shrink-0 text-[0.62rem] tabular-nums text-white/45">
          {index + 1}/{count}
        </span>
      </div>

      {/* Full screen — the deck at reading size. */}
      <AnimatePresence>
        {full && (
          <motion.div
            className="fixed inset-0 z-[120] flex flex-col bg-neutral-950/97 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="The Extincts Project — presentation"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[0.7rem] tabular-nums text-white/50">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                onClick={() => setFull(false)}
                className="rounded-full border border-white/25 px-4 py-2 text-[0.7rem] text-white/80 outline-none transition-colors duration-200 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Close ✕
              </button>
            </div>
            <div className="relative min-h-0 flex-1 px-5 pb-6">
              <Image
                src={slides[index]}
                alt={`The Extincts Project — slide ${index + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-4 pb-6">
              <button
                type="button"
                onClick={() => go(-1)}
                className="rounded-full border border-white/25 px-5 py-3 text-white/80 outline-none transition-colors duration-200 hover:border-white hover:text-white"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-full border border-white/25 px-5 py-3 text-white/80 outline-none transition-colors duration-200 hover:border-white hover:text-white"
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
