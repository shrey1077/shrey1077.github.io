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
function footStyle(s: AzothSpecies, portrait: boolean): React.CSSProperties {
  const at = portrait ? s.atPortrait : s.at;
  return {
    left: `${at.x}%`,
    top: `${at.y}%`,
    width: `${at.w}%`,
    transform: "translate(-50%, -100%)",
  };
}

/** The strip along the foot of the hero. ONE strip, two contents (owner,
 *  2026-10-03):
 *   · a species — the mushroom being hovered, COLOUR-CODED in its own hue: a
 *     wash of that colour from the left, its colour on the rule, the dots and
 *     the subtitle, so each mushroom's strip is told apart at a glance;
 *   · the intro — the two notes and the CTA that used to sit in the hero's
 *     lower corners, now shown only while the scene is hovered (always on
 *     touch, which has no hover; and whenever the CTA has keyboard focus).
 *  Its contents swap rather than stack, so moving between mushrooms never
 *  shows two. */
function HeroStrip({ species, intro }: { species: AzothSpecies | null; intro: boolean }) {
  const shown = !!species || intro;
  return (
    <div
      aria-live="polite"
      className={`absolute inset-x-0 bottom-0 z-[55] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {species ? (
        <div
          key={species.id}
          className="pointer-events-none border-t backdrop-blur-lg"
          style={{
            borderColor: `${species.color}aa`,
            backgroundColor: "rgba(8,8,10,0.86)",
            backgroundImage: `linear-gradient(90deg, ${species.color}73 0%, ${species.color}26 38%, transparent 70%)`,
          }}
        >
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${species.color}, ${species.accent}, transparent)` }} />
          <div className="mx-auto flex w-full flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:gap-10 md:px-14 md:py-5">
            <div className="shrink-0 md:w-[22%]">
              <p className="font-azoth-display text-xl italic leading-tight text-white md:text-2xl">{species.name}</p>
              <p className="mt-1 text-[11px] font-medium tracking-wide" style={{ color: species.accent }}>
                {species.subtitle}
              </p>
            </div>
            <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1.5 md:grid-cols-4">
              {species.qualities.map((q) => (
                <li key={q} className="flex items-start gap-2 text-xs leading-snug text-white/80">
                  <span aria-hidden className="mt-[5px] size-[6px] shrink-0 rounded-full" style={{ background: species.accent }} />
                  {q}
                </li>
              ))}
            </ul>
            <div className="w-fit shrink-0 rounded-lg px-3 py-2 md:text-right" style={{ background: `${species.color}33` }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: species.accent }}>
                Best for
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/90">{species.bestFor}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-[#e8702a]/40 bg-[rgba(8,8,10,0.86)] backdrop-blur-lg">
          <div className="h-0.5 bg-gradient-to-r from-[#e8702a] via-[#e8702a]/40 to-transparent" />
          <div className="mx-auto flex w-full flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:gap-10 md:px-14 md:py-5">
            <p className="text-xs leading-relaxed text-white/80 md:w-[34%] md:text-sm">{AZOTH_HERO.leftNote}</p>
            <p className="flex-1 text-xs leading-relaxed text-white/80 md:text-sm">{AZOTH_HERO.rightNote}</p>
            <a
              href="#work"
              className="w-fit shrink-0 rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white outline-none transition-all duration-300 hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95"
            >
              {AZOTH_HERO.cta}
            </a>
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
  // Upright below `lg` the scene crops to its middle strip; see atPortrait.
  const portrait = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  // Which species the strip shows. React state is fine here: it changes on
  // enter/leave, not per frame.
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = AZOTH_SPECIES.find((s) => s.id === activeId) ?? null;
  // Whether a mouse is over the scene — the intro strip shows only then.
  const [hovering, setHovering] = useState(false);

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
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovering(true);
      }}
      // ⚠ Also on move: the hero fills the screen, so the page usually loads
      // with the cursor already inside it, and no enter ever fires for that.
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" && !hovering) setHovering(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHovering(false);
      }}
    >
      {/* Base exposure — and the headline, ALWAYS visible since 2026-10-03
          (owner), still behind the rock: it sits between the exposure and a
          copy of it with the sky cut away (scripts/prepare-azoth-hero-cut.mjs),
          so the ridge passes in front of it. The spotlit layer above carries
          its own copy the same way, so inside the spotlight it reads through
          the flowering ridge too. */}
      <div className="azoth-hero-zoom absolute inset-0 z-10">
        <Image src={AZOTH_HERO.base} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-[16%] flex justify-center px-5 text-center">
          <h1
            className="azoth-hero-anim azoth-hero-reveal font-azoth-display whitespace-nowrap text-[clamp(1.5rem,10.2vw,11.25rem)] italic leading-none text-white"
            style={{ letterSpacing: "-0.06em", animationDelay: "0.25s" }}
          >
            {AZOTH_HERO.headline}
          </h1>
        </div>
        <Image src={AZOTH_HERO.baseCut} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      {/* The spotlit exposure, revealed through the cursor mask. Its headline
          is a visual copy only — the page h1 is the one in the base layer. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-30 ${isTouch && !reduceMotion ? "azoth-hero-drift" : ""}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <Image src={AZOTH_HERO.reveal} alt="" fill priority sizes="100vw" className="object-cover" />
        {/* The headline, BEHIND THE ROCK: a quarter smaller than the
            client's (2026-10-02), between this exposure and its sky-cut copy. */}
        <div className="absolute inset-x-0 top-[16%] flex justify-center px-5 text-center">
          <p
            className="azoth-hero-anim azoth-hero-reveal font-azoth-display whitespace-nowrap text-[clamp(1.5rem,10.2vw,11.25rem)] italic leading-none text-white"
            style={{ letterSpacing: "-0.06em", animationDelay: "0.25s" }}
          >
            {AZOTH_HERO.headline}
          </p>
        </div>
        <Image src={AZOTH_HERO.revealCut} alt="" fill priority sizes="100vw" className="object-cover" />
        {/* The four species, standing on the flowering ridge. ⚠ INSIDE the
            masked layer on purpose: they exist only where the spotlight is, so
            they are found by hovering the scene, never shown outright. */}
        <div className={ART_FRAME}>
          {AZOTH_SPECIES.map((s) => (
            // Colour-coded (owner, 2026-10-03): each mushroom glows in its own
            // hue — the one its strip is washed with — harder while hovered.
            <div
              key={s.id}
              className={`absolute aspect-square transition-[filter,transform] duration-300 ${
                active?.id === s.id ? "scale-[1.04]" : ""
              }`}
              style={{
                ...footStyle(s, portrait),
                filter:
                  active?.id === s.id
                    ? `drop-shadow(0 0 18px ${s.color}) drop-shadow(0 0 6px ${s.accent}) brightness(1.1)`
                    : `drop-shadow(0 0 10px ${s.color}aa)`,
              }}
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
              style={footStyle(s, portrait)}
              onPointerEnter={() => setActiveId(s.id)}
              onPointerLeave={() => setActiveId((id) => (id === s.id ? null : id))}
              onFocus={() => setActiveId(s.id)}
              onBlur={() => setActiveId((id) => (id === s.id ? null : id))}
              onClick={() => setActiveId((id) => (id === s.id && isTouch ? null : s.id))}
            />
          ))}
        </div>
      </div>

      <HeroStrip species={active} intro={!active && (hovering || isTouch)} />
    </section>
  );
}
