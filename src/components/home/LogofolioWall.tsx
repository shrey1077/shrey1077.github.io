"use client";

/**
 * LogofolioWall — the Logofolio room, as the interactive grid.
 *
 * Adapted from the Originkit "Interactive Grid" the owner supplied on
 * 2026-08-20. The behaviour is theirs: hovering a cell lifts it, its four
 * orthogonal neighbours lift a little less, and a short leave-delay stops the
 * wall flickering as the pointer crosses a seam.
 *
 * ⚠ NOT `LogofolioGrid`. That component still exists and is still wired into
 * SectionBody, which SidesShowcase imports — the parked chain the handoff says
 * not to disturb. Overwriting it would have silently rewritten parked code, so
 * this is a new file and the old one is left exactly as it was.
 *
 * What changed from the supplied component, and why:
 *
 * ⚠ CARDS ARE WHITE, not the original's near-black. The owner's marks are
 * mostly black ink on transparency, so the supplied `cardFill: "#000000"` would
 * have rendered a wall of empty squares. The border goes pale for the same
 * reason, and the idle opacity is raised — 0.7 black-on-white reads washed out
 * where 0.7 white-on-black read recessive. The one exception is a mark whose
 * own ink is white; it keeps a dark card or it would disappear instead.
 *
 * ⚠ EVERY MARK APPEARS ONCE. The original tiles `columns * rows` cells and
 * repeats the list with `i % urls.length` — right for a decorative wall, wrong
 * for a portfolio, where it would show some marks twice and others three times.
 * The grid is sized FROM the number of marks instead.
 *
 * ⚠ MARKS KEEP THEIR MATCHED FOOTPRINT. Each is pre-trimmed to its ink and
 * carries the size that makes its drawn footprint equal to every other's
 * (scripts/prepare_logo_marks.py). One `logoScale` for all of them — what the
 * original does — would throw that away and let a wide wordmark tower over a
 * square monogram again. The percentage is re-solved per mark here because this
 * cell is SQUARE-ish while the board's box is wide, so a different dimension
 * binds; see `fitPct`.
 *
 * ⚠ The original's `rotateX`/`rotateY` are transposed in its own transform
 * (`rotateX(rotateY)`). Both props are dropped rather than inherited — nothing
 * here tilts, so the bug is moot and not worth carrying.
 *
 * Reduced motion gets the wall with no lift and no transition.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import type { LogoMark, MarkPlate } from "@/content/catalogue";

const DURATION = 200;
const LEAVE_DELAY = 200;

/** Cells per row, by measured container width. 25 marks land 5x5 at the top. */
function columnsFor(width: number): number {
  if (width < 380) return 2;
  if (width < 560) return 3;
  if (width < 820) return 4;
  return 5;
}

/**
 * The aspect the mark's BOX is pinned to.
 *
 * ⚠ The box declares this explicitly rather than inheriting the cell's shape.
 * Sizing it as a percentage of both cell dimensions looked equivalent and was
 * not: the cell carries `p-3`, so its CONTENT box measured 1.416 rather than
 * the 4:3 the maths assumed, and the footprints split into two families 13%
 * apart — every mark wider than the box in one, every mark taller in the other.
 * Pinning the aspect makes `fitWeight`'s crossover exact.
 */
const BOX_ASPECT = 4 / 3;

/**
 * Relative size a mark needs for every mark's drawn footprint to come out equal.
 *
 * ⚠ This is NOT `√(long/short)`. That is the answer for a SQUARE box, and it
 * was measured wrong on the real wall: footprints ranged 900–1783 px², a 62%
 * spread, because the box is 4:3 rather than square. With a box of aspect `B`:
 *
 *   mark wider than the box (a ≥ B) → width binds  → area ∝ (P·W)²/a
 *   mark taller than the box (a < B) → height binds → area ∝ (P·H)²·a
 *
 * Equalising those gives `√a` above the crossover and `B/√a` below it, which
 * meet exactly at `a = B` so the curve is continuous and nothing jumps as a
 * mark's aspect crosses the cell's.
 */
function fitWeight(w: number, h: number): number {
  const a = w / h;
  return a >= BOX_ASPECT ? Math.sqrt(a) : BOX_ASPECT / Math.sqrt(a);
}

function fitPct(w: number, h: number, heaviest: number, max: number): number {
  return (max * fitWeight(w, h)) / heaviest;
}

export function LogofolioWall({
  logos,
  markPlates,
}: {
  logos: LogoMark[];
  /** original url → trimmed art + intrinsic size. See readMarkPlates. */
  markPlates: Record<string, MarkPlate>;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measured, not inferred from a viewport breakpoint: this wall lives inside a
  // panel whose width is not the window's.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCols(columnsFor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const items = useMemo(
    () =>
      logos.map((m) => {
        const plate = markPlates[m.url];
        return {
          slug: m.slug,
          name: m.name,
          url: plate?.url ?? m.url,
          w: plate?.w ?? 1,
          h: plate?.h ?? 1,
          /** White ink would vanish on a white card — it keeps a dark one. */
          light: m.tone === "light",
        };
      }),
    [logos, markPlates],
  );

  // The heaviest mark present fixes the normalisation, so the sizing is
  // relative to what is actually on the wall rather than a hardcoded guess —
  // and so the largest lands on `max` and nothing overflows its cell.
  const heaviest = useMemo(
    () => items.reduce((n, i) => Math.max(n, fitWeight(i.w, i.h)), 0.0001),
    [items],
  );

  const neighbours = useMemo(() => {
    if (hovered === null) return new Set<number>();
    const out = [hovered - cols, hovered + cols];
    if (hovered % cols !== 0) out.push(hovered - 1);
    if (hovered % cols !== cols - 1) out.push(hovered + 1);
    return new Set(out.filter((n) => n >= 0 && n < items.length));
  }, [hovered, cols, items.length]);

  const onEnter = useCallback((i: number) => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHovered(i);
  }, []);

  const onLeave = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHovered(null), LEAVE_DELAY);
  }, []);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="h-full min-h-0 w-full overflow-y-auto pr-1">
      <div
        onPointerLeave={onLeave}
        className="grid w-full gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          perspective: "1600px",
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, i) => {
          const isBig = !reduceMotion && hovered === i;
          const isSmall = !reduceMotion && !isBig && neighbours.has(i);
          const pct = fitPct(item.w, item.h, heaviest, 74);
          return (
            <div
              key={item.slug}
              onPointerEnter={() => onEnter(i)}
              title={item.name}
              className={`relative flex aspect-[4/3] items-center justify-center rounded-lg border p-3 ${
                item.light ? "border-white/20 bg-neutral-900" : "border-neutral-200 bg-white"
              }`}
              style={{
                transition: reduceMotion
                  ? undefined
                  : `transform ${DURATION}ms, box-shadow ${DURATION}ms`,
                transform: isBig
                  ? "scale(1.15) translate(-12px, -12px) translateZ(15px)"
                  : isSmall
                    ? "scale(1.05) translate(-4px, -4px) translateZ(0)"
                    : undefined,
                boxShadow: isBig
                  ? "0 12px 34px rgba(0,0,0,0.5)"
                  : isSmall
                    ? "0 6px 18px rgba(0,0,0,0.32)"
                    : undefined,
                // Lifted cells must sit above their neighbours, or the scale-up
                // slides underneath the next card's opaque white ground.
                zIndex: isBig ? items.length + 1 : isSmall ? items.length : 1,
              }}
            >
              <span
                className="relative block"
                style={{ width: `${pct}%`, aspectRatio: String(BOX_ASPECT) }}
              >
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  draggable={false}
                  className="select-none object-contain transition-opacity duration-200"
                  style={{ opacity: isBig || isSmall ? 1 : 0.86 }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
