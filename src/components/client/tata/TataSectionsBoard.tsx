"use client";

/**
 * TataSectionsBoard — the Tata IIS experience as six pins you click, three a
 * side, with the chosen room opening beneath them.
 *
 * The owner asked on 2026-08-25 for this page to behave like the landing, and
 * for the pins to be styled like the landing's LEFT column — on BOTH sides here,
 * rather than the landing's logic/creative split. That is why there is no paint
 * treatment anywhere in this file: this page has one voice, not two hemispheres.
 *
 * ⚠ IT DOES NOT REIMPLEMENT BrainPins. That component is welded to the landing —
 * it measures the brain's artwork, carries the creative column's raster pins and
 * their sampled ring colours, and positions everything against the hero stage.
 * None of that exists here. What is copied is the LOOK of its logic pin: a
 * Digibra pill, filled when closed and outlined when open, with a ringed circle
 * flush against it and a hairline that arrives from the top corner.
 *
 * ⚠ THE CONNECTORS MIRROR, THE PILLS DO NOT. Lines on the right drop from the
 * top-RIGHT corner and turn left; the pills themselves keep the same internal
 * order on both sides (label then circle, reading inward) so the six read as one
 * set rather than as two facing columns. This is the deliberate difference from
 * the landing, where the right column is a true mirror.
 *
 * ⚠ `brand-guidelines` is not one of TATA_SECTIONS. It has its own renderer that
 * takes no props (`GuidelineSections`), so the panel switches on the id rather
 * than looking every room up in one list.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GuidelineSections } from "@/components/client/tata/GuidelineSections";
import { WorkSections, type ResolvedSection } from "@/components/client/tata/WorkSections";
import { TATA_PINS } from "@/constants/tataPins";
import { EASE_OUT } from "@/constants/motion";

/** Where each column sits, and how far apart the pins are down it. */
const COL = {
  left: { x: "left-[7vw]", top: 0.3, step: 0.2 },
  right: { x: "right-[7vw]", top: 0.3, step: 0.2 },
} as const;

/** The circle flush against each pill, in px. */
const CIRCLE = 26;
/** Corner radius on a connector's turn, in viewBox units. */
const TURN_R = 1.1;
/** Gap between neighbouring verticals, so no horizontal crosses another drop. */
const GAP = 1.1;
/** Where the outermost vertical sits, as a percentage of the stage. */
const BASE_X = 3.2;
/** Seconds for one connector to draw itself. */
const DRAW = 0.42;

/** A connector: drop from above the stage, then turn inward to the pin. */
function path(x: number, y: number, end: number, mirrored: boolean): string {
  const r = mirrored ? -TURN_R : TURN_R;
  return `M ${x} -2 V ${y - TURN_R} Q ${x} ${y} ${x + r} ${y} H ${end}`;
}

export function TataSectionsBoard({ sections }: { sections: ResolvedSection[] }) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const [anchors, setAnchors] = useState<Record<string, { x: number; y: number }>>({});
  const stageRef = useRef<HTMLDivElement>(null);

  /* Measure where each pin's circle actually is, so the lines land ON it rather
     than at a guessed coordinate. Same reasoning as the landing: the pills are
     different widths, so a fixed end would miss most of them. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const next: Record<string, { x: number; y: number }> = {};
      stage.querySelectorAll<HTMLElement>("[data-tata-pin]").forEach((el) => {
        const id = el.dataset.tataPin;
        if (!id) return;
        const r = el.getBoundingClientRect();
        next[id] = {
          x: ((r.left + r.width / 2 - box.left) / box.width) * 100,
          y: ((r.top + r.height / 2 - box.top) / box.height) * 100,
        };
      });
      setAnchors((prev) => {
        const k = Object.keys(next);
        const same =
          k.length === Object.keys(prev).length &&
          k.every((i) => prev[i] && Math.abs(prev[i].x - next[i].x) < 0.05 && Math.abs(prev[i].y - next[i].y) < 0.05);
        return same ? prev : next;
      });
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const open = TATA_PINS.find((p) => p.id === openId) ?? null;

  return (
    <div className="w-full">
      {/* ── The rail ── */}
      <div
        ref={stageRef}
        className="relative min-h-[62svh] w-full"
        aria-label="Sections"
      >
        {/* The connectors, drawn once over the whole rail. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {TATA_PINS.map((pin) => {
            const a = anchors[pin.id];
            if (!a) return null;
            const mirrored = pin.side === "right";
            const drop = mirrored
              ? 100 - (BASE_X + pin.index * GAP)
              : BASE_X + pin.index * GAP;
            return (
              <path
                key={pin.id}
                d={path(drop, a.y, a.x, mirrored)}
                fill="none"
                stroke="currentColor"
                strokeWidth={openId === pin.id ? 1.6 : 1}
                vectorEffect="non-scaling-stroke"
                className="text-neutral-900/35"
                style={
                  reduceMotion
                    ? undefined
                    : {
                        // ⚠ A CLIP, not a dash offset. `non-scaling-stroke`
                        // strokes in a different space from the one pathLength
                        // normalises, so a dash pattern tiles at the wrong rate
                        // and renders the line broken. Mirrored lines open from
                        // the other edge or they draw away from their pin.
                        clipPath: mirrored ? "inset(0 0 100% 92%)" : "inset(0 92% 100% 0)",
                        animation: `brainpin-draw ${DRAW}s linear ${pin.index * DRAW}s forwards`,
                      }
                }
              />
            );
          })}
        </svg>

        {TATA_PINS.map((pin) => {
          const isOpen = openId === pin.id;
          const wait = reduceMotion ? 0 : (pin.index + 1) * DRAW;
          return (
            <motion.div
              key={pin.id}
              initial={wait ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE_OUT, delay: wait }}
              className={`absolute ${COL[pin.side].x} flex items-center`}
              style={{ top: `${(COL[pin.side].top + pin.index * COL[pin.side].step) * 100}%` }}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId((v) => (v === pin.id ? null : pin.id))}
                className="pointer-events-auto flex items-center outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
              >
                {/* Pill and circle, flush — the landing's logic pin exactly. */}
                <span
                  className={`font-digibra grid place-items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-center text-[1.07rem] leading-none transition-colors duration-300 ${
                    isOpen
                      ? "border-2 border-neutral-950 bg-transparent text-neutral-950"
                      : "bg-neutral-950 text-white"
                  }`}
                >
                  {pin.label}
                </span>
                <span
                  aria-hidden
                  data-tata-pin={pin.id}
                  className="relative grid shrink-0 place-items-center rounded-full border-2 border-neutral-950 bg-transparent"
                  style={{ width: CIRCLE, height: CIRCLE }}
                >
                  {/* The tell: a flat disc dropped inside the ring when open,
                      which is the landing's held-hover state. */}
                  <motion.span
                    aria-hidden
                    className="block rounded-full bg-neutral-950"
                    initial={false}
                    animate={{ scale: isOpen ? 1 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT }}
                    style={{ width: CIRCLE * 0.42, height: CIRCLE * 0.42 }}
                  />
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ── The room ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={open.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE_OUT }}
            className="w-full overflow-hidden"
            // ⚠ Fired on COMPLETION, not when `openId` changes: the panel opens
            //   from height 0, so scrolling at the moment of the click aims at a
            //   zero-tall box and is then left behind as it grows. Guarded on
            //   `open` so a closing room does not drag the page after it.
            //
            // ⚠ AND IT TARGETS THE RAIL, NOT THE PANEL. Aiming at the panel is
            //   what you would expect and it does not hold: these rooms load
            //   ~50 images and run 3600px tall, and the reflow as they arrive
            //   moves the page under the scroll — measured drifting from 662
            //   back to 267 on its own, seconds after landing. The rail sits
            //   ABOVE all of that and does not move, so it is a stable anchor.
            //   Landing on it also keeps the pins on screen, which is what lets
            //   you switch rooms without scrolling back up for the map.
            onAnimationComplete={() => {
              if (open) {
                stageRef.current?.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                  block: "start",
                });
              }
            }}
          >
            {open.id === "brand-guidelines" ? (
              <GuidelineSections />
            ) : (
              (() => {
                const s = sections.find((x) => x.id === open.id);
                return s ? <WorkSections sections={[s]} startExpanded /> : null;
              })()
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
