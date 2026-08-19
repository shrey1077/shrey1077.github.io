"use client";

/**
 * GuidelineSeeMore — a round "See more" button that opens the rest of a
 * campus's logo-guideline plates in a modal slider.
 *
 * The colour scheme and typography slide sit inline in the column; everything
 * else is tucked behind this circle. Opening it shows one plate at a time on a
 * dark backdrop with prev/next (and ←/→/Esc), so the guideline deck can be read
 * without crowding the page. Scroll locks while open.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";

export function GuidelineSeeMore({
  plates,
  accent,
  label,
}: {
  plates: string[];
  accent: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const n = plates.length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
      else if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, n]);

  if (n === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
        aria-label={`${label} — open the full guideline deck`}
        // ⚠ A PILL, not the 56px circle this used to be. The circle was sized
        // for the two short words "See more"; the label is "Brand Guidelines"
        // now and wrapped inside it. A pill grows with whatever it is given.
        className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-neutral-300 px-5 py-2.5 text-neutral-600 outline-none transition-colors duration-300 hover:border-neutral-900 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
      >
        <span className="tata-subhead whitespace-nowrap text-[0.58rem] uppercase tracking-[0.12em]">{label}</span>
        <span aria-hidden className="text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Logo guideline plates"
            className="fixed inset-0 flex flex-col bg-neutral-950/96 backdrop-blur-sm"
            style={{ zIndex: Z_INDEX.viewer }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE_OUT }}
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
              <span className="tata-subhead text-[0.62rem] uppercase tracking-[0.16em] text-white/50">
                <span style={{ color: accent }}>{String(i + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="tata-body rounded-full border border-white/25 px-4 py-2 text-[0.7rem] text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Close ✕
              </button>
            </div>

            <div
              className="flex flex-1 items-center justify-center gap-4 px-4 py-6 sm:gap-8 sm:px-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setI((v) => (v - 1 + n) % n)}
                aria-label="Previous"
                className="tata-body shrink-0 rounded-full border border-white/25 px-4 py-4 text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
              >
                ←
              </button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={plates[i]}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                  className="relative aspect-[3557/2528] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white"
                >
                  <Image src={plates[i]} alt={`Guideline plate ${i + 1}`} fill sizes="90vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setI((v) => (v + 1) % n)}
                aria-label="Next"
                className="tata-body shrink-0 rounded-full border border-white/25 px-4 py-4 text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
              >
                →
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pb-8" onClick={(e) => e.stopPropagation()}>
              {plates.map((p, k) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`Plate ${k + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? "w-5 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
