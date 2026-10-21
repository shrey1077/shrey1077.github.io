"use client";

/**
 * CertificateDialog — the AI Film Making certificate, over the page, and the
 * button that opens it.
 *
 * The dialog stood in the brain slide's glance row (BrainFooter), opened by a
 * "Certificate ↗" chip beside "AI Film Making · Upskilled", from 2026-10-16
 * until 2026-10-22, when the owner moved it to the first slide: a third button
 * under the orb, beside About me and Download resume ("same pop up we have for
 * certificate, move it to this button" — HeroStage).
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { PixelButton } from "@/components/home/PixelButton";
import { HOME_TYPE } from "@/constants/faces";

/** The certificate the owner supplied (scripts/prepare-certificate.mjs). */
const CERTIFICATE = {
  src: "/content/about/ai-film-making-certificate.webp",
  pdf: "/content/about/ai-film-making-certificate.pdf",
  w: 1800,
  h: 1013,
  alt: "Certificate of completion: Shrey Singh, the 8-Week AI Film Making Program, Videopreneur Studios",
};

/** The first slide's button, and the dialog it opens. */
export function CertificateButton() {
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  return (
    <>
      <span className="pointer-events-auto inline-block">
        <PixelButton side="logic" size="sm" onClick={() => setOpen(true)} ariaHaspopup="dialog">
          AI filmmaking certificate <span aria-hidden>↗</span>
        </PixelButton>
      </span>
      <CertificateDialog open={open} onClose={() => setOpen(false)} reduceMotion={reduceMotion} />
    </>
  );
}

/**
 * The certificate, over the page. Portalled to <body>: the stage it is opened
 * from is transformed, which would make a `position: fixed` box fixed to IT.
 * While open it marks the root `data-modal`, which the Flythrough reads to
 * leave the wheel and the keys alone; Escape, the close button or a click
 * outside shuts it, and the focus goes back.
 */
export function CertificateDialog({ open, onClose, reduceMotion }: { open: boolean; onClose: () => void; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(open, { cell: 12, duration: 0.55, reduceMotion });
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  const [ever, setEver] = useState(open);
  if (open && !ever) setEver(true);
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const opener = document.activeElement as HTMLElement | null;
    root.dataset.modal = "certificate";
    // The page behind stays put: no wheel or swipe scrolls it while open.
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (root.dataset.modal === "certificate") delete root.dataset.modal;
      root.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);
  // Nothing until first asked for — the page is built ahead of time, and a
  // portal there would not match it when the page comes alive.
  if (!ever) return null;
  return createPortal(
    <div
      ref={ref}
      className={`${HOME_TYPE} fixed inset-0 z-[300] grid place-items-center bg-neutral-950/70 p-4 backdrop-blur-sm ${open ? "" : "invisible"}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Film Making — certificate of completion"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex w-[min(92vw,64rem,calc((100svh-9rem)*16/9))] flex-col gap-3 outline-none"
      >
        <div
          className="relative w-full overflow-hidden rounded-lg shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
          style={{ aspectRatio: `${CERTIFICATE.w} / ${CERTIFICATE.h}` }}
        >
          {ever && (
            // eslint-disable-next-line @next/next/no-img-element -- loaded only once asked for
            <img src={CERTIFICATE.src} alt={CERTIFICATE.alt} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-helv text-[0.78rem] leading-snug text-white/80">
            Certificate of completion · 8-Week AI Film Making Program · Videopreneur Studios
          </p>
          <div className="flex items-center gap-2">
            <PixelButton side="logic" size="sm" href={CERTIFICATE.pdf}>
              Open PDF <span aria-hidden>↗</span>
            </PixelButton>
            <PixelButton side="logic" size="sm" onClick={onClose} ariaLabel="Close the certificate">
              Close ✕
            </PixelButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
