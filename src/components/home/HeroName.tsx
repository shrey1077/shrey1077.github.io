"use client";

/**
 * HeroName — the landing's two words, set around the brain.
 *
 * Think sits on the crown at display scale, in Digibra, at a fifth of black —
 * it reads as a watermark the brain sits IN FRONT OF rather than a headline
 * over it. Its final K is right-aligned to the brain's midline, so the word
 * ends exactly where the logic hemisphere does and the brain laps over its
 * last letter. imagine answers it at the base in Juturu bold, starting from
 * a little past that midline and running right.
 *
 * BOTH WORDS ARE MESHES NOW (2026-08-25). Each is rasterised to a texture that
 * a grid of vertices drags through and springs back from — THINK in its flat
 * THINK_GREY, imagine in a rainbow that sweeps slowly along the word. imagine
 * used to be liquid particles over a static gradient; the owner replaced that
 * with THINK's effect plus moving colour. ImagineParticles is kept, unused.
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

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ThinkMesh } from "@/components/home/ThinkMesh";
import { DURATION, EASE_OUT } from "@/constants/motion";

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

/** Horizontal anchors, as CSS offsets: Think's box is pinned by its RIGHT edge
 *  and Imagine's by its LEFT, so the pair keeps its gap at any size.
 *
 *  ⚠ The BOX is pinned there, but each word now scales about its OWN CENTRE
 *  (transformOrigin 50% 50%), so what stays put as the size changes is the
 *  word's centre, not the pinned edge — the owner asked on 2026-08-21 for both
 *  to stay centred, horizontally and vertically, at every size. With the old
 *  edge origins the words grew outward from the middle and their centres slid
 *  as they scaled. */
const THINK_RIGHT = "57%";
/** Moved right on the owner's instruction 2026-08-10 so Imagine clears the
 *  brain entirely and sits in the white. Measured, not guessed: at the leftmost
 *  pointer position its right edge sat at 61.99%, and the word now BEGINS where
 *  it used to end.
 *  ⚠ The 0.85/1.15 reasoning that used to be recorded here is void: the word no
 *  longer grows past its box, and it scales about its centre rather than this
 *  edge, so its left edge travels inward as it shrinks instead of holding. */
const IMAGINE_LEFT = "62%";

/** Vertical anchors, as a fraction of the viewport, measured to each word's
 *  INK top rather than its box — the boxes sit well off the ink on both faces.
 *
 *  ⚠ This replaces the live brain measurement. Placement used to be derived
 *  from the footage's own alpha so the words tucked against its real crown and
 *  base at any size; the mockup puts them at fixed heights instead, so that
 *  measurement is gone. `measureBrainV` went with it — recover it from git if
 *  the brain-relative behaviour is ever wanted back. */
const THINK_INK_TOP = 0.168;
const IMAGINE_INK_TOP = 0.716;

/** The two faces are nothing alike, so one font-size does not give one height.
 *  Measured on canvas at 200px: "Think" in Digibra rises 149px and has no
 *  descender at all; "Imagine" in Juturu rises 140px with 42px hanging below.
 *
 *  Matching TOTAL ink would shrink Imagine's letters to pay for its descender
 *  and leave it looking smaller. What reads as equal size is equal ASCENT, so
 *  Imagine takes a 6.4% bump and the descender is free to hang.
 *
 *  ⚠ RE-MEASURE THIS whenever the creative face changes — it was 149/137 for
 *  the face before that one, and 149/140 while the words read "Think" and
 *  "Imagine". CASING COUNTS: re-measured on canvas at 200px on 2026-08-21 for
 *  the new "THINK" / "imagine", it is 143/142, i.e. essentially parity. The
 *  6.4% bump Imagine used to take is gone, because the gap it corrected was
 *  Digibra's lowercase ASCENDERS (h, k) overshooting its caps — set all-caps,
 *  THINK is the shorter word, not the taller one.
 *  The number is a property of the two fonts and the two strings, not a taste
 *  call. */
const IMAGINE_RATIO = 143 / 142;

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
const IMAGINE_FONT_ASCENT = 1.17;
const IMAGINE_FONT_DESCENT = 0.21;
const IMAGINE_INK_DESCENT = 0.21;
const IMAGINE_INK_ASCENT = 0.71;
const THINK_FONT_ASCENT = 0.75;
const THINK_FONT_DESCENT = 0.25;
const THINK_INK_ASCENT = 0.715;

/** Line boxes. Imagine's MUST clear 1.38 or the fill shears; the remainder is
 *  slack. Think's 0.82 is unchanged — it clears its 0.5 requirement already. */
const IMAGINE_LEADING = 1.45;
const THINK_LEADING = 0.82;

/** Where a word's lowest / highest ink sits relative to the top of its box.
 *  Both follow the same rule: half-leading is measured against the DECLARED
 *  box, the baseline sits one declared ascent below that, and the ink hangs
 *  off the baseline. */
function inkBelowBoxTop(fs: number, boxH: number): number {
  const halfLeading = (boxH - (IMAGINE_FONT_ASCENT + IMAGINE_FONT_DESCENT) * fs) / 2;
  return halfLeading + (IMAGINE_FONT_ASCENT + IMAGINE_INK_DESCENT) * fs;
}
function inkAboveBoxTop(fs: number, boxH: number): number {
  const halfLeading = (boxH - (THINK_FONT_ASCENT + THINK_FONT_DESCENT) * fs) / 2;
  return halfLeading + (THINK_FONT_ASCENT - THINK_INK_ASCENT) * fs;
}
/** Imagine's HIGHEST ink, same rule — needed now that the word is placed by
 *  where its ink starts rather than by where the brain's base happens to be. */
function imagineInkTop(fs: number, boxH: number): number {
  const halfLeading = (boxH - (IMAGINE_FONT_ASCENT + IMAGINE_FONT_DESCENT) * fs) / 2;
  return halfLeading + (IMAGINE_FONT_ASCENT - IMAGINE_INK_ASCENT) * fs;
}

/** Clear air kept between either word's ink and the edge of the stage. The
 *  stage is `overflow-hidden`, so ink that reaches an edge is ink that is gone. */
const EDGE_MARGIN = 10;

/** Think's grey, flattened. It used to be black at 20%, which let the circuit
 *  film and the brain read straight through the letters; on top of everything
 *  it has to be opaque instead. This is that same 20% black composited over the
 *  page's own #f9f9f9 — 0.2x0 + 0.8x249 = 199 — so the word lands on the colour
 *  it already appeared to be, now at full strength. Re-derive if `bg-gallery`
 *  changes. */
const THINK_GREY = "#c7c7c7";

/** Clear air between Imagine's lowest ink and the furniture below it. */
const FLOOR_GAP = 18;

export function HeroName() {
  const reduceMotion = useReducedMotion();

  const thinkRef = useRef<HTMLSpanElement>(null);
  const imagineRef = useRef<HTMLSpanElement>(null);
  // True only while each word's mesh is actually drawing; see the spans below.
  const [imagineMeshOn, setImagineMeshOn] = useState(false);
  const [meshOn, setMeshOn] = useState(false);

  // The size breath. Springs are slow and soft so this never reads as a jump.
  // ⚠ Both start at the MIDPOINT, which is where a pointer at dead centre puts
  //   them — starting at 1 makes both words snap down on the first mouse move.
  const thinkZ = useMotionValue((1 + SIZE_MIN_RATIO) / 2);
  const imagineZ = useMotionValue((1 + SIZE_MIN_RATIO) / 2);
  const thinkScale = useSpring(thinkZ, { stiffness: 50, damping: 20, mass: 0.6 });
  const imagineScale = useSpring(imagineZ, { stiffness: 50, damping: 20, mass: 0.6 });

  // Vertical placement of each word's top edge.
  const thinkY = useMotionValue(0);
  const imagineY = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight;

      // Think. Placed by where its INK starts, then held inside the top edge —
      // the box sits ~15px above the ink on Digibra, so clamping the box would
      // let the letters leave the stage.
      const thinkEl = thinkRef.current;
      if (thinkEl) {
        const fs = parseFloat(getComputedStyle(thinkEl).fontSize) || 0;
        const inkOffset = inkAboveBoxTop(fs, thinkEl.offsetHeight);
        const wanted = vh * THINK_INK_TOP - inkOffset;
        thinkY.set(Math.max(EDGE_MARGIN - inkOffset, wanted));
      }

      // Imagine. Same idea, plus the two floors it has always needed: the
      // furniture in the bottom-right corner, and the bottom of the stage
      // regardless — a viewport short enough to put the rotator below the word
      // leaves the furniture clamp defending nothing.
      const el = imagineRef.current;
      if (el) {
        const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
        const boxH = el.offsetHeight;
        const inkBelowTop = inkBelowBoxTop(fs, boxH);
        const inkTopOffset = imagineInkTop(fs, boxH);

        const furniture = document
          .querySelector('[data-hero-furniture="right-bottom"]')
          ?.getBoundingClientRect();
        const stageFloor = vh - EDGE_MARGIN;
        const floor =
          furniture && furniture.height > 0
            ? Math.min(furniture.top - FLOOR_GAP, stageFloor)
            : stageFloor;

        const wanted = vh * IMAGINE_INK_TOP - inkTopOffset;
        imagineY.set(Math.min(wanted, floor - inkBelowTop));
      }
    };

    measure();
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
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion, thinkZ, imagineZ, thinkY, imagineY]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
        };

  return (
    <h1 aria-label="Think. Imagine." className="pointer-events-none absolute inset-0">
      {/* Think — right edge pinned to the midline, so the final K lands exactly
          where the logic hemisphere ends. It scales about that same edge, which
          keeps the K anchored while the word breathes. */}
      <motion.div
        aria-hidden
        style={{ y: thinkY, scale: thinkScale, transformOrigin: "50% 50%", right: THINK_RIGHT }}
        className="absolute top-0 z-30"
      >
        <motion.span {...rise(0.35)} className="relative block">
          {/* ⚠ The span STAYS, and keeps `thinkRef` — the layout's ink metrics
              measure it, and it is what a reduced-motion visitor reads. The
              mesh only takes over its FILL, and only once ThinkMesh reports it
              is really drawing, so a WebGL2 failure leaves the word rather
              than a hole. Reverting is deleting the sibling and one class. */}
          <span
            ref={thinkRef}
            style={{ fontSize: BASE_SIZE, lineHeight: THINK_LEADING, color: THINK_GREY }}
            className={`${WORD} font-digibra ${meshOn ? "opacity-0" : ""}`}
          >
            THINK
          </span>
          <ThinkMesh word="THINK" from={thinkRef} onActive={setMeshOn} />
        </motion.span>
      </motion.div>

      {/* Imagine — starts at that same midline and runs right, so at rest the
          two words meet at the brain's division. Scales about its left edge for
          the same reason. */}
      <motion.div
        aria-hidden
        style={{ y: imagineY, scale: imagineScale, transformOrigin: "50% 50%", left: IMAGINE_LEFT }}
        className="absolute top-0 z-20"
      >
        <motion.span {...rise(0.5)} className="relative block">
          {/* ⚠ The span STAYS, and keeps `imagineRef`. It is what the layout
              measures (see the ink-metrics effect above) and what a
              reduced-motion or WebGL-less visitor actually reads. The mesh only
              takes over its FILL: `imagineMeshOn` drops the painted word once
              ThinkMesh reports it is really drawing, so a failure to start
              leaves the gradient word intact rather than a hole.

              ⚠ THE LIQUID IS GONE. ImagineParticles ran here until 2026-08-25,
              when the owner asked for the word to keep changing rainbow colours
              and to carry THINK's mesh instead. The component file is kept,
              unreferenced, in case it returns.

              ⚠ The colour now comes from the MESH, not from this span. The
              `brain-paint` class below is the fallback the mesh replaces —
              a static gradient for anyone the shader never starts for. The
              moving rainbow is `rainbow` on ThinkMesh. */}
          <span
            ref={imagineRef}
            style={{
              fontSize: `calc(${BASE_SIZE} * ${IMAGINE_RATIO})`,
              lineHeight: IMAGINE_LEADING,
            }}
            className={`${WORD} brain-paint bg-clip-text font-graff font-bold text-transparent ${
              imagineMeshOn ? "opacity-0" : ""
            }`}
          >
            imagine
          </span>
          <ThinkMesh word="imagine" from={imagineRef} onActive={setImagineMeshOn} rainbow />
        </motion.span>
      </motion.div>
    </h1>
  );
}
