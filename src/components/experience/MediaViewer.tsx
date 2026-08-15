"use client";

/**
 * MediaViewer — focused viewing of a single asset (framework, Phase 2.6).
 *
 * A quiet, gallery-white lightbox: the asset large and centered, its name as
 * mono meta, dismissed by the backdrop, the ✕, or Escape. Images render today;
 * video/document viewing extends `renderAsset` later without changing the API.
 *
 * Not yet wired into AssetGrid — the future immersive gallery decides how
 * viewing opens. Controlled component: `asset` (null = closed) + `onClose`.
 * Uses the viewer layer of the z-hierarchy (constants/design.ts).
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ContentAsset } from "@/content/catalogue";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

interface MediaViewerProps {
  /** The asset being viewed, or null when closed. */
  asset: ContentAsset | null;
  onClose: () => void;
  /** Supply both to turn the lightbox into a slider. Omit for a single plate —
   *  the arrows and the counter only appear when there is somewhere to go. */
  onPrev?: () => void;
  onNext?: () => void;
  /** 1-based position, for the counter. */
  position?: { at: number; of: number };
}

export function MediaViewer({
  asset,
  onClose,
  onPrev,
  onNext,
  position,
}: MediaViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Handlers live in a ref so the effect below can depend on OPEN/CLOSED alone.
  // Written in an effect, not during render — the parent hands us fresh
  // closures every step, and mutating a ref mid-render is a lint error here.
  const nav = useRef({ onClose, onPrev, onNext });
  useEffect(() => {
    nav.current = { onClose, onPrev, onNext };
  });

  // Keyed on whether the viewer is open, NOT on which asset is showing. Keying
  // it on `asset` would tear down and rebuild on every step of the slider —
  // re-locking scroll and yanking focus back to Close between pictures.
  const open = asset !== null;

  // While open: Escape closes, arrows walk, background scroll is locked, focus
  // moves to the close control and is restored to the opener on dismiss.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") nav.current.onClose();
      // The arrow keys are how anyone actually walks a slider.
      if (e.key === "ArrowLeft") nav.current.onPrev?.();
      if (e.key === "ArrowRight") nav.current.onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={asset.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast, ease: EASE_OUT }}
          className="fixed inset-0 flex flex-col bg-white/97 backdrop-blur-sm"
          style={{ zIndex: Z_INDEX.viewer }}
          onClick={onClose}
        >
          <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
            {position ? (
              <span
                className={`${typeVoiceClass("logic", "meta")} text-xs tabular-nums text-neutral-400`}
              >
                {String(position.at).padStart(2, "0")} / {String(position.of).padStart(2, "0")}
              </span>
            ) : (
              <span />
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className={`${typeVoiceClass("logic", "meta")} rounded px-2 py-1 text-xs text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40`}
            >
              Close ✕
            </button>
          </div>

          {/* Arrows sit outside the stopPropagation wrapper's flow but above
              the backdrop, so a click on one steps rather than closing. */}
          {onPrev && onNext && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full px-4 py-6 text-2xl text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:left-4"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full px-4 py-6 text-2xl text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:right-4"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative m-6 flex-1 sm:m-10"
            onClick={(e) => e.stopPropagation()}
          >
            {asset.kind === "image" ? (
              <Image
                src={asset.url}
                alt={asset.name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-neutral-500 underline-offset-4 hover:underline"
                >
                  Open {asset.name}
                </a>
              </div>
            )}
          </div>

          <p
            className={`${typeVoiceClass("logic", "meta")} pb-6 text-center text-[0.6rem] text-neutral-500`}
          >
            {asset.name}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
