"use client";

/**
 * HeroName — the landing name statement (replaces the old 50/50 headline).
 *
 * The name is split across the brain — "Shrey" to the LEFT, "Singh" to the
 * RIGHT — both in the logic voice (IBM Plex Mono, uppercase). "Shrey" is
 * graphite; "Singh" is painted with the living gradient (.brain-paint), so it
 * stays colourful and never stops shifting.
 *
 * The pair reacts to the pointer. At its CLOSEST (pointer at page centre) each
 * word's inner edge rests exactly at the brain's own side — measured live from
 * the footage's alpha, so the words hug the brain instead of hiding behind it,
 * regardless of viewport shape. As the pointer moves toward an edge the words
 * DRIFT apart, but only a little: the brain stays the hero. Outer edges are
 * capped so neither word ever crosses the side margin.
 *
 * Rendered BENEATH the footage (no positive z-index; the parent inserts it
 * before the brain video), so the brain crosses in front of the inner edges.
 * Pointer-events-none; the parent unmounts it via AnimatePresence the instant a
 * hemisphere is chosen. Reduced motion holds a fixed split and skips pointer
 * tracking (the gradient's drift is disabled in globals.css too).
 */

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

/** Rest split before the pointer is known (and the whole story on touch). */
const DEFAULT_SPREAD = 0.5;
/** How far each inner edge tucks past the brain's side at rest (frac of vw). */
const TUCK_FRAC = 0.015;
/** Extra outward drift at full spread (frac of vw). Small — the brain leads. */
const TRAVEL_FRAC = 0.06;
/** The side gutter the words never cross into (px, or 4vw — whichever bigger). */
const sideMargin = (vw: number) => Math.max(24, vw * 0.04);

const WORD =
  "block whitespace-nowrap will-change-transform " +
  typeVoiceClass("logic", "display") +
  " text-[clamp(1.9rem,6.5vw,6.5rem)] font-black tracking-[-0.01em] leading-[0.9]";

/** The brain's solid horizontal extent (viewport px) across the name's vertical
 *  band, read from the footage's alpha. Null until the video has a frame. */
function measureBrain(vw: number, vh: number): { left: number; right: number } | null {
  try {
    const v = [...document.querySelectorAll("video")].find((x) =>
      (x.currentSrc || x.src || "").includes("brain"),
    ) as HTMLVideoElement | undefined;
    if (!v || !v.videoWidth) return null;
    const rect = v.getBoundingClientRect();
    const cw = v.videoWidth,
      ch = v.videoHeight;
    const scale = Math.min(rect.width / cw, rect.height / ch);
    const offX = rect.left + (rect.width - cw * scale) / 2;
    const offY = rect.top + (rect.height - ch * scale) / 2;
    const cvs = document.createElement("canvas");
    cvs.width = cw;
    cvs.height = ch;
    const ctx = cvs.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, cw, ch);
    const d = ctx.getImageData(0, 0, cw, ch).data;
    let L = Infinity,
      R = -Infinity;
    for (let yp = 0.4; yp <= 0.56; yp += 0.01) {
      const y = Math.round((yp * vh - offY) / scale);
      if (y < 0 || y >= ch) continue;
      // Longest run of opaque pixels on this row = the dense brain (not splatter).
      let bestLen = 0,
        bestS = -1,
        bestE = -1,
        s = -1,
        run = 0;
      for (let x = 0; x < cw; x++) {
        if (d[(y * cw + x) * 4 + 3] > 150) {
          if (s < 0) s = x;
          run++;
        } else {
          if (run > bestLen) {
            bestLen = run;
            bestS = s;
            bestE = x - 1;
          }
          s = -1;
          run = 0;
        }
      }
      if (run > bestLen) {
        bestLen = run;
        bestS = s;
        bestE = cw - 1;
      }
      if (bestLen >= cw * 0.1) {
        L = Math.min(L, offX + bestS * scale);
        R = Math.max(R, offX + bestE * scale);
      }
    }
    return L === Infinity ? null : { left: L, right: R };
  } catch {
    return null;
  }
}

export function HeroName() {
  const reduceMotion = useReducedMotion();

  const shreyRef = useRef<HTMLSpanElement>(null);
  const singhRef = useRef<HTMLSpanElement>(null);
  /** Per-word horizontal offsets (px) at rest (inner edge at the brain's side)
   *  and at full spread (drifted out, but never past the margin). */
  const geo = useRef({ restL: 0, restR: 0, farL: 0, farR: 0 });

  // Pointer distance from centre, 0 (centre) → 1 (edge), spring-smoothed.
  const spread = useMotionValue(reduceMotion ? 0.5 : DEFAULT_SPREAD);
  const smooth = useSpring(spread, { stiffness: 70, damping: 20, mass: 0.5 });

  const xLeft = useMotionValue(0);
  const xRight = useMotionValue(0);

  useEffect(() => {
    const apply = (s: number) => {
      const { restL, restR, farL, farR } = geo.current;
      xLeft.set(restL + s * (farL - restL));
      xRight.set(restR + s * (farR - restR));
    };

    const measure = () => {
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const half = vw / 2;
      const margin = sideMargin(vw);
      const shreyW = shreyRef.current?.offsetWidth ?? 0;
      const singhW = singhRef.current?.offsetWidth ?? 0;
      const tuck = vw * TUCK_FRAC;
      const travel = vw * TRAVEL_FRAC;

      // The brain's sides — measured, or a sensible off-centre fallback.
      const b = measureBrain(vw, vh) ?? { left: vw * 0.34, right: vw * 0.68 };

      // "Shrey" anchors its right edge at page centre → offset is negative.
      // "Singh" anchors its left edge at page centre → offset is positive.
      // Rest: each inner edge lands at its brain side (a hair past it).
      const minL = margin - half + shreyW; // most-negative xLeft (outer edge = margin)
      const maxR = half - margin - singhW; // most-positive xRight
      const restL = Math.max(b.left + tuck - half, minL);
      const restR = Math.min(b.right - tuck - half, maxR);
      geo.current = {
        restL,
        restR,
        farL: Math.max(restL - travel, minL),
        farR: Math.min(restR + travel, maxR),
      };
      apply(smooth.get());
    };

    measure();
    // The brain video is lazy-loaded; re-measure once it has decoded a frame.
    const timers = [setTimeout(measure, 500), setTimeout(measure, 1500)];
    const unsub = smooth.on("change", apply);
    window.addEventListener("resize", measure);

    let onMove: ((e: PointerEvent) => void) | undefined;
    if (!reduceMotion) {
      onMove = (e) => {
        const half = window.innerWidth / 2;
        spread.set(Math.min(1, Math.abs(e.clientX - half) / half));
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      timers.forEach(clearTimeout);
      unsub();
      window.removeEventListener("resize", measure);
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion, smooth, spread, xLeft, xRight]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { y: "115%" as const },
          animate: { y: 0 },
          transition: { duration: 0.9, ease: EASE_OUT, delay },
        };

  return (
    <motion.h1
      aria-label="Shrey Singh"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: -20,
              transition: { duration: DURATION.fast, ease: EASE_OUT },
            }
      }
      transition={{ duration: DURATION.medium, ease: EASE_OUT }}
      className="pointer-events-none absolute inset-0"
    >
      {/* Left — "Shrey", its right edge anchored at page centre, sliding left. */}
      <motion.span
        aria-hidden
        style={{ x: xLeft }}
        className="absolute right-1/2 top-[42%] block overflow-hidden pb-[0.14em] pr-[0.08em]"
      >
        <motion.span ref={shreyRef} {...rise(0.45)} className={`${WORD} text-neutral-900`}>
          Shrey
        </motion.span>
      </motion.span>

      {/* Right — "Singh", left edge anchored at page centre, sliding right, and
          painted with the living, colour-shifting gradient. */}
      <motion.span
        aria-hidden
        style={{ x: xRight }}
        className="absolute left-1/2 top-[42%] block overflow-hidden pb-[0.14em] pl-[0.08em]"
      >
        <motion.span
          ref={singhRef}
          {...rise(0.55)}
          className={`${WORD} brain-paint bg-clip-text text-transparent`}
        >
          Singh
        </motion.span>
      </motion.span>
    </motion.h1>
  );
}
