"use client";

/**
 * ShowcaseStrip — every slide on a side as a row of pills, in the black band
 * along the foot (owner, 2026-10-18: "this element needs to be in the black
 * band at bottom, selected one in white pixelated pill and rest in black
 * pixelated pills, same for right side"). It stood along the top of the rooms
 * until then (2026-10-15: "we can access them through logos on top").
 *
 *   · LEFT   in the band's black part: the marks in the owner's order, then
 *            "See all" — the All Projects wall, the last room;
 *   · RIGHT  in its rainbow part, the mirror: the four creative rooms by icon
 *            and name, running in from the right edge.
 *
 * Every tile is a pixel pill, as every button (PixelButton): the slide on
 * screen WHITE, its squares graphite (left) or paint (right), and a little
 * wider than the rest; the others BLACK, their squares lit white or in paint,
 * the marks in white. Each mark is fitted by its ink, not its file's margins
 * (INK). NewsMobile's is drawn on white: blended into the pill — multiplied
 * on the white one, inverted and screened on the black — so its ground never
 * shows as a box. ABS's is a coin in colour on white: cut to its circle, in
 * colour on the white pill and grey on a black one. A click flies there in ONE step, however far (the
 * Flythrough's warp), never through the slides in between.
 *
 * The band (FootBand) carries it in the part for the side the camera is on;
 * the other part stays the way across. It fits whole at every size (owner:
 * "all icons fit inside the frame"): the pills share the width, and on a
 * phone the creative ones show their icons only.
 */

import { RoomImage as Image } from "@/components/home/nearness";
import { CreativeIcon } from "@/components/home/CreativeIcons";
import { PixelGround } from "@/components/home/PixelButton";
import { ALL_PROJECTS_ID, type Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

/** A pill's height: inside the band (7svh) with a little of it showing above
 *  and below — a shade less on a phone, where the pills are narrow. */
const PILL_H = "h-[min(2rem,calc(7svh-0.9rem))] sm:h-[min(2.75rem,calc(7svh-0.9rem))]";

/** Each mark's ink in its file (.perf-tools/tmp/inkbox.mjs): the file's size,
 *  then the ink's box; `white`, drawn on a white ground; `round`, a disc
 *  filling its ink box, cut to it; `size`, a share of the width it may take
 *  (a long wordmark reads larger than the rest at full width); `name`, set
 *  beside a small mark (ABS's coin — owner, 2026-10-18: "write ABS Wholesale
 *  in barlow bold font beside the small circular logo"). A mark not here
 *  fills the pill by its whole file. */
interface Ink {
  fw: number;
  fh: number;
  x: number;
  y: number;
  w: number;
  h: number;
  white?: boolean;
  round?: boolean;
  size?: number;
  name?: string;
}
const INK: Record<string, Ink> = {
  "tata-iis": { fw: 625, fh: 354, x: 99, y: 123, w: 427, h: 108 },
  "azoth-biotech": { fw: 512, fh: 256, x: 39, y: 77, w: 414, h: 98 },
  abs: { fw: 480, fh: 409, x: 51, y: 46, w: 336, h: 335, round: true, name: "ABS Wholesale" },
  // "Make zabraku little smaller" (owner, 2026-10-18).
  zabraku: { fw: 1200, fh: 153, x: 0, y: 0, w: 1200, h: 153, size: 0.78 },
  newsmobile: { fw: 480, fh: 110, x: 9, y: 16, w: 442, h: 81, white: true },
};

/** A mark, its ink as large as the pill allows: in colour on the white pill,
 *  white on a black one. */
function Mark({ src, ink, on }: { src: string; ink?: Ink; on: boolean }) {
  const k = ink ?? { fw: 1, fh: 1, x: 0, y: 0, w: 1, h: 1 };
  const look = on
    ? k.white
      ? "mix-blend-multiply"
      : ""
    : `opacity-85 transition-opacity duration-200 group-hover:opacity-100 ${
        k.round
          ? "[filter:grayscale(1)_brightness(1.2)]"
          : k.white
            ? "mix-blend-screen [filter:grayscale(1)_invert(1)_brightness(1.6)]"
            : "[filter:brightness(0)_invert(1)]"
      }`;
  const art = (
    <span
      className={`absolute block ${look}`}
      style={{
        left: `${((-k.x / k.w) * 100).toFixed(3)}%`,
        top: `${((-k.y / k.h) * 100).toFixed(3)}%`,
        width: `${((k.fw / k.w) * 100).toFixed(3)}%`,
        height: `${((k.fh / k.h) * 100).toFixed(3)}%`,
      }}
    >
      <Image src={src} alt="" fill sizes="160px" className={ink ? "object-fill" : "object-contain"} />
    </span>
  );
  // A small mark and its name beside it; the name only where there is room.
  if (k.name) {
    return (
      <span className="relative flex h-full min-w-0 items-center justify-center gap-1.5 px-2.5 py-[0.3rem] sm:py-[0.4rem]">
        <span className={`relative block aspect-square h-full shrink-0 overflow-hidden ${k.round ? "rounded-full" : ""}`}>{art}</span>
        <span className="truncate text-[0.66rem] font-bold leading-none max-sm:hidden lg:text-[0.74rem]" style={{ fontFamily: "var(--font-barlow), ui-sans-serif, sans-serif" }}>
          {k.name}
        </span>
      </span>
    );
  }
  return (
    <span className={`absolute inset-x-[12%] flex items-center justify-center [container-type:size] ${k.round ? "inset-y-[12%]" : "inset-y-[20%]"}`}>
      <span
        className={`relative block overflow-hidden ${k.round ? "rounded-full" : ""}`}
        style={{
          width: ink ? `min(${(k.size ?? 1) * 100}cqw, ${(k.w / k.h).toFixed(3)} * 100cqh)` : "100%",
          height: ink ? undefined : "100%",
          aspectRatio: ink ? `${k.w} / ${k.h}` : undefined,
        }}
      >
        {art}
      </span>
    </span>
  );
}

function Pill({
  side,
  on,
  label,
  onClick,
  className = "",
  children,
}: {
  side: "logic" | "creative";
  on: boolean;
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const creative = side === "creative";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={on ? "true" : undefined}
      aria-label={label}
      title={label}
      className={`group relative isolate flex min-w-0 shrink items-center justify-center overflow-hidden rounded-full outline-none transition-[box-shadow,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-white ${PILL_H} ${
        on
          ? `bg-white text-neutral-900 ${creative ? "shadow-[0_2px_10px_rgba(0,0,0,0.35)]" : ""}`
          : `bg-neutral-950 text-white ring-1 hover:bg-neutral-800 ${creative ? "ring-black/50" : "ring-white/20 hover:ring-white/50"}`
      } ${className}`}
    >
      <PixelGround side={side} tone={on ? "light" : "dark"} />
      {children}
    </button>
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
  // The one on screen a little wider than the rest.
  const grow = (on: boolean, max: string, maxOn: string) => (on ? `flex-[1.5_1_0%] ${maxOn}` : `flex-[1_1_0%] ${max}`);
  // A mark with its name beside it (ABS) takes more of the row.
  const growNamed = (on: boolean) => (on ? "flex-[1.9_1_0%] max-w-[13.5rem]" : "flex-[1.45_1_0%] max-w-[11rem]");

  return (
    <div
      role="group"
      aria-label={creative ? "Creative work" : "Projects"}
      // Clear of the screen's edge as the slides are, and of the band's
      // pixelated seam on the other side.
      className={`flex h-full w-full min-w-0 items-center gap-1 sm:gap-1.5 ${
        creative ? "flex-row-reverse pl-6 pr-3 sm:pr-8 lg:pl-10 lg:pr-[5vw]" : "pl-3 pr-6 sm:pl-8 lg:pl-[5vw] lg:pr-10"
      }`}
    >
      {/* The side's name, where there is room — the left's only: the right's
          pills need the room for their names, and the band says "Creative"
          beside them anyway. */}
      {!creative && <span className={`${typeVoiceClass("logic", "meta")} hidden shrink-0 px-2 text-[0.56rem] tracking-[0.3em] text-white/55 xl:inline`}>Projects</span>}
      {items.map((it) => {
        const on = it.id === activeId;
        if (creative) {
          return (
            <Pill key={it.id} side="creative" on={on} label={it.short} onClick={() => onGo(it.id)} className={`${on ? "flex-[1.25_1_auto]" : "flex-[1_1_auto]"} max-w-[17rem] px-2 sm:px-4`}>
              <span className="relative flex min-w-0 items-center justify-center gap-2">
                {it.sectionId && <CreativeIcon section={it.sectionId} className="h-4 w-4 shrink-0" />}
                <span className="face-creative truncate text-[0.78rem] font-bold leading-none max-sm:hidden">{it.short}</span>
              </span>
            </Pill>
          );
        }
        return (
          <Pill key={it.id} side="logic" on={on} label={it.short} onClick={() => onGo(it.id)} className={INK[it.id]?.name ? growNamed(on) : grow(on, "max-w-[8.5rem]", "max-w-[11.5rem]")}>
            {it.mark ? (
              <Mark src={it.mark} ink={INK[it.id]} on={on} />
            ) : (
              <span className="font-graff relative truncate px-2 text-[0.5rem] uppercase tracking-[0.1em] sm:text-[0.62rem]">{it.short}</span>
            )}
          </Pill>
        );
      })}
      {!creative && (
        <Pill
          side="logic"
          on={activeId === ALL_PROJECTS_ID}
          label="All Projects"
          onClick={() => onGo(ALL_PROJECTS_ID)}
          className={`${grow(activeId === ALL_PROJECTS_ID, "max-w-[8.5rem]", "max-w-[11.5rem]")} px-2 sm:px-3`}
        >
          <span className="font-graff relative flex items-center gap-1 whitespace-nowrap text-[0.5rem] uppercase tracking-[0.14em] sm:text-[0.62rem] sm:tracking-[0.18em]">
            <span className="max-sm:sr-only">See all</span>
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </Pill>
      )}
    </div>
  );
}
