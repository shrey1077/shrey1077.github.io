"use client";

/**
 * HeroName — the landing's two words, set around the brain.
 *
 * Think sits on the crown at display scale, in Digibra, at a fifth of black —
 * it reads as a watermark the brain sits IN FRONT OF rather than a headline
 * over it. Its final K is right-aligned to the brain's midline, so the word
 * ends exactly where the logic hemisphere does and the brain laps over its
 * last letter. Imagine answers it at the base in Juturu bold, starting from
 * a little past that midline (54%) and running right. Think is a fifth of
 * black; Imagine carries the paint gradient again as of 2026-08-10.
 *
 * That fill has been on and off twice, and the reason is what sits behind it.
 * It went solid white when the paint film ran across the right flank at full
 * strength — a gradient fill simply vanished into a gradient ground. The film
 * has since moved to the Art section, which leaves this word pure white on a
 * near-white circuit backdrop at a 1.05:1 contrast ratio, i.e. invisible. The
 * paint is what makes it legible now. If a coloured layer ever returns to the
 * right flank, this goes back to solid white.
 *
 * ⚠ The fill is `bg-clip-text`, so the word's opacity CANNOT come from an
 * alpha on the text colour (a `text-black` with a slash-opacity suffix, the
 * way Think is dimmed) — that destroys the clip and the word disappears.
 * Dim the layer, not the type.
 *
 * The two no longer slide sideways. They breathe on the Z axis instead:
 * centre-screen is the rest state, and moving the pointer left pushes Think
 * five percent toward you while Imagine recedes by the same amount — moving
 * right does the reverse. Five percent is small on purpose. The brain answers
 * the mouse far more strongly, and the words are meant to be the room it sits
 * in, not a second thing competing for the eye.
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

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** How far each word travels on Z, as a scale delta. Tripled from 0.05 on the
 *  owner's instruction 2026-08-10 — the breath was deliberately small when the
 *  words were scenery at 12vw, and now that they are half that size it reads as
 *  nothing at 5%. */
const ZOOM = 0.15;

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
const BASE_SIZE = "clamp(1.3rem, 5.2vw, 6rem)";

/** Horizontal anchors, as CSS offsets. Think is pinned by its RIGHT edge and
 *  Imagine by its LEFT, so each grows away from the middle and the pair keeps
 *  its gap at any size. Think's right edge lands at 43% of the width, Imagine's
 *  left at 46.5% — they no longer meet at the midline the way they used to. */
const THINK_RIGHT = "57%";
const IMAGINE_LEFT = "46.5%";

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
 *  the face before this one. The number is a property of the two fonts, not a
 *  taste call. */
const IMAGINE_RATIO = 149 / 140;

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
 *  ⚠ RE-MEASURE all six whenever either face, or its weight, changes. */
const IMAGINE_FONT_ASCENT = 1.17;
const IMAGINE_FONT_DESCENT = 0.21;
const IMAGINE_INK_DESCENT = 0.21;
const IMAGINE_INK_ASCENT = 0.71;
const THINK_FONT_ASCENT = 0.75;
const THINK_FONT_DESCENT = 0.25;
const THINK_INK_ASCENT = 0.745;

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

  // Z-breath. Springs are slow and soft so this never reads as a jump.
  const thinkZ = useMotionValue(1);
  const imagineZ = useMotionValue(1);
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
        // Pointer left → Think comes forward, Imagine recedes. Right inverts it.
        thinkZ.set(1 - t * ZOOM);
        imagineZ.set(1 + t * ZOOM);
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
        style={{ y: thinkY, scale: thinkScale, transformOrigin: "100% 50%", right: THINK_RIGHT }}
        className="absolute top-0 z-30"
      >
        <motion.span {...rise(0.35)} className="block">
          <span
            ref={thinkRef}
            style={{ fontSize: BASE_SIZE, lineHeight: THINK_LEADING, color: THINK_GREY }}
            className={`${WORD} font-digibra`}
          >
            Think
          </span>
        </motion.span>
      </motion.div>

      {/* Imagine — starts at that same midline and runs right, so at rest the
          two words meet at the brain's division. Scales about its left edge for
          the same reason. */}
      <motion.div
        aria-hidden
        style={{ y: imagineY, scale: imagineScale, transformOrigin: "0% 50%", left: IMAGINE_LEFT }}
        className="absolute top-0 z-20"
      >
        <motion.span {...rise(0.5)} className="block">
          <span
            ref={imagineRef}
            style={{
              fontSize: `calc(${BASE_SIZE} * ${IMAGINE_RATIO})`,
              lineHeight: IMAGINE_LEADING,
            }}
            className={`${WORD} brain-paint bg-clip-text font-graff font-bold text-transparent`}
          >
            Imagine
          </span>
        </motion.span>
      </motion.div>
    </h1>
  );
}
