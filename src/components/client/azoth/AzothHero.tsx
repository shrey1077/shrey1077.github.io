"use client";

/**
 * AzothHero — the client-supplied hero, ported from their Bolt export.
 *
 * A full-viewport forest scene where the cursor carries a spotlight: inside the
 * circle a second exposure of the same scene shows through. Four species sit on
 * the floor as pins; hovering one raises a card.
 *
 * Three things changed in the port, all for the same reason — the original ran
 * a full-viewport `canvas.toDataURL()` on every mouse move, which serialises a
 * PNG per frame and re-rendered React at 60fps:
 *
 *  1. The spotlight is a CSS radial-gradient mask, not a canvas. Same look,
 *     no serialisation, and it composites on the GPU.
 *  2. The pointer is written straight to CSS custom properties in a rAF loop,
 *     so moving the mouse never re-renders React at all.
 *  3. Touch devices have no cursor, so the spotlight would simply never appear.
 *     There, the reveal layer holds a slow drift instead (and reduced-motion
 *     settles it in the centre).
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { AZOTH_HERO, AZOTH_SPECIES, type AzothSpecies } from "@/constants/azothHero";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Spotlight radius in px. */
const SPOTLIGHT_R = 260;
/** Pointer easing per frame — lower is laggier, 0.1 matches the original. */
const EASE = 0.1;

function SpeciesPin({ species, index }: { species: AzothSpecies; index: number }) {
  return (
    <div
      className="group absolute z-[45] flex -translate-x-1/2 cursor-pointer select-none flex-col items-center"
      style={{ left: `${species.leftPct}%`, bottom: "25%" }}
    >
      {/* The card. Held closed until the pin has been hovered a beat, so
          sweeping the mouse across the floor doesn't flash all four open. */}
      <div className="pointer-events-none w-[220px] translate-y-3 scale-95 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-200">
        <div
          className="overflow-hidden rounded-2xl backdrop-blur-lg"
          style={{
            background: "rgba(8,8,10,0.88)",
            border: `1px solid ${species.color}50`,
            boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${species.color}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <div className="relative h-[130px] overflow-hidden">
            <Image src={species.image} alt="" fill sizes="220px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(8,8,10,0.85)]" />
            <div className="absolute inset-x-3 bottom-2">
              <p className="text-sm font-semibold leading-tight text-white">{species.name}</p>
              <p className="mt-0.5 text-[10px]" style={{ color: species.accent }}>
                {species.subtitle}
              </p>
            </div>
          </div>

          <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${species.color}, ${species.accent})` }} />

          <div className="p-3.5">
            <ul className="mb-3 flex flex-col gap-1.5">
              {species.qualities.map((q) => (
                <li key={q} className="flex items-start gap-2 text-[11px] leading-tight text-white/70">
                  <span
                    aria-hidden
                    className="mt-[3px] size-[5px] shrink-0 rounded-full"
                    style={{ background: species.color }}
                  />
                  {q}
                </li>
              ))}
            </ul>
            <div className="rounded-lg px-2.5 py-1.5" style={{ background: `${species.color}18` }}>
              <p className="mb-0.5 text-[9px] uppercase tracking-[0.14em]" style={{ color: species.accent }}>
                Best for
              </p>
              <p className="text-[10px] font-medium text-white/80">{species.bestFor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stem — grows out of the floor on hover. */}
      <div
        className="w-[1.5px] rounded-sm transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] h-0 group-hover:h-[110px]"
        style={{ background: `linear-gradient(to bottom, ${species.color}ee, ${species.color}30)` }}
      />
      <div
        className="-mt-[3px] size-1.5 rounded-full transition-all duration-200 group-hover:size-2.5"
        style={{ background: species.color, boxShadow: `0 0 0 0 ${species.color}88` }}
      />

      <div
        className="relative size-[76px] overflow-hidden rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:scale-110"
        style={{
          border: `2.5px solid ${species.color}70`,
          boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
        }}
      >
        <Image src={species.image} alt={species.name} fill sizes="76px" priority={index < 2} className="object-cover" />
      </div>

      <p
        className="mt-2 max-w-[90px] truncate text-center text-[10px] font-semibold tracking-wide text-white/65 transition-colors duration-200"
        style={{ ["--hover" as string]: species.accent }}
      >
        {species.short}
      </p>

      <div aria-hidden className="mt-0.5 h-1.5 w-[60px] rounded-full bg-black/35 blur-[4px]" />
    </div>
  );
}

export function AzothHero() {
  const rootRef = useRef<HTMLElement>(null);
  const target = useRef({ x: -9999, y: -9999 });
  const smooth = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isTouch = useMediaQuery("(hover: none)");

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // No cursor to follow: park the spotlight centre-stage so the second
    // exposure is still discoverable, and let the CSS drift do the rest.
    if (isTouch || reduceMotion) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${r.width / 2}px`);
      el.style.setProperty("--spot-y", `${r.height * 0.55}px`);
      return;
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.x = e.clientX - r.left;
      target.current.y = e.clientY - r.top;
    };
    // The pointer is written to CSS custom properties rather than React state:
    // the mask reads them directly, so a mouse move costs one style write
    // instead of a re-render. Declared here so the loop can reference itself
    // without the hook-ordering problem a self-calling useCallback creates.
    const tick = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * EASE;
      smooth.current.y += (target.current.y - smooth.current.y) * EASE;
      el.style.setProperty("--spot-x", `${smooth.current.x.toFixed(1)}px`);
      el.style.setProperty("--spot-y", `${smooth.current.y.toFixed(1)}px`);
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isTouch, reduceMotion]);

  const mask = `radial-gradient(circle ${SPOTLIGHT_R}px at var(--spot-x, -9999px) var(--spot-y, -9999px), #000 0%, #000 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, transparent 100%)`;

  return (
    <section
      ref={rootRef}
      aria-label="Azoth Biotech — inspired by nature"
      className="azoth-hero relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-black"
    >
      {/* Base exposure. */}
      <div className="azoth-hero-zoom absolute inset-0 z-10">
        <Image src={AZOTH_HERO.base} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* The spotlit exposure, revealed through the cursor mask. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-30 ${isTouch && !reduceMotion ? "azoth-hero-drift" : ""}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <Image src={AZOTH_HERO.reveal} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* Species pins — desktop only; at phone width four cards cannot coexist
          with the headline, and they depend on hover to open at all. */}
      <div aria-hidden className="hidden lg:block">
        {AZOTH_SPECIES.map((s, i) => (
          <SpeciesPin key={s.id} species={s} index={i} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[16%] z-20 flex justify-center px-5 text-center">
        <h1
          className="azoth-hero-anim azoth-hero-reveal font-azoth-display whitespace-nowrap text-[clamp(2rem,13.6vw,15rem)] italic leading-none text-white"
          style={{ letterSpacing: "-0.06em", animationDelay: "0.25s" }}
        >
          {AZOTH_HERO.headline}
        </h1>
      </div>

      <div
        className="azoth-hero-anim azoth-hero-fade absolute bottom-14 left-6 z-50 hidden max-w-[260px] sm:block md:left-14"
        style={{ animationDelay: "0.7s" }}
      >
        <p className="text-sm leading-relaxed text-white/80">{AZOTH_HERO.leftNote}</p>
      </div>

      <div
        className="azoth-hero-anim azoth-hero-fade absolute inset-x-5 bottom-10 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[260px] sm:gap-5 md:right-14"
        style={{ animationDelay: "0.85s" }}
      >
        <p className="text-xs leading-relaxed text-white/80 sm:text-sm">{AZOTH_HERO.rightNote}</p>
        <a
          href="#work"
          className="rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white outline-none transition-all duration-300 hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95"
        >
          {AZOTH_HERO.cta}
        </a>
      </div>
    </section>
  );
}
