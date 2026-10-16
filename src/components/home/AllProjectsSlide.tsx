"use client";

/**
 * AllProjectsSlide — the left side's last room: every project, as a wall of
 * marks (owner, 2026-10-16: "Move UID and Vivid pro tech to All Projects
 * Slide (where UID is right now, and include all projects here, some were
 * removed earlier as well). include a logo grid for displaying projects").
 *
 * Each tile is a project's mark (or its name set in type, where it has none)
 * and does what that project can:
 *   · the slides' projects fly to their slide (Luzid and Kartpipe to ABS's);
 *   · Vivid ProTech and Post Grad. UID — slides until now — open their pages;
 *   · the independent commissions open their preview over the page
 *     (ProjectPreview, as on /all-works);
 *   · the chess site opens;
 *   · the marks the owner drew (the logofolio, constants/logofolio — the wall
 *     of them came off the home page earlier) go to the project they belong
 *     to, where one is on the site, and otherwise simply stand.
 * The wall is sized to its room — as many columns as give the largest tiles —
 * so it fits whole at any size, with no scroll. "View All Works" opens the
 * page that lists the commissions at length.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { ProjectPreview, type StudyPlate } from "@/components/home/ProjectPreview";
import { ABS_BRANDS, ALL_PROJECTS_ID, LOGIC_SHOWCASE, PAGE_PROJECTS, type Showcase } from "@/constants/showcase";
import type { ProjectStudy } from "@/constants/projectStudies";
import { typeVoiceClass } from "@/constants/typography";

/** An independent commission, with its plates (read on the server). */
export interface WallStudy {
  id: string;
  name: string;
  kind: string;
  logo?: string;
  study: ProjectStudy;
  plates: StudyPlate[];
}
/** A mark the owner drew (readLogofolio). */
export interface WallMark {
  slug: string;
  name: string;
  url: string;
}
export interface Wall {
  studies: WallStudy[];
  marks: WallMark[];
}

type Action = { go: string } | { href: string } | { study: WallStudy } | null;
interface Tile {
  key: string;
  name: string;
  logo?: string;
  action: Action;
}

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;
/** ABS's badge on a clear ground (the strip's sits on white). */
const ABS_LOGO = "/content/clients/abs/abs-logo.png";
/** Where the marks the owner drew belong, where it is on the site. Shown
 *  elsewhere already (on a slide's own tile, or a commission's): left out. */
const MARK_HOME: Record<string, Action> = {
  "iis-ahmedabad": { go: "tata-iis" },
  "iis-mumbai": { go: "tata-iis" },
  mycoveda: { go: "azoth-biotech" },
  mycoactive: { go: "azoth-biotech" },
  kavaka: { go: "azoth-biotech" },
  naturalist: { go: "azoth-biotech" },
  mushroomworks: { go: "azoth-biotech" },
  "puran-studios": { href: "/clients/uid" },
};
const SHOWN_ELSEWHERE = new Set(["tata-iis", "azoth-biotech", "abs", "luzid", "first-divine", "komono", "mycoveda-symbol"]);
/** The chess site — a static site of its own (constants/clients). */
const CHESS: Tile = { key: "chess", name: "Three Steps Ahead", logo: "/chess/images/logo.png", action: { href: "/chess/index.html" } };

/** The tiles' shape, width ÷ height. */
const TILE = 4 / 3;

function tilesOf(wall: Wall): Tile[] {
  const slide = (it: Showcase, go = it.id): Tile => ({
    key: it.id,
    name: it.short,
    logo: it.id === "abs" ? ABS_LOGO : it.mark,
    action: { go },
  });
  return [
    ...LOGIC_SHOWCASE.filter((it) => it.id !== ALL_PROJECTS_ID).map((it) => slide(it)),
    ...ABS_BRANDS.map((it) => slide(it, "abs")),
    ...PAGE_PROJECTS.map((it) => ({ key: it.id, name: it.short, logo: it.mark, action: { href: it.report.href ?? "/" } })),
    ...wall.studies.map((s) => ({ key: s.id, name: s.name, logo: s.logo, action: { study: s } })),
    CHESS,
    ...wall.marks.filter((m) => !SHOWN_ELSEWHERE.has(m.slug)).map((m) => ({ key: `mark-${m.slug}`, name: m.name, logo: m.url, action: MARK_HOME[m.slug] ?? null })),
  ];
}

/** How many columns give the largest tiles in a W × H room, and how large. */
function fit(n: number, w: number, h: number, gap: number) {
  let best = { cols: 1, size: 0 };
  for (let cols = 2; cols <= 12; cols++) {
    const rows = Math.ceil(n / cols);
    const tw = (w - gap * (cols - 1)) / cols;
    const th = (h - gap * (rows - 1)) / rows;
    const size = Math.min(tw, th * TILE); // the tile's width
    if (size > best.size) best = { cols, size };
  }
  return best;
}

export function AllProjectsSlide({ item, wall }: { item: Showcase; wall: Wall }) {
  const tiles = useMemo(() => tilesOf(wall), [wall]);
  const roomRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<WallStudy | null>(null);
  const [ever, setEver] = useState(false);
  if (open && !ever) setEver(true);

  useLayoutEffect(() => {
    const el = roomRef.current;
    if (!el) return;
    const read = () => setRoom({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // While a commission is open, the page's wheel and keys are its own.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.modal = "project";
    return () => {
      if (root.dataset.modal === "project") delete root.dataset.modal;
    };
  }, [open]);

  const gap = room.w < 520 ? 6 : 10;
  const { cols, size } = fit(tiles.length, room.w, room.h, gap);
  const tileH = size / TILE;
  const named = tileH > 64;

  const act = (a: Action) => {
    if (!a) return;
    if ("go" in a) window.dispatchEvent(new CustomEvent("flythrough:go", { detail: { id: a.go } }));
    else if ("study" in a) setOpen(a.study);
  };

  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame is-logic absolute inset-0 flex flex-col">
        <div className="mb-3 flex shrink-0 items-end justify-between gap-4 [@media(max-height:31.25rem)]:mb-2">
          <div>
            <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>Projects · Everything</p>
            <h2 className="face-logic mt-1 text-[clamp(1.4rem,3vw,2.6rem)] leading-none text-neutral-900 [@media(max-height:31.25rem)]:text-[1.15rem]">
              All Projects
            </h2>
          </div>
          <p className={`${META} shrink-0 tabular-nums`}>{tiles.length} marks</p>
        </div>
        {/* The wall, sized to its room. */}
        <div ref={roomRef} className="relative min-h-0 flex-1">
          {size > 0 && (
            <ul
              className="absolute inset-0 grid content-center justify-center"
              style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)`, gridAutoRows: `${tileH}px`, gap }}
            >
              {tiles.map((t) => {
                const face = (
                  <>
                    {t.logo ? (
                      <span className={`absolute ${named ? "inset-x-[14%] bottom-[30%] top-[14%]" : "inset-[12%]"}`}>
                        <Image src={t.logo} alt="" fill sizes={`${Math.round(size)}px`} className="object-contain" />
                      </span>
                    ) : (
                      <span className={`face-logic absolute inset-x-2 grid place-items-center text-center leading-tight text-neutral-900 ${named ? "bottom-[30%] top-[10%] text-[0.78rem]" : "inset-y-1 text-[0.6rem]"}`}>
                        {t.name}
                      </span>
                    )}
                    {named && (
                      <span className={`${META} absolute inset-x-2 bottom-[9%] truncate text-center !tracking-[0.14em]`}>{t.name}</span>
                    )}
                  </>
                );
                const tile =
                  "relative block h-full w-full overflow-hidden rounded-lg bg-white/85 ring-1 ring-neutral-900/10 outline-none backdrop-blur-[2px]";
                if (!t.action) {
                  return (
                    <li key={t.key} title={t.name}>
                      <span className={tile} aria-label={t.name} role="img">
                        {face}
                      </span>
                    </li>
                  );
                }
                const hover = "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900";
                return (
                  <li key={t.key} title={t.name}>
                    {"href" in t.action ? (
                      <a href={t.action.href} className={`${tile} ${hover}`} aria-label={`${t.name} — open`}>
                        {face}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => act(t.action)}
                        className={`${tile} ${hover}`}
                        aria-label={"study" in t.action ? `${t.name} — preview` : `${t.name} — go to its slide`}
                        aria-haspopup={"study" in t.action ? "dialog" : undefined}
                      >
                        {face}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* The way in to the page that lists them at length. */}
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={item.report.href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>

      {/* A commission's preview, over the page — portalled, as the slide is
          inside the Flythrough's transformed stage. Mounted only once asked
          for: the page is built ahead of time, and a portal would not match
          it when it comes alive. */}
      {ever && createPortal(<ProjectPreview study={open?.study ?? null} plates={open?.plates ?? []} onClose={() => setOpen(null)} />, document.body)}
    </section>
  );
}
