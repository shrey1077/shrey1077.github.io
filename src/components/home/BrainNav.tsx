"use client";

/**
 * BrainNav — the three circles over the flythrough (2026-10-03, owner). Once
 * the camera leaves the landing, a row of three sits at the top of the stage:
 *   · black and white — the LEFT brain: flies to the first logic room;
 *   · half black, half colour — home: back to the landing, where both
 *     hemispheres meet (black on the left as in the logic circle, paint on
 *     the right as in the creative one, the way the brain itself is split);
 *   · full colour — the RIGHT brain: flies to the first creative room.
 * The two sides are parallel tracks since 2026-10-03 (Flythrough): a number
 * flies to that level AND switches to that side's track if need be.
 * Hovering either side circle drops four smaller ones under it, numbered 1–4,
 * one per room on that side, each flying straight to its slide. The room's
 * name shows under the row.
 *
 * This replaced the dot rail on the stage's right edge (same day), so the
 * slides got their right gutter back.
 *
 * Touch has no hover: there a tap on a side circle opens (or shuts) its four
 * instead of flying, and a tap on a number flies and shuts them. Keyboard: a
 * side's numbers open while focus-visible is anywhere in its group, so Tab
 * walks from the circle into 1–4.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { NavSection } from "@/types/navigation";
import { typeVoiceClass } from "@/constants/typography";

type Side = "logic" | "creative";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const LABEL = `${typeVoiceClass("logic", "meta")} whitespace-nowrap rounded bg-neutral-950/75 px-2 py-0.5 text-[0.55rem] tracking-[0.24em] text-white`;

/** The three faces, as backgrounds under a white ring. */
const FACE: Record<Side | "home", string> = {
  logic: "linear-gradient(90deg, #0a0a0a 50%, #ffffff 50%)",
  home: "linear-gradient(90deg, #0a0a0a 50%, transparent 50%)",
  creative: "none",
};

function SideCircle({
  side,
  rooms,
  first,
  current,
  open,
  setOpen,
  onGo,
}: {
  side: Side;
  rooms: NavSection[];
  /** The slide index of rooms[0]. */
  first: number;
  current: number;
  open: boolean;
  setOpen: (s: Side | null) => void;
  onGo: (k: number) => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<number | null>(null);
  // The last pointer to press the circle: a touch toggles, anything else flies.
  const pressedBy = useRef("mouse");
  // Whether a mouse is inside the group. ⚠ A click on a number moves focus,
  // and the blur that follows must not shut the row out from under the click
  // — blur only shuts it for the keyboard.
  const inside = useRef(false);
  const here = current >= first && current < first + rooms.length;
  const logic = side === "logic";
  const name = logic ? "Left brain" : "Right brain";
  const label = hovered !== null ? rooms[hovered].label : here ? rooms[current - first].label : name;

  return (
    <div
      className="relative flex flex-col items-center"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        inside.current = true;
        setOpen(side);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        inside.current = false;
        setOpen(null);
        setHovered(null);
      }}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setOpen(side);
      }}
      onBlur={(e) => {
        if (!inside.current && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
      }}
    >
      <button
        type="button"
        aria-label={`${name}: ${rooms.map((r) => r.label).join(", ")}`}
        aria-expanded={open}
        onPointerDown={(e) => {
          pressedBy.current = e.pointerType;
        }}
        onClick={() => {
          const touch = pressedBy.current !== "mouse";
          pressedBy.current = "mouse";
          if (touch) setOpen(open ? null : side);
          else onGo(first);
        }}
        className={`group relative block size-7 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.45)] outline-none ring-[1.5px] ring-white transition-transform duration-300 hover:scale-110 focus-visible:scale-110 lg:size-8 ${
          here ? "scale-110 outline outline-1 outline-offset-[3px] outline-white/75" : ""
        } ${logic ? "" : "brain-paint"}`}
        style={logic ? { backgroundImage: FACE.logic } : undefined}
      />

      {/* The four rooms. `pt` bridges the gap so the pointer can travel from
          the circle down to them without leaving the group. */}
      {/* ⚠ The row's own plate fades too, not just the numbers on it — it
          used to stay put when closed and leave a faint dark pill under each
          side circle. */}
      <div
        className={`absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center gap-1.5 pt-3.5 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex gap-1.5 rounded-full bg-neutral-950/45 p-1 backdrop-blur-sm">
          {rooms.map((r, i) => {
            const on = current === first + i;
            return (
              <li key={r.id}>
                {/* The button stays put at full size so the hit area is all
                    there from the first frame; only what it holds animates. */}
                <button
                  type="button"
                  aria-label={`${i + 1}. ${r.label}`}
                  aria-current={on ? "step" : undefined}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => {
                    onGo(first + i);
                    if (pressedBy.current !== "mouse") setOpen(null);
                  }}
                  onPointerDown={(e) => {
                    pressedBy.current = e.pointerType;
                  }}
                  className="group block size-6 rounded-full outline-none lg:size-7"
                >
                  <motion.span
                    className="block size-full"
                    initial={false}
                    animate={open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.5 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.24,
                      delay: open && !reduceMotion ? i * 0.045 : 0,
                      ease: EASE_OUT,
                    }}
                  >
                    {/* The hover swell is CSS on its own layer — the motion
                        span's inline transform would override a class. */}
                    <span
                      className={`block size-full rounded-full transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110 ${
                        logic ? "" : "brain-paint p-[2px]"
                      }`}
                    >
                      {logic ? (
                        <span
                          className={`font-digibra grid size-full place-items-center rounded-full text-[0.8rem] leading-none ring-[1.5px] ring-white transition-colors duration-200 lg:text-[0.9rem] ${
                            on ? "bg-white text-neutral-950" : "bg-neutral-950 text-white group-hover:bg-neutral-800"
                          }`}
                        >
                          {i + 1}
                        </span>
                      ) : (
                        // Painted ring, white disc — the creative pins' pill;
                        // the room you are in flips to paint, as an open pin does.
                        <span
                          className={`font-graff grid size-full place-items-center rounded-full text-[0.78rem] font-bold leading-none transition-colors duration-200 lg:text-[0.88rem] ${
                            on ? "text-white" : "bg-white text-neutral-900"
                          }`}
                        >
                          {i + 1}
                        </span>
                      )}
                    </span>
                  </motion.span>
                </button>
              </li>
            );
          })}
        </ul>
        <motion.p
          aria-hidden
          className={LABEL}
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, delay: open && !reduceMotion ? 0.12 : 0 }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}

export function BrainNav({
  current,
  track,
  firstRoom,
  logic,
  creative,
  hidden,
  onGo,
}: {
  /** The slide the camera is on (0 = the landing's first slide, the orb). */
  current: number;
  /** Which of the two parallel tracks the camera is on (Flythrough). Only
   *  that side marks the room you are in. */
  track: Side;
  /** The slide index of the first room on EITHER track — the two run level
   *  with each other from here (2026-10-03). Home flies to 0. */
  firstRoom: number;
  logic: NavSection[];
  creative: NavSection[];
  /** Over the landing, which has its own pins. */
  hidden: boolean;
  /** Fly to slide k, on the given track. */
  onGo: (k: number, track?: Side) => void;
}) {
  const [openState, setOpen] = useState<Side | null>(null);
  // Over the landing nothing is open, whatever was left open before.
  const open = hidden ? null : openState;
  const navRef = useRef<HTMLElement>(null);

  // A tap anywhere else shuts a row a tap opened. (A mouse shuts it by
  // leaving; this only ever matters on touch.)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <nav
      ref={navRef}
      aria-label="Brain"
      className={`absolute left-1/2 top-[max(0.75rem,2.2vh)] z-[200] -translate-x-1/2 transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full bg-neutral-950/35 p-1.5 ring-1 ring-white/10 backdrop-blur-sm sm:gap-5">
        <SideCircle
          side="logic"
          rooms={logic}
          first={firstRoom}
          current={track === "logic" ? current : -1}
          open={open === "logic"}
          setOpen={setOpen}
          onGo={(k) => onGo(k, "logic")}
        />

        <div className="group relative flex flex-col items-center">
          <button
            type="button"
            aria-label="Home"
            onClick={() => onGo(0)}
            className="brain-paint relative block size-7 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.45)] outline-none ring-[1.5px] ring-white transition-transform duration-300 hover:scale-110 focus-visible:scale-110 lg:size-8"
          >
            <span aria-hidden className="absolute inset-0 rounded-full" style={{ backgroundImage: FACE.home }} />
          </button>
          <span
            aria-hidden
            className={`${LABEL} pointer-events-none absolute left-1/2 top-full mt-3.5 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100`}
          >
            Home
          </span>
        </div>

        <SideCircle
          side="creative"
          rooms={creative}
          first={firstRoom}
          current={track === "creative" ? current : -1}
          open={open === "creative"}
          setOpen={setOpen}
          onGo={(k) => onGo(k, "creative")}
        />
      </div>
    </nav>
  );
}
