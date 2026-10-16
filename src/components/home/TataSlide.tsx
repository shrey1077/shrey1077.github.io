"use client";

/**
 * TataSlide — Tata IIS, the left side's first slide (owner, 2026-10-16: "I
 * want that image from the tata page on right, then tata iis black logo on
 * left with the grid bg. For the text I want all the info about Tata IIS
 * written in 100 words, and arranged in two paragraphs with the silhouette
 * animation at the bottom, and birds are animating upwards into the text,
 * perfect animated text wrap is required … so that the text wrap effect is
 * easily visible around the silhouette animation"). It was the page's still,
 * ProjectSlide, until then.
 *
 *   ┌──────────────────────────────┬───────────────────┐
 *   │ TATA IIS (the wordmark)      │                   │
 *   │                              │  the hero artwork │
 *   │ the institute ·  my part     │  (the Tata page's,│
 *   │ in one column ↗  in the other│   bleeding right) │
 *   │ ☐ the film: the boy, the     │                   │
 *   │   cage, the birds            │ [View Full ... →] │
 *   └──────────────────────────────┴───────────────────┘
 *   over the Tata page's own grid wash, the whole slide.
 *
 * THE FILM (owner, the same day): the boy raising the birdcage and the birds
 * flying free — the handbook flipbook's drawing, made into four seconds by the
 * owner in Google Flow, wings beating, his hair in the wind, the camera
 * travelling in under him as the flock leaves (scripts/prepare-tata-set-
 * free.mjs). It plays while the slide is on screen, holds on its last frame,
 * and plays again. It is black on white, drawn in `multiply`, so its white
 * drops out and the grid shows through.
 *
 * THE WORDS lie over it in two columns — the institute in one, the owner's
 * part in the other ("i wanted my text in 2 columns") — and are laid out
 * line by line AROUND THE FILM'S INK (FilmWrap): for every frame the film
 * shows, each line asks where the boy, the cage and the birds are across its
 * height and fills only the room either side of them. So a bird flying up
 * through a paragraph parts the words round it, on both sides, as it goes.
 */

import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { RoomImage as Image, NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";

// The Tata page's own files (TATA_GRID, TATA_GUIDELINES.wordmark, TATA_HERO.art
// in constants/tataExperience and tataStory — named here rather than imported,
// so the home page doesn't carry the Tata page's copy).
const GRID = "/content/clients/tata-iis/brand/grid-2026.webp";
const WORDMARK = "/content/clients/tata-iis/brand/wordmark-black.png";
const ART = "/content/clients/tata-iis/hero/skills-build-stronger-india.webp";

/** The film, its first and last frames, and where its ink is, frame by
 *  frame (scripts/prepare-tata-set-free.mjs). 16:9, four seconds. */
const FILM = "/content/clients/tata-iis/handbook/set-free.mp4";
const FIRST = "/content/clients/tata-iis/handbook/set-free-first.webp";
const LAST_FRAME = "/content/clients/tata-iis/handbook/set-free-last.webp";
const WRAP = "/content/clients/tata-iis/handbook/set-free-wrap.json";
const FILM_RATIO = 9 / 16;
/** How long the last frame holds before the film plays again. */
const HOLD_MS = 3000;

/** The words — about a hundred, all of them already established on the Tata
 *  page or in the showcase (TATA_DESCRIPTION, TATA_WHO, the role's points):
 *  the institute in the first column, the owner's part in the second. */
const COPY = [
  "Tata Indian Institute of Skills is a Tata Group initiative — a Section 8 company set up in partnership with the Ministry of Skill Development and Entrepreneurship to build world-class skill institutes. Backed by Tata values, its two campuses, in Ahmedabad and Mumbai, deliver industry-grade, outcome-driven training in emerging technical and service skills, turning India’s demographic advantage into workplace excellence.",
  "As Lead Manager — Graphic Designer, 2024 to 2026, I built its identity on a strict construction grid, drew the logo system for the institute and both campuses, and set the brand guidelines for each. In all: 180+ artifacts across 13 categories, and five films.",
] as const;

/** The block's widest, in rem — the film and the two columns over it. */
const MAX_REM = 46;
/** The gap between the columns, in ems of the text. */
const GUTTER_EM = 1.6;

interface Wrap {
  w: number;
  h: number;
  band: number;
  fps: number;
  /** Per frame, per band: runs of ink as [start, end, start, end…], film px. */
  frames: number[][][];
}

let wrapLoad: Promise<Wrap> | null = null;
function loadWrap(): Promise<Wrap> {
  wrapLoad ??= fetch(WRAP)
    .then((r) => r.json())
    .then((j: Omit<Wrap, "frames"> & { frames: string[] }) => ({
      ...j,
      frames: j.frames.map((f) => f.split(";").map((b) => (b ? b.split(",").map(Number) : []))),
    }));
  return wrapLoad;
}

interface Run {
  x: number;
  y: number;
  w: number;
  words: string[];
  /** Spread the words to the run's ends. */
  justify: boolean;
}

/** Each column's words, line by line, round the film. `ink` gives, for a
 *  line's top and bottom (block px), the film's spans across it; each line of
 *  a column is filled, left to right, in whatever room the spans leave
 *  between the column's edges. */
function layout(
  columns: { x0: number; x1: number; words: string[] }[],
  lineH: number,
  measure: (w: string) => number,
  space: number,
  ink: (top: number, bottom: number) => [number, number][],
  minRoom: number,
): { runs: Run[]; height: number } {
  const runs: Run[] = [];
  let height = 0;
  for (const { x0, x1, words } of columns) {
    let y = 0;
    let i = 0;
    while (i < words.length && y < 4000) {
      const rooms: [number, number][] = [];
      let at = x0;
      for (const [a, b] of ink(y, y + lineH)) {
        if (b <= x0 || a >= x1) continue;
        if (a - at >= minRoom) rooms.push([at, a]);
        at = Math.max(at, b);
      }
      if (x1 - at >= minRoom) rooms.push([at, x1]);
      for (const [a, b] of rooms) {
        if (i >= words.length) break;
        const line: string[] = [];
        let used = 0;
        while (i < words.length) {
          const add = measure(words[i]) + (line.length ? space : 0);
          if (used + add > b - a) break;
          line.push(words[i]);
          used += add;
          i++;
        }
        // Spread to the room's ends — the film's edge held crisp — only where
        // the words nearly fill it anyway; never into wide gaps.
        if (line.length) runs.push({ x: a, y, w: b - a, words: line, justify: i < words.length && line.length > 2 && used > (b - a) * 0.86 });
      }
      y += lineH;
    }
    height = Math.max(height, y);
  }
  return { runs, height };
}

/** The film and the words round it, under `head` (the wordmark): the two
 *  centred together in the room the column gives them. */
function FilmWrap({ live, reduceMotion, head }: { live: boolean; reduceMotion: boolean; head: React.ReactNode }) {
  const near = useContext(NearContext);
  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, head: 0 });
  const [wrap, setWrap] = useState<Wrap | null>(null);
  const [frame, setFrame] = useState(0);
  // The type: read off the probe (the slide's own CSS), measured on a canvas.
  const [type, setType] = useState<{ font: string; size: number; lineH: number } | null>(null);

  useEffect(() => {
    if (near) loadWrap().then(setWrap, () => {});
  }, [near]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const read = () => {
      setBox({ w: el.clientWidth, h: el.clientHeight, head: headRef.current?.offsetHeight ?? 0 });
      const cs = probeRef.current && getComputedStyle(probeRef.current);
      if (cs) {
        const size = parseFloat(cs.fontSize);
        setType({ font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, size, lineH: parseFloat(cs.lineHeight) || size * 1.15 });
      }
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    if (headRef.current) ro.observe(headRef.current);
    // The face may arrive after the first measure.
    document.fonts?.ready.then(read);
    return () => ro.disconnect();
  }, []);

  // Playing: while the slide is on screen, from the start; at the end a
  // hold, then again. Off screen it waits on its first frame. The words
  // follow the frame the film is SHOWING (requestVideoFrameCallback), laid
  // out there and then (flushSync) so they reach the screen in the same
  // frame as the picture — a frame late, a fast bird would land on a word.
  if (!live && frame !== 0) setFrame(0);
  useEffect(() => {
    const v = filmRef.current;
    if (!v || reduceMotion) return;
    if (!live) {
      v.pause();
      if (v.currentTime) v.currentTime = 0;
      return;
    }
    const fps = wrap?.fps ?? 24;
    const count = wrap?.frames.length ?? 96;
    const at = (t: number) => Math.min(count - 1, Math.max(0, Math.floor(t * fps + 0.01)));
    const show = (t: number) => setFrame(at(t));
    let cb = 0;
    let raf = 0;
    let hold = 0;
    const byFrame = "requestVideoFrameCallback" in v;
    const onFrame = (_: number, meta: VideoFrameCallbackMetadata) => {
      flushSync(() => show(meta.mediaTime));
      cb = v.requestVideoFrameCallback(onFrame);
    };
    const onTick = () => {
      show(v.currentTime);
      raf = requestAnimationFrame(onTick);
    };
    if (byFrame) cb = v.requestVideoFrameCallback(onFrame);
    else raf = requestAnimationFrame(onTick);
    const onEnded = () => {
      show(v.duration);
      hold = window.setTimeout(() => {
        v.currentTime = 0;
        v.play().catch(() => {});
      }, HOLD_MS);
    };
    v.addEventListener("ended", onEnded);
    v.currentTime = 0;
    v.play().catch(() => {});
    return () => {
      window.clearTimeout(hold);
      v.removeEventListener("ended", onEnded);
      if (byFrame && cb) v.cancelVideoFrameCallback(cb);
      cancelAnimationFrame(raf);
      v.pause();
    };
  }, [live, reduceMotion, wrap]);

  // The canvas the words are measured on, and each word's width, kept.
  const measure = useMemo(() => {
    if (!type || typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.font = type.font;
    const cache = new Map<string, number>();
    const m = (w: string) => {
      let v = cache.get(w);
      if (v === undefined) cache.set(w, (v = ctx.measureText(w).width));
      return v;
    };
    return { m, space: ctx.measureText(" ").width };
  }, [type]);

  const words = useMemo(() => COPY.map((p) => p.split(/\s+/)), []);

  // The block: the columns as wide as the column allows (to MAX_REM); the
  // film from its top left, as wide as them unless the room is too short.
  const width = Math.min(box.w, MAX_REM * 16);
  const filmW = Math.max(0, Math.min(width, (box.h - box.head) / FILM_RATIO));
  const filmH = filmW * FILM_RATIO;
  // Reduced motion: the last frame, still, and the words round it.
  const shown = reduceMotion ? (wrap ? wrap.frames.length - 1 : 0) : frame;

  const ink = useCallback(
    (top: number, bottom: number): [number, number][] => {
      if (!wrap || !type) return [];
      const runs = wrap.frames[shown] ?? [];
      const s = filmW / wrap.w; // film px → block px
      const padX = type.size * 0.65;
      const padY = type.size * 0.3;
      // The bands this line passes, a hair beyond it either way.
      const b0 = Math.max(0, Math.floor((top - padY) / s / wrap.band));
      const b1 = Math.min(runs.length - 1, Math.floor((bottom + padY) / s / wrap.band));
      const spans: [number, number][] = [];
      for (let b = b0; b <= b1; b++) {
        const r = runs[b];
        for (let k = 0; k < r.length; k += 2) spans.push([r[k] * s - padX, r[k + 1] * s + padX]);
      }
      spans.sort((p, q) => p[0] - q[0]);
      const merged: [number, number][] = [];
      for (const sp of spans) {
        const last = merged[merged.length - 1];
        if (last && sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
        else merged.push([sp[0], sp[1]]);
      }
      return merged;
    },
    [wrap, type, shown, filmW],
  );

  const flow = useMemo(() => {
    if (!measure || !type || width <= 0) return null;
    const gutter = type.size * GUTTER_EM;
    const half = (width - gutter) / 2;
    return layout(
      [
        { x0: 0, x1: half, words: words[0] },
        { x0: half + gutter, x1: width, words: words[1] },
      ],
      type.lineH,
      measure.m,
      measure.space,
      ink,
      type.size * 2.6,
    );
  }, [measure, type, width, words, ink]);

  const height = Math.max(filmH, flow?.height ?? 0);

  return (
    <div ref={boxRef} className="relative min-h-0 w-full flex-1">
      {/* The type the words are set in — read, never seen. */}
      <span ref={probeRef} aria-hidden className="tata-flow-type pointer-events-none invisible absolute">
        x
      </span>
      {/* For a screen reader, and a search engine: the words, in order. */}
      <div className="sr-only">
        {COPY.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {/* The wordmark, then the film and the words — centred, together, in
          the room the column leaves them.
          ⚠ Centred by flex, never by a transform: a transform would make this
          a layer of its own, and the film's `multiply` would then meet only
          the empty layer — its white would stand over the grid as a box. */}
      <div className="absolute inset-0 flex flex-col justify-center">
        <div ref={headRef} className="pb-[clamp(0.75rem,4.5vh,2.75rem)]">
          {head}
        </div>
        <div aria-hidden className="relative" style={{ width, height }}>
          {reduceMotion ? (
            near && (
              // eslint-disable-next-line @next/next/no-img-element -- a still in the film's own box
              <img src={LAST_FRAME} alt="" className="absolute left-0 top-0 mix-blend-multiply" style={{ width: filmW, height: filmH }} />
            )
          ) : (
            <video
              ref={filmRef}
              src={near ? FILM : undefined}
              poster={near ? FIRST : undefined}
              muted
              playsInline
              preload={near ? "auto" : "none"}
              disablePictureInPicture
              className="absolute left-0 top-0 mix-blend-multiply"
              style={{ width: filmW, height: filmH }}
            />
          )}
          {/* The words, two columns, from the film's top edge down. */}
          <div className="tata-flow-type absolute left-0 top-0">
            {flow?.runs.map((r, k) => (
              <div
                key={k}
                className="absolute flex whitespace-nowrap"
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.w,
                  justifyContent: r.justify ? "space-between" : "flex-start",
                  columnGap: r.justify ? 0 : measure?.space,
                }}
              >
                {r.words.map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TataSlide({ item, live, reduceMotion }: { item: Showcase; live: boolean; reduceMotion: boolean }) {
  const href = item.report.href ?? "/clients/tata-iis";
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden bg-white">
      <h2 className="sr-only">{item.name}</h2>
      {/* The Tata page's grid wash, the whole slide. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image src={GRID} alt="" fill sizes="100vw" className="object-cover opacity-70" />
      </div>

      {/* The hero artwork, bleeding right, from under the strip to the band;
          on a tall screen, the lower right, under the words. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[7svh] right-0 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem))] w-[50%] portrait:top-auto portrait:h-[40svh] portrait:w-[62vw]"
      >
        <Image src={ART} alt="" fill sizes="(orientation: portrait) 62vw, 50vw" className="object-contain object-right-bottom" />
      </div>

      {/* The left: the wordmark, then the film with the words round it. On a
          tall screen, the upper part, clear of the artwork below; on a short
          one (a phone on its side) wider, the artwork being small there —
          the film is held small by the height, and the columns need the
          width or they run down into the band. */}
      <div className="slide-frame is-logic absolute inset-0 flex">
        <div className="flex min-h-0 w-[54%] flex-col portrait:w-full portrait:pb-[calc(40svh-4.25rem)] [@media(max-height:31.25rem)]:landscape:w-[72%]">
          <FilmWrap
            live={live}
            reduceMotion={reduceMotion}
            head={
              <span className="relative block aspect-[1020/257] w-[min(100%,24rem,calc(13vh*1020/257))]">
                <Image src={WORDMARK} alt="TATA IIS — Tata Indian Institute of Skills" fill sizes="24rem" className="object-contain object-left" />
              </span>
            }
          />
        </div>
      </div>

      {/* The way in, where every left slide keeps it. */}
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
