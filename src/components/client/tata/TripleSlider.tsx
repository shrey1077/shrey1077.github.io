"use client";

/**
 * TripleSlider — a horizontal slider that shows three items at a time and
 * eases sideways one card per step. Used inside the full-screen FamilyOverlay
 * (dark theme). Responsive: 1 card on phones, 2 on tablets, 3 on desktop.
 *
 * The track translates in pixels (card width measured from the viewport), so
 * the three columns stay equal and the motion is a clean eased slide with no
 * snapping artefacts. Choosing a card opens it in the shared MediaViewer.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { CollectionAsset } from "@/types/experience";
import { EASE_OUT } from "@/constants/motion";

function perViewFor(width: number): number {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

export function TripleSlider({
  items,
  onOpen,
}: {
  items: CollectionAsset[];
  onOpen: (a: CollectionAsset) => void;
}) {
  const frames = items.filter((a) => a.kind === "image");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(3);
  const [wrapW, setWrapW] = useState(0);
  const [index, setIndex] = useState(0);

  // Measure the viewport so card width = wrapW / perView (equal columns). The
  // ResizeObserver fires once on observe() for the initial size, and again on
  // any width change (a window resize also resizes this width-based element).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setPerView(perViewFor(window.innerWidth));
      setWrapW(el.clientWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxIndex = Math.max(0, frames.length - perView);
  // Clamp during render (rather than in an effect) so a smaller maxIndex — e.g.
  // after perView grows on resize — never leaves the track scrolled past the end.
  const clamped = Math.min(index, maxIndex);

  const cardW = wrapW > 0 ? wrapW / perView : 0;
  const go = (dir: number) => setIndex(Math.max(0, Math.min(maxIndex, clamped + dir)));

  if (frames.length === 0) return null;

  const from = clamped + 1;
  const to = Math.min(clamped + perView, frames.length);

  return (
    <div className="w-full">
      <div ref={wrapRef} className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: -clamped * cardW }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          {frames.map((f) => (
            <div
              key={f.url}
              className="flex-none"
              style={{ width: cardW > 0 ? `${cardW}px` : `${100 / perView}%` }}
            >
              <button
                type="button"
                onClick={() => onOpen(f)}
                aria-label={`View ${f.caption ?? f.name}`}
                className="group block w-full px-2.5 text-left outline-none sm:px-4"
              >
                <div className="relative h-[42vh] w-full overflow-hidden border border-white/10 bg-white/[0.03] outline-none transition-colors duration-300 group-hover:border-white/30 group-focus-visible:border-white/60 sm:h-[50vh]">
                  <Image
                    src={f.url}
                    alt={f.caption ?? f.name}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                {f.caption && (
                  <p className="tata-body mt-4 max-w-[22rem] text-[0.7rem] leading-relaxed text-white/55">
                    {f.caption}
                  </p>
                )}
              </button>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between px-2.5 sm:px-4">
        <span className="tata-body text-[0.62rem] uppercase tracking-[0.14em] text-white/45 tabular-nums">
          {from}{to > from ? `–${to}` : ""} / {frames.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={clamped === 0}
            aria-label="Previous"
            className="tata-body rounded-full border border-white/25 px-4 py-3 text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-default disabled:opacity-25 disabled:hover:border-white/25 disabled:hover:text-white/80"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={clamped >= maxIndex}
            aria-label="Next"
            className="tata-body rounded-full border border-white/25 px-4 py-3 text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-default disabled:opacity-25 disabled:hover:border-white/25 disabled:hover:text-white/80"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
