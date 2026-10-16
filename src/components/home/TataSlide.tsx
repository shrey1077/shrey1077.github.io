"use client";

/**
 * TataSlide — Tata IIS, the left side's first slide (owner, 2026-10-16: "I
 * want that image from the tata page on right, then tata iis black logo on
 * left with the grid bg. For the text I want all the info about Tata IIS …
 * arranged in two paragraphs with the silhouette animation at the bottom, and
 * birds are animating upwards into the text, perfect animated text wrap is
 * required"). It was the page's still, ProjectSlide, until then.
 *
 *   ┌────────────────────────────────┬───────────────────┐
 *   │ TATA IIS (the wordmark)        │                   │
 *   │                                │  the hero artwork │
 *   │ the institute  │  my part      │  (the Tata page's,│
 *   │ in one column  │  in the other │   bleeding right) │
 *   │ …words part ↗  │  round birds… │                   │
 *   │        ☐ the film, small      │ [View Full ... →] │
 *   └────────────────────────────────┴───────────────────┘
 *   over the Tata page's own grid wash, the whole slide.
 *
 * THE FILM (owner, the same day): the boy raising the birdcage and the birds
 * flying free — the handbook flipbook's drawing, made into four seconds by the
 * owner in Google Flow, wings beating, his hair in the wind, the camera
 * travelling in under him as the flock leaves (scripts/prepare-tata-set-
 * free.mjs). It plays while the slide is on screen, holds on its last frame,
 * and plays again. Black on white, drawn in `multiply`, so its white drops
 * out and the grid shows through.
 *
 * THE WORDS, two columns — the institute in one, the owner's part in the
 * other — are laid out line by line AROUND THE FILM'S INK (FilmWrap): for
 * every frame the film shows, each line asks where the boy, the cage and the
 * birds are across its height and fills only the room either side of them.
 *
 * WHERE THE FILM SITS (owner, the next round: "need half the size of
 * animation, and more text. place it such only the bottom of text in 1st and
 * 2nd column shud be affected by text wrap"): half the block wide, centred
 * across the gutter, its upper part (the cage, the boy's raised arms, the
 * flock) in the last lines of BOTH columns and the rest — the boy below the
 * shoulders — under the text. Where exactly is worked out once per size (the
 * plan): the film is let down until the columns, wrapped round its busiest
 * frames, end OVERLAP of the way down it. It never moves while it plays; only
 * the words do. On a screen too small for all the words, the last sentences
 * of the longer column go first (a screen reader still has them all).
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

/** The words, sentence by sentence — all of them already established on the
 *  Tata page or in the showcase (TATA_DESCRIPTION, TATA_WHO, the campus
 *  profiles, TATA_POWERED_BY, TATA_SYSTEM, TATA_IDENTITIES, the role's
 *  points): the institute in the first column, the owner's part in the
 *  second. */
const COLUMNS: readonly (readonly string[])[] = [
  [
    "Tata Indian Institute of Skills is a Tata Group initiative — a Section 8 company set up in partnership with the Ministry of Skill Development and Entrepreneurship to build world-class skill institutes.",
    "Backed by Tata values, it delivers industry-grade, outcome-driven training in emerging technical and service skills, turning India’s demographic advantage into workplace excellence.",
    "Its two campuses each carry a voice of their own.",
    "IIS Ahmedabad, set up with the Government of Gujarat, stands on a 20-acre campus in Nasmed village; IIS Mumbai, on a 4+ acre campus in Chunabhatti.",
    "Both are built for job-oriented learning, with state-of-the-art infrastructure and advanced labs.",
    "The institute is powered by Tata Trusts and Skill India, alongside the Government of Gujarat and the Ministry.",
  ],
  [
    "As Lead Manager — Graphic Designer, 2024 to 2026, I refined the wordmark to bring the institute into the wider Tata identity, rebuilt on the group’s own typeface so it reads as part of the family at every size and on every surface.",
    "I built the system on a strict construction grid, drew the logo system for the institute and both campuses — Ahmedabad’s tree of knowledge, Mumbai’s climbing S — and set the brand guidelines for each: one construction, exclusion zone and behaviour, apart only in colour and geometry.",
    "Then the work itself: the trainee handbook, signage and print, mockups staged in place, the social grid, photography and film.",
    "In all, 180+ artifacts across 13 categories, and five films.",
  ],
];

/** The block's widest, in rem — the two columns, and the film under them. */
const MAX_REM = 40;
/** The gap between the columns, in ems of the text. */
const GUTTER_EM = 1.8;
/** The film's width, as a share of the block's — half what it was. */
const FILM_SHARE = 0.5;
/** How far down the film the columns end: its top part (the cage, the arms,
 *  the flock) among their last lines, the rest beneath them. */
const OVERLAP = 0.55;

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

type Ink = (top: number, bottom: number) => [number, number][];

/** Each column's words, line by line, round the film. `ink` gives, for a
 *  line's top and bottom (block px), the film's spans across it; each line of
 *  a column is filled, left to right, in whatever room the spans leave
 *  between the column's edges. */
function layout(
  columns: { x0: number; x1: number; words: string[] }[],
  lineH: number,
  measure: (w: string) => number,
  space: number,
  ink: Ink,
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

/** The film's spans across a line, for frame `f` with the film's top-left
 *  at (fx, fy) in the block and `fw` wide. */
function inkOf(wrap: Wrap, f: number, fx: number, fy: number, fw: number, size: number): Ink {
  const runs = wrap.frames[f] ?? [];
  const s = fw / wrap.w; // film px → block px
  const padX = size * 0.65;
  const padY = size * 0.3;
  return (top, bottom) => {
    // The bands this line passes, a hair beyond it either way.
    const b0 = Math.max(0, Math.floor((top - fy - padY) / s / wrap.band));
    const b1 = Math.min(runs.length - 1, Math.floor((bottom - fy + padY) / s / wrap.band));
    if (b1 < 0 || b0 > b1) return [];
    const spans: [number, number][] = [];
    for (let b = b0; b <= b1; b++) {
      const r = runs[b];
      for (let k = 0; k < r.length; k += 2) spans.push([fx + r[k] * s - padX, fx + r[k + 1] * s + padX]);
    }
    spans.sort((p, q) => p[0] - q[0]);
    const merged: [number, number][] = [];
    for (const sp of spans) {
      const last = merged[merged.length - 1];
      if (last && sp[0] <= last[1]) last[1] = Math.max(last[1], sp[1]);
      else merged.push([sp[0], sp[1]]);
    }
    return merged;
  };
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
    const show = (t: number) => setFrame(Math.min(count - 1, Math.max(0, Math.floor(t * fps + 0.01))));
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

  // The block: the columns as wide as the column allows (to MAX_REM); the
  // film half that, centred across the gutter — smaller still if the room is
  // too short for it.
  const width = Math.min(box.w, MAX_REM * 16);
  const room = box.h - box.head;
  const filmW = Math.max(0, Math.min(width * FILM_SHARE, (room * 0.5) / FILM_RATIO));
  const filmH = filmW * FILM_RATIO;
  const filmX = (width - filmW) / 2;
  const columnsAt = useCallback(
    (cut: number[]) => {
      const gutter = (type?.size ?? 12) * GUTTER_EM;
      const half = (width - gutter) / 2;
      return [
        { x0: 0, x1: half, words: COLUMNS[0].slice(0, cut[0]).join(" ").split(/\s+/) },
        { x0: half + gutter, x1: width, words: COLUMNS[1].slice(0, cut[1]).join(" ").split(/\s+/) },
      ];
    },
    [width, type],
  );

  // THE PLAN, once per size: how many sentences fit, and where the film sits.
  // Worked out in an idle moment — a few dozen layouts — and kept.
  const [plan, setPlan] = useState<{ key: string; filmY: number; cut: number[]; height: number } | null>(null);
  const planKey = `${width}|${room}|${type?.font}|${!!wrap}`;
  useEffect(() => {
    if (!wrap || !type || !measure || width <= 0) return;
    const run = () => {
      const minRoom = type.size * 2.6;
      // The film's busiest frames stand in for all of them.
      const sample = wrap.frames.map((_, f) => f).filter((f) => f % 6 === 0 || f === wrap.frames.length - 1);
      const place = (cut: number[]) => {
        const cols = columnsAt(cut);
        const bare = layout(cols, type.lineH, measure.m, measure.space, () => [], minRoom).height;
        let filmY = bare - OVERLAP * filmH;
        let tallest = bare;
        for (let k = 0; k < 4; k++) {
          tallest = 0;
          for (const f of sample) tallest = Math.max(tallest, layout(cols, type.lineH, measure.m, measure.space, inkOf(wrap, f, filmX, filmY, filmW, type.size), minRoom).height);
          const next = tallest - OVERLAP * filmH;
          if (Math.abs(next - filmY) < 1) break;
          filmY = next;
        }
        return { filmY: Math.max(0, filmY), height: Math.max(filmY + filmH, tallest) };
      };
      // All the words if they fit; else the longer column's last sentence
      // goes, and again, keeping two in each.
      const cut = [COLUMNS[0].length, COLUMNS[1].length];
      let p = place(cut);
      while (p.height > room && (cut[0] > 2 || cut[1] > 2)) {
        const longer = (cut[0] > 2 && (COLUMNS[0].slice(0, cut[0]).join(" ").length >= COLUMNS[1].slice(0, cut[1]).join(" ").length || cut[1] <= 2)) ? 0 : 1;
        cut[longer]--;
        p = place(cut);
      }
      setPlan({ key: planKey, filmY: p.filmY, cut: [...cut], height: p.height });
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(run, { timeout: 500 });
    return () => cancel(id);
  }, [planKey, wrap, type, measure, width, room, filmW, filmH, filmX, columnsAt]);
  const ready = plan && plan.key === planKey ? plan : null;

  // Reduced motion: the last frame, still, and the words round it.
  const shown = reduceMotion ? (wrap ? wrap.frames.length - 1 : 0) : frame;

  const flow = useMemo(() => {
    if (!measure || !type || !wrap || !ready) return null;
    return layout(columnsAt(ready.cut), type.lineH, measure.m, measure.space, inkOf(wrap, shown, filmX, ready.filmY, filmW, type.size), type.size * 2.6);
  }, [measure, type, wrap, ready, columnsAt, shown, filmX, filmW]);

  return (
    <div ref={boxRef} className="relative min-h-0 w-full flex-1">
      {/* The type the words are set in — read, never seen. */}
      <span ref={probeRef} aria-hidden className="tata-flow-type pointer-events-none invisible absolute">
        x
      </span>
      {/* For a screen reader, and a search engine: all the words, in order. */}
      <div className="sr-only">
        {COLUMNS.map((c) => (
          <p key={c[0]}>{c.join(" ")}</p>
        ))}
      </div>
      {/* The wordmark, then the words and the film — centred, together, in
          the room the column leaves them.
          ⚠ Centred by flex, never by a transform: a transform would make this
          a layer of its own, and the film's \`multiply\` would then meet only
          the empty layer — its white would stand over the grid as a box. */}
      <div className="absolute inset-0 flex flex-col justify-center">
        <div ref={headRef} className="pb-[clamp(0.75rem,4.5vh,2.75rem)]">
          {head}
        </div>
        <div aria-hidden className="relative" style={{ width, height: ready?.height ?? 0, visibility: ready ? "visible" : "hidden" }}>
          {reduceMotion ? (
            near && (
              // eslint-disable-next-line @next/next/no-img-element -- a still in the film's own box
              <img src={LAST_FRAME} alt="" className="absolute mix-blend-multiply" style={{ left: filmX, top: ready?.filmY ?? 0, width: filmW, height: filmH }} />
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
              className="absolute mix-blend-multiply"
              style={{ left: filmX, top: ready?.filmY ?? 0, width: filmW, height: filmH }}
            />
          )}
          {/* The words, two columns, from the block's top down. */}
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
        className="pointer-events-none absolute bottom-[7svh] right-0 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem))] w-[50%] portrait:top-auto portrait:h-[34svh] portrait:w-[56vw]"
      >
        <Image src={ART} alt="" fill sizes="(orientation: portrait) 56vw, 50vw" className="object-contain object-right-bottom" />
      </div>

      {/* The left: the wordmark, then the words with the film among their
          last lines. On a tall screen, the upper part, clear of the artwork
          below; on a short one (a phone on its side) wider, the artwork being
          small there. */}
      <div className="slide-frame is-logic absolute inset-0 flex">
        <div className="flex min-h-0 w-[54%] flex-col portrait:w-full portrait:pb-[calc(34svh-4.25rem)] [@media(max-height:31.25rem)]:landscape:w-[72%]">
          <FilmWrap
            live={live}
            reduceMotion={reduceMotion}
            head={
              <span className="relative block aspect-[1020/257] w-[min(100%,24rem,calc(13vh*1020/257))] portrait:w-[min(100%,18rem,calc(10vh*1020/257))]">
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
