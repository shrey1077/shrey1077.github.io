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
 * other — are laid out line by line, LETTER BY LETTER, AROUND THE FILM'S INK
 * (FilmWrap): for every frame the film shows, each line asks where the boy,
 * the cage and the birds are across its height and fills only the room
 * either side of them, breaking a word where a bird cuts it. Then the birds'
 * WAKE (owner, the next round: "break up words and rotate and push letters
 * into above sentences which get further disturbed"): letters near a bird are
 * pushed off it — up, mostly, the way the flock flies — and turned, and a
 * letter lifted into the line above jostles that line in turn.
 *
 * WHERE THE FILM SITS (owner, the next round: "need half the size of
 * animation, and more text. place it such only the bottom of text in 1st and
 * 2nd column shud be affected by text wrap"): half the block wide, its upper
 * part among the last lines and the rest under the text. Since the next
 * round it stands under the SECOND column, its left edge on the column's
 * ("left Align the animation with 2nd column"), and under the first stand
 * IIS Ahmedabad's and IIS Mumbai's marks, stacked ("Under 1st column put IISA
 * and IISM portrait logos"). Where exactly is worked out once per size (the
 * plan): the film is let down until the columns, wrapped round its busiest
 * frames, end OVERLAP of the way down it. It never moves while it plays; only
 * the words do. On a screen too small for all the words, the last sentences
 * of the longer column go first (a screen reader still has them all).
 *
 * THE BOY STANDS ON THE BAND (owner, the same day: "i want the boy to be
 * standing on the black pixelated band at bottom"): the film and the words
 * are let down together until the boy's feet in the film's first frame meet
 * the band's top edge (`ground`, a marker at the band's height). As the
 * camera moves in he grows, and his legs pass behind the band — which also
 * hides the film's foot, where the frame crops him. The wordmark keeps the
 * top of the column. On a tall screen the hero artwork, which stood at the
 * foot on the right, fills the room between the wordmark and the words
 * instead (`middle`) — some of it kept for the artwork before the words are
 * fitted.
 */

import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { RoomImage as Image, NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";
import { FILM, FILM_RATIO, FIRST, HOLD_MS, LAST_FRAME, inkOf, layout, loadWrap, paintLetters, wake, type Painted, type Wrap } from "@/components/film/setFree";

// The Tata page's own files (TATA_GRID, TATA_GUIDELINES.wordmark, TATA_HERO.art
// in constants/tataExperience and tataStory — named here rather than imported,
// so the home page doesn't carry the Tata page's copy).
const GRID = "/content/clients/tata-iis/brand/grid-2026.webp";
const WORDMARK = "/content/clients/tata-iis/brand/wordmark-black.png";
const ART = "/content/clients/tata-iis/hero/skills-build-stronger-india.webp";
/** The two campuses' own lockups, for under the first column (owner: "Under
 *  1st column put IISA and IISM … logos", then "Use original IISA and IISM
 *  logos" — the stacked versions, iisa-portrait.png and iism-portrait.png,
 *  are unused since). `ink` is where the artwork sits on its canvas: IIS
 *  Mumbai's file has wide empty margins, so it is shown cropped to its ink. */
const CAMPUS_MARKS = [
  { src: "/content/clients/tata-iis/brand/iisa.png", alt: "IIS Ahmedabad", w: 800, h: 593, ink: { x: 0, y: 0, w: 800, h: 593 } },
  { src: "/content/clients/tata-iis/brand/iism.png", alt: "IIS Mumbai", w: 800, h: 800, ink: { x: 20, y: 274, w: 760, h: 252 } },
] as const;

/** The campus marks side by side at one height, standing on their foot —
 *  each box shaped like its ink, and the file placed in it so the ink fills
 *  it exactly. They wait for the room like every picture here (nearness). */
function CampusMarks() {
  const near = useContext(NearContext);
  return (
    <span className="flex h-full items-end gap-[7%] pb-[0.35rem]">
      {CAMPUS_MARKS.map((m) => (
        <span key={m.src} className="relative block overflow-hidden" style={{ flex: `${m.ink.w / m.ink.h} 1 0`, aspectRatio: `${m.ink.w} / ${m.ink.h}` }}>
          {near && (
            // eslint-disable-next-line @next/next/no-img-element -- placed by its ink, which next/image's fill cannot do
            <img
              src={m.src}
              alt={m.alt}
              className="absolute max-w-none"
              style={{
                width: `${(m.w / m.ink.w) * 100}%`,
                height: `${(m.h / m.ink.h) * 100}%`,
                left: `${(-m.ink.x / m.ink.w) * 100}%`,
                top: `${(-m.ink.y / m.ink.h) * 100}%`,
              }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

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
/** How far down the film the columns end: its top part — the cage's crown
 *  and the flock rising from it — among their last lines, the rest beneath
 *  them. 0.25 since the owner's next word ("move the text further up, fix
 *  animation at current point"): the film stays standing on the band, the
 *  words lift clear of the boy (it was 0.55, down to his shoulders). */
const OVERLAP = 0.25;
/** And the words lifted this many lines above that (owner: "move the text 4
 *  lines height upwards", then "just move text down 2 line height", then
 *  "move text up one line") — the film stays standing on the band, so the
 *  flock meets the columns' foot and its wake reaches up into them. */
const LIFT_LINES = 3;

/** The film and the words round it, under `head` (the wordmark); the
 *  campuses' marks under the first column. */
function FilmWrap({
  live,
  reduceMotion,
  head,
  middle,
  campuses,
  groundRef,
}: {
  live: boolean;
  reduceMotion: boolean;
  head: React.ReactNode;
  /** What fills the room between the wordmark and the words on a tall
   *  screen (the hero artwork). */
  middle?: React.ReactNode;
  /** What stands under the first column, on the band (the campus marks). */
  campuses?: React.ReactNode;
  /** A marker at the band's top edge, in the same frame as this box. */
  groundRef: React.RefObject<HTMLDivElement | null>;
}) {
  const near = useContext(NearContext);
  const boxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pool = useRef<Painted[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0, head: 0, ground: 0, tall: false });
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
      // The band's top edge, measured down from this box's top — by layout,
      // never by screen boxes, which carry the flight's scale.
      const g = groundRef.current;
      setBox({
        w: el.clientWidth,
        h: el.clientHeight,
        head: headRef.current?.offsetHeight ?? 0,
        ground: g ? g.offsetTop - el.offsetTop : el.clientHeight,
        tall: window.matchMedia("(orientation: portrait)").matches,
      });
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
  }, [groundRef]);

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

  // The canvas the letters are measured on, and each one's width, kept.
  const measure = useMemo(() => {
    if (!type || typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.font = type.font;
    const cache = new Map<string, number>();
    const m = (c: string) => {
      let v = cache.get(c);
      if (v === undefined) cache.set(c, (v = ctx.measureText(c).width));
      return v;
    };
    return { m, space: ctx.measureText(" ").width };
  }, [type]);

  // The block: two columns as wide as the column allows (to MAX_REM); the
  // film under the second, its left edge on the column's (owner: "left Align
  // the animation with 2nd column"), as wide as the column — smaller if the
  // room is too short for it.
  const width = Math.min(box.w, MAX_REM * 16);
  const gutter = (type?.size ?? 12) * GUTTER_EM;
  const half = Math.max(0, (width - gutter) / 2);
  // On a tall screen a share of it is kept for the artwork (`middle`).
  const room = box.ground - box.head - (box.tall ? box.ground * 0.3 : 0);
  // Where the boy's feet are in the film's first frame (the lowest ink in
  // its left half), as a share of its height — the line that meets the band.
  const feet = useMemo(() => {
    if (!wrap) return 0.9;
    const first = wrap.frames[0] ?? [];
    let low = 0;
    first.forEach((r, b) => {
      for (let k = 0; k < r.length; k += 2) if (r[k] < wrap.w * 0.45) low = b + 1;
    });
    return low ? Math.min(1, (low * wrap.band) / wrap.h) : 0.9;
  }, [wrap]);
  const filmW = Math.max(0, Math.min(half, (room * 0.5) / FILM_RATIO));
  const filmH = filmW * FILM_RATIO;
  const filmX = half + gutter;
  const columnsAt = useCallback(
    (cut: number[]) => [
      { x0: 0, x1: half, words: COLUMNS[0].slice(0, cut[0]).join(" ").split(/\s+/) },
      { x0: half + gutter, x1: width, words: COLUMNS[1].slice(0, cut[1]).join(" ").split(/\s+/) },
    ],
    [width, half, gutter],
  );

  // THE PLAN, once per size: how many sentences fit, and where the film sits
  // — the second column, wrapped round the film's busiest frames, ending
  // OVERLAP of the way down it; the first leaving room under it for the
  // campus marks. Worked out in an idle moment — a few dozen layouts — and
  // kept.
  const [plan, setPlan] = useState<{ key: string; filmY: number; cut: number[]; height: number; reach: number; first: number } | null>(null);
  const planKey = `${width}|${room}|${type?.font}|${!!wrap}|${feet}`;
  useEffect(() => {
    if (!wrap || !type || !measure || width <= 0) return;
    const run = () => {
      const minRoom = type.size * 2;
      const marks = type.lineH * 3.4; // the least room the campus marks need
      const sample = wrap.frames.map((_, f) => f).filter((f) => f % 6 === 0 || f === wrap.frames.length - 1);
      const place = (cut: number[]) => {
        const cols = columnsAt(cut);
        const bare = layout(cols, type.lineH, measure.m, measure.space, () => [], minRoom).heights;
        const lift = LIFT_LINES * type.lineH;
        let filmY = bare[1] - OVERLAP * filmH + lift;
        let second = bare[1];
        for (let k = 0; k < 4; k++) {
          second = 0;
          for (const f of sample) second = Math.max(second, layout(cols, type.lineH, measure.m, measure.space, inkOf(wrap, f, filmX, filmY, filmW, type.size).spans, minRoom).heights[1]);
          const next = second - OVERLAP * filmH + lift;
          if (Math.abs(next - filmY) < 1) break;
          filmY = next;
        }
        filmY = Math.max(0, filmY);
        const reach = filmY + feet * filmH;
        return { filmY, reach, first: bare[0], height: Math.max(filmY + filmH, second, bare[0]), marksFit: reach - bare[0] >= marks };
      };
      // All the words if they fit; else a last sentence goes — the first
      // column's while the campus marks lack room, otherwise the longer's —
      // keeping two in each.
      const cut = [COLUMNS[0].length, COLUMNS[1].length];
      let p = place(cut);
      while ((p.reach > room || !p.marksFit) && (cut[0] > 2 || cut[1] > 2)) {
        const longer =
          !p.marksFit && cut[0] > 2
            ? 0
            : cut[0] > 2 && (COLUMNS[0].slice(0, cut[0]).join(" ").length >= COLUMNS[1].slice(0, cut[1]).join(" ").length || cut[1] <= 2)
              ? 0
              : 1;
        cut[longer]--;
        p = place(cut);
      }
      setPlan({ key: planKey, filmY: p.filmY, cut: [...cut], height: p.height, reach: p.reach, first: p.first });
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(run, { timeout: 500 });
    return () => cancel(id);
  }, [planKey, wrap, type, measure, width, room, filmW, filmH, filmX, columnsAt, feet]);
  const ready = plan && plan.key === planKey ? plan : null;

  // Reduced motion: the last frame, still, and the words round it.
  const shown = reduceMotion ? (wrap ? wrap.frames.length - 1 : 0) : frame;

  // This frame's letters, and the birds' wake through them.
  const flow = useMemo(() => {
    if (!measure || !type || !wrap || !ready) return null;
    const ink = inkOf(wrap, shown, filmX, ready.filmY, filmW, type.size);
    const { letters } = layout(columnsAt(ready.cut), type.lineH, measure.m, measure.space, ink.spans, type.size * 2);
    return { letters, moves: wake(letters, type.lineH, type.size, ink.nearest) };
  }, [measure, type, wrap, ready, columnsAt, shown, filmX, filmW]);

  // The letters, drawn straight to the page: one span each, kept and reused,
  // and touched only when its letter or its place changes — most of them sit
  // still above the film, frame after frame.
  useLayoutEffect(() => {
    const host = textRef.current;
    if (host && flow) paintLetters(host, pool.current, flow.letters, flow.moves);
  }, [flow]);

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
      {/* The wordmark at the top; the words and the film let down until the
          boy's feet meet the band.
          ⚠ Placed by top offsets, never by a transform: a transform would make
          this a layer of its own, and the film's "multiply" would then meet
          only the empty layer — its white would stand over the grid as a box. */}
      <div ref={headRef} className="absolute inset-x-0 top-0 pb-[clamp(0.75rem,4.5vh,2.75rem)]">
        {head}
      </div>
      {/* A tall screen's artwork, between the wordmark and the words. */}
      {middle && box.tall && ready && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: box.head, height: Math.max(0, box.ground - ready.reach - box.head - 12) }}>
          {middle}
        </div>
      )}
      <div
        aria-hidden
        className="absolute left-0"
        style={{ top: ready ? box.ground - ready.reach : 0, width, height: ready?.height ?? 0, visibility: ready ? "visible" : "hidden" }}
      >
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
        {/* The campus marks, under the first column, standing on the band. */}
        {campuses && ready && (
          <div className="absolute left-0" style={{ top: ready.first + (type?.lineH ?? 14) * 0.9, width: half, height: Math.max(0, ready.reach - ready.first - (type?.lineH ?? 14) * 0.9) }}>
            {campuses}
          </div>
        )}
        {/* The letters, two columns (drawn by the effect above). */}
        <div ref={textRef} className="tata-flow-type absolute left-0 top-0" />
      </div>
    </div>
  );
}


export function TataSlide({ item, live, reduceMotion }: { item: Showcase; live: boolean; reduceMotion: boolean }) {
  const href = item.report.href ?? "/clients/tata-iis";
  const groundRef = useRef<HTMLDivElement>(null);
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden bg-white">
      <h2 className="sr-only">{item.name}</h2>
      {/* The Tata page's grid wash, the whole slide. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image src={GRID} alt="" fill sizes="100vw" className="object-cover opacity-70" />
      </div>

      {/* The hero artwork, bleeding right, from under the strip to the band.
          On a tall screen it stands between the wordmark and the words
          instead (FilmWrap's `middle`). */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[7svh] right-0 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem))] w-[50%] portrait:hidden"
      >
        <Image src={ART} alt="" fill sizes="50vw" className="object-contain object-right-bottom" />
      </div>

      {/* The left: the wordmark, then the words with the film among their
          last lines. On a tall screen, the upper part, clear of the artwork
          below; on a short one (a phone on its side) wider, the artwork being
          small there. */}
      <div className="slide-frame is-logic absolute inset-0 flex">
        {/* The band's top edge (FootBand: 7svh), where the boy stands. */}
        <div ref={groundRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[7svh] h-0" />
        <div className="flex min-h-0 w-[54%] flex-col portrait:w-full [@media(max-height:31.25rem)]:landscape:w-[72%]">
          <FilmWrap
            live={live}
            reduceMotion={reduceMotion}
            groundRef={groundRef}
            campuses={<CampusMarks />}
            middle={
              <>
                <Image src={ART} alt="" fill sizes="70vw" className="object-contain object-right" />
                <span className="pointer-events-auto absolute bottom-0 left-0">
                  <PixelButton side="logic" href={href}>
                    {item.report.label} <span aria-hidden>→</span>
                  </PixelButton>
                </span>
              </>
            }
            head={
              <span className="relative block aspect-[1020/257] w-[min(100%,24rem,calc(13vh*1020/257))] portrait:w-[min(100%,18rem,calc(10vh*1020/257))]">
                <Image src={WORDMARK} alt="TATA IIS — Tata Indian Institute of Skills" fill sizes="24rem" className="object-contain object-left" />
              </span>
            }
          />
        </div>
      </div>

      {/* The way in, where every left slide keeps it — on a wide screen. On
          a tall one the words come down into that corner, so it stands beside
          the artwork instead (`middle`, above). */}
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw] portrait:hidden">
        <PixelButton side="logic" href={href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
