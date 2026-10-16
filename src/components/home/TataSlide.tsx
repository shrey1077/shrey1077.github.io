"use client";

/**
 * TataSlide — Tata IIS, the left side's first slide (owner, 2026-10-16: "I
 * want that image from the tata page on right, then tata iis black logo on
 * left with the grid bg. For the text I want all the info about Tata IIS
 * written in 100 words, and arranged in two paragraphs with the silhouette
 * animation at the bottom, and birds are animating upwards into the text,
 * perfect animated text wrap is required, i want very small text font, with
 * min line height, so that the text wrap effect is easily visible around the
 * silhouette animation"). It was the page's still, ProjectSlide, until then.
 *
 *   ┌──────────────────────────┬───────────────────────┐
 *   │ TATA IIS (the wordmark)  │                       │
 *   │                          │    the hero artwork   │
 *   │ two paragraphs, small,   │    (the Tata page's,  │
 *   │ tight, flowing round  ↗  │     bleeding right)   │
 *   │ the birds as they rise   │                       │
 *   │ ☐  the boy and the cage  │ [View Full Project →] │
 *   └──────────────────────────┴───────────────────────┘
 *   over the Tata page's own grid wash, the whole slide.
 *
 * The drawing is the handbook's flipbook (the Tata page's band 03) — a boy
 * raises a birdcage and the birds fly free, up and to the right. Here it
 * plays by itself while the slide is on screen, and the text is laid out
 * line by line AROUND ITS INK (FlipbookWrap): every frame, each line asks
 * where the drawing is across its height and fills only the room either side
 * of it — so a bird climbing into the paragraph parts the words around it,
 * on both sides, as it goes.
 */

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RoomImage as Image, NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";

// The Tata page's own files (TATA_GRID, TATA_GUIDELINES.wordmark, TATA_HERO.art
// in constants/tataExperience and tataStory — named here rather than imported,
// so the home page doesn't carry the Tata page's copy).
const GRID = "/content/clients/tata-iis/brand/grid-2026.webp";
const WORDMARK = {
  src: "/content/clients/tata-iis/brand/wordmark-black.png",
  w: 1020,
  h: 257,
};
const ART = {
  src: "/content/clients/tata-iis/hero/skills-build-stronger-india.webp",
  w: 1071,
  h: 1469,
};

/** The flipbook: one sheet of 75 frames, 10 × 8, each 440 × 492
 *  (constants/tataFlipbookFlow), and where its ink is, frame by frame
 *  (scripts/prepare-tata-flipbook-wrap.mjs). */
const SPRITE = "/content/clients/tata-iis/handbook/flipbook-sprite.webp";
const WRAP = "/content/clients/tata-iis/handbook/flipbook-wrap.json";
const SHEET = { frames: 75, cols: 10, rows: 8, w: 440, h: 492 };
const LAST = SHEET.frames - 1;
/** Frames a second, and how long the last one holds before it starts again. */
const FPS = 12;
const HOLD_MS = 3200;

/** The words — about a hundred, all of them already established on the Tata
 *  page or in the showcase (TATA_DESCRIPTION, TATA_WHO, the role's points):
 *  the institute, then the owner's part in it. */
const COPY = [
  "Tata Indian Institute of Skills is a Tata Group initiative — a Section 8 company set up in partnership with the Ministry of Skill Development and Entrepreneurship to build world-class skill institutes. Backed by Tata values, its two campuses, in Ahmedabad and Mumbai, deliver industry-grade, outcome-driven training in emerging technical and service skills, turning India’s demographic advantage into workplace excellence.",
  "As Lead Manager — Graphic Designer, 2024 to 2026, I built its identity on a strict construction grid, drew the logo system for the institute and both campuses, and set the brand guidelines for each. In all: 180+ artifacts across 13 categories, and five films.",
] as const;

/** The drawing's width, as a share of the text's (less, where the screen is
 *  too short for it). Its top is the text's — so the birds' last climb
 *  reaches the first lines — and the boy stands below the words. */
const DRAW_SHARE = 0.84;
/** The text block's widest, in rem: narrow enough that the words run down
 *  past the birds to the cage, so the whole climb is through them. */
const MAX_REM = 22;

interface Wrap {
  w: number;
  h: number;
  band: number;
  /** Per frame, per band: runs of ink as [start, end, start, end…], frame px. */
  frames: number[][][];
}

let wrapLoad: Promise<Wrap> | null = null;
function loadWrap(): Promise<Wrap> {
  wrapLoad ??= fetch(WRAP)
    .then((r) => r.json())
    .then((j: { w: number; h: number; band: number; frames: string[] }) => ({
      ...j,
      frames: j.frames.map((f) =>
        f.split(";").map((b) => (b ? b.split(",").map(Number) : [])),
      ),
    }));
  return wrapLoad;
}

interface Run {
  x: number;
  y: number;
  w: number;
  words: string[];
  /** Spread the words to the run's ends (every run but a paragraph's last). */
  justify: boolean;
}

/** The text, line by line, round the drawing. `ink` gives, for a line's
 *  top and bottom (block px), the drawing's spans across it; each line is
 *  filled, left to right, in whatever room is left between them. */
function layout(
  paragraphs: string[][],
  width: number,
  lineH: number,
  measure: (w: string) => number,
  space: number,
  ink: (top: number, bottom: number) => [number, number][],
  minRoom: number,
): { runs: Run[]; height: number } {
  const runs: Run[] = [];
  let y = 0;
  paragraphs.forEach((words, p) => {
    let i = 0;
    while (i < words.length) {
      // This line's rooms: the width less the drawing's spans.
      const rooms: [number, number][] = [];
      let at = 0;
      for (const [a, b] of ink(y, y + lineH)) {
        if (a - at >= minRoom) rooms.push([at, a]);
        at = Math.max(at, b);
      }
      if (width - at >= minRoom) rooms.push([at, width]);
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
        // Spread to the room's ends — the drawing's edge held crisp — only
        // where the words nearly fill it anyway; never into wide gaps.
        if (line.length)
          runs.push({
            x: a,
            y,
            w: b - a,
            words: line,
            justify:
              i < words.length && line.length > 2 && used > (b - a) * 0.86,
          });
      }
      y += lineH;
      if (y > 4000) return; // a word wider than every room: never loop for ever
    }
    if (p < paragraphs.length - 1) y += lineH * 0.7;
  });
  return { runs, height: y };
}

/** The words round the drawing, under `head` (the wordmark): the two
 *  centred together in the room the column gives them. */
function FlipbookWrap({
  live,
  reduceMotion,
  head,
}: {
  live: boolean;
  reduceMotion: boolean;
  head: React.ReactNode;
}) {
  const near = useContext(NearContext);
  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, head: 0 });
  const [wrap, setWrap] = useState<Wrap | null>(null);
  const [frame, setFrame] = useState(reduceMotion ? LAST : 0);
  // The type: read off the probe (the slide's own CSS), measured on a canvas.
  const [type, setType] = useState<{
    font: string;
    size: number;
    lineH: number;
  } | null>(null);

  useEffect(() => {
    if (near) loadWrap().then(setWrap, () => {});
  }, [near]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const read = () => {
      setBox({
        w: el.clientWidth,
        h: el.clientHeight,
        head: headRef.current?.offsetHeight ?? 0,
      });
      const cs = probeRef.current && getComputedStyle(probeRef.current);
      if (cs) {
        const size = parseFloat(cs.fontSize);
        setType({
          font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          size,
          lineH: parseFloat(cs.lineHeight) || size * 1.1,
        });
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

  // Playing: while on screen, frame by frame to the last, a hold, again.
  // Off screen it rests on the first frame — the boy, and room for the words
  // — so the climb starts as the slide arrives. Reduced motion: the last
  // frame, still.
  if (reduceMotion && frame !== LAST) setFrame(LAST);
  const [restart, setRestart] = useState(0);
  if (!live && !reduceMotion && frame !== 0) setFrame(0);
  useEffect(() => {
    if (!live || reduceMotion) return;
    let f = -1;
    let id = 0;
    const tick = () => {
      if (document.hidden) {
        id = window.setTimeout(tick, 500);
        return;
      }
      f++;
      if (f > LAST) {
        id = window.setTimeout(() => setRestart((r) => r + 1), HOLD_MS);
        return;
      }
      setFrame(f);
      id = window.setTimeout(tick, 1000 / FPS);
    };
    id = window.setTimeout(tick, restart ? 0 : 600);
    return () => window.clearTimeout(id);
  }, [live, reduceMotion, restart]);

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

  // The block: the text as wide as the column allows (to MAX_REM); the
  // drawing from its top left, DRAW_SHARE of it wide unless the room is too
  // short for that.
  const width = Math.min(box.w, MAX_REM * 16);
  const drawW = Math.max(
    0,
    Math.min(width * DRAW_SHARE, (box.h - box.head) * (SHEET.w / SHEET.h)),
  );
  const drawH = drawW * (SHEET.h / SHEET.w);

  const ink = useCallback(
    (top: number, bottom: number): [number, number][] => {
      if (!wrap || !type) return [];
      const runs = wrap.frames[frame] ?? [];
      const s = drawW / wrap.w; // frame px → block px
      const padX = type.size * 0.7;
      const padY = type.size * 0.15;
      // The bands this line passes, a hair beyond it either way.
      const b0 = Math.max(0, Math.floor((top - padY) / s / wrap.band));
      const b1 = Math.min(
        runs.length - 1,
        Math.floor((bottom + padY) / s / wrap.band),
      );
      const spans: [number, number][] = [];
      for (let b = b0; b <= b1; b++) {
        const r = runs[b];
        for (let k = 0; k < r.length; k += 2)
          spans.push([r[k] * s - padX, r[k + 1] * s + padX]);
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
    [wrap, type, frame, drawW],
  );

  const flow = useMemo(() => {
    if (!measure || !type || width <= 0) return null;
    return layout(
      words,
      width,
      type.lineH,
      measure.m,
      measure.space,
      ink,
      type.size * 2.6,
    );
  }, [measure, type, width, words, ink]);

  const col = frame % SHEET.cols;
  const row = Math.floor(frame / SHEET.cols);
  const height = Math.max(drawH, flow?.height ?? 0);

  return (
    <div ref={boxRef} className="relative min-h-0 w-full flex-1">
      {/* The type the words are set in — read, never seen. */}
      <span
        ref={probeRef}
        aria-hidden
        className="tata-flow-type pointer-events-none invisible absolute"
      >
        x
      </span>
      {/* For a screen reader, and a search engine: the words, in order. */}
      <div className="sr-only">
        {COPY.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {/* The wordmark, then the drawing and the words — centred, together,
          in the room the column leaves them. */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div ref={headRef} className="pb-[clamp(0.75rem,4.5vh,2.75rem)]">
          {head}
        </div>
        <div aria-hidden className="relative" style={{ width, height }}>
          <div
            className="absolute left-0 top-0"
            style={{
              width: drawW,
              height: drawH,
              backgroundImage: near ? `url(${SPRITE})` : undefined,
              backgroundSize: `${SHEET.cols * 100}% ${SHEET.rows * 100}%`,
              backgroundPosition: `${(col / (SHEET.cols - 1)) * 100}% ${(row / (SHEET.rows - 1)) * 100}%`,
            }}
          />
          {/* The words, from the drawing's top edge down. */}
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

export function TataSlide({
  item,
  live,
  reduceMotion,
}: {
  item: Showcase;
  live: boolean;
  reduceMotion: boolean;
}) {
  const href = item.report.href ?? "/clients/tata-iis";
  return (
    <section
      aria-label={item.name}
      data-side="logic"
      className="absolute inset-0 overflow-hidden bg-white"
    >
      <h2 className="sr-only">{item.name}</h2>
      {/* The Tata page's grid wash, the whole slide. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src={GRID}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </div>

      {/* The hero artwork, bleeding right, from under the strip to the band;
          on a tall screen, the lower right, under the words. */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[7svh] right-0 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem))] w-[50%] portrait:top-auto portrait:h-[40svh] portrait:w-[62vw]"
      >
        <Image
          src={ART.src}
          alt=""
          fill
          sizes="(orientation: portrait) 62vw, 50vw"
          className="object-contain object-right-bottom"
        />
      </div>

      {/* The left: the wordmark, then the words round the drawing. On a tall
          screen, the upper part, clear of the artwork below. */}
      <div className="slide-frame is-logic absolute inset-0 flex">
        <div className="flex min-h-0 w-[46%] flex-col portrait:w-full portrait:pb-[calc(40svh-4.25rem)]">
          <FlipbookWrap
            live={live}
            reduceMotion={reduceMotion}
            head={
              <span className="relative block aspect-[1020/257] w-[min(100%,24rem,calc(13vh*1020/257))]">
                <Image
                  src={WORDMARK.src}
                  alt="TATA IIS — Tata Indian Institute of Skills"
                  fill
                  sizes="24rem"
                  className="object-contain object-left"
                />
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
