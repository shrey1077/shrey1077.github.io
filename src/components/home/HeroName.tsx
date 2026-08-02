"use client";

/**
 * HeroName — the landing name, stacked on the brain and above everything.
 *
 * "Shrey" rests on the brain's crown, "Singh" at its base — both centred at
 * rest. As the pointer moves AWAY from centre (either direction), "Shrey" slides
 * left and "Singh" slides right; at the edge "Shrey" reaches the left margin and
 * "Singh" the right. The brain's top/bottom are measured live from the footage's
 * alpha (its wide main mass) so the words tuck against it with only a sliver of
 * overlap, top and bottom.
 *
 * Rendered ABOVE the footage and the rest of the furniture (z-30), so the name
 * always reads. Pointer-events-none. Reduced motion holds it centred and still.
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

const sideMargin = (vw: number) => Math.max(24, vw * 0.04);

const WORD =
  "block whitespace-nowrap will-change-transform " +
  typeVoiceClass("logic", "display") +
  " text-[clamp(2rem,7vw,7rem)] font-black tracking-[-0.01em] leading-[0.9]";

/** The brain's WIDE vertical extent (viewport px) — crown to base of the main
 *  mass, ignoring the narrow tips so the name doesn't sit too high or too low. */
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

  const shreyRef = useRef<HTMLSpanElement>(null);
  const singhRef = useRef<HTMLSpanElement>(null);
  const shreyMax = useRef(0);
  const singhMax = useRef(0);

  // Horizontal spread (px): Shrey negative (left), Singh positive (right).
  const shreyPx = useMotionValue(0);
  const singhPx = useMotionValue(0);
  const shreyX = useSpring(shreyPx, { stiffness: 60, damping: 18, mass: 0.5 });
  const singhX = useSpring(singhPx, { stiffness: 60, damping: 18, mass: 0.5 });
  // Vertical placement (px) of each word's top edge.
  const shreyY = useMotionValue(0);
  const singhY = useMotionValue(0);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const b = measureBrainV() ?? { top: vh * 0.3, bottom: vh * 0.68 };
      const shreyH = shreyRef.current?.offsetHeight ?? 0;
      const overlap = vh * 0.02; // a sliver, top and bottom
      shreyY.set(b.top - shreyH + overlap);
      // The brain runs low; keep Singh from sitting at the very bottom.
      singhY.set(Math.min(b.bottom - overlap, vh * 0.62));
      const margin = sideMargin(vw);
      const shreyW = shreyRef.current?.offsetWidth ?? 0;
      const singhW = singhRef.current?.offsetWidth ?? 0;
      shreyMax.current = Math.max(0, vw / 2 - margin - shreyW / 2);
      singhMax.current = Math.max(0, vw / 2 - margin - singhW / 2);
    };

    measure();
    const timers = [setTimeout(measure, 500), setTimeout(measure, 1500)];
    window.addEventListener("resize", measure);

    let onMove: ((e: PointerEvent) => void) | undefined;
    if (!reduceMotion) {
      onMove = (e) => {
        const half = window.innerWidth / 2;
        const spread = Math.min(1, Math.abs(e.clientX - half) / half);
        shreyPx.set(-spread * shreyMax.current);
        singhPx.set(spread * singhMax.current);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion, shreyPx, singhPx, shreyY, singhY]);

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
        };

  return (
    <h1 aria-label="Shrey Singh" className="pointer-events-none absolute inset-0 z-30">
      {/* Shrey — on the crown, sliding left. */}
      <motion.div aria-hidden style={{ x: shreyX, y: shreyY }} className="absolute left-1/2 top-0">
        <motion.span {...rise(0.35)} className="block -translate-x-1/2">
          <span ref={shreyRef} className={`${WORD} text-neutral-900`}>
            Shrey
          </span>
        </motion.span>
      </motion.div>

      {/* Singh — at the base, sliding right, painted with the living gradient. */}
      <motion.div aria-hidden style={{ x: singhX, y: singhY }} className="absolute left-1/2 top-0">
        <motion.span {...rise(0.5)} className="block -translate-x-1/2">
          <span ref={singhRef} className={`${WORD} brain-paint bg-clip-text text-transparent`}>
            Singh
          </span>
        </motion.span>
      </motion.div>
    </h1>
  );
}
