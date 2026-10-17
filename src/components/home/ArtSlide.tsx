"use client";

/**
 * ArtSlide — Arts & Crafts on the right side.
 *
 * ONE PIECE AT A TIME since 2026-10-15 (owner: "Lets have one continuous
 * slider with one image only transitioning every 5 seconds to the left with
 * pixel effect"); it was three rows sliding sideways. The piece fills the
 * slide between the strip and the band, whole (never cropped), and every
 * STEP_MS the next one comes in from the right: both drift left a little
 * while the screen's small squares hand over from one to the other, the
 * right-hand ones first — the Flythrough's pixel dissolve (pixelDissolve), on
 * a smaller square. It runs only while the slide is the one on screen
 * (`active`), and waits while the tab is hidden.
 *
 * The pieces are the slide-size copies (scripts/make-art-slides.mjs, which
 * also leaves out the icons, the mandalas and the "Emphasis" sheet); only the
 * one on screen and the next are ever loaded. A click on one opens the
 * collections in full (/arts-and-crafts), as does "View Full Collection".
 * Reduced motion: the pieces change without moving or dissolving.
 *
 * THREE COLUMNS since 2026-10-16 (owner: "three columns, one with pencil
 * sketches and paintings, second with typography and craft pics, and third
 * for photography, and rotate all pics that are inverted" — the sideways
 * ones turned upright at the source, scripts/fix-art-rotation.mjs): each
 * column its own slider, one piece at a time, as above. On a tall screen
 * the three stood one above the other.
 *
 * THREE TABS AND ONE VIEWER since 2026-10-17 (owner: "For Arts section i
 * want thee tabs and a single viewer") — the Writings slide's reader, for
 * pictures:
 *
 *   ┌───────────────┬──────────────────────────────────┐
 *   │ ▌Sketches &   │                                  │
 *   │  Paintings    │      the piece, whole, as large  │
 *   │  Typography & │      as the viewer allows        │
 *   │  Craft        │                                  │
 *   │  Photography  │  Sketchbooks · 3 / 24     ‹  ›   │
 *   └───────────────┴──────────────────────────────────┘
 *
 * A tab picks the section; the viewer starts it at its first piece and goes
 * on by itself every STEP_MS as before, the arrows (and ← →, once the viewer
 * has focus) stepping either way — back runs the hand-over the other way.
 * On a tall screen the tabs stand in a row above the viewer.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, useReducedMotion } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { RAINBOW } from "@/components/home/MoodField";
import { clipFor, gridFor } from "@/components/home/pixelDissolve";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em]`;

export interface ArtThumb {
  collection: string;
  /** 0 sketches and paintings, 1 typography and craft, 2 photography
   *  (scripts/make-art-slides.mjs). */
  column?: number;
  src: string;
  w: number;
  h: number;
}

/** From one piece's arrival to the next's. */
const STEP_MS = 5000;
/** The hand-over itself, seconds. */
const MOVE_S = 1.3;
/** The squares, px — finer than a flight's (24): the stage is smaller. */
const ART_CELL = 18;
/** How far each piece drifts left over the hand-over, as a share of the
 *  stage's width. */
const DRIFT = 0.14;
/** The sections, as tabs (a piece's `column` is its index). */
const COLUMNS = ["Sketches & Paintings", "Typography & Craft", "Photography"] as const;

/** One piece, whole, as big as the stage allows. The stage is a size
 *  container, so its sides are 100cqw × 100cqh. */
function Piece({ t }: { t: ArtThumb }) {
  const r = t.w / t.h;
  return (
    <span
      className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-neutral-900/10"
      style={{ width: `min(100cqw, ${r} * 100cqh)`, height: `min(100cqh, 100cqw / ${r})` }}
    >
      <Image src={t.src} alt="" fill sizes="80vw" loading="eager" className="object-cover" />
    </span>
  );
}

/** The viewer: one section's pieces, one at a time, going on by itself and
 *  stepped either way by the arrows. */
function ArtViewer({ thumbs, active, title }: { thumbs: ArtThumb[]; active: boolean; title: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  const n = thumbs.length;
  // Two layers that take turns: the one in FRONT shows the piece on screen,
  // the other waits hidden with the one to come, already loaded, and comes in
  // over the hand-over — then they swap, so the piece on screen is never
  // re-mounted (a fresh picture would blink as it decodes).
  // `at`: the piece on screen; `front`: the layer showing it; `dir`: which
  // way the next step goes (1 on, −1 back). The layer behind holds the piece
  // that step brings — the next one, except while a step back is under way.
  const [{ at, front }, setShown] = useState<{ at: number; front: 0 | 1 }>({ at: 0, front: 0 });
  const [dir, setDir] = useState<1 | -1>(1);
  const [moving, setMoving] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const coming = n ? (at + dir + n) % n : 0;
  const slot: [number, number] = front === 0 ? [at, coming] : [coming, at];
  const advance = (d: 1 | -1) => setShown((s) => ({ at: (s.at + d + n) % n, front: s.front === 0 ? 1 : 0 }));
  const step = (d: 1 | -1) => {
    if (n < 2 || moving) return;
    if (reduceMotion) {
      // No hand-over: the piece simply changes, and the one after it waits.
      setShown((s) => ({ at: (s.at + d + n) % n, front: s.front }));
      return;
    }
    setDir(d);
    setMoving(true);
  };

  // The wait on each piece, then the hand-over on.
  useEffect(() => {
    if (!active || n < 2 || moving) return;
    let id = 0;
    const tick = () => {
      if (document.hidden) {
        id = window.setTimeout(tick, 1000);
        return;
      }
      step(1);
    };
    id = window.setTimeout(tick, reduceMotion ? STEP_MS : STEP_MS - MOVE_S * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step only sets state
  }, [active, n, moving, at, reduceMotion]);

  useEffect(() => {
    if (!moving) return;
    const stage = stageRef.current;
    const out = (front === 0 ? layerA : layerB).current;
    const inn = (front === 0 ? layerB : layerA).current;
    if (!stage || !out || !inn) return;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const grid = gridFor(w, h, ART_CELL);
    const d = dir;
    const paint = (g: number) => {
      // On: each piece drifts left, the squares turning from the right; back:
      // the other way. The squares stay put on the stage, so each piece's
      // clip is shifted back by its own drift.
      const ox = -d * DRIFT * w * g;
      const ix = d * DRIFT * w * (1 - g);
      out.style.transform = `translateX(${ox.toFixed(1)}px)`;
      inn.style.transform = `translateX(${ix.toFixed(1)}px)`;
      const from = d === 1 ? "right" : "left";
      out.style.clipPath = clipFor(grid, g, "out", from, -ox, 0) || "inset(50%)";
      inn.style.clipPath = clipFor(grid, g, "in", from, -ix, 0) || "inset(50%)";
    };
    paint(0);
    inn.style.visibility = "visible";
    const controls = animate(0, 1, {
      duration: MOVE_S,
      ease: "linear",
      onUpdate: paint,
      onComplete: () => {
        advance(d);
        // The layer behind goes back to waiting with the next piece.
        setDir(1);
        setMoving(false);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance only sets state
  }, [moving, front]);

  // A new piece in front: tidy what the move left on both layers.
  useEffect(() => {
    [layerA.current, layerB.current].forEach((el, i) => {
      if (!el) return;
      el.style.transform = "";
      el.style.clipPath = "";
      el.style.visibility = i === front ? "visible" : "hidden";
    });
  }, [front]);

  if (!n) return null;
  const here = thumbs[at];
  const arrow =
    "grid h-9 w-9 place-items-center rounded-full bg-white text-lg leading-none text-neutral-900 ring-1 ring-neutral-900/15 outline-none transition-colors hover:bg-neutral-950 hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-900/50 disabled:opacity-40 [@media(max-height:31.25rem)]:h-7 [@media(max-height:31.25rem)]:w-7";

  return (
    <div
      role="tabpanel"
      id="arts-viewer"
      aria-label={`${title} — pieces`}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
        else return;
        // Theirs, not the flight's (whose ← → switch sides).
        e.preventDefault();
        e.stopPropagation();
      }}
      className="relative flex min-h-0 min-w-0 flex-col items-center justify-center gap-2 outline-none [container-type:size]"
    >
      <Link
        href="/arts-and-crafts"
        prefetch={false}
        aria-label={`${title}: ${here.collection} — open Arts & Crafts`}
        className="relative block w-full shrink-0 outline-none transition-[height] duration-500 ease-out [container-type:size] focus-visible:ring-2 focus-visible:ring-neutral-900/40 motion-reduce:transition-none"
        // As tall as the piece on screen needs (a wide one on a narrow screen
        // leaves no gap above its caption), up to the viewer less the caption
        // row; a hand-over to a piece of another shape settles after it.
        style={{ height: `min(100cqh - 2.75rem, 100cqw / ${(here.w / here.h).toFixed(4)})` }}
      >
        <div ref={stageRef} className="absolute inset-0">
          {/* The two layers; the one behind waits hidden, its piece
              already loading, for its turn. */}
          {slot.map((k, i) => (
            <div
              key={i}
              ref={i === 0 ? layerA : layerB}
              aria-hidden={i !== front}
              className={`absolute inset-0 will-change-transform ${i === front ? "" : "invisible"}`}
            >
              <Piece t={thumbs[k]} />
            </div>
          ))}
        </div>
      </Link>
      {/* What it is, and the way through — exactly as wide as the piece
          above it (the stage is the viewer less this row, h-9 + gap-2), so
          the line reads as its caption; it follows each new piece's width. */}
      <div
        className="flex h-9 min-w-[11rem] max-w-full shrink-0 items-center justify-between gap-3 transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `min(100cqw, ${(here.w / here.h).toFixed(4)} * (100cqh - 2.75rem))` }}
      >
        <p className={`${META} min-w-0 truncate text-neutral-600`}>
          {here.collection} · <span className="tabular-nums">{at + 1} / {n}</span>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => step(-1)} disabled={n < 2} aria-label="Previous piece" aria-controls="arts-viewer" className={arrow}>
            ‹
          </button>
          <button type="button" onClick={() => step(1)} disabled={n < 2} aria-label="Next piece" aria-controls="arts-viewer" className={arrow}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArtSlide({ thumbs, active }: { thumbs: ArtThumb[]; active: boolean }) {
  const [tab, setTab] = useState(0);
  const sections = COLUMNS.map((title, c) => ({ title, pieces: thumbs.filter((t) => (t.column ?? 1) === c) }));
  const open = sections[tab];
  return (
    <section aria-label="Arts & Crafts" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col gap-3">
        <div className="shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={`${META} text-neutral-500`}>Creative · 02 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.4rem,3vw,2.8rem)] font-bold leading-none text-neutral-900">Arts &amp; Crafts</h2>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-[clamp(0.75rem,2vw,1.75rem)] portrait:grid-cols-1 portrait:grid-rows-[auto_minmax(0,1fr)]">
          {/* The three sections, as tabs. */}
          <div role="tablist" aria-label="Arts & Crafts sections" aria-orientation="vertical" className="flex min-h-0 flex-col gap-2 portrait:grid portrait:grid-cols-3 portrait:gap-1.5">
            {sections.map((s, i) => {
              const on = i === tab;
              return (
                <button
                  key={s.title}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="arts-viewer"
                  onClick={() => setTab(i)}
                  className={`flex h-[clamp(3rem,9vh,4.5rem)] items-center gap-3 rounded-full px-5 text-left outline-none ring-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/50 portrait:h-auto portrait:justify-center portrait:px-2 portrait:py-2 portrait:text-center [@media(max-height:31.25rem)]:h-10 ${
                    on ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white/85 text-neutral-900 ring-neutral-900/10 hover:bg-white"
                  }`}
                >
                  <span aria-hidden className="block h-2.5 w-2.5 shrink-0 rounded-full portrait:hidden" style={{ backgroundColor: RAINBOW[(i * 4 + 1) % RAINBOW.length] }} />
                  <span className="min-w-0">
                    <span className={`${META} block portrait:hidden [@media(max-height:31.25rem)]:hidden ${on ? "text-white/55" : "text-neutral-500"}`}>{s.pieces.length} pieces</span>
                    <span className="face-creative block truncate text-[clamp(0.85rem,1.4vw,1.15rem)] font-bold leading-tight portrait:whitespace-normal portrait:text-[0.72rem]">{s.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {/* The one viewer, starting the picked section at its first piece. */}
          <ArtViewer key={open.title} title={open.title} thumbs={open.pieces} active={active} />
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/arts-and-crafts">
          View Full Collection <span aria-hidden>↗</span>
        </PixelButton>
      </div>
    </section>
  );
}
