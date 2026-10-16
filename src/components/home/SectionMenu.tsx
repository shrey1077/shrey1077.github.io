"use client";

/**
 * SectionMenu — the button in the top-right corner of the rooms, and the list
 * it drops down (owner, 2026-10-15: "Remove the three circle nav bar on top
 * center. instead have a button (3rd slide onwards), on top right corner
 * (fixed, appear/disappear with pixel effect, when move between 3 to 2 vice
 * versa) as a drop down having a clickable list of all sections that will
 * take you from any page to any page with a single slide pixel transition").
 *
 * It stands from the first room on, and comes and goes in squares
 * (usePixelPresence) as the camera crosses between the brain slide and the
 * rooms. The list: back to the start (the brain slide), every project on the
 * left (the All Projects wall the last of them), every room on the right — the
 * one on screen marked.
 * A choice flies there in ONE step (the Flythrough's warp), switching side if
 * it has to. The button wears the side it is on: graphite or paint.
 *
 * Closes on a choice, on Escape, on a click anywhere else, and whenever the
 * camera moves on. While open the wheel and the arrow keys are the list's
 * (`data-modal` on the root, which the Flythrough respects).
 */

import { useEffect, useId, useRef, useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { RAINBOW } from "@/components/home/MoodField";
import { CREATIVE_SHOWCASE, LOGIC_SHOWCASE } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.56rem] tracking-[0.3em] text-neutral-500`;
const pad = (n: number) => String(n).padStart(2, "0");

/** The button's mark: a 3 × 3 of pixels. */
function GridMark() {
  return (
    <span aria-hidden className="grid grid-cols-3 gap-[2px]">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="block h-[3px] w-[3px] bg-current" />
      ))}
    </span>
  );
}

export function SectionMenu({
  show,
  side,
  activeId,
  onGo,
  onHome,
  reduceMotion,
}: {
  /** In the rooms — from slide 3 on. */
  show: boolean;
  side: "logic" | "creative";
  activeId: string | null;
  onGo: (id: string) => void;
  onHome: () => void;
  reduceMotion: boolean;
}) {
  // Open AT a place: the list belongs to the room it was opened in, so it is
  // shut the moment the camera moves on or the button goes.
  const place = `${activeId}|${show}`;
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === place;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenAt((at) => {
      const was = at === place;
      return (typeof next === "function" ? next(was) : next) ? place : null;
    });
  const rootRef = usePixelPresence<HTMLDivElement>(show, { cell: 6, duration: 0.55, reduceMotion });
  const listId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.modal = "menu";
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenAt(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    // The first item takes the focus, for the keyboard.
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus({ preventScroll: true });
    return () => {
      if (root.dataset.modal === "menu") delete root.dataset.modal;
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, rootRef]);

  const choose = (id: string) => {
    setOpen(false);
    onGo(id);
  };

  const row = (on: boolean) =>
    `group flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left outline-none transition-colors duration-150 focus-visible:bg-neutral-900 focus-visible:text-white ${
      on ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900 hover:text-white"
    }`;

  return (
    <div
      ref={rootRef}
      className={`absolute right-4 top-[max(2vh,0.75rem)] z-[150] sm:right-8 lg:right-[5vw] ${show ? "" : "invisible"}`}
    >
      <PixelButton
        side={side}
        onClick={() => setOpen((o) => !o)}
        ariaExpanded={open}
        ariaControls={listId}
        ariaHaspopup="menu"
      >
        <GridMark />
        <span className="max-sm:sr-only">Menu</span>
      </PixelButton>

      {open && (
        <div
          ref={panelRef}
          id={listId}
          role="menu"
          aria-label="Sections"
          className="absolute right-0 top-[calc(100%+0.5rem)] max-h-[min(78svh,40rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-white/95 p-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 backdrop-blur-sm"
        >
          <button type="button" role="menuitem" className={row(false)} onClick={() => { setOpen(false); onHome(); }}>
            <span className={`${META} w-6 !tracking-[0.1em] group-hover:text-white/60`}>↑</span>
            <span className="text-[0.82rem]">Start</span>
          </button>

          <p className={`${META} mt-2 px-2.5 pb-1 pt-1.5`}>Projects</p>
          {LOGIC_SHOWCASE.map((it, i) => (
            <button key={it.id} type="button" role="menuitem" aria-current={it.id === activeId ? "true" : undefined} className={row(it.id === activeId)} onClick={() => choose(it.id)}>
              <span className={`${META} w-6 !tracking-[0.1em] ${it.id === activeId ? "text-white/60" : "group-hover:text-white/60"}`}>{pad(i + 1)}</span>
              <span className="text-[0.82rem]">{it.short}</span>
            </button>
          ))}

          <p className={`${META} mt-2 px-2.5 pb-1 pt-1.5`}>Creative</p>
          {CREATIVE_SHOWCASE.map((it, i) => (
            <button key={it.id} type="button" role="menuitem" aria-current={it.id === activeId ? "true" : undefined} className={row(it.id === activeId)} onClick={() => choose(it.id)}>
              <span aria-hidden className="flex w-6 justify-start">
                <span className="block h-2 w-2" style={{ backgroundColor: RAINBOW[(i * 2) % RAINBOW.length] }} />
              </span>
              <span className="face-creative text-[0.86rem] font-bold">{it.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
