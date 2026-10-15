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
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, useReducedMotion } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { clipFor, gridFor } from "@/components/home/pixelDissolve";

export interface ArtThumb {
  collection: string;
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

export function ArtSlide({ thumbs, active }: { thumbs: ArtThumb[]; active: boolean }) {
  const reduceMotion = useReducedMotion() ?? false;
  const n = thumbs.length;
  // Two layers that take turns: the one in FRONT shows the piece on screen,
  // the other waits hidden with the next one, already loaded, and comes in
  // over the hand-over — then they swap, so the piece on screen is never
  // re-mounted (a fresh picture would blink as it decodes).
  // `at`: the piece on screen; `front`: the layer showing it. The layer
  // behind always holds the piece after it.
  const [{ at, front }, setShown] = useState<{ at: number; front: 0 | 1 }>({ at: 0, front: 0 });
  const [moving, setMoving] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const after = n ? (at + 1) % n : 0;
  const slot: [number, number] = front === 0 ? [at, after] : [after, at];
  const advance = () => setShown((s) => ({ at: (s.at + 1) % n, front: s.front === 0 ? 1 : 0 }));

  // The wait on each piece, then the hand-over.
  useEffect(() => {
    if (!active || n < 2 || moving) return;
    let id = 0;
    const step = () => {
      if (document.hidden) {
        id = window.setTimeout(step, 1000);
        return;
      }
      if (reduceMotion) advance();
      else setMoving(true);
    };
    id = window.setTimeout(step, reduceMotion ? STEP_MS : STEP_MS - MOVE_S * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance only sets state
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
    const paint = (g: number) => {
      // Each piece drifts left; the squares stay put on the stage, so each
      // one's clip is shifted back by its own drift.
      const ox = -DRIFT * w * g;
      const ix = DRIFT * w * (1 - g);
      out.style.transform = `translateX(${ox.toFixed(1)}px)`;
      inn.style.transform = `translateX(${ix.toFixed(1)}px)`;
      out.style.clipPath = clipFor(grid, g, "out", "right", -ox, 0) || "inset(50%)";
      inn.style.clipPath = clipFor(grid, g, "in", "right", -ix, 0) || "inset(50%)";
    };
    paint(0);
    inn.style.visibility = "visible";
    const controls = animate(0, 1, {
      duration: MOVE_S,
      ease: "linear",
      onUpdate: paint,
      onComplete: () => {
        advance();
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

  return (
    <section aria-label="Arts & Crafts" data-side="creative" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">Arts &amp; Crafts</h2>
      <div className="slide-frame absolute inset-0 flex flex-col">
        <Link
          href="/arts-and-crafts"
          prefetch={false}
          aria-label={`${here.collection} — open Arts & Crafts`}
          className="relative block min-h-0 flex-1 outline-none [container-type:size] focus-visible:ring-2 focus-visible:ring-neutral-900/40"
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
        <p className="font-helv mt-2 shrink-0 text-center text-[0.62rem] uppercase tracking-[0.22em] text-neutral-500">
          {here.collection} <span className="tabular-nums text-neutral-400">· {at + 1} / {n}</span>
        </p>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/arts-and-crafts">
          View Full Collection <span aria-hidden>↗</span>
        </PixelButton>
      </div>
    </section>
  );
}
