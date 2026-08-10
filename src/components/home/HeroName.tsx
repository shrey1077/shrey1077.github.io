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
 * The two sit on OPPOSITE sides of the footage in z-order, which is the whole
 * trick: Think at z-0 is behind it, so the brain laps over its final K, while
 * Imagine at z-20 lies on top of the paint, so the overlap reads as ink
 * soaking through rather than a label stuck on.
 *
 * The brain's vertical extent is measured live from the footage's alpha so the
 * words tuck against its real crown and base at any size.
 */

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";

/** How far each word travels on Z, as a scale delta. */
const ZOOM = 0.05;

/** Scenery scale, not headline scale — but capped so the word still fits.
 *  Each word owns exactly half the viewport (its outer edge to the midline),
 *  and at a true 4x Think measured 1334px against 720px of room, so it lost
 *  its T and H off-screen and read as "INK". 12vw is the largest that keeps
 *  all five letters on screen WITH the 5% zoom applied — 13vw fits at rest but
 *  clips once the pointer reaches the left edge. */
const WORD = "block whitespace-nowrap will-change-transform";
const BASE_SIZE = "clamp(3rem, 12vw, 14rem)";

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

/** How tall "Imagine" actually is, as a fraction of its font-size. Measured on
 *  canvas at 200px in Juturu BOLD, which is what the word is set in:
 *  actualBoundingBoxAscent 142, actualBoundingBoxDescent 42 — 184/200 of ink.
 *
 *  Two separate things depend on this, and both broke without it:
 *
 *  1. The line box must be TALLER than the ink. The fill is `bg-clip-text`, so
 *     the paint comes from the element's background box — any ink outside that
 *     box is painted with nothing and simply disappears. At `leading-[0.82]`
 *     the ink overflowed 8px top and bottom, which sheared the flat off both
 *     g descenders. Solid-white type never showed this, because a text colour
 *     fills the glyph wherever it falls.
 *  2. The floor clamp has to know where the lowest ink is, which is NOT the
 *     bottom of `getBoundingClientRect`.
 *
 *  ⚠ RE-MEASURE alongside IMAGINE_RATIO whenever the creative face or its
 *  weight changes. Note this bold measurement puts the ascent at 142, where
 *  IMAGINE_RATIO's is 140 — leaving that ratio alone rather than resizing the
 *  word by 1.4% off the back of a clipping fix. */
const IMAGINE_INK = (142 + 42) / 200;

/** Line box for Imagine — must exceed IMAGINE_INK or the fill clips. The slack
 *  is the breathing room, split half above and half below the ink. */
const IMAGINE_LEADING = 0.98;

/** Clear air between Imagine's lowest ink and the furniture below it. */
const FLOOR_GAP = 18;

/** The brain's WIDE vertical extent (viewport px) — crown to base of the main
 *  mass, ignoring the narrow tips so the words don't sit too high or too low. */
function measureBrainV(): { top: number; bottom: number } | null {
  try {
    const c = document.querySelector("canvas[data-brain]") as HTMLCanvasElement | null;
    if (!c || !c.width) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const rect = c.getBoundingClientRect();
    const cw = c.width,
      ch = c.height;
    const scale = Math.min(rect.width / cw, rect.height / ch);
    const offY = rect.top + (rect.height - ch * scale) / 2;
    const d = ctx.getImageData(0, 0, cw, ch).data;
    let top = -1,
      bottom = -1;
    for (let y = 0; y < ch; y++) {
      let run = 0,
        wide = false;
      for (let x = Math.floor(cw * 0.3); x < cw * 0.7; x++) {
        if (d[(y * cw + x) * 4 + 3] > 150) {
          if (++run >= cw * 0.15) {
            wide = true;
            break;
          }
        } else run = 0;
      }
      if (wide) {
        if (top < 0) top = y;
        bottom = y;
      }
    }
    if (top < 0) return null;
    return { top: offY + top * scale, bottom: offY + bottom * scale };
  } catch {
    return null;
  }
}

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
      const b = measureBrainV() ?? { top: vh * 0.3, bottom: vh * 0.68 };
      const thinkH = thinkRef.current?.offsetHeight ?? 0;
      // A deeper bite than before: the brain is meant to lap OVER the word,
      // not merely touch it.
      const overlap = thinkH * 0.3;
      thinkY.set(b.top - thinkH + overlap);

      // Imagine's floor. Two separate things can push it too low: the brain's
      // base (which moved down when the footage scaled up 5%) and the plain
      // 66% ceiling. Neither knew about the descender or about the furniture
      // in the bottom-right corner, so the word ended up 38px into the Hobbies
      // rotator with its g clipped by the stage's overflow.
      const el = imagineRef.current;
      let maxTop = vh * 0.66;
      if (el) {
        const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
        // Where the lowest ink sits, measured from the top of the element's
        // box: half-leading plus the full ascent-to-descender span.
        const naturalH = fs * IMAGINE_INK;
        const inkBelowTop = (el.offsetHeight + naturalH) / 2;

        // Clear the furniture if it's mounted (desktop only), else the stage.
        const furniture = document
          .querySelector('[data-hero-furniture="right-bottom"]')
          ?.getBoundingClientRect();
        const floor =
          furniture && furniture.height > 0 ? furniture.top : vh * 0.96;

        maxTop = Math.min(maxTop, floor - FLOOR_GAP - inkBelowTop);
      }

      imagineY.set(Math.min(b.bottom - overlap * 0.8, maxTop));
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
        style={{ y: thinkY, scale: thinkScale, transformOrigin: "100% 50%" }}
        className="absolute right-1/2 top-0 z-0"
      >
        <motion.span {...rise(0.35)} className="block">
          <span
            ref={thinkRef}
            style={{ fontSize: BASE_SIZE, lineHeight: 0.82 }}
            className={`${WORD} font-digibra text-black/20`}
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
        style={{ y: imagineY, scale: imagineScale, transformOrigin: "0% 50%" }}
        className="absolute left-[54%] top-0 z-20"
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
