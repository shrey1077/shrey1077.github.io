"use client";

/**
 * PersonalProjectsSlide — Personal Projects, the right side's fourth slide
 * (owner, 2026-10-26: "move Extincts Project to 4th slide with all my art,
 * publications all on the 4th slide as tabs, the tab we click will show in
 * main preview window that keeps on pixelating around the corners. title for
 * this slide will be Personal Projects").
 *
 * Three tabs over one window — the three rooms that were slides of their own
 * until then (ExtinctsSlide, ArtSlide and WritingsSlide, kept, unused):
 *   · THE EXTINCTS PROJECT — the council film, scrubbed by the pointer as on
 *     its slide (FilmScrub), and the project in a line;
 *   · ARTS & CRAFTS — every piece in turn, its collection named;
 *   · WRITINGS & PUBLICATIONS — the six writings' first pages in turn, each
 *     named.
 * A tab picked comes in over the last in squares (usePixelPresence), and the
 * window's corners never settle: squares of the page's white blink in and
 * out over them, a few in paint at the edge (PixelCorners). The way into the
 * picked project stands in the corner, where every right slide keeps it.
 */

import { useContext, useEffect, useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { NearContext } from "@/components/home/nearness";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";
import { FilmScrub, type FilmCut } from "@/components/home/FilmScrub";
import type { ArtThumb } from "@/components/home/ArtSlide";
import type { WritingPage } from "@/components/home/WritingsSlide";
import { PERSONAL_PROJECTS, SIX_WRITINGS } from "@/constants/showcase";
import { PUBLICATIONS } from "@/constants/publications";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;
/** The Extincts slide's council film (ExtinctsSlide's COUNCIL). */
const COUNCIL: FilmCut = { dir: "/content/extincts/council", frames: 25, w: 1920, h: 1080, big: 1280, small: 960 };
/** How long each piece or page holds in the window. */
const TURN_MS = 3200;

type Tab = "the-extincts-project" | "arts-and-crafts" | "writings";
const TABS: Tab[] = ["the-extincts-project", "arts-and-crafts", "writings"];

/** The window's four corners, eaten and given back by squares. */
function PixelCorners() {
  const N = 5;
  const corners = [
    { key: "tl", pos: "left-0 top-0", flip: [1, 1] },
    { key: "tr", pos: "right-0 top-0", flip: [-1, 1] },
    { key: "bl", pos: "left-0 bottom-0", flip: [1, -1] },
    { key: "br", pos: "right-0 bottom-0", flip: [-1, -1] },
  ];
  return (
    <>
      {corners.map((c, ci) => (
        <span
          key={c.key}
          aria-hidden
          className={`pointer-events-none absolute z-20 grid ${c.pos}`}
          style={{
            gridTemplateColumns: `repeat(${N}, var(--px))`,
            transform: `scale(${c.flip[0]}, ${c.flip[1]})`,
          }}
        >
          {Array.from({ length: N * N }, (_, k) => {
            const i = k % N;
            const j = Math.floor(k / N);
            const d = i + j; // 0 at the very corner
            if (d >= N) return <span key={k} />;
            const solid = d < 2;
            const edge = d === N - 1;
            const paint = edge && hash(i + ci * 7, j) > 0.55;
            return (
              <span
                key={k}
                className={`block size-[var(--px)] ${solid ? "" : "pixel-blink"}`}
                style={
                  {
                    backgroundColor: paint ? RAINBOW[(i + j + ci * 2) % RAINBOW.length] : "#fff",
                    "--blink": `${(1.1 + hash(i, j + ci) * 1.6).toFixed(2)}s`,
                    "--delay": `${(-hash(j + ci, i) * 2).toFixed(2)}s`,
                  } as unknown as React.CSSProperties
                }
              />
            );
          })}
        </span>
      ))}
    </>
  );
}

/** Pictures in turn, each over the last. `open`: its tab is the open one —
 *  a picture's squares set it visible outright, which would show it
 *  through a closed tab (as AiSlide's app shots); `on`: and turning. */
function Turning({ items, open, on, reduceMotion }: { items: { src: string; name: string; fit?: "contain" | "cover" }[]; open: boolean; on: boolean; reduceMotion: boolean }) {
  const near = useContext(NearContext);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!on || reduceMotion || items.length < 2) return;
    const t = window.setInterval(() => setK((v) => (v + 1) % items.length), TURN_MS);
    return () => window.clearInterval(t);
  }, [on, reduceMotion, items.length]);
  return (
    <>
      {items.map((it, i) => (
        <Pane key={it.src} shown={open && i === k} load={near && Math.abs(i - k) <= 1} src={it.src} fit={it.fit ?? "contain"} reduceMotion={reduceMotion} />
      ))}
      <p className="font-helv absolute bottom-3 right-4 z-10 rounded-full bg-white/85 px-3 py-1 text-[0.72rem] text-neutral-800 ring-1 ring-neutral-900/10" aria-live="polite">
        {items[k]?.name} <span className="text-neutral-400">· {k + 1} / {items.length}</span>
      </p>
    </>
  );
}

function Pane({ shown, load, src, fit, reduceMotion }: { shown: boolean; load: boolean; src: string; fit: "contain" | "cover"; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 14, duration: 0.6, reduceMotion });
  return (
    <div ref={ref} className={`absolute inset-0 ${shown ? "" : "invisible"}`} style={{ zIndex: shown ? 2 : 1 }}>
      {load && (
        // eslint-disable-next-line @next/next/no-img-element -- a slide-size copy, at the window's size
        <img src={src} alt="" decoding="async" className={`block h-full w-full ${fit === "cover" ? "object-cover" : "object-contain p-[clamp(0.75rem,2.5vw,2rem)]"}`} />
      )}
    </div>
  );
}

export function PersonalProjectsSlide({
  thumbs,
  covers,
  live,
  reduceMotion,
}: {
  thumbs: ArtThumb[];
  covers: Record<string, WritingPage[]>;
  live: boolean;
  reduceMotion: boolean;
}) {
  const [tab, setTab] = useState<Tab>("the-extincts-project");
  const extinctsRef = usePixelPresence<HTMLDivElement>(tab === "the-extincts-project", { cell: 14, duration: 0.55, reduceMotion });
  const artRef = usePixelPresence<HTMLDivElement>(tab === "arts-and-crafts", { cell: 14, duration: 0.55, reduceMotion });
  const writingsRef = usePixelPresence<HTMLDivElement>(tab === "writings", { cell: 14, duration: 0.55, reduceMotion });
  const project = PERSONAL_PROJECTS.find((p) => p.id === tab)!;
  const EXTINCTS = PERSONAL_PROJECTS.find((p) => p.id === "the-extincts-project")!;
  const art = thumbs.map((t) => ({ src: t.src, name: t.collection }));
  const pages = SIX_WRITINGS.flatMap((slug) => {
    const first = covers[slug]?.[0];
    const title = PUBLICATIONS.find((p) => p.slug === slug)?.title ?? slug;
    return first ? [{ src: first.src, name: title }] : [];
  });

  return (
    <section aria-label="Personal Projects" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        <div className="mb-3 shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={META}>AI Design · 04 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">Personal Projects</h2>
        </div>
        {/* The tabs: pills, the picked one dark. */}
        <div role="tablist" aria-label="Personal projects" className="mb-2.5 flex shrink-0 items-stretch gap-1.5 sm:gap-2">
          {TABS.map((id) => {
            const p = PERSONAL_PROJECTS.find((x) => x.id === id)!;
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`pp-tab-${id}`}
                aria-selected={on}
                aria-controls="pp-window"
                onClick={() => setTab(id)}
                className={`min-w-0 rounded-full px-4 py-2 text-left ring-1 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 max-sm:flex-1 max-sm:px-2 max-sm:text-center sm:px-5 sm:py-2.5 ${
                  on ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white/85 text-neutral-900 ring-neutral-900/10 hover:bg-white"
                }`}
              >
                <span className="face-creative block truncate text-[clamp(0.8rem,1.5vw,1.15rem)] font-bold leading-tight max-sm:line-clamp-2 max-sm:whitespace-normal max-sm:leading-[1.1]">{p.short}</span>
                <span className={`${META} mt-0.5 block truncate ${on ? "!text-white/55" : ""} max-sm:hidden [@media(max-height:31.25rem)]:hidden`}>{p.sector}</span>
              </button>
            );
          })}
        </div>
        {/* The window, its corners pixelating. */}
        <div
          id="pp-window"
          role="tabpanel"
          aria-labelledby={`pp-tab-${tab}`}
          className="relative min-h-0 flex-1 overflow-hidden bg-neutral-100 ring-1 ring-neutral-900/[0.08] [--px:clamp(8px,1.3vw,16px)]"
        >
          <div ref={extinctsRef} className={`absolute inset-0 bg-neutral-950 ${tab === "the-extincts-project" ? "" : "invisible"}`} aria-hidden={tab !== "the-extincts-project"}>
            <FilmScrub cut={COUNCIL} live={live && tab === "the-extincts-project"} reduceMotion={reduceMotion} fit="cover" focus={{ x: 0.5, y: 0.35 }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-[clamp(1rem,2.5vw,2rem)] pt-16">
              <p className={`${META} !text-white/60`}>{EXTINCTS.role}</p>
              <p className="face-creative mt-1 text-[clamp(1.3rem,3vw,2.4rem)] font-bold leading-none text-white">The Extincts Project</p>
              <p className="font-helv mt-2 max-w-xl text-[clamp(0.74rem,1.1vw,0.92rem)] leading-snug text-white/80">
                {EXTINCTS.sector}: three reports, field trips to Pradhyuman Zoo, Gir and Fudam, and six stories, from The Last Dodo to The First Meeting.
              </p>
            </div>
          </div>
          <div ref={artRef} className={`absolute inset-0 ${tab === "arts-and-crafts" ? "" : "invisible"}`} aria-hidden={tab !== "arts-and-crafts"}>
            <Turning items={art} open={tab === "arts-and-crafts"} on={live && tab === "arts-and-crafts"} reduceMotion={reduceMotion} />
          </div>
          <div ref={writingsRef} className={`absolute inset-0 ${tab === "writings" ? "" : "invisible"}`} aria-hidden={tab !== "writings"}>
            <Turning items={pages} open={tab === "writings"} on={live && tab === "writings"} reduceMotion={reduceMotion} />
          </div>
          <PixelCorners />
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href={project.report.href}>
          {project.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
