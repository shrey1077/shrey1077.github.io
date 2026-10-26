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
 *
 * ⚠ IT ALSO STANDS ON THE HOME PAGE (owner, 2026-10-15: "for azoth slide, i
 * want the users to experience the rocky artwork with mushroom on hover, on
 * the slide itself"), as the Azoth slide — `variant="slide"`. The same scene,
 * spotlight and mushrooms, with three differences: it fills its slide rather
 * than the viewport; its pictures wait for their room (nearness) rather than
 * loading first; and its headline is a paragraph — the home page has its own
 * h1 — and its strip stands clear of the home page's band and corner buttons,
 * its button opening the Azoth page.
 * ⚠ AND ON THE SLIDE THE HEADLINE IS THE LOGO (owner, 2026-10-15: "on top
 * left keep a big Azoth Biotech white logo landscape, and under it write the
 * inspired by nature in small letters matching logo width"): the white
 * horizontal lockup, top left under the strip, and "Inspired by Nature" set
 * to exactly its width (SVG text, textLength). The big headline behind the
 * rock stays on the Azoth page only. Its strip along the foot went too:
 * the mushroom under the cursor is named in big serif italic in the lower
 * right instead.
 * ⚠ AND SINCE 2026-10-19 THE PAGE IS DRESSED AS THE SLIDE (owner: "on azoth
 * page, replace the top artwork with our slide artwork on main page azoth's
 * slide"): the lockup top left, the family along the foot, the mushroom's
 * name lower right — placed for a page (no band, no strip above) — and the
 * hero's own "Explore" pill where the slide has its button. The big headline
 * behind the rock and the strip of details went from the page with it; the
 * page's h1 is kept, unseen. HeroStrip is kept, unused.
 */

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { RoomImage } from "@/components/home/nearness";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { COMPANY_ABOUT } from "@/constants/companyAbout";
import { AZOTH_HERO, AZOTH_SPECIES, type AzothSpecies } from "@/constants/azothHero";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** The white horizontal lockup, for the slide's top-left (482 × 123 — the
 *  largest on disk; a bigger export would be sharper on high-density
 *  screens). */
/** A found mushroom's stay, and its fade after it. */
const FOUND_HOLD_MS = 5000;
const FOUND_FADE_MS = 700;
const SLIDE_LOGO = { src: "/content/clients/azoth-biotech/brand/marks/lockup-horizontal-white.webp", w: 482, h: 123 };
/** The family under Azoth, in white, under the lockup on the slide (owner,
 *  2026-10-16: "include Azoth brands except mycoveda in azoth slide as white
 *  logos"; scripts/prepare-azoth-white-brands.mjs). `h` sets each one's
 *  height against the row's, so the four read as one size: a stacked mark
 *  stands taller than a long wordmark. */
const SLIDE_BRANDS = [
  { slug: "naturalist", name: "Naturalist", w: 720, h: 225, size: 0.95 },
  // The official gear since 2026-10-26 (the MW-and-arrow mark until then).
  { slug: "mushroomworks-gear", name: "Mushroomworks", w: 885, h: 886, size: 1.5 },
  { slug: "mycoactive", name: "MycoActives", w: 720, h: 340, size: 1.2 },
  { slug: "kavaka", name: "Kavaka", w: 720, h: 115, size: 0.62 },
] as const;

/** Where the slide's things stand on the PAGE (2026-10-19) — no band, no
 *  sections button: the lockup top left, the family along the foot, the
 *  Explore pill bottom right and the mushroom's name over it. A tall screen
 *  stands the family over the pill, as the slide does over its button. */
const PAGE_TOP_LEFT = "left-5 top-[clamp(1.5rem,6vh,3.5rem)] sm:left-10 lg:left-[5vw]";
const PAGE_FOOT_LEFT = "left-5 bottom-[clamp(1.5rem,5vh,3rem)] sm:left-10 lg:left-[5vw] portrait:bottom-[calc(clamp(1.5rem,5vh,3rem)+3rem+1rem)]";
const PAGE_FOOT_RIGHT = "right-5 bottom-[clamp(1.5rem,5vh,3rem)] sm:right-10 lg:right-[5vw]";
const PAGE_NAME = "right-5 bottom-[calc(clamp(1.5rem,5vh,3rem)+3rem+0.9rem)] sm:right-10 lg:right-[5vw]";

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
/** Kept, unused since 2026-10-19: the page is dressed as the slide now. */
export function HeroStrip({
  species,
  intro,
  slide,
  href,
}: {
  species: AzothSpecies | null;
  intro: boolean;
  slide: boolean;
  href: string;
}) {
  const shown = !!species || intro;
  return (
    <div
      aria-live="polite"
      className={`absolute inset-x-0 z-[55] ${slide ? "bottom-[calc(7svh+0.75rem+2.75rem+0.75rem)]" : "bottom-0"} transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 ${
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
            {!slide && (
            <a
              href={href}
              className="w-fit shrink-0 rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white outline-none transition-all duration-300 hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95"
            >
              {AZOTH_HERO.cta}
            </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AzothHero({ variant = "page" }: { variant?: "page" | "slide" } = {}) {
  const slide = variant === "slide";
  // On the home page the pictures wait for their slide, and nothing jumps the
  // queue ahead of the landing.
  const Image = slide ? RoomImage : NextImage;
  const priority = !slide;
  const rootRef = useRef<HTMLElement>(null);
  const target = useRef({ x: -9999, y: -9999 });
  const smooth = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const isTouch = useMediaQuery("(hover: none)");
  /** A finger has touched the hero: the spotlight follows it from then on. */
  const [fingered, setFingered] = useState(false);
  // Upright below `lg` the scene crops to its middle strip; see atPortrait.
  const portrait = useMediaQuery("(max-width: 1023px) and (orientation: portrait)");
  // Which species the strip shows. React state is fine here: it changes on
  // enter/leave, not per frame.
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = AZOTH_SPECIES.find((s) => s.id === activeId) ?? null;
  // Whether a mouse is over the scene — the intro strip shows only then.
  const [hovering, setHovering] = useState(false);
  // The mushrooms, for the tick to fade, and which one is hovered (held in
  // full whatever the spotlight does).
  const mushRefs = useRef(new Map<string, HTMLDivElement>());
  /** When each mushroom was last found — fully in the spotlight, or hovered.
   *  A found one stays FOUND_HOLD_MS after the spotlight leaves it, then
   *  fades (owner, 2026-10-16: "once a mushroom is found it ll not disappear
   *  back until 5 seconds (if not hovered upon again)"). */
  const foundAt = useRef(new Map<string, number>());
  const activeRef = useRef<string | null>(null);
  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // No cursor to follow: park the spotlight centre-stage so the second
    // exposure is still discoverable, and let the CSS drift do the rest —
    // until a finger touches the hero (below).
    if (reduceMotion || (isTouch && !fingered)) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${r.width / 2}px`);
      el.style.setProperty("--spot-y", `${r.height * 0.55}px`);
      if (reduceMotion) return;
      // A FINGER FINDS THEM TOO (owner, 2026-10-17: "allow user to drag on
      // the screens"): the first touch on the hero hands the spotlight to
      // the finger, which it then follows as it does a mouse.
      const onFirst = (e: TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        const r2 = el.getBoundingClientRect();
        if (t.clientX < r2.left || t.clientX > r2.right || t.clientY < r2.top || t.clientY > r2.bottom) return;
        smooth.current.x = target.current.x = t.clientX - r2.left;
        smooth.current.y = target.current.y = t.clientY - r2.top;
        setFingered(true);
      };
      window.addEventListener("touchstart", onFirst, { passive: true });
      return () => window.removeEventListener("touchstart", onFirst);
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.x = e.clientX - r.left;
      target.current.y = e.clientY - r.top;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || e.touches.length !== 1) return;
      const r = el.getBoundingClientRect();
      target.current.x = t.clientX - r.left;
      target.current.y = t.clientY - r.top;
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
      // Each mushroom, whole: full inside the spotlight's core, gone past
      // its edge — measured from the plant's middle, a little low.
      const r = el.getBoundingClientRect();
      for (const [id, node] of mushRefs.current) {
        const q = node.getBoundingClientRect();
        const d = Math.hypot(q.left + q.width / 2 - r.left - smooth.current.x, q.top + q.height * 0.6 - r.top - smooth.current.y);
        const t = Math.max(0, Math.min(1, (d - SPOTLIGHT_R * 0.35) / (SPOTLIGHT_R * 0.45)));
        const lit = 1 - t * t * (3 - 2 * t);
        const now = performance.now();
        if (lit > 0.9 || activeRef.current === id) foundAt.current.set(id, now);
        const since = now - (foundAt.current.get(id) ?? -Infinity);
        const held = since < FOUND_HOLD_MS ? 1 : Math.max(0, 1 - (since - FOUND_HOLD_MS) / FOUND_FADE_MS);
        node.style.opacity = Math.max(lit, held).toFixed(3);
      }
      raf.current = requestAnimationFrame(tick);
    };

    // The loop runs only while the hero is on screen (speed fix 9,
    // 2026-10-13): it wrote the spotlight every frame after it had scrolled
    // away. Back on screen it eases on from where it stood, as it always did.
    let on = false;
    const run = (v: boolean) => {
      if (v === on) return;
      on = v;
      if (v) raf.current = requestAnimationFrame(tick);
      else if (raf.current) cancelAnimationFrame(raf.current);
    };
    const io = new IntersectionObserver(([e]) => run(e.isIntersecting));
    io.observe(el);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isTouch, reduceMotion, fingered]);

  const mask = `radial-gradient(circle ${SPOTLIGHT_R}px at var(--spot-x, -9999px) var(--spot-y, -9999px), #000 0%, #000 40%, rgba(0,0,0,0.75) 60%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, transparent 100%)`;

  return (
    <section
      ref={rootRef}
      aria-label="Azoth Biotech — inspired by nature"
      className={`azoth-hero relative w-full overflow-hidden bg-black ${slide ? "h-full" : "h-[100svh] min-h-[560px]"}`}
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
        <Image src={AZOTH_HERO.base} alt={`Azoth Biotech — the landscape behind “${AZOTH_HERO.headline}”`} fill priority={priority} sizes="100vw" className="object-cover" />
        {/* The page's h1, unseen — the lockup above says it. */}
        {!slide && <h1 className="sr-only">Azoth Biotech — {AZOTH_HERO.headline}</h1>}
        <Image src={AZOTH_HERO.baseCut} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
      </div>

      {/* The spotlit exposure, revealed through the cursor mask. Its headline
          is a visual copy only — the page h1 is the one in the base layer. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-30 ${isTouch && !fingered && !reduceMotion ? "azoth-hero-drift" : ""}`}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <Image src={AZOTH_HERO.reveal} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
        <Image src={AZOTH_HERO.revealCut} alt="" fill priority={priority} sizes="100vw" className="object-cover" />
      </div>

      {/* The four species, standing on the flowering ridge — found by the
          spotlight, each fading in and out WHOLE as it comes near (the tick
          below), not cut by the spotlight's soft edge: inside the mask they
          showed through in patches (owner, 2026-10-15: "address the
          transparency patches"). Solid cutouts (scripts/make-solid-
          mushrooms.mjs), and no glow (owner: "i dont like that much glow
          around it") — and still under the pointer (owner, 2026-10-16: "they pop up
          a bit, i dont want that, keep it still"). Once found, one stays found
          for five seconds (foundAt). On touch, and with
          reduced motion, they simply stand. */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        <div className={ART_FRAME}>
          {AZOTH_SPECIES.map((s) => (
            <div
              key={s.id}
              ref={(n) => {
                if (n) mushRefs.current.set(s.id, n);
                else mushRefs.current.delete(s.id);
              }}
              data-mushroom={s.id}
              className="absolute aspect-square"
              style={{
                ...footStyle(s, portrait),
                opacity: (isTouch && !fingered) || reduceMotion ? 1 : 0,
                ...(s.fade && {
                  maskImage: `linear-gradient(to bottom, #000 ${s.fade.from}%, transparent ${s.fade.to}%)`,
                  WebkitMaskImage: `linear-gradient(to bottom, #000 ${s.fade.from}%, transparent ${s.fade.to}%)`,
                }),
              }}
            >
              <Image src={s.image} alt={s.name} fill sizes="16vw" className="object-contain object-bottom" />
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

      {/* The white logo, top left, with the line set to its width. On the
          slide, smaller and up in the sections button's row, beside it — the
          words under it clear of the cordyceps and the rock (owner,
          2026-10-26: "the azoth logo and text should not overlap with the
          cordyceps or rocky artwork, make logo smaller and shift up with
          text"; it stood under that row, at 13–30rem, until then). */}
      {(
        <div
          className={`azoth-hero-anim azoth-hero-fade pointer-events-none absolute z-[50] [@media(max-height:31.25rem)]:w-[9.5rem] ${
            slide
              ? "left-4 top-[calc(max(2vh,0.75rem)+0.4rem)] w-[clamp(10rem,22vw,21rem)] sm:left-8 lg:left-[5vw] [@media(max-height:31.25rem)]:top-[calc(max(2vh,0.75rem)+0.2rem)]"
              : `w-[clamp(13rem,32vw,30rem)] ${PAGE_TOP_LEFT}`
          }`}
        >
          <Image src={SLIDE_LOGO.src} alt="Azoth Biotech" width={SLIDE_LOGO.w} height={SLIDE_LOGO.h} sizes="(min-width: 1024px) 32vw, 60vw" className="block h-auto w-full" />
          <svg viewBox={`0 0 ${SLIDE_LOGO.w} 26`} className="mt-[2%] block w-full overflow-visible" role="img" aria-label={AZOTH_HERO.headline}>
            <text x="0" y="19" textLength={SLIDE_LOGO.w} lengthAdjust="spacing" fontSize="17" fill="rgba(255,255,255,0.88)" style={{ textTransform: "uppercase" }}>
              {AZOTH_HERO.headline}
            </text>
          </svg>
          {/* On the slide, the company in a paragraph (owner, 2026-10-20 —
              COMPANY_ABOUT), the lockup's width or a little more. */}
          {slide && (
            <p className="font-helv mt-[clamp(0.6rem,2vh,1.1rem)] w-[max(100%,min(21rem,calc(100vw-2rem)))] text-[0.84rem] leading-snug text-white/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] [@media(max-height:31.25rem)]:text-[0.72rem]">
              {COMPANY_ABOUT["azoth-biotech"]}
            </p>
          )}
        </div>
      )}

      {/* The family under Azoth, in white, along the foot just above the
          band, its left on the lockup's (owner, 2026-10-16: "keep Naturalist
          to kavaka logos at the bottom, just above black band, naturalist
          aligned left with Azoth logo at top, sizes also slightly bigger"). On
          a tall screen it stands over the button rather than beside it. */}
      {(
        <ul
          aria-label="Brands under Azoth Biotech"
          className={`azoth-hero-anim azoth-hero-fade pointer-events-none absolute z-[50] flex items-end gap-[clamp(0.9rem,2.4vw,2.25rem)] [--row:clamp(1.3rem,2.9vw,2.6rem)] [@media(max-height:31.25rem)]:[--row:1.05rem] ${
            slide ? "bottom-[calc(7svh+1rem)] left-4 sm:left-8 lg:left-[5vw] portrait:bottom-[calc(7svh+0.75rem+2.75rem+1rem)]" : PAGE_FOOT_LEFT
          }`}
        >
          {SLIDE_BRANDS.map((b) => (
            <li key={b.slug} className="relative shrink-0" style={{ height: `calc(var(--row) * ${b.size})`, aspectRatio: `${b.w} / ${b.h}` }}>
              <Image src={`/content/clients/azoth-biotech/brand/brands/white/${b.slug}.png`} alt={b.name} fill sizes="12rem" className="object-contain object-bottom opacity-90" />
            </li>
          ))}
        </ul>
      )}

      {/* On the page, where the slide has its button: the way down to the
          rest of the page. */}
      {!slide && (
        <a
          href="#work"
          className={`absolute z-[60] w-fit rounded-full bg-[#e8702a] px-7 py-3 text-sm font-medium text-white outline-none transition-all duration-300 hover:scale-[1.03] hover:bg-[#d2611f] hover:shadow-lg hover:shadow-[#e8702a]/30 focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 ${PAGE_FOOT_RIGHT}`}
        >
          {AZOTH_HERO.cta} <span aria-hidden>↓</span>
        </a>
      )}

      {(
        // On the slide, no strip (owner, 2026-10-15: "remove these bands,
        // instead write the mushrooms' name in the previous font of 'Inspired
        // by Nature' … at the lower right corner just above the button, and
        // big size that accommodates all names in same size"): the name of
        // the mushroom under the cursor, in the headline's serif, one size for
        // all four — set so the longest, "Cordyceps Militaris", fits.
        <div
          aria-live="polite"
          className={`pointer-events-none absolute z-[55] ${slide ? "bottom-[calc(7svh+0.75rem+2.75rem+0.9rem)] right-4 sm:right-8 lg:right-[5vw]" : PAGE_NAME}`}
        >
          <AnimatePresence mode="wait">
            {active && (
              <motion.p
                key={active.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="font-azoth-display whitespace-nowrap text-right text-[clamp(1.6rem,min(4.4vw,8.5svh),4.4rem)] italic leading-none text-white"
                style={{ letterSpacing: "-0.03em", textShadow: `0 0 26px ${active.color}cc, 0 0 8px ${active.accent}66` }}
              >
                {active.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
