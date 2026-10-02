"use client";

/**
 * HeroName — the landing's two words, set around the brain.
 *
 * BOTH WORDS WRAP THE BRAIN (2026-10-02, v2026.1) — THINK round the left
 * hemisphere reading up from a T at the bottom, imagine round the right reading
 * down from its i at the top, every letter's foot pointing at the brain's
 * centre, like type set on a circle. Each letter is its own slot on a circle
 * concentric with that side's boundary (BRAIN_LEFT_ARC, BRAIN_RIGHT_ARC), its
 * feet a fixed ARC_GAP off the brain. Until then both sat on one horizontal
 * line on the crown, THINK's K right-aligned to the midline.
 *
 * BOTH WORDS ARE MESHES (2026-08-25), now one per LETTER. Each is rasterised
 * to a texture that a grid of vertices drags through and springs back from —
 * THINK in black, imagine in a rainbow that sweeps slowly along the word. imagine
 * used to be liquid particles over a static gradient; the owner replaced that
 * with THINK's effect plus moving colour. ImagineParticles was DELETED on
 * 2026-09-10 with the rest of the unreachable tree; recover it from git if the
 * liquid is ever wanted back.
 *
 * ⚠ The `brain-paint` span underneath each is the FALLBACK, not the fill. It is
 * what a reduced-motion or WebGL-less visitor reads, and it is hidden the moment
 * the mesh reports it is really drawing. The moving colour lives in the shader.
 *
 * ⚠ That fallback is `bg-clip-text`, so its opacity CANNOT come from an alpha on
 * the text colour (a `text-black` with a slash-opacity suffix, the way Think is
 * dimmed) — that destroys the clip and the word disappears. Dim the layer, not
 * the type.
 *
 * The two no longer slide sideways. They change SIZE with the pointer instead:
 * each is at its largest when the pointer is on its own side and falls to
 * SIZE_MIN_RATIO of that on the far side, crossing at the midpoint dead centre.
 * See SIZE_MIN_RATIO — this replaced a much smaller symmetric "breath" on
 * 2026-08-21.
 *
 * ⚠ Think used to sit BEHIND the footage at z-0, so the brain lapped over its
 * final K. That was reversed on the owner's instruction 2026-08-10: Think is
 * now z-30, above the pins and the furniture and everything else on the stage.
 * Opacity went with it — a word in front of the brain cannot be 20% black, or
 * the footage reads through the letters — so it carries THINK_GREY, the flat
 * equivalent of what that 20% used to composite to. Imagine stays at z-20.
 *
 * Both words are held inside the stage by EDGE_MARGIN, measured against their
 * INK rather than their boxes. The stage is `overflow-hidden`, and tucking each
 * word against the brain will happily push it off an edge when the footage sits
 * high or low.
 *
 * The brain's vertical extent is measured live from the footage's alpha so the
 * words tuck against its real crown and base at any size.
 */

import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ThinkMesh } from "@/components/home/ThinkMesh";
import { toStage } from "@/components/home/BrainTraces";
import { BRAIN_FRAME_H, BRAIN_FRAME_W } from "@/components/home/BrainSequence";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { UNIFY_FACES_ON_HOME } from "@/constants/faces";

/** How far each word shrinks as the pointer crosses to the other side.
 *
 *  ⚠ THE WORDS ONLY EVER SCALE DOWN. BASE_SIZE below is the MAXIMUM size, and
 *  this is the fraction of it each word falls to when the pointer is fully on
 *  the other side. That direction is deliberate and load-bearing twice over:
 *   · the ink clamps (EDGE_MARGIN, FLOOR_GAP) measure the UNSCALED span, so
 *     with the box already at max size they are computed for the largest state
 *     the word can ever reach and stay correct at every smaller one; and
 *   · BOTH words' meshes bake their texture from the layout box, so a word that
 *     scaled ABOVE 1 would be resampling a texture baked smaller than it is
 *     drawn, and would soften.
 *
 *  Replaces the old symmetric ±ZOOM breath (0.85–1.15 about a mid size). The
 *  owner asked on 2026-08-21 for a real size range, big on the pointer's side
 *  and small on the other, with the midpoint at dead centre — which this gives
 *  for free: at t = 0 both sit at (1 + SIZE_MIN_RATIO) / 2. */
const SIZE_MIN_RATIO = 0.375;

/** Size and placement both come from a mockup the owner overlaid on the stage
 *  in black (2026-08-10). Derived rather than eyeballed: the mockup crop also
 *  contained the live pins and the live Think, whose viewport positions are
 *  known from the code, so those solved the crop's scale and offset, and the
 *  black words were then read off in the same coordinates.
 *
 *  What that gave: Think spanning 22.6%–43.0% of the viewport width against
 *  the 2.5%–50% it occupied before, i.e. 0.43 of the old size. The words used
 *  to be scenery at 12vw, sized so each owned half the viewport out to the
 *  midline; they are now nearer to headline scale and sit clear of both the
 *  midline and each other.
 *
 *  ⚠ These are read off a crop, so treat them as good to about a percent, not
 *  as exact. IMAGINE_RATIO is deliberately left to carry Imagine's size, so
 *  the two keep their measured ascent match rather than drifting apart. */
const WORD = "block whitespace-nowrap will-change-transform";
/** ⚠ THIS IS NOW THE MAXIMUM SIZE, not a mid size. It was clamp(1.3rem, 5.2vw,
 *  6rem) when the words breathed ±15% around it; the top of that range was
 *  therefore ~5.98vw, which is what this now states outright. SIZE_MIN_RATIO
 *  takes each word down from here, so the pair still covers roughly the old
 *  ceiling at its largest and goes far smaller than before at its smallest —
 *  the range the owner drew on 2026-08-21. */
const BASE_SIZE = "clamp(1.5rem, 6vw, 6.9rem)";

/** ⚠ NEITHER WORD HAS A CSS ANCHOR ANY MORE. Until 2026-10-02 THINK was pinned
 *  by its right edge at 57% and imagine by its left at 62%, both on one line on
 *  the crown (THINK_INK_TOP 0.168). Both now wrap the brain, one per side. */
/** The circle THINK wraps, in FRAME pixels (1280×720, the footage's own).
 *  ⚠ MEASURED, 2026-10-02: per row, the leftmost 8px block that is ≥97% opaque
 *  (alpha > 230) AND has three more solid blocks to its right — which rejects
 *  the thin circuit sketch off the left hemisphere. Taken as the UNION across
 *  every fourth frame, since the scrub moves the silhouette, so the letters
 *  clear the brain at every pointer position. Rows 216–600 fit a circle at
 *  (547, 396) r 216; the radius carries the fit's worst outward miss (+11)
 *  plus a pixel, so no point of the edge pokes past it. Re-measure if the
 *  frames are replaced. */
const BRAIN_LEFT_ARC = { cx: 547, cy: 396, r: 228 };
/** The circle imagine wraps: BRAIN_LEFT_ARC's radius and row, placed so its
 *  rightmost point sits on the right hemisphere's outer edge.
 *  ⚠ NOT measured off alpha — the right hemisphere throws its paint straight
 *  off its own edge, so no alpha or colour test separates brain from splash.
 *  The edge (frame x ≈ 795 at rest) was read off the rendered page, 2026-10-02.
 *  ⚠ And NOT a mirror about the grey→colour seam: that seam (594 at rest) is
 *  where the hemispheres meet on screen, not the silhouette's centre — the
 *  brain is turned — and mirroring about it put imagine ~100px out in the
 *  splash. The seam also travels a long way with the scrub (≈740 on frame 0,
 *  ≈450 on frame 47); the outer edges move far less. */
const BRAIN_RIGHT_EDGE_X = 795;
const BRAIN_RIGHT_ARC = {
  cx: BRAIN_RIGHT_EDGE_X - BRAIN_LEFT_ARC.r,
  cy: BRAIN_LEFT_ARC.cy,
  r: BRAIN_LEFT_ARC.r,
};
/** Frame row each word's middle is centred on. A little above the circle's own
 *  centre, so THINK's lower letters stay clear of the logic pins' traces, which
 *  enter the brain at rows 490–570 (BrainTraces); imagine mirrors it. */
const ARC_MID_Y = 370;
/** px of clear air between the brain's edge and the letters' feet. */
const ARC_GAP = 12;
/** Letter spacing along the arc, as a multiple of each letter's own advance.
 *  ⚠ imagine runs tighter: it is seven letters and ~1.5× THINK's width, and at
 *  THINK's tracking it wrapped well past the crown at full size. */
const THINK_TRACKING = 1.18;
const IMAGINE_TRACKING = 1.02;
/** imagine's size at which the turning brain starts to cover it, and at which
 *  it has fully gone behind — the owner's instruction, 2026-10-02: with the
 *  pointer far left the right hemisphere swings out over the fixed arc, and
 *  the word should be hidden there, not printed on the brain.
 *  ⚠ Read in SIZE, not pointer position, because the size spring and the
 *  brain's scrub are both damped and track each other far better than either
 *  tracks the raw pointer. Observed 2026-10-02: clear of the brain with the
 *  pointer at 35% across (size ≈ 0.59), touching at 20% (≈ 0.50), covered by
 *  0% (0.375). Size = SIZE_MIN_RATIO + (1 − SIZE_MIN_RATIO) × pointer. */
const IMAGINE_SHOW_AT = 0.56;
const IMAGINE_HIDE_FROM = 0.47;
/** ⚠ T FIRST, AT THE BOTTOM: the word reads UPWARD round the brain, every
 *  letter's foot pointing at the brain's centre — the owner's instruction,
 *  2026-10-02. Index 0 is the lowest slot. */
const THINK_LETTERS = "THINK".split("");
/** imagine mirrors it on the right — "do the same for imagine", 2026-10-02 —
 *  feet toward the centre again, which on this side makes the word read
 *  DOWNWARD: index 0 (the i) is the HIGHEST slot. */
const IMAGINE_LETTERS = "imagine".split("");

/** One font-size does not give one height, so `imagine` is scaled to match
 *  THINK's ASCENT rather than its size — equal ascent is what reads as equal.
 *
 *  ⚠ THIS IS PER-FACE AND PER-STRING, and both change under
 *  UNIFY_FACES_ON_HOME. Measured on canvas at 200px, 2026-08-25:
 *      THINK   / Digibra  ascent 0.715
 *      imagine / Juturu   ascent 0.710   → ratio 143/142, essentially parity
 *      imagine / Digibra  ascent 0.740   → ratio 0.966, imagine set SMALLER
 *  Digibra's lowercase ascenders overshoot its caps, so an all-Digibra
 *  "imagine" is TALLER than "THINK" at the same size and has to come down.
 *
 *  ⚠ It is also much WIDER: 5.289em against Juturu's 3.244em, +63%. At the top
 *  of the size range that takes the word from ~255px to ~397px across — which,
 *  wrapped round the brain, is why IMAGINE_TRACKING runs tighter than THINK's.
 *
 *  ⚠ RE-MEASURE whenever a face, a weight, the casing or the string changes. */
const IMAGINE_RATIO = UNIFY_FACES_ON_HOME ? 0.715 / 0.74 : 143 / 142;

/** Both faces' metrics, in em, measured on canvas at 200px at the weight each
 *  word is actually set in. FONT_* are the face's DECLARED metrics, INK_* the
 *  real extent of that specific word's glyphs.
 *
 *  The distinction is the whole bug. CSS does not centre a word's ink in its
 *  line box — it centres the face's DECLARED box, then puts the baseline at
 *  `half-leading + declared ascent`. Juturu declares a 1.17em ascent against a
 *  0.21em descent, so its baseline sits far lower in the box than the ink
 *  suggests, and at any leading below 1.38 the g's descender lands OUTSIDE the
 *  box entirely — measured at 23px out. With `bg-clip-text` the paint comes
 *  from that box, so the overflow was painted with nothing and both g's were
 *  sheared flat. Two rounds of "make the box a bit taller" missed it because
 *  they assumed centring; the box has to clear the DECLARED metrics, not the
 *  ink.
 *
 *  Digibra declares a plain 0.75/0.25 and "Think" has no descender at all, so
 *  it needs only 0.5 and its 0.82 is comfortable. But its declared ascent is
 *  0.75 against 0.745 of ink, so at 0.82 leading the ink starts ~15px ABOVE the
 *  box — which is why Think ran off the top of the stage. Solid type doesn't
 *  clip against its own box, so this only ever mattered for the edge clamp.
 *
 *  ⚠ RE-MEASURE all six whenever either face, its weight, OR THE CASING of
 *  either word changes. Re-measured 2026-08-21 for "THINK" / "imagine":
 *   · THINK_INK_ASCENT fell 0.745 → 0.715. Digibra's h and k rise above its
 *     cap height, so the all-caps word is SHORTER than the mixed-case one.
 *   · Imagine's two ink figures did NOT move (0.71 / 0.21): in Juturu the i's
 *     dot and the g reach exactly as high and low as the capital I did.
 *  The four FONT_* figures are declared face metrics and never depend on the
 *  string, so they are untouched. */
/* ⚠ Imagine's four numbers come in TWO SETS, one per face, because every one of
 * them is a property of the family and the exact word. Juturu declares a 1.17
 * ascent against 0.21; Digibra declares a flat 0.75/0.25. Mixing a declared
 * metric from one face with an ink metric from the other puts the word's
 * baseline in the wrong place and, with `bg-clip-text`, shears the descenders. */
const IMAGINE_FONT_ASCENT = UNIFY_FACES_ON_HOME ? 0.75 : 1.17;
const IMAGINE_FONT_DESCENT = UNIFY_FACES_ON_HOME ? 0.25 : 0.21;
const IMAGINE_INK_DESCENT = UNIFY_FACES_ON_HOME ? 0.25 : 0.21;
const IMAGINE_INK_ASCENT = UNIFY_FACES_ON_HOME ? 0.74 : 0.71;
const THINK_FONT_ASCENT = 0.75;
const THINK_FONT_DESCENT = 0.25;
const THINK_INK_ASCENT = 0.715;

/** Line boxes. Imagine's MUST clear 1.38 or the fill shears; the remainder is
 *  slack. Think's 0.82 is unchanged — it clears its 0.5 requirement already. */
/* ⚠ Juturu needs 1.38 clear or the g's descender lands outside the box and
 * `bg-clip-text` paints it with nothing; 1.45 gave it slack. Digibra declares
 * only 1.0, so the box can close up — but not to THINK's 0.82, because unlike
 * "THINK" the word "imagine" HAS a descender in this face (0.25 of ink). */
const IMAGINE_LEADING = UNIFY_FACES_ON_HOME ? 1.08 : 1.45;
const THINK_LEADING = 0.82;

/** Where a word's highest ink sits relative to the top of its box. Both follow
 *  the same rule: half-leading is measured against the DECLARED box, the
 *  baseline sits one declared ascent below that, and the ink hangs off the
 *  baseline. */
function inkAboveBoxTop(fs: number, boxH: number): number {
  const halfLeading = (boxH - (THINK_FONT_ASCENT + THINK_FONT_DESCENT) * fs) / 2;
  return halfLeading + (THINK_FONT_ASCENT - THINK_INK_ASCENT) * fs;
}
/** Imagine's HIGHEST ink, same rule. */
function imagineInkTop(fs: number, boxH: number): number {
  const halfLeading = (boxH - (IMAGINE_FONT_ASCENT + IMAGINE_FONT_DESCENT) * fs) / 2;
  return halfLeading + (IMAGINE_FONT_ASCENT - IMAGINE_INK_ASCENT) * fs;
}

/** Clear air kept between either word's ink and the edge of the stage. The
 *  stage is `overflow-hidden`, so ink that reaches an edge is ink that is gone. */
const EDGE_MARGIN = 10;

/** THINK's ink: pure black, on the hero's top layer (z-40, over the pins and
 *  PORTFOLIO at z-30) — the owner's instruction, 2026-10-02. It was a flat
 *  #c7c7c7 (20% black over #f9f9f9) while it sat on the crown as a watermark. */
const THINK_INK = "#000";
/** "Bolder", per the same instruction. Digibra has ONE weight and globals.css
 *  blocks synthetic bold, so the weight comes from a stroke in the ink colour:
 *  this much per side, in em, in both the mesh and the fallback span. */
const THINK_EMBOLDEN = 0.035;

/** imagine's ink and shadow — pure white, lifted off the splash by a tight
 *  dark grey shadow, the owner's instruction, 2026-10-02. */
const IMAGINE_INK = "#fff";
const IMAGINE_SHADOW = "drop-shadow(0 2px 3px rgba(38,38,38,0.85)) drop-shadow(0 0 10px rgba(38,38,38,0.45))";

/** The vertical CENTRE of each word's ink, measured down from the top of its
 *  box. This is both where the two words are aligned and where each one scales
 *  about — see the transform origins below.
 *
 *  ⚠ It is NOT the middle of the box. THINK's 0.82 leading is tighter than
 *  Digibra's declared 1.0, so its ink sits ~0.11em above the box's centre; and
 *  imagine's ink includes the g's descender. Align or scale about the box and
 *  the words drift apart by several pixels as they change size. */
function thinkInkCentre(fs: number, boxH: number): number {
  return inkAboveBoxTop(fs, boxH) + (THINK_INK_ASCENT * fs) / 2;
}
function imagineInkCentre(fs: number, boxH: number): number {
  return imagineInkTop(fs, boxH) + ((IMAGINE_INK_ASCENT + IMAGINE_INK_DESCENT) * fs) / 2;
}

/** One wrapped word's DOM handles: a positioned slot and a measured glyph span
 *  per letter, and which letters' meshes are really drawing. */
interface ArcLetters {
  slotRefs: React.RefObject<(HTMLDivElement | null)[]>;
  letterRefs: React.RefObject<HTMLSpanElement | null>[];
  onActive: ((active: boolean) => void)[];
}

/** ⚠ Returns the HANDLES (stable — the layout effect lists them) separately
 *  from `meshOn` (live — only the render reads it), so a letter's mesh
 *  reporting in never re-runs the layout effect. */
function useArcLetters(letters: string[]): { handles: ArcLetters; meshOn: boolean[] } {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const letterRefs = useMemo(() => letters.map(() => createRef<HTMLSpanElement>()), [letters]);
  const [meshOn, setMeshOn] = useState<boolean[]>(() => letters.map(() => false));
  // ⚠ STABLE per letter: ThinkMesh lists onActive in its effect deps, so a fresh
  //   arrow each render would tear down and rebuild its WebGL context every time.
  const onActive = useMemo(
    () =>
      letters.map((_, i) => (active: boolean) =>
        setMeshOn((prev) => {
          if (prev[i] === active) return prev;
          const next = [...prev];
          next[i] = active;
          return next;
        }),
      ),
    [letters],
  );
  const handles = useMemo(() => ({ slotRefs, letterRefs, onActive }), [letterRefs, onActive]);
  return { handles, meshOn };
}

export function HeroName({
  brain,
}: {
  /** The footage layer's resting transform — HeroStage's own constants, so the
   *  arc lands on the brain exactly where BrainTraces finds it. */
  brain: { scale: number; shiftX: number; rise: number };
}) {
  const reduceMotion = useReducedMotion();

  const stageRef = useRef<HTMLHeadingElement>(null);
  // Per word: one slot (positioned) and one glyph span (measured, meshed) per
  // letter, plus which letters' meshes are really drawing.
  const { handles: think, meshOn: thinkMeshOn } = useArcLetters(THINK_LETTERS);
  const { handles: imagine, meshOn: imagineMeshOn } = useArcLetters(IMAGINE_LETTERS);

  // The size breath. Springs are slow and soft so this never reads as a jump.
  // ⚠ Both start at the MIDPOINT, which is where a pointer at dead centre puts
  //   them — starting at 1 makes both words snap down on the first mouse move.
  const thinkZ = useMotionValue((1 + SIZE_MIN_RATIO) / 2);
  const imagineZ = useMotionValue((1 + SIZE_MIN_RATIO) / 2);
  const thinkScale = useSpring(thinkZ, { stiffness: 50, damping: 20, mass: 0.6 });
  const imagineScale = useSpring(imagineZ, { stiffness: 50, damping: 20, mass: 0.6 });

  useEffect(() => {
    /** Lays one word's letters on its arc at size `s`. Imperative, straight
     *  onto each slot's transform — it runs on every frame of the size spring,
     *  and the hot-path contract keeps per-frame work out of React state.
     *
     *  Set like type on a circle: each letter's baseline is tangent to the
     *  arc and its foot points at the circle's centre. The arc GROWS AND
     *  SHRINKS WITH THE LETTERS: spacing scales with `s`, and the radius is the
     *  brain's plus ARC_GAP plus half the word's scaled ink height, so the
     *  feet (imagine's: the g's tail) stay on the curve at every size rather
     *  than the word shrinking into the brain or drifting off it.
     *
     *  `side` is −1 for the left hemisphere, +1 for the right. φ is the angle
     *  above the circle's outermost point on that side. */
    const layout = (
      word: ArcLetters,
      arc: typeof BRAIN_LEFT_ARC,
      side: -1 | 1,
      tracking: number,
      /** The word's ink height and ink centre (down from its box top), in px. */
      ink: (fs: number, boxH: number) => { height: number; centre: number },
      s: number,
    ) => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.offsetWidth;
      const h = stage.offsetHeight;
      if (!w || !h) return;
      const fit = Math.min(w / BRAIN_FRAME_W, h / BRAIN_FRAME_H) * brain.scale;
      const c = toStage(arc.cx, arc.cy, w, h, brain.scale, brain.shiftX, brain.rise);
      const rb = arc.r * fit;
      const midSin = (arc.cy - ARC_MID_Y) / arc.r;
      const phiMid = Math.asin(Math.max(-1, Math.min(1, midSin)));

      const metrics = word.letterRefs.map((r) => {
        const el = r.current;
        if (!el) return null;
        const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
        return { w: el.offsetWidth, h: el.offsetHeight, fs };
      });
      if (metrics.some((m) => !m)) return;
      const ms = metrics as NonNullable<(typeof metrics)[number]>[];
      // Every letter of a word shares one size and one box, so one ink figure
      // sets the ring the centres ride on — and, crucially, every letter uses
      // the WORD's ink centre, not its own, so the baselines line up on the
      // arc whatever each glyph's own extent (an i's dot, a g's tail).
      const { height, centre: inkC } = ink(ms[0].fs, ms[0].h);
      const r = rb + ARC_GAP + (height * s) / 2;
      // Each letter's centre, as arc length from the word's middle, by its own
      // advance — an I takes less room than an H.
      const pitches = ms.map((m) => m.w * tracking * s);
      const total = pitches.reduce((a, p) => a + p, 0);

      let run = 0;
      ms.forEach((m, i) => {
        const slot = word.slotRefs.current[i];
        if (!slot) return;
        const along = run + pitches[i] / 2 - total / 2;
        run += pitches[i];
        // Left: index 0 lowest, the word climbs. Right: index 0 highest, the
        // word descends. Both are the same sweep, clockwise round the brain.
        const phi = phiMid - (side * along) / r;
        const ext = (height * s) / 2;
        const px = Math.min(
          w - EDGE_MARGIN - ext,
          Math.max(EDGE_MARGIN + ext, c.x + side * r * Math.cos(phi)),
        );
        const py = Math.min(
          h - EDGE_MARGIN - (m.w * s) / 2,
          Math.max(EDGE_MARGIN + (m.w * s) / 2, c.y - r * Math.sin(phi)),
        );
        // ⚠ rotate(side·(90° − φ)). Left at its outermost point that is −90°,
        //   a letter on its back with its foot toward the brain; right, +90°.
        //   Off the outermost point each letter tips further so the foot keeps
        //   pointing at the centre.
        const deg = side * (90 - (phi * 180) / Math.PI);
        slot.style.transformOrigin = `${m.w / 2}px ${inkC}px`;
        slot.style.transform = `translate(${px - m.w / 2}px, ${py - inkC}px) rotate(${deg}deg) scale(${s})`;
        slot.style.visibility = "visible";
      });
    };

    const thinkInk = (fs: number, boxH: number) => ({
      height: THINK_INK_ASCENT * fs,
      centre: thinkInkCentre(fs, boxH),
    });
    const imagineInk = (fs: number, boxH: number) => ({
      height: (IMAGINE_INK_ASCENT + IMAGINE_INK_DESCENT) * fs,
      centre: imagineInkCentre(fs, boxH),
    });
    const layThink = (s: number) => layout(think, BRAIN_LEFT_ARC, -1, THINK_TRACKING, thinkInk, s);
    const layImagine = (s: number) => {
      layout(imagine, BRAIN_RIGHT_ARC, 1, IMAGINE_TRACKING, imagineInk, s);
      // Gone behind the brain: as the pointer goes left the brain turns to
      // show its left side and the right hemisphere swings out over the
      // fixed arc. Fade over the span where it does, so the word reads as
      // hidden by the brain rather than printed on it.
      const t = Math.max(0, Math.min(1, (s - IMAGINE_HIDE_FROM) / (IMAGINE_SHOW_AT - IMAGINE_HIDE_FROM)));
      const o = String(t * t * (3 - 2 * t));
      imagine.slotRefs.current.forEach((slot) => {
        if (slot) slot.style.opacity = o;
      });
    };

    const measure = () => {
      layThink(thinkScale.get());
      layImagine(imagineScale.get());
    };

    measure();
    const unsubThink = thinkScale.on("change", layThink);
    const unsubImagine = imagineScale.on("change", layImagine);
    const timers = [setTimeout(measure, 500), setTimeout(measure, 1500)];
    window.addEventListener("resize", measure);

    let onMove: ((e: PointerEvent) => void) | undefined;
    if (!reduceMotion) {
      onMove = (e) => {
        const half = window.innerWidth / 2;
        // -1 at the left edge, 0 dead centre, +1 at the right edge.
        const t = Math.max(-1, Math.min(1, (e.clientX - half) / half));
        // Pointer left → THINK at full size, imagine at its smallest. Right
        // inverts it. `u` runs 0→1 across the screen, so each word is a
        // straight lerp between SIZE_MIN_RATIO and 1 and the two cross at the
        // midpoint exactly at centre screen.
        const u = (t + 1) / 2;
        const span = 1 - SIZE_MIN_RATIO;
        thinkZ.set(1 - u * span);
        imagineZ.set(SIZE_MIN_RATIO + u * span);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      unsubThink();
      unsubImagine();
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion, brain.scale, brain.shiftX, brain.rise, think, imagine, thinkScale, imagineScale, thinkZ, imagineZ]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
        };

  return (
    <h1 ref={stageRef} aria-label="Think. Imagine." className="pointer-events-none absolute inset-0">
      {/* THINK — one slot per letter, wrapped round the left hemisphere. Each
          slot is placed and tilted by `layout`, straight onto its transform;
          hidden until the first layout so nothing flashes at the corner. */}
      {THINK_LETTERS.map((ch, i) => (
        <div
          key={`t${i}`}
          aria-hidden
          ref={(el) => {
            think.slotRefs.current[i] = el;
          }}
          style={{ visibility: "hidden" }}
          className="absolute left-0 top-0 z-40 will-change-transform"
        >
          <motion.span {...rise(0.35 + i * 0.06)} className="relative block">
            {/* ⚠ The span STAYS — the layout's ink metrics measure it, and it
                is what a reduced-motion visitor reads. The mesh only takes over
                its FILL, and only once ThinkMesh reports it is really drawing,
                so a WebGL2 failure leaves the letter rather than a hole. */}
            <span
              ref={think.letterRefs[i]}
              style={{
                fontSize: BASE_SIZE,
                lineHeight: THINK_LEADING,
                color: THINK_INK,
                WebkitTextStroke: `${2 * THINK_EMBOLDEN}em ${THINK_INK}`,
              }}
              className={`${WORD} font-digibra ${thinkMeshOn[i] ? "opacity-0" : ""}`}
            >
              {ch}
            </span>
            <ThinkMesh
              word={ch}
              from={think.letterRefs[i]}
              onActive={think.onActive[i]}
              embolden={THINK_EMBOLDEN}
            />
          </motion.span>
        </div>
      ))}

      {/* imagine — the mirror of THINK round the right hemisphere, reading
          down, on the same top layer. PURE WHITE with a dark grey shadow
          (2026-10-02): on the paint splash it now sits over every colour at
          once, and white lifted off a grey shadow is the one ink that reads on
          all of them. It was the moving rainbow until then — ThinkMesh still
          has `rainbow`/`rainbowStart`/`rainbowSpan` to put it back per letter.

          ⚠ The shadow is a `drop-shadow` FILTER on the wrapper, so it follows
          the mesh's displaced glyphs as well as the fallback span; a
          text-shadow would only ever shadow the hidden span. */}
      {IMAGINE_LETTERS.map((ch, i) => (
        <div
          key={`i${i}`}
          aria-hidden
          ref={(el) => {
            imagine.slotRefs.current[i] = el;
          }}
          style={{ visibility: "hidden" }}
          className="absolute left-0 top-0 z-40 will-change-transform"
        >
          <motion.span
            {...rise(0.5 + i * 0.05)}
            className="relative block"
            style={{ filter: IMAGINE_SHADOW }}
          >
            <span
              ref={imagine.letterRefs[i]}
              style={{
                fontSize: `calc(${BASE_SIZE} * ${IMAGINE_RATIO})`,
                lineHeight: IMAGINE_LEADING,
                color: IMAGINE_INK,
              }}
              className={`${WORD} font-graff font-bold ${imagineMeshOn[i] ? "opacity-0" : ""}`}
            >
              {ch}
            </span>
            <ThinkMesh word={ch} from={imagine.letterRefs[i]} onActive={imagine.onActive[i]} />
          </motion.span>
        </div>
      ))}
    </h1>
  );
}
