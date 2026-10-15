"use client";

/**
 * PortraitOrb — the owner, half circuit-line and half paint, the one turning
 * into the other square by square.
 *
 * Two supplied ring artworks with the owner's two portraits inside them: the
 * circuit-line ring around the mono frame, the paint-splatter ring around the
 * colour one. At rest the circle is half of each — the same left-logic /
 * right-creative split the brain above it makes.
 *
 * ⚠ THE TWO HALVES TRADE PLACES ALONG AN ARROWHEAD OF SQUARES (owner,
 * 2026-10-14). The frame is a grid of small SEAM_CELL squares; the line
 * between the halves is a very open chevron ("closer to a straight line, but
 * not exactly straight") pointing the way the change is going — the side
 * gaining ground leads with its tip — and along it the squares turn over in a
 * ragged band, each shrinking out of one half as it grows into the other, the
 * way the slides' squares turn (pixelDissolve). It runs the whole width of the
 * frame, tracery and splatter included, to both ends: at one end every square
 * is line, at the other every square is paint — nothing fades, the squares
 * carry it all the way ("pixel animation should follow all the way through on
 * both sides"). (For an hour the same day the squares turned in a random
 * spray instead; the owner preferred the arrowhead.)
 *   · THE MOUSE DRIVES IT (owner, 2026-10-14: "remember we had attached it
 *     with mouse horizontal movement, keep that"): the pointer's place across
 *     the screen sets how far the change has gone — move right and the line
 *     half goes right with you, opening; move left, the paint half — as it did
 *     from 2026-10-03 to 2026-10-12.
 *   · A SECOND OF STILLNESS and it carries on by itself from wherever it
 *     stands, to one end and back, at ONE steady speed (owner: "no variable
 *     animation speed … same pixel animation speed all the way from L to R or
 *     vice versa"), heading the way it was last going.
 * (2026-10-12 to -14 it swept on its own on a cosine and held still while the
 * pointer moved, faded the beaten side out near each end, and its seam was a
 * crisp straight line — git has all of it.)
 *
 * ⚠ The two frames are pre-composited and ALIGNED at build time, not stacked
 * by CSS. The supplied rings do not agree with each other: the line ring's
 * disc sits at (1083.5, 493) with r=391.2 and the paint ring's at (455.5,
 * 489.5) with r=342.5 — different centres AND different radii. Both are
 * re-projected onto one shared canvas so the disc lands identically in each.
 * Both files are therefore the same size and must stay that way; re-run the
 * build step if a ring is replaced rather than nudging anything by eye.
 *
 * ⚠ The two PORTRAITS are aligned to each other too, and that needs a
 * translation, not just a zoom: scale 1.042 with a (+4.5, −7.0) source-pixel
 * shift. Solved by maximising gradient-magnitude correlation across the face,
 * which scores 0.636 against 0.598 for the best scale-only fit. Scale alone
 * left the face visibly broken at the seam — the frames differ by a shift as
 * well as a zoom, and only the shift closes the jaw and glasses across the
 * join.
 *
 * The two halves' clips are exact complements — every square is one half or
 * the other, or mid-turn as a small square of one inside a ring of the other —
 * so a side that is fully open leaves the other genuinely invisible rather
 * than merely covered. That matters because both frames have transparent
 * background: a covered frame would still show its tracery through the gaps.
 *
 * Written straight to the two layers' clip-path from a motion value; nothing
 * re-renders as it goes. It only runs while the orb is on screen.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { IDLE_MS, SWEEP_PERIOD } from "@/components/home/idleSweep";
import { markPhotoShown } from "@/components/home/nearness";
import { hash, smooth } from "@/components/home/pixelDissolve";

/** The two frames. ⚠ HeroStage preloads both from the page's <head>
 *  (2026-10-12, speed fix 1): the orb only renders once the stage has been
 *  measured, after the page's code has run, so without that the browser would
 *  not learn of the photo until then — and would fetch it behind everything
 *  else the page asks for at that moment. */
export const ORB_SRC = { line: "/content/portrait/orb-line.webp", paint: "/content/portrait/orb-paint.webp" } as const;

/** Both frames share this canvas exactly. See the header. */
const ASPECT = 1200 / 606;
/** The squares, px: 11 (owner, 2026-10-14: "smaller pixels"). Set when the
 *  slides' squares were 48 — 48 ÷ φ³ — and KEPT at 11 when those were halved
 *  to 24 the same day: this seam is its own effect, and the owner had just
 *  signed it off at this size. */
const SEAM_CELL = 11;
/** The arrowhead: how far its arms trail its tip per px up or down from the
 *  frame's middle — a very open one (owner, 2026-10-14: "more obtuse angle, ie
 *  closer to a straight line, but not exactly straight"), each arm ~11° off
 *  the vertical. */
const ARROW = 0.2;
/** The ragged band, in squares, over which a square turns from one half to
 *  the other, and how far each square's own jitter carries it. */
const BAND = 3;
const JITTER = 1;
/** How quickly the arrow swings round when the way it is going reverses —
 *  through straight, never a snap. Per second. */
const SWING = 5;
/** The disc's centre as a share of the frame's width (the build step's cxFrac).
 *  The tip's run across is laid out so that at the even split it stands HERE —
 *  the face half and half — not at the frame's middle, 12px off it: the run
 *  starts a little further out past the left edge than past the right, and
 *  stays one straight, steady line. */
const DISC_CX = 0.4674;
/** One way across, end to end, by itself: half the sweep's period — and at one
 *  steady speed the whole way. */
const PASS_S = SWEEP_PERIOD / 2;
/** How far off-centre the pointer travels before a side is whole. 1 = the very
 *  edge of the screen; a little over saturates before it, so the ends are
 *  reachable. (The value it had while it followed the mouse before.) */
const GAIN = 1.35;
/** How quickly it closes on the pointer, per second — the old spring's feel. */
const FOLLOW = 9;

export function PortraitOrb({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef<HTMLDivElement>(null);
  /** How far the change has gone: 0 = all line, 0.5 = the even split, 1 = all paint. */
  const split = useMotionValue(0.5);
  /** The arrow's bend: 1 points it left (the paint gaining), −1 right (the line
   *  gaining), and between, on its way round. Eased in the loop below. */
  const bendRef = useRef(1);
  /** The frame's size, kept by the ResizeObserver below. ⚠ NOT read off the
   *  element each frame (speed, 2026-10-15): the sweep redraws every frame,
   *  and a size read there made the browser lay the whole page out again
   *  first — on a phone that was most of the main thread, the whole time the
   *  first slide was up. */
  const sizeRef = useRef({ w: 0, h: 0 });

  const renderSquares = () => {
    const lineEl = lineRef.current;
    const paintEl = paintRef.current;
    if (!lineEl || !paintEl) return;
    const { w: W, h: H } = sizeRef.current;
    if (!W || !H) return;
    const u = split.get();
    const c = SEAM_CELL;
    const cols = Math.ceil(W / c);
    const rows = Math.ceil(H / c);
    // The tip's run: from past the right edge (all line) to past the left (all
    // paint), far enough out that nothing of the arms, the band or the jitter
    // is left on the frame at either end — straight and steady in between,
    // and through the disc's centre at the half.
    const margin = (BAND + JITTER + 1) * c + (ARROW * H) / 2;
    const from = W + margin;
    const to = 2 * DISC_CX * W - from;
    const tip = from + (to - from) * u;
    const bend = ARROW * bendRef.current;
    const f = (v: number) => v.toFixed(1);
    const rect = (x: number, y: number, w: number, h: number) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}z`;
    let paint = "";
    let line = "";
    for (let j = 0; j < rows; j++) {
      const y = j * c;
      // This row's edge: the tip at the middle, the arms trailing behind it.
      const edge = tip + bend * Math.abs(y + c / 2 - H / 2);
      let runP = -1;
      let runL = -1;
      for (let i = 0; i <= cols; i++) {
        const x = i * c;
        // How much of this square is paint, 0 … 1 (paint lies right of the
        // edge), its own jitter making the edge ragged; past the row, none.
        const s =
          i < cols
            ? smooth(Math.min(1, Math.max(0, ((x + c / 2 - edge) / c + (hash(i + 11, j + 7) - 0.5) * JITTER) / BAND + 0.5)))
            : -1;
        // Whole squares run together along the row, a hair over their edges.
        if (s >= 0.999) {
          if (runP < 0) runP = x;
        } else if (runP >= 0) {
          paint += rect(runP - 0.5, y - 0.5, x - runP + 1, c + 1);
          runP = -1;
        }
        if (s >= 0 && s <= 0.001) {
          if (runL < 0) runL = x;
        } else if (runL >= 0) {
          line += rect(runL - 0.5, y - 0.5, x - runL + 1, c + 1);
          runL = -1;
        }
        // A square mid-turn: a smaller square of paint at its middle, and the
        // ring of line around it — exact complements.
        if (s > 0.001 && s < 0.999) {
          const e = c * s;
          const g = (c - e) / 2;
          paint += rect(x + g, y + g, e, e);
          line += rect(x - 0.5, y - 0.5, c + 1, g + 0.5) + rect(x - 0.5, y + g + e, c + 1, g + 0.5);
          line += rect(x - 0.5, y + g, g + 0.5, e) + rect(x + g + e, y + g, g + 0.5, e);
        }
      }
    }
    lineEl.style.clipPath = line ? `path("${line}")` : "inset(50%)";
    paintEl.style.clipPath = paint ? `path("${paint}")` : "inset(50%)";
  };
  useMotionValueEvent(split, "change", renderSquares);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      sizeRef.current = { w: root.offsetWidth, h: root.offsetHeight };
      renderSquares();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Both halves in and painted — half of what the home page's background
  // downloads wait for (nearness; the other half is the orb's fade-in,
  // HeroStage).
  const halvesIn = useRef(0);
  const onHalfIn = () => {
    if (++halvesIn.current === 2) requestAnimationFrame(() => requestAnimationFrame(() => markPhotoShown("loaded")));
  };

  // The mouse, and the steady sweep when it is still — only while the orb is
  // on screen. A finger is not followed: on a touch screen it is scrolling.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let target = split.get();
    let movedAt = -Infinity;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const t = (e.clientX / window.innerWidth - 0.5) * GAIN + 0.5;
      // ⚠ Inverted, so the change travels WITH the pointer (see the header).
      target = 1 - Math.min(1, Math.max(0, t));
      movedAt = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let shown = true;
    const io = new IntersectionObserver(([e]) => {
      shown = e.isIntersecting;
    });
    io.observe(root);
    /** Which way it is heading: 1 toward the paint, −1 back. */
    let dir = 1;
    let last = -1;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!shown) return;
      const v = split.get();
      let next = v;
      if (now - movedAt < IDLE_MS) {
        // Following the mouse.
        next = reduceMotion ? target : v + (target - v) * (1 - Math.exp(-dt * FOLLOW));
        if (Math.abs(next - v) > 1e-4) dir = next > v ? 1 : -1;
      } else if (!reduceMotion) {
        // By itself: one steady speed, turning at each end.
        next = v + (dir * dt) / PASS_S;
        if (next >= 1) {
          next = 2 - next;
          dir = -1;
        } else if (next <= 0) {
          next = -next;
          dir = 1;
        }
      }
      // The arrow swings round to the way it is going.
      const b = bendRef.current;
      const nb = reduceMotion ? dir : b + (dir - b) * (1 - Math.exp(-dt * SWING));
      const swung = Math.abs(nb - b) > 1e-3;
      if (swung) bendRef.current = nb;
      if (next !== v) split.set(next);
      else if (swung) renderSquares();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, split]);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ aspectRatio: ASPECT }}>
      {/* Logic half — circuit ring, mono portrait. */}
      <div ref={lineRef} className="absolute inset-0">
        <Image
          src={ORB_SRC.line}
          alt="Shrey Singh"
          fill
          sizes="500px"
          className="object-contain"
          loading="eager"
          fetchPriority="high"
          onLoad={onHalfIn}
        />
      </div>

      {/* Creative half — paint ring, colour portrait. */}
      <div ref={paintRef} className="absolute inset-0">
        {/* ⚠ Eager and high priority as the line half is (it was lazy until
            2026-10-12): the photo is the first screen's picture, and it is
            whole only when both halves are in. */}
        <Image
          src={ORB_SRC.paint}
          alt=""
          fill
          sizes="500px"
          className="object-contain"
          loading="eager"
          fetchPriority="high"
          onLoad={onHalfIn}
        />
      </div>
    </div>
  );
}
