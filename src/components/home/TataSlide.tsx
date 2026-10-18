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
 *   │ the institute  │  its campuses │  (the Tata page's,│
 *   │ in one column  │  in the other │   bleeding right) │
 *   │ Position: …    │  round birds… │                   │
 *   │ IISA  IISM     ☐ the film     │ [View Full ... →] │
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
 * THE WORDS, two columns, all of them the institute's (owner, 2026-10-18:
 * "This text should only be Tata IIS and its info as was before, but more
 * detailed, dont include my details") — the institute in one, its campuses in
 * the other; the owner's part, which stood in the second until then, is one
 * line under the first: "Position:" and the role. They are laid out line by
 * line, LETTER BY LETTER, AROUND THE FILM'S INK
 * (FilmWrap): for every frame the film shows, each line asks where the boy,
 * the cage and the birds are across its height and fills only the room
 * either side of them, breaking a word where a bird cuts it. Then the birds'
 * WAKE (owner, the next round: "break up words and rotate and push letters
 * into above sentences which get further disturbed"): letters near a bird are
 * pushed off it — up, mostly, the way the flock flies — and turned, and a
 * letter lifted into the line above jostles that line in turn.
 *
 * WHERE THE FILM SITS — since 2026-10-18 (owner: "the lower animation will
 * only effect last two lines of second column") the film is let up until the
 * highest ink of any of its frames reaches the second column's last TWO
 * lines, and no higher; the birds' wake moves only those two lines' letters,
 * and the first column is never touched. Before that:
 *
 * (owner, the next round: "need half the size of
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TataTurn } from "@/components/home/TataTurn";
import { FILM, FILM_RATIO, FIRST, HOLD_MS, LAST_FRAME, inkOf, layout, loadWrap, paintLetters, wake, type Painted, type Wrap } from "@/components/film/setFree";

// The Tata page's own files (TATA_GRID, TATA_GUIDELINES.wordmark, TATA_HERO.art
// in constants/tataExperience and tataStory — named here rather than imported,
// so the home page doesn't carry the Tata page's copy).
const GRID = "/content/clients/tata-iis/brand/grid-2026.webp";
const WORDMARK = "/content/clients/tata-iis/brand/wordmark-black.png";
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
  // One height for both: the room's, or less where the two side by side
  // would be wider than the column (since 2026-10-18, when the role's line
  // took some of the room above them and they ran up over it).
  const across = CAMPUS_MARKS.reduce((s, m) => s + m.ink.w / m.ink.h, 0);
  const h = `min(100cqh - 0.35rem, 93cqw / ${across.toFixed(4)})`;
  return (
    <span className="flex h-full items-end gap-[7%] pb-[0.35rem] [container-type:size]">
      {CAMPUS_MARKS.map((m) => (
        <span key={m.src} className="relative block shrink-0 overflow-hidden" style={{ height: `calc(${h})`, aspectRatio: `${m.ink.w} / ${m.ink.h}` }}>
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

/** The words, sentence by sentence — the institute's own, all of them
 *  already established on the Tata page (TATA_DESCRIPTION, TATA_WHO, the
 *  campus profiles — the client's own paragraphs — TATA_POWERED_BY and the
 *  campus photographs): the institute in the first column, its two campuses
 *  in the second. Nothing of the owner's here (owner, 2026-10-18); the role
 *  is the line under the first column. On a small screen the last sentences
 *  go first, so the most important lead. */
const COLUMNS: readonly (readonly string[])[] = [
  [
    "Tata Indian Institute of Skills (Tata IIS) is a Tata Group initiative — a Section 8 company set up in partnership with the Ministry of Skill Development and Entrepreneurship (MSDE) to build world-class skill institutes in Ahmedabad and Mumbai.",
    "Backed by Tata values, it delivers industry-grade, outcome-driven training in emerging technical and service skills, turning India’s demographic advantage into workplace excellence.",
    "Its aim is to empower India’s youth, equipping them with the skills that professional success asks for.",
    "The institute is powered by Tata Trusts and Skill India, alongside the Government of Gujarat and the Ministry.",
  ],
  [
    "IIS Ahmedabad, established with the MSDE and the Government of Gujarat, stands on a 20-acre campus in Nasmed village.",
    "IIS Mumbai, established with the MSDE, Government of India, stands on a 4+ acre campus in Chunabhatti.",
    "Both are built for job-oriented learning, with state-of-the-art infrastructure: advanced labs and classrooms, and workshop floors where trainees learn at the bench.",
    "Two campuses, one institute: skills, people, progress and opportunity.",
  ],
];

/** The block's widest, in rem — the two columns, and the film under them. */
const MAX_REM = 40;
/** The gap between the columns, in ems of the text. */
const GUTTER_EM = 1.8;
/** How many of the second column's last lines the film may touch — its wrap
 *  and its wake (owner, 2026-10-18: "the lower animation will only effect last
 *  two lines of second column"). Until then the columns ended a quarter of the
 *  way down the film, lifted three lines (OVERLAP 0.25, LIFT_LINES 3). */
const TOUCHED_LINES = 2;
/** The gap above the line under the first column ("Position: …"), in
 *  lines; the line itself takes one, or two where the column is narrow. */
const POSITION_GAP = 0.75;

/** The film and the words round it, under `head` (the wordmark); the
 *  campuses' marks under the first column. */
function FilmWrap({
  live,
  reduceMotion,
  head,
  middle,
  campuses,
  position,
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
  /** The line straight under the first column: the owner's role. */
  position?: { label: string; value: string };
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
  const [box, setBox] = useState({ w: 0, h: 0, head: 0, mark: 0, strip: 0, ground: 0, tall: false });
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
        // The wordmark itself (the head without its padding), and the strip's
        // foot above this box's top: the slide frame clears the strip by 0.6rem
        // (globals.css, .slide-frame).
        mark: (headRef.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0,
        strip: 0.6 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16),
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
  // The highest ink in any frame, as a share of the film's height — what may
  // reach no higher than the second column's last lines.
  const inkTop = useMemo(() => {
    if (!wrap) return 0;
    let top = wrap.h;
    for (const f of wrap.frames) {
      const b = f.findIndex((r) => r.length > 0);
      if (b >= 0) top = Math.min(top, b * wrap.band);
    }
    return top / wrap.h;
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
  // — its highest ink level with the top of the second column's last
  // TOUCHED_LINES, the column wrapped round the film's busiest frames; the
  // first leaving room under it for the role and the campus marks. Worked out
  // in an idle moment — a few dozen layouts — and kept.
  const [plan, setPlan] = useState<{ key: string; filmY: number; cut: number[]; height: number; reach: number; first: number } | null>(null);
  // The role's room under the first column, in lines with its gap: two lines
  // where the column is too narrow for it in one (a phone).
  const posRoom = !position
    ? 0
    : POSITION_GAP + (measure && [...`${position.label} ${position.value}`].reduce((w, c) => w + measure.m(c), 0) * 1.06 > half ? 2 : 1);
  const planKey = `${width}|${room}|${type?.font}|${!!wrap}|${feet}|${inkTop}|${posRoom}`;
  useEffect(() => {
    if (!wrap || !type || !measure || width <= 0) return;
    const run = () => {
      const minRoom = type.size * 2;
      const marks = type.lineH * (3.4 + posRoom); // the least room the role and the campus marks need
      // The film's top for a second column ending at `end`: its highest ink
      // at the top of the last TOUCHED_LINES — less inkOf's own margin above
      // the ink, so the line above them stays clear of it.
      const padY = type.size * 0.15 + 1;
      const at = (end: number) => end - TOUCHED_LINES * type.lineH + padY - inkTop * filmH;
      const sample = wrap.frames.map((_, f) => f).filter((f) => f % 4 === 0 || f === wrap.frames.length - 1);
      const place = (cut: number[]) => {
        const cols = columnsAt(cut);
        const bare = layout(cols, type.lineH, measure.m, measure.space, () => [], minRoom).heights;
        // The second column's foot with the film's top at y, round its
        // busiest frame.
        const foot = (y: number) => {
          let e = 0;
          for (const f of sample) e = Math.max(e, layout(cols, type.lineH, measure.m, measure.space, inkOf(wrap, f, filmX, y, filmW, type.size).spans, minRoom).heights[1]);
          return e;
        };
        // The highest the film may stand: raised, it pushes words on and the
        // column grows under it, so search — the lowest the film can be is
        // with its ink under the words (no line touched); as high as the
        // words alone would allow, it may touch too many.
        let lo = at(bare[1]);
        let hi = bare[1] + padY - inkTop * filmH;
        if (at(foot(lo)) <= lo) hi = lo;
        for (let k = 0; k < 9 && hi - lo > 0.5; k++) {
          const mid = (lo + hi) / 2;
          if (at(foot(mid)) <= mid) hi = mid;
          else lo = mid;
        }
        const second = foot(hi);
        const filmY = Math.max(0, hi);
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
  }, [planKey, wrap, type, measure, width, room, filmW, filmH, filmX, columnsAt, feet, inkTop, posRoom]);
  const ready = plan && plan.key === planKey ? plan : null;

  // Reduced motion: the last frame, still, and the words round it.
  const shown = reduceMotion ? (wrap ? wrap.frames.length - 1 : 0) : frame;

  // This frame's letters, and the birds' wake through them.
  const flow = useMemo(() => {
    if (!measure || !type || !wrap || !ready) return null;
    const ink = inkOf(wrap, shown, filmX, ready.filmY, filmW, type.size);
    const { letters } = layout(columnsAt(ready.cut), type.lineH, measure.m, measure.space, ink.spans, type.size * 2);
    const moves = wake(letters, type.lineH, type.size, ink.nearest);
    // The wake stirs only the second column's last lines; every other letter
    // holds still.
    let last = -1;
    for (const L of letters) if (L.col === 1) last = Math.max(last, L.line);
    letters.forEach((L, i) => {
      if (L.col === 1 && L.line > last - TOUCHED_LINES) return;
      moves[i * 3] = 0;
      moves[i * 3 + 1] = 0;
      moves[i * 3 + 2] = 0;
    });
    return { letters, moves };
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
        {position && <p>{`${position.label} ${position.value}`}</p>}
      </div>
      {/* The wordmark at the top; the words and the film let down until the
          boy's feet meet the band.
          ⚠ Placed by top offsets, never by a transform: a transform would make
          this a layer of its own, and the film's "multiply" would then meet
          only the empty layer — its white would stand over the grid as a box. */}
      {/* On a wide screen the wordmark stands midway between the strip and
          the words (owner, 2026-10-17: "bring tata iis logo in center of upper
          tabs and lower text"); on a tall one the artwork fills that room, so
          it keeps the top. */}
      <div
        ref={headRef}
        className="absolute inset-x-0 top-0 pb-[clamp(0.75rem,4.5vh,2.75rem)]"
        style={!box.tall && ready ? { top: Math.max(0, (box.ground - ready.reach - box.strip) / 2 - box.mark / 2) } : undefined}
      >
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
        {/* The role, straight under the first column, in its type. */}
        {position && ready && (
          <p className="tata-flow-type absolute left-0" style={{ top: ready.first + (type?.lineH ?? 14) * POSITION_GAP, width: half }}>
            <span className="font-bold">{position.label}</span> {position.value}
          </p>
        )}
        {/* The campus marks under that, standing on the band. */}
        {campuses && ready && (
          <div
            className="absolute left-0"
            style={{
              top: ready.first + (type?.lineH ?? 14) * (posRoom + 0.9),
              width: half,
              height: Math.max(0, ready.reach - ready.first - (type?.lineH ?? 14) * (posRoom + 0.9)),
            }}
          >
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
  const tall = useMediaQuery("(orientation: portrait)");
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden bg-white">
      <h2 className="sr-only">{item.name}</h2>
      {/* The ground. On a wide screen: the student turning to the camera,
          the whole slide, scrubbed by the pointer across its right half
          (TataTurn; owner, 2026-10-16) — it took the place of the grid wash
          and the hero artwork, both of which its frames carry. On a tall
          screen: the grid wash, and the turn between the wordmark and the
          words (FilmWrap's `middle`). */}
      {tall ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image src={GRID} alt="" fill sizes="100vw" className="object-cover opacity-70" />
        </div>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <TataTurn live={live} reduceMotion={reduceMotion} fit="cover" />
        </div>
      )}

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
            position={{ label: "Position:", value: item.role }}
            middle={
              <>
                <TataTurn live={live && tall} reduceMotion={reduceMotion} fit="student" className="absolute inset-0 mix-blend-multiply" />
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
