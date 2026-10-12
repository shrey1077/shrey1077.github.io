"use client";

/**
 * ScreenWall — band 08's work: the brand on screen, all of it on one wall
 * (2026-10-05). It replaced the six rooms behind cards (TataSectionsBoard, git
 * has it): with the mockups, Print, the installed work and the camera laid
 * open in 04–07, what was left behind the cards was Digital's screens, and
 * those are here.
 *
 *   · Socials — the post grid, as a grid.
 *   · Website banners — in a bare browser frame, turning one to the next.
 *   · Presentations — in a 16:9 frame, turning slide to slide.
 *
 * Each frame turns only while on screen and stands still for reduced motion.
 * Any piece opens full size and walks the rest of its set.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { TataFader } from "@/components/client/tata/TataFader";
import { TataViewer, type TataPlate, type ViewerState } from "@/components/client/tata/TataViewer";
import { SIDE_LINK } from "@/components/client/tata/SideBand";

export interface ScreenSet {
  label: string;
  /** Its catalogue page. */
  href?: string;
  plates: readonly TataPlate[];
}

/** Posts shown in the grid; the rest are a click away. */
const GRID = 16;
/** ms between a frame's turns. */
const TURN_MS = 3200;

const LABEL = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

function SetHead({ set }: { set: ScreenSet }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <p className={LABEL}>
        {set.label} <span className="ml-1 tabular-nums text-neutral-400">{set.plates.length}</span>
      </p>
      {set.href && (
        <Link href={set.href} className={`${SIDE_LINK} text-[0.58rem]`}>
          All <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export function ScreenWall({ socials, banners, decks }: { socials: ScreenSet; banners: ScreenSet; decks: ScreenSet }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  /** Where each frame is, and whose beat is next — the two frames turn
   *  alternately, half a turn apart. */
  const [at, setAt] = useState({ banners: 0, decks: 0, beat: 0 });
  const [hold, setHold] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ViewerState>(null);
  const nb = Math.max(1, banners.plates.length);
  const nd = Math.max(1, decks.plates.length);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    // A frame under the pointer holds still; the other keeps turning.
    const t = window.setInterval(
      () =>
        setAt((a) => {
          const mine = a.beat % 2 === 0 ? "banners" : "decks";
          const next = { ...a, beat: a.beat + 1 };
          if (mine === "banners" && hold !== "banners") next.banners = (a.banners + 1) % nb;
          if (mine === "decks" && hold !== "decks") next.decks = (a.decks + 1) % nd;
          return next;
        }),
      TURN_MS / 2,
    );
    return () => window.clearInterval(t);
  }, [inView, reduceMotion, hold, nb, nd]);

  const shown = socials.plates.slice(0, GRID);
  const more = socials.plates.length - shown.length;

  /** A frame that turns through a set: the picture, and a dot per piece. */
  const frame = (set: ScreenSet, id: string, at: number, aspect: string, chrome: boolean) => (
    <div onMouseEnter={() => setHold(id)} onMouseLeave={() => setHold(null)}>
      <SetHead set={set} />
      <button
        type="button"
        onClick={() => setViewing({ plates: set.plates, at })}
        aria-label={`${set.label}: ${set.plates[at]?.name} — open full size`}
        className="group block w-full cursor-zoom-in overflow-hidden bg-white text-left outline-none ring-1 ring-neutral-300 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] focus-visible:ring-2 focus-visible:ring-neutral-900/40"
      >
        {chrome && (
          // A bare browser frame — three dots and an empty address bar. No
          // address in it: it is a frame, not a claim about a site.
          <span aria-hidden className="flex h-5 items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-2.5">
            {[0, 1, 2].map((d) => (
              <span key={d} className="block size-1.5 rounded-full bg-neutral-300" />
            ))}
            <span className="ml-3 block h-2 w-1/3 rounded-full bg-white ring-1 ring-neutral-200" />
          </span>
        )}
        <span className={`relative block w-full ${aspect}`}>
          {set.plates[at] && (
            <TataFader
              src={set.plates[at].thumb}
              sizes="(max-width: 1024px) 92vw, 440px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          )}
        </span>
      </button>
      <span aria-hidden className="mt-2.5 flex gap-1.5">
        {set.plates.map((p, i) => (
          <span
            key={p.url}
            className={`block h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === at ? "bg-neutral-800" : "bg-neutral-300"}`}
          />
        ))}
      </span>
    </div>
  );

  return (
    <div ref={ref} className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
      {/* Socials: the grid. */}
      <div>
        <SetHead set={socials} />
        <ul className="grid grid-cols-4 gap-1.5">
          {shown.map((p, i) => {
            const last = i === shown.length - 1 && more > 0;
            return (
              <li key={p.url}>
                <button
                  type="button"
                  onClick={() => setViewing({ plates: socials.plates, at: i })}
                  aria-label={last ? `${more + 1} more posts — open` : `Post: ${p.name} — open full size`}
                  className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
                >
                  <Image
                    src={p.thumb}
                    alt={`Post: ${p.name}`}
                    fill
                    sizes="(max-width: 768px) 23vw, 110px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  {last && (
                    <span className="absolute inset-0 grid place-items-center bg-neutral-950/60 text-white">
                      <span className="tata-body text-[0.95rem] tabular-nums">+{more + 1}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* The site's banners, and the deck. */}
      <div className="flex flex-col gap-8">
        {frame(banners, "banners", at.banners, "aspect-[2.7/1]", true)}
        {frame(decks, "decks", at.decks, "aspect-video", false)}
      </div>

      <TataViewer state={viewing} onChange={setViewing} />
    </div>
  );
}
