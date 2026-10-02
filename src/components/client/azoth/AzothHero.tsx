"use client";

/**
 * AzothHero — the client-supplied hero, ported from their Bolt export.
 *
 * A full-viewport forest scene where the cursor carries a spotlight: inside the
 * circle a second exposure of the same scene shows through — a flowering ridge,
 * with the four species standing on it, so a mushroom is only ever seen inside
 * the spotlight. Hovering one runs its details along the foot of the hero.
 * (Until 2026-10-02 the species were pins on the floor raising floating cards;
 * the owner replaced both.)
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

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { AZOTH_HERO, AZOTH_SPECIES, type AzothSpecies } from "@/constants/azothHero";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Spotlight radius in px. */
const SPOTLIGHT_R = 260;
/** Pointer easing per frame — lower is laggier, 0.1 matches the original. */
const EASE = 0.1;

/** The artwork's own frame (both exposures are 1280×720), laid over the
 *  section exactly as `object-cover` lays the images: centred, scaled to
 *  cover. Anything placed inside it in percent stays pinned to the same spot
 *  on the ridge however the viewport crops the scene. */
const ART_FRAME =
  "absolute left-1/2 top-1/2 aspect-[16/9] w-[max(100%,calc(100svh*16/9))] -translate-x-1/2 -translate-y-1/2";

/** A species placed by its foot on the ridge. */
function footStyle(s: AzothSpecies): React.CSSProperties {
  return {
    left: `${s.at.x}%`,
    top: `${s.at.y}%`,
    width: `${s.at.w}%`,
    transform: "translate(-50%, -100%)",
  };
}

/** The strip along the foot of the hero for the hovered species — replaces the
 *  floating cards the pins used to raise (owner, 2026-10-02). One strip, full
 *  width; its contents swap, so moving between mushrooms never stacks two. */
function SpeciesStrip({ species }: { species: AzothSpecies | null }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[55] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        species ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {species && (
        <div
          key={species.id}
          className="border-t bg-[rgba(8,8,10,0.86)] backdrop-blur-lg"
          style={{ borderColor: `${species.color}66` }}
        >
          <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${species.color}, ${species.accent}, transparent)` }} />
          <div className="mx-auto flex w-full flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:gap-10 md:px-14 md:py-5">
            <div className="shrink-0 md:w-[22%]">
              <p className="font-azoth-display text-xl italic leading-tight text-white md:text-2xl">{species.name}</p>
              <p className="mt-1 text-[11px] tracking-wide" style={{ color: species.accent }}>
                {species.subtitle}
              </p>
            </div>
            <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1.5 md:grid-cols-4">
              {species.qualities.map((q) => (
                <li key={q} className="flex items-start gap-2 text-xs leading-snug text-white/75">
                  <span
                    aria-hidden
                    className="mt-[5px] size-[5px] shrink-0 rounded-full"
                    style={{ background: species.color }}
                  />
                  {q}
                </li>
              ))}
            </ul>
            <div className="shrink-0 md:text-right">
              <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: species.accent }}>
                Best for
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/85">{species.bestFor}</p>
            </div>
          </div>
        </div>
      )}
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
  // Which species the strip shows. React state is fine here: it changes on
  // enter/leave, not per frame.
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = AZOTH_SPECIES.find((s) => s.id === activeId) ?? null;

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

      {/* The spotlit exposure, revealed through the cursor mask. ⚠ NOT
          aria-hidden any more: the page h1 lives in here. */}
      <div
        className={`pointer-events-none absolute inset-0 z-30 ${isTouch && !reduceMotion ? "azoth-hero-drift" : ""}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <Image src={AZOTH_HERO.reveal} alt="" fill priority sizes="100vw" className="object-cover" />
        {/* The headline, BEHIND THE ROCK (owner, 2026-10-02): a quarter
            smaller than the client's, and set inside the masked layer between
            the full exposure and a copy of it with the sky cut away — so it is
            only seen inside the spotlight, and there only in the negative
            space, the ridge passing in front of it. It used to sit above
            everything at z-20, always visible. */}
        <div className="absolute inset-x-0 top-[16%] flex justify-center px-5 text-center">
          <h1
            className="azoth-hero-anim azoth-hero-reveal font-azoth-display whitespace-nowrap text-[clamp(1.5rem,10.2vw,11.25rem)] italic leading-none text-white"
            style={{ letterSpacing: "-0.06em", animationDelay: "0.25s" }}
          >
            {AZOTH_HERO.headline}
          </h1>
        </div>
        <Image src={AZOTH_HERO.revealCut} alt="" fill priority sizes="100vw" className="object-cover" />
        {/* The four species, standing on the flowering ridge. ⚠ INSIDE the
            masked layer on purpose: they exist only where the spotlight is, so
            they are found by hovering the scene, never shown outright. */}
        <div className={ART_FRAME}>
          {AZOTH_SPECIES.map((s) => (
            <div
              key={s.id}
              className={`absolute aspect-square transition-[filter,transform] duration-300 ${
                active?.id === s.id ? "scale-[1.04] brightness-110" : ""
              }`}
              style={footStyle(s)}
            >
              <Image src={s.image} alt="" fill sizes="16vw" className="object-contain object-bottom" />
            </div>
          ))}
        </div>
      </div>

      {/* Hit areas over each mushroom — outside the mask, since the masked
          layer takes no pointer events. Hover (or focus, or tap on touch)
          sets the species the strip shows. */}
      <div className="pointer-events-none absolute inset-0 z-[45] overflow-hidden">
        <div className={ART_FRAME}>
          {AZOTH_SPECIES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.name}
              aria-pressed={active?.id === s.id}
              className="pointer-events-auto absolute aspect-square cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={footStyle(s)}
              onPointerEnter={() => setActiveId(s.id)}
              onPointerLeave={() => setActiveId((id) => (id === s.id ? null : id))}
              onFocus={() => setActiveId(s.id)}
              onBlur={() => setActiveId((id) => (id === s.id ? null : id))}
              onClick={() => setActiveId((id) => (id === s.id && isTouch ? null : s.id))}
            />
          ))}
        </div>
      </div>

      <SpeciesStrip species={active} />

      {/* The two notes and the CTA step aside while the strip is up — they
          share the foot of the hero with it. ⚠ Faded on this WRAPPER: the
          notes' own entrance animation holds their opacity with fill-mode
          forwards, which would override a class on them. */}
      <div
        className={`transition-opacity duration-300 ${active ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
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
      </div>
    </section>
  );
}
