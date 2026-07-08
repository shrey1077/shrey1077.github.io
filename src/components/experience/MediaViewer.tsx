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

import { useEffect } from "react";
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
}

export function MediaViewer({ asset, onClose }: MediaViewerProps) {
  // Escape closes — bound only while open.
  useEffect(() => {
    if (!asset) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asset, onClose]);

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
          <div className="flex items-center justify-end px-6 pt-6 sm:px-10">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
            >
              Close ✕
            </button>
          </div>

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
            className={`${typeVoiceClass("logic", "meta")} pb-6 text-center text-[0.6rem] text-neutral-400`}
          >
            {asset.name}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
