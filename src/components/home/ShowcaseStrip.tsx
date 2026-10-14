"use client";

/**
 * ShowcaseStrip — the row along the top of the rooms naming every slide on
 * that side (owner, 2026-10-15: "a single Projects menu at the bottom of
 * second slide, that will become the top of left side slide 3 … we can access
 * them through logos on top").
 *
 *   · LEFT   "Projects", then the nine marks in the owner's order, then
 *            "See all" — the All Works page, everything else;
 *   · RIGHT  the mirror: the four creative rooms by name and icon, running
 *            in from the right edge, "Creative" at the end.
 * The slide on screen is marked — its tile edged in black (left) or paint
 * (right), with a row of blinking pixels under it — and a click flies there
 * in ONE step, however far (the Flythrough's warp), never through the slides
 * in between.
 *
 * The Flythrough carries it: it comes in with the side's first room — from
 * the foot of the brain slide, where the Projects pin stands, to the top of
 * slide 3 — then holds still while the rooms fly through beneath it, and pans
 * with its side. It keeps clear of the sections button in the top-right
 * corner (SectionMenu). Too long for the screen, it scrolls sideways, and the
 * marked tile is kept in view.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { CreativeIcon } from "@/components/home/CreativeIcons";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";
import { ALL_WORKS_HREF, type Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.56rem] tracking-[0.3em] text-neutral-500`;

/** Three pixels blinking under the marked tile. */
function Marker({ creative }: { creative: boolean }) {
  return (
    <span aria-hidden className="pointer-events-none absolute -bottom-[7px] left-1/2 flex -translate-x-1/2 gap-[3px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="pixel-blink block h-[4px] w-[4px]"
          style={
            {
              backgroundColor: creative ? RAINBOW[(i * 2 + 1) % RAINBOW.length] : "#171717",
              "--blink": `${(1.1 + hash(i, 9) * 1.6).toFixed(2)}s`,
              "--delay": `${(-hash(9, i) * 2).toFixed(2)}s`,
            } as unknown as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export function ShowcaseStrip({
  side,
  items,
  activeId,
  onGo,
}: {
  side: "logic" | "creative";
  items: readonly Showcase[];
  /** The slide on screen, on this side — or null. */
  activeId: string | null;
  onGo: (id: string) => void;
}) {
  const creative = side === "creative";
  const rowRef = useRef<HTMLDivElement>(null);

  // Keep the marked tile in view along the row (never by scrollIntoView,
  // which would move the page too).
  useEffect(() => {
    const row = rowRef.current;
    const tile = activeId ? row?.querySelector<HTMLElement>(`[data-strip-id="${activeId}"]`) : null;
    if (!row || !tile) return;
    const l = tile.offsetLeft - 12;
    const r = tile.offsetLeft + tile.offsetWidth + 12;
    if (l < row.scrollLeft) row.scrollTo({ left: l, behavior: "smooth" });
    else if (r > row.scrollLeft + row.clientWidth) row.scrollTo({ left: r - row.clientWidth, behavior: "smooth" });
  }, [activeId]);

  return (
    <nav
      aria-label={creative ? "Creative work" : "Projects"}
      className={`pointer-events-none absolute inset-x-0 top-[max(2vh,0.75rem)] flex px-4 sm:px-8 lg:px-[5vw] ${
        creative ? "justify-end" : "justify-start"
      }`}
    >
      {/* Room on the right for the sections button (SectionMenu). */}
      <div className="flex min-w-0 max-w-full pr-[7.25rem]">
        <div
          ref={rowRef}
          className={`pointer-events-auto flex min-w-0 items-center gap-1.5 overflow-x-auto rounded-2xl bg-white/85 px-2 pb-2.5 pt-1.5 ring-1 ring-neutral-200/90 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            creative ? "flex-row-reverse" : ""
          }`}
        >
          <span className={`${META} hidden shrink-0 px-2 xl:inline`}>{creative ? "Creative" : "Projects"}</span>
          {items.map((it) => {
            const on = it.id === activeId;
            if (creative) {
              return (
                <button
                  key={it.id}
                  type="button"
                  data-strip-id={it.id}
                  aria-current={on ? "true" : undefined}
                  onClick={() => onGo(it.id)}
                  className={`relative shrink-0 rounded-full p-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                    on ? "bg-[linear-gradient(90deg,#ff2e8b,#ff8a00,#f5c518,#7fbf2e,#00a6a6,#3f6ad8,#7a3fb0)]" : "bg-neutral-900/10 hover:bg-neutral-900/30"
                  }`}
                >
                  <span className="flex h-10 items-center gap-2 rounded-full bg-white px-4">
                    {it.sectionId && <CreativeIcon section={it.sectionId} className="h-4 w-4 shrink-0" />}
                    <span className="face-creative whitespace-nowrap text-[0.78rem] font-bold leading-none text-neutral-900">
                      {it.short}
                    </span>
                  </span>
                  {on && <Marker creative />}
                </button>
              );
            }
            return (
              <button
                key={it.id}
                type="button"
                data-strip-id={it.id}
                aria-current={on ? "true" : undefined}
                aria-label={it.short}
                title={it.short}
                onClick={() => onGo(it.id)}
                className={`group relative h-11 w-[5.6rem] shrink-0 rounded-lg bg-white outline-none transition-[box-shadow,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 xl:w-[6.2rem] ${
                  on ? "ring-2 ring-neutral-900" : "ring-1 ring-neutral-900/12 hover:ring-neutral-900/40"
                }`}
              >
                {it.mark ? (
                  <span
                    className={`absolute inset-x-1.5 inset-y-1 transition-[filter,opacity] duration-200 ${
                      on ? "" : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                    }`}
                  >
                    <Image src={it.mark} alt="" fill sizes="96px" className="object-contain" />
                  </span>
                ) : (
                  <span
                    className={`font-graff absolute inset-0 grid place-items-center text-[0.66rem] uppercase tracking-[0.14em] ${
                      on ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-900"
                    }`}
                  >
                    {it.short}
                  </span>
                )}
                {on && <Marker creative={false} />}
              </button>
            );
          })}
          {!creative && (
            <Link
              href={ALL_WORKS_HREF}
              prefetch={false}
              className="font-graff group ml-1 flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-600 outline-none transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40"
            >
              See all
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
