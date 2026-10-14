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
 * corner (SectionMenu). It fits whole at every size (owner: "all icons fit
 * inside the frame"): the tiles share the width, and on a phone stand in two
 * rows, five and five.
 */

import Link from "next/link";
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
    <span aria-hidden className="pointer-events-none absolute -bottom-[5px] left-1/2 flex -translate-x-1/2 gap-[3px] sm:-bottom-[7px]">
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

  return (
    <nav
      aria-label={creative ? "Creative work" : "Projects"}
      className={`pointer-events-none absolute inset-x-0 top-[max(2vh,0.75rem)] flex px-4 sm:px-8 lg:px-[5vw] ${
        creative ? "justify-end" : "justify-start"
      }`}
    >
      {/* Room on the right for the sections button (SectionMenu) — just its
          mark on a phone. Everything fits: no sideways scroll at any size. */}
      <div className={`flex w-full min-w-0 pr-[3.5rem] sm:pr-[7.25rem] ${creative ? "justify-end" : "justify-start"}`}>
        <div
          className={`pointer-events-auto grid w-full min-w-0 gap-x-1 gap-y-1.5 rounded-2xl bg-white/85 p-1.5 pb-2.5 ring-1 ring-neutral-200/90 backdrop-blur-sm sm:flex sm:w-auto sm:max-w-full sm:items-center sm:gap-1.5 sm:px-2 sm:pt-1.5 ${
            creative ? "grid-cols-2 sm:flex-row-reverse" : "grid-cols-5"
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
                  aria-current={on ? "true" : undefined}
                  title={it.short}
                  onClick={() => onGo(it.id)}
                  className={`relative min-w-0 rounded-full p-[1.5px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:w-[14rem] sm:shrink ${
                    on ? "bg-[linear-gradient(90deg,#ff2e8b,#ff8a00,#f5c518,#7fbf2e,#00a6a6,#3f6ad8,#7a3fb0)]" : "bg-neutral-900/10 hover:bg-neutral-900/30"
                  }`}
                >
                  <span className="flex h-8 min-w-0 items-center justify-center gap-2 rounded-full bg-white px-3 sm:h-10 sm:px-4">
                    {it.sectionId && <CreativeIcon section={it.sectionId} className="h-4 w-4 shrink-0" />}
                    <span className="face-creative truncate text-[0.7rem] font-bold leading-none text-neutral-900 sm:text-[0.78rem]">
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
                aria-current={on ? "true" : undefined}
                aria-label={it.short}
                title={it.short}
                onClick={() => onGo(it.id)}
                className={`group relative h-8 min-w-0 rounded-lg bg-white outline-none transition-[box-shadow,opacity] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:h-11 sm:w-[6.2rem] sm:shrink ${
                  on ? "ring-2 ring-neutral-900" : "ring-1 ring-neutral-900/12 hover:ring-neutral-900/40"
                }`}
              >
                {it.mark ? (
                  <span
                    className={`absolute inset-x-1 inset-y-1 transition-[filter,opacity] duration-200 sm:inset-x-1.5 ${
                      on ? "" : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                    }`}
                  >
                    <Image src={it.mark} alt="" fill sizes="100px" className="object-contain" />
                  </span>
                ) : (
                  <span
                    className={`font-graff absolute inset-0 grid place-items-center text-[0.5rem] uppercase tracking-[0.1em] sm:text-[0.62rem] ${
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
              className="font-graff group flex h-8 min-w-0 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg text-[0.5rem] uppercase tracking-[0.14em] text-neutral-600 outline-none ring-1 ring-neutral-900/12 transition-colors hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:ml-1 sm:h-11 sm:px-3 sm:text-[0.62rem] sm:tracking-[0.18em] sm:ring-0"
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
