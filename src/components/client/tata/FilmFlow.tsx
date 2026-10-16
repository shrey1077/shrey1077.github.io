"use client";

/**
 * FilmFlow — band 03's flipbook story, told round the owner's film of it
 * (owner, 2026-10-16: "replace this with our new animation"). It replaces
 * FlipbookFlow — the handbook's drawn frames, which the text wrapped by
 * floats — with the film the home page's Tata slide plays (setFree): the boy
 * raising the cage, the birds flying free.
 *
 * The two columns of COPY lie either side of the film, which sits over the
 * gutter two lines down, and are laid out LETTER BY LETTER round its ink on
 * every frame it shows — a word breaking only where a bird cuts it — while
 * the birds' wake pushes the letters near them up and turns them, a lifted
 * letter jostling the line above (setFree's layout, inkOf, wake). The block
 * keeps one height, worked out from the film's busiest frames, so the page
 * never shifts while it plays.
 *
 * It plays while the band is on screen, holds its last frame, and plays
 * again. Below `md` there are no columns to flow between: the film, then the
 * words. Reduced motion: the last frame, still, and the words round it.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { FILM, FILM_RATIO, FIRST, HOLD_MS, LAST_FRAME, inkOf, layout, loadWrap, paintLetters, wake, type Painted, type Wrap } from "@/components/film/setFree";
import { TATA_HANDBOOK_FLIPBOOK_COPY as COPY } from "@/constants/tataStory";

/** The block's text: the band's body voice, at its usual size and leading. */
const TYPE = "tata-body text-[0.98rem] leading-[1.8] text-neutral-700";
/** The film's width, as a share of the block's; its top, in lines down. */
const FILM_SHARE = 0.6;
const TOP_LINES = 2;
/** The gap between the columns, and between paragraphs, in ems / lines. */
const GUTTER_EM = 2.6;
const PARA_LINES = 0.55;

/** A column's paragraphs as one run of words, "\n" between paragraphs. */
const wordsOf = (ps: readonly string[]) => ps.flatMap((p, i) => [...(i ? ["\n"] : []), ...p.split(/\s+/)]);

export function FilmFlow() {
  const reduceMotion = useReducedMotion() ?? false;
  const boxRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const pool = useRef<Painted[]>([]);
  const [wide, setWide] = useState(false);
  const [width, setWidth] = useState(0);
  const [type, setType] = useState<{ font: string; size: number; lineH: number } | null>(null);
  const [wrap, setWrap] = useState<Wrap | null>(null);
  const [live, setLive] = useState(false);
  const [frame, setFrame] = useState(0);

  // Wide enough for columns?
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // On screen (or nearly): load the ink, and play while it is in view.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) loadWrap().then(setWrap, () => {});
    }, { rootMargin: "800px 0px" });
    const seen = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.25 });
    near.observe(el);
    seen.observe(el);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, [wide]);

  // The block's width and the type, read off the page.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el || !wide) return;
    const read = () => {
      setWidth(el.clientWidth);
      const cs = probeRef.current && getComputedStyle(probeRef.current);
      if (cs) {
        const size = parseFloat(cs.fontSize);
        setType({ font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, size, lineH: parseFloat(cs.lineHeight) || size * 1.8 });
      }
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    document.fonts?.ready.then(read);
    return () => ro.disconnect();
  }, [wide]);

  // Playing: the words follow the frame the film is SHOWING, laid out in the
  // same frame as the picture (flushSync).
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
  }, [live, reduceMotion, wrap, wide]);

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

  // The geometry: the film over the gutter, two lines down.
  const filmW = width * FILM_SHARE;
  const filmH = filmW * FILM_RATIO;
  const filmX = (width - filmW) / 2;
  const filmY = (type?.lineH ?? 28) * TOP_LINES;
  const columns = useMemo(() => {
    const gutter = (type?.size ?? 16) * GUTTER_EM;
    const half = (width - gutter) / 2;
    return [
      { x0: 0, x1: half, words: wordsOf(COPY.columns[0]) },
      { x0: half + gutter, x1: width, words: wordsOf(COPY.columns[1]) },
    ];
  }, [width, type]);

  // One height for the block, from the film's busiest frames — so the page
  // never moves while it plays. Worked out in an idle moment, and kept.
  const [plan, setPlan] = useState<{ key: string; height: number } | null>(null);
  const planKey = `${width}|${type?.font}|${!!wrap}`;
  useEffect(() => {
    if (!wrap || !type || !measure || width <= 0) return;
    const run = () => {
      let height = filmY + filmH;
      for (let f = 0; f < wrap.frames.length; f += 4) {
        const { heights } = layout(columns, type.lineH, measure.m, measure.space, inkOf(wrap, f, filmX, filmY, filmW, type.size).spans, type.size * 2.4, type.lineH * PARA_LINES);
        height = Math.max(height, ...heights);
      }
      setPlan({ key: planKey, height: Math.ceil(height + type.lineH * 0.5) });
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(run, { timeout: 500 });
    return () => cancel(id);
  }, [planKey, wrap, type, measure, width, columns, filmX, filmY, filmW, filmH]);
  const ready = plan && plan.key === planKey ? plan : null;

  // This frame's letters, and the birds' wake through them.
  const shown = reduceMotion ? (wrap ? wrap.frames.length - 1 : 0) : frame;
  const flow = useMemo(() => {
    if (!measure || !type || !wrap || !ready) return null;
    const ink = inkOf(wrap, shown, filmX, filmY, filmW, type.size);
    const { letters } = layout(columns, type.lineH, measure.m, measure.space, ink.spans, type.size * 2.4, type.lineH * PARA_LINES);
    return { letters, moves: wake(letters, type.lineH, type.size, ink.nearest) };
  }, [measure, type, wrap, ready, shown, filmX, filmY, filmW, columns]);
  useLayoutEffect(() => {
    const host = textRef.current;
    if (host && flow) paintLetters(host, pool.current, flow.letters, flow.moves);
  }, [flow]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="tata-body mb-5 text-center text-[0.68rem] uppercase tracking-[0.2em] text-neutral-900">{COPY.kicker}</p>

      {wide ? (
        <div ref={boxRef} className="relative w-full" style={{ height: ready?.height ?? 480 }}>
          {/* The type the words are set in — read, never seen. */}
          <span ref={probeRef} aria-hidden className={`${TYPE} pointer-events-none invisible absolute`}>
            x
          </span>
          {/* For a screen reader, and a search engine: the words, in order. */}
          <div className="sr-only">
            {[...COPY.columns[0], ...COPY.columns[1]].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element -- a still in the film's own box
            <img src={LAST_FRAME} alt="" aria-hidden className="absolute mix-blend-multiply" style={{ left: filmX, top: filmY, width: filmW, height: filmH }} />
          ) : (
            <video
              ref={filmRef}
              src={FILM}
              poster={FIRST}
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              aria-label="The flipbook, animated: a boy holds up a birdcage and the birds fly free"
              className="absolute mix-blend-multiply"
              style={{ left: filmX, top: filmY, width: filmW, height: filmH }}
            />
          )}
          {/* The letters, two columns (drawn by the effect above). */}
          <div ref={textRef} aria-hidden className={`${TYPE} absolute inset-0`} style={{ visibility: ready ? "visible" : "hidden" }} />
        </div>
      ) : (
        <div ref={boxRef}>
          <video
            ref={filmRef}
            src={FILM}
            poster={FIRST}
            muted
            playsInline
            loop
            preload="metadata"
            disablePictureInPicture
            aria-label="The flipbook, animated: a boy holds up a birdcage and the birds fly free"
            className="mb-8 block w-full mix-blend-multiply"
            style={{ aspectRatio: "16 / 9" }}
          />
          {[...COPY.columns[0], ...COPY.columns[1]].map((p) => (
            <p key={p} className="tata-body mb-4 text-[0.98rem] leading-[1.8] text-neutral-700">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
