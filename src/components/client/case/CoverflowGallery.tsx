"use client";

/**
 * CoverflowGallery — a 3D coverflow for one category's plates.
 *
 * Adapted from the Originkit "Coverflow Gallery" the owner supplied on
 * 2026-08-20, and used on the ABS page's Luzid section only — the category
 * opts in with `presentation: "coverflow"`, so nothing else on the site changes
 * shape by accident.
 *
 * The geometry is theirs: the active card upright in the spotlight, neighbours
 * stepped back in Z and tilted, paint order following 3D position rather than
 * z-index because the stack is `preserve-3d`. Clicking a neighbour brings it to
 * centre; clicking the centre advances.
 *
 * What changed, and why:
 *
 * ⚠ `object-contain`, NOT the original's `cover`. Luzid's plates are not one
 * shape — measured, they run 1080x1080, 1349x1687 and one 1500x622 banner. The
 * original crops every slide to a fixed card, which on that banner would throw
 * away two-thirds of the artwork. The card keeps its uniform size (a coverflow
 * needs that to read) and the work is letterboxed inside it instead.
 *
 * ⚠ NO PER-CARD TITLE. Every plate in a category carries the same `name` — the
 * brand — so the original's title block would stamp "Luzid" across all seven.
 * A position counter and dots carry the wayfinding instead, and they sit
 * OUTSIDE the 3D context: a `preserve-3d` child gets painted by depth, so
 * controls placed inside it disappear behind the cards.
 *
 * ⚠ Card size is measured from the container, not fixed at the original's 400px.
 * This sits in a case-study column whose width is not the viewport's.
 *
 * ⚠ Reduced motion falls back to CaseGallery — the plain grid the rest of the
 * page uses. A coverflow is motion and occlusion by definition; the honest
 * answer for someone who has asked for neither is the presentation that has
 * neither, not this one with its transitions switched off.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { CaseGallery } from "@/components/client/case/CaseGallery";
import type { CasePlate } from "@/types/caseStudy";

/** Fixed internals, carried over from the supplied component. */
const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;
const TILT = 12;
const SIDE_TILT = 8;
const SPREAD = 240;
const DIM = 0.6;
const DUR = 0.6;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function CoverflowGallery({
  plates,
  accent,
}: {
  plates: CasePlate[];
  accent: string;
}) {
  const reduceMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState({ w: 340, h: 340 });
  const [active, setActive] = useState(0);
  const lockRef = useRef(false);
  const n = plates.length;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      // Square-ish and capped: most of these plates are square or portrait, and
      // a card wider than its neighbours' gap turns the flow into a pile.
      const w = Math.max(200, Math.min(420, e.contentRect.width * 0.46));
      setCard({ w, h: w });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, DUR * 1000);
  }, []);

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current || n < 2) return;
      lock();
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    },
    [step],
  );

  // ⚠ Not "the coverflow with transitions off" — the grid the rest of the page
  // already uses. See the note at the top.
  if (reduceMotion) return <CaseGallery plates={plates} accent={accent} />;
  if (n === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={hostRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${n} plates`}
        onKeyDown={onKeyDown}
        className="relative flex w-full items-center justify-center overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
        style={{ perspective: `${PERSPECTIVE}px`, height: card.h + 80 }}
      >
        <div
          className="relative"
          style={{ width: card.w, height: card.h, transformStyle: "preserve-3d" }}
        >
          {plates.map((p, i) => {
            // Shortest way round the loop, so the flow never unwinds the long way.
            let rel = i - active;
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
            const ax = Math.abs(rel);
            const visible = ax <= MAX_VISIBLE;
            const isActive = rel === 0;

            return (
              <div
                key={p.url}
                onClick={() => {
                  if (lockRef.current) return;
                  lock();
                  setActive((a) => (i === a ? (a + 1) % n : i));
                }}
                aria-hidden={!visible}
                className="absolute left-1/2 top-1/2 overflow-hidden rounded-md bg-neutral-900"
                style={{
                  width: card.w,
                  height: card.h,
                  transformStyle: "preserve-3d",
                  transform:
                    `translate(-50%, -50%) translateX(${rel * SPREAD}px) ` +
                    `translateZ(${-ax * DEPTH}px) rotateY(${-rel * TILT}deg) ` +
                    `rotateZ(${rel * SIDE_TILT}deg) scale(${Math.max(0.4, 1 - ax * SCALE_STEP)})`,
                  transition: `transform ${DUR}s ${EASE}, opacity ${DUR}s ${EASE}`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? "auto" : "none",
                  cursor: isActive ? "default" : "pointer",
                  boxShadow: isActive ? "0 24px 60px -20px rgba(0,0,0,0.55)" : undefined,
                }}
              >
                <Image
                  src={p.url}
                  alt={`${p.name} — ${i + 1} of ${n}`}
                  fill
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  draggable={false}
                  className="select-none object-contain"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-black"
                  style={{
                    opacity: isActive ? 0 : DIM,
                    transition: `opacity ${DUR}s ${EASE}`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚠ Outside the preserve-3d stack. Inside it these would be sorted by
          depth and vanish behind the cards. */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous plate"
          className="rounded-full border border-neutral-300 px-3 py-1 text-neutral-500 outline-none transition-colors duration-200 hover:border-neutral-600 hover:text-neutral-900 focus-visible:border-neutral-900"
        >
          ←
        </button>
        <div className="flex items-center gap-1.5">
          {plates.map((p, i) => (
            <button
              key={p.url}
              type="button"
              aria-label={`Plate ${i + 1}`}
              aria-current={i === active}
              onClick={() => {
                if (lockRef.current) return;
                lock();
                setActive(i);
              }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                backgroundColor: i === active ? accent : "#d4d4d4",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next plate"
          className="rounded-full border border-neutral-300 px-3 py-1 text-neutral-500 outline-none transition-colors duration-200 hover:border-neutral-600 hover:text-neutral-900 focus-visible:border-neutral-900"
        >
          →
        </button>
      </div>
    </div>
  );
}
