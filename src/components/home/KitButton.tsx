"use client";

/**
 * KitButton — the button in each side's outer bottom corner, and the pop-up
 * it opens over the top of the screen (owner, 2026-10-15: "My Stack will
 * appear as a pop-up on top of screen when clicked on a button at the bottom
 * left corners in left side sections. Its counterpart on right side corner
 * (for right side elements) will be my tools").
 *
 *   · LEFT, bottom-left    My Stack — the software (MyStack, the room it was
 *                          until now);
 *   · RIGHT, bottom-right  My Tools — the camera, the nibs, the brushes (KIT).
 * The button stands on the band along the foot (FootBand, 7svh) and pans with
 * its side; it comes and goes in squares (usePixelPresence) as the camera
 * crosses between the brain slide and the rooms. (The brain's circle stood in
 * these corners until 2026-10-15 — BrainDock, unlinked; the sections button
 * and ← → cross sides now.)
 *
 * The pop-up drops from the top, over a soft veil, and arrives in squares
 * too. It is a dialog: Escape, the close button or a click on the veil shuts
 * it, the focus goes in and comes back, and while it is open the wheel and
 * the keys are its own (`data-modal`, which the Flythrough respects).
 */

import { useEffect, useId, useRef, useState } from "react";
import { motion, type MotionValue } from "framer-motion";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { MyStack } from "@/components/home/MyStack";
import { RAINBOW } from "@/components/home/MoodField";
import { KIT, type KitIcon } from "@/constants/kit";
import { PAPER_PLATE } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.6rem] tracking-[0.28em] text-neutral-500`;

/** Line drawings for the kit, 24 × 24, in the current colour. */
function KitGlyph({ icon }: { icon: KitIcon }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7">
      {icon === "camera" && (
        <>
          <path {...p} d="M3 8.5h4l1.6-2.5h6.8L17 8.5h4V19H3z" />
          <circle {...p} cx="12" cy="13.2" r="3.6" />
          <path {...p} d="M5.5 11h1.5" />
        </>
      )}
      {icon === "nib" && (
        <>
          <path {...p} d="M12 21l-5-8 5-10 5 10z" />
          <path {...p} d="M12 21v-7.5" />
          <circle {...p} cx="12" cy="11.5" r="1.3" />
        </>
      )}
      {icon === "brush" && (
        <>
          <path {...p} d="M20 4L11 13" />
          <path {...p} d="M11 13c-2.5-.6-4.6.9-5 3.2-.3 1.8-1.2 2.9-3 3.3 3.6 1.4 7.5.6 8.7-2.1.7-1.6.4-3.1-.7-4.4z" />
        </>
      )}
      {icon === "palette" && (
        <>
          <path {...p} d="M12 3.5c-4.9 0-8.5 3.4-8.5 7.8 0 3.9 3 7.2 6.9 7.2 1.2 0 1.8-.8 1.8-1.6 0-1.1-1-1.5-1-2.6 0-1 .8-1.7 1.8-1.7h2c2.7 0 5-2.1 5-4.8 0-2.9-3.5-4.3-8-4.3z" />
          <circle cx="7.6" cy="10.8" r="1.1" fill={RAINBOW[0]} />
          <circle cx="10" cy="7.2" r="1.1" fill={RAINBOW[3]} />
          <circle cx="14.4" cy="7" r="1.1" fill={RAINBOW[5]} />
        </>
      )}
      {icon === "pencil" && (
        <>
          <path {...p} d="M4 20l1.2-4.6L16.5 4.1a1.6 1.6 0 012.3 0l1.1 1.1a1.6 1.6 0 010 2.3L8.6 18.8z" />
          <path {...p} d="M14.5 6l3.5 3.5" />
        </>
      )}
      {icon === "cutter" && (
        <>
          <path {...p} d="M3 17L15 5l4 4L7 21H3z" />
          <path {...p} d="M15 5l3-2 3 3-2 3" />
          <path {...p} d="M6 18l2-2" />
        </>
      )}
    </svg>
  );
}

function ToolsKit() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
      {KIT.map((g, gi) => (
        <section key={g.label} aria-label={g.label} className="text-right">
          <p className="flex items-baseline justify-end gap-2 border-b border-neutral-900/15 pb-2 text-[0.62rem] uppercase tracking-[0.28em] text-neutral-500">
            {g.label}
            <span className="tabular-nums text-neutral-900">{String(gi + 1).padStart(2, "0")}</span>
          </p>
          <ul className="mt-3 grid gap-2">
            {g.items.map((it, i) => (
              <li
                key={it.name}
                className="flex flex-row-reverse items-center gap-4 rounded-2xl border border-neutral-900/12 bg-white/55 px-4 py-3 text-right"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center" style={{ color: RAINBOW[(gi * 2 + i) % RAINBOW.length] }}>
                  <KitGlyph icon={it.icon} />
                </span>
                <span className="min-w-0">
                  <span className="face-creative block text-[0.98rem] font-bold leading-tight text-neutral-900">{it.name}</span>
                  <span className="mt-0.5 block text-[0.72rem] leading-snug text-neutral-500">{it.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function KitButton({
  side,
  show,
  away,
  x,
  reduceMotion,
}: {
  side: "logic" | "creative";
  /** In the rooms. */
  show: boolean;
  /** Its side is panned off the screen: out of reach of the keyboard too. */
  away: boolean;
  /** Its side's pan, as a CSS translate. */
  x: MotionValue<string>;
  reduceMotion: boolean;
}) {
  const logic = side === "logic";
  const [opened, setOpen] = useState(false);
  // Shut whenever the button goes (the camera leaves the rooms) — and stays
  // shut when it comes back.
  const [wasShown, setWasShown] = useState(show);
  if (wasShown !== show) {
    setWasShown(show);
    if (!show) setOpen(false);
  }
  const open = opened && show;
  // The pop-up's contents mount on the first open — their marks needn't
  // download with the page.
  const [ever, setEver] = useState(false);
  const btnRef = usePixelPresence<HTMLDivElement>(show, { cell: 6, duration: 0.55, reduceMotion });
  const popRef = usePixelPresence<HTMLDivElement>(open, { cell: 10, duration: 0.5, reduceMotion });
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.modal = "kit";
    opener.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      if (root.dataset.modal === "kit") delete root.dataset.modal;
      window.removeEventListener("keydown", onKey);
      opener.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const title = logic ? "My Stack" : "My Tools";
  const sub = logic
    ? "The software behind the work — for design, for generating images and film, and for building."
    : "What the work on this side is made with, by hand.";

  return (
    <>
      <motion.div
        aria-hidden={!show || away}
        inert={away}
        className="pointer-events-none absolute inset-0 z-[140]"
        style={{ x }}
      >
        <div
          ref={btnRef}
          className={`pointer-events-auto absolute bottom-[calc(7svh+0.75rem)] ${logic ? "left-4 sm:left-8 lg:left-[5vw]" : "right-4 sm:right-8 lg:right-[5vw]"} ${
            show ? "" : "invisible"
          }`}
        >
          <PixelButton
            side={side}
            onClick={() => {
              setEver(true);
              setOpen(true);
            }}
            ariaHaspopup="dialog"
            ariaExpanded={open}
          >
            {title}
          </PixelButton>
        </div>
      </motion.div>

      {/* The pop-up, over the top of the screen. */}
      <div
        ref={popRef}
        className={`absolute inset-0 z-[160] ${open ? "" : "invisible"}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute inset-0 cursor-default bg-white/55 backdrop-blur-[3px]"
        />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`${PAPER_PLATE} absolute inset-x-4 top-[max(2vh,0.75rem)] max-h-[calc(93svh-2rem)] overflow-y-auto p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] outline-none sm:inset-x-8 sm:p-7 lg:inset-x-[5vw]`}
        >
          <div className={`mb-6 flex items-start justify-between gap-6 ${logic ? "" : "flex-row-reverse text-right"}`}>
            <div>
              <p className={META}>{logic ? "Logic · Software" : "Creative · By hand"}</p>
              <h2
                id={titleId}
                className={`mt-2 text-[clamp(1.8rem,3.6vw,3.2rem)] leading-[0.95] text-neutral-900 ${
                  logic ? "face-logic" : "face-creative font-bold"
                }`}
              >
                {title}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">{sub}</p>
            </div>
            <PixelButton side={side} size="sm" onClick={() => setOpen(false)} ariaLabel={`Close ${title}`}>
              Close ✕
            </PixelButton>
          </div>
          {ever && (logic ? <MyStack /> : <ToolsKit />)}
        </div>
      </div>
    </>
  );
}
