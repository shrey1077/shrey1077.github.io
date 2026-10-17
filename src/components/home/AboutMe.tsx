"use client";

/**
 * AboutMe — the "About me" button on the first slide, and the pop-up it
 * opens (owner, 2026-10-16: "Love this for a About me Button at 1st slide
 * that opens into a popup on click", sharing their own account of
 * themselves, then: "Complete the rest of journey at ABS where i worked for
 * hundreds of american brands for wholesale and distribution ads, also
 * developed complete branding identity for the company, apart from
 * developing two brands Luzid and Kartpipe and marketing collateral for all,
 * While parallely working on developing Azoth Biotech's Identity with
 * additional brands like Naturalist, MushroomWorks, MycoActives, Kavaka,
 * MycoVeda").
 *
 * THE WORDS ARE THE OWNER'S: their account as they wrote it (a missing space
 * mended, and the line about UID put in the past, the journey having gone on
 * since); then ABS and Azoth in their words; then Tata IIS, in theirs too
 * ("then i spent next 2.5 years with Tata IIS, joined as individual
 * contributor, then hired as Assistant Manager, leaving as Lead Manager-
 * Graphic Designer in Sept 2026"), with what the site already says of it.
 *
 * The pop-up is portalled to <body> — the first slide lives in the
 * Flythrough's transformed stage, which would make a `position: fixed` box
 * fixed to IT — and marks the root `data-modal` while open, so the
 * Flythrough leaves the wheel and the keys alone. Escape, the close button or
 * a click outside shuts it; the focus goes in and comes back. It arrives in
 * squares (usePixelPresence).
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { SITE } from "@/constants/site";
import { HOME_TYPE } from "@/constants/faces";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;

/** Their account, then the journey since. */
const STORY: readonly string[] = [
  "I would like to describe myself as a person who is passionate about three things majorly, environment, design and writing, but not necessarily in that order.",
  "For my bachelors degree in IT, I was fortunate to have spent five years in Himachal Pradesh’s Solan district. The beautiful mountain life was a gifted experience and all the challenges attached with it were welcomed by myself.",
  "It was there in JUIT Waknaghat campus when I first started my basic animation study for a module, and found myself hooked to the field of design.",
  "This foundation led me to various fields of design from 3D animations, VFX and graphics designing. I was lucky to find job opportunities that provided me a platform to grow upon. I had strong linguistic skills from early childhood which helped me to work for a few well-known news media houses where I was able to enhance all my skills in a better way.",
  "I always wanted to have a formal education in design and I was fortunate to be a part of an institute like UID to fulfill that dream.",
  "From there I joined ABS Wholesale in the USA, where I worked for hundreds of American brands on their wholesale and distribution ads. I developed the complete branding identity for the company, developed two brands of its own, Luzid and Kartpipe, and made the marketing collateral for all of them.",
  "In parallel, I was developing Azoth Biotech’s identity, with its additional brands — Naturalist, MushroomWorks, MycoActives, Kavaka and MycoVeda.",
  "Then I spent the next 2.5 years with Tata IIS: I joined as an individual contributor, was then hired as Assistant Manager, and left as Lead Manager — Graphic Designer in September 2026. There I built the identity on a strict construction grid and redesigned the Tata IIS logo from its earlier version, setting it in Copperplate Gothic.",
  "Today I’m upskilling in AI film making and AI agents.",
];

function AboutDialog({ open, onClose, reduceMotion }: { open: boolean; onClose: () => void; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(open, { cell: 12, duration: 0.55, reduceMotion });
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const opener = document.activeElement as HTMLElement | null;
    root.dataset.modal = "about";
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
      if (root.dataset.modal === "about") delete root.dataset.modal;
      root.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);
  return createPortal(
    <div
      ref={ref}
      className={`${HOME_TYPE} fixed inset-0 z-[300] grid place-items-center bg-neutral-950/55 p-4 backdrop-blur-sm ${open ? "" : "invisible"}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-me-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[min(88svh,46rem)] w-[min(94vw,60rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-neutral-200 outline-none"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-200 px-5 pb-4 pt-5 sm:px-8 sm:pt-7">
          <div>
            <p className={META}>About me</p>
            <h2 id="about-me-title" className="face-logic digibra-light mt-2 text-[clamp(1.5rem,3.4vw,2.4rem)] uppercase leading-none text-neutral-900">
              {SITE.name}
            </h2>
            <p className="mt-1.5 text-[0.85rem] text-neutral-500">{`${SITE.title} & AI Filmmaker`}</p>
          </div>
          <PixelButton side="logic" size="sm" onClick={onClose} ariaLabel="Close About me">
            Close ✕
          </PixelButton>
        </div>
        {/* Two columns on a wide screen; the words scroll inside the panel if
            a small one cannot hold them. */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <div className="gap-10 text-[0.92rem] leading-relaxed text-neutral-700 lg:columns-2">
            {STORY.map((p, i) => (
              <p key={i} className={`mb-4 break-inside-avoid ${i === 5 ? "lg:break-before-column" : ""}`}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function AboutMe() {
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  // Nothing in the portal until first asked for — the page is built ahead of
  // time, and a portal there would not match it when the page comes alive.
  const [ever, setEver] = useState(false);
  if (open && !ever) setEver(true);
  return (
    <>
      <span className="pointer-events-auto inline-block">
        <PixelButton side="logic" size="sm" onClick={() => setOpen(true)} ariaHaspopup="dialog">
          About me <span aria-hidden>→</span>
        </PixelButton>
      </span>
      {ever && <AboutDialog open={open} onClose={() => setOpen(false)} reduceMotion={reduceMotion} />}
    </>
  );
}
