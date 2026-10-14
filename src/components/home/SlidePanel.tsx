"use client";

/**
 * SlidePanel — what a button inside a slide opens: the Extincts' Story,
 * Characters and AI Creations, AI Projects' two folders (owner, 2026-10-15).
 *
 * It opens OVER the slide's own content — between the strip along the top and
 * the band along the foot — arriving and leaving in squares
 * (usePixelPresence), and it is sized to fit the screen whole: nothing in it
 * scrolls the page (owner: "no vertical scrolling on any slide"). While open
 * it is a dialog — Escape or its close button shuts it, the focus goes in and
 * comes back — and the wheel, the keys and swipes are its own (`data-modal`,
 * which the Flythrough respects), so a scroll can't fly away from under it.
 */

import { useEffect, useId, useRef, useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { typeVoiceClass } from "@/constants/typography";

export function SlidePanel({
  open,
  onClose,
  side,
  eyebrow,
  title,
  reduceMotion,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side: "logic" | "creative";
  eyebrow: string;
  title: string;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const ref = usePixelPresence<HTMLDivElement>(open, { cell: 10, duration: 0.5, reduceMotion });
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Its contents mount on the first open — nothing in them downloads before.
  const [ever, setEver] = useState(open);
  if (open && !ever) setEver(true);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.modal = "panel";
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      if (root.dataset.modal === "panel") delete root.dataset.modal;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <div
      ref={ref}
      className={`slide-frame absolute inset-0 z-30 flex ${open ? "" : "invisible"}`}
      aria-hidden={!open}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-white/95 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 outline-none backdrop-blur-sm sm:p-6"
      >
        <div className="mb-3 flex shrink-0 items-start justify-between gap-4 sm:mb-4">
          <div className="min-w-0">
            <p className={`${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`}>{eyebrow}</p>
            <h3
              id={titleId}
              className={`mt-1 truncate text-[clamp(1.2rem,2.6vw,2.2rem)] leading-none text-neutral-900 ${
                side === "creative" ? "face-creative font-bold" : "face-logic"
              }`}
            >
              {title}
            </h3>
          </div>
          <PixelButton side={side} size="sm" onClick={onClose} ariaLabel={`Close ${title}`}>
            Close ✕
          </PixelButton>
        </div>
        <div className="min-h-0 flex-1">{ever && children}</div>
      </div>
    </div>
  );
}
