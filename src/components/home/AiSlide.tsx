"use client";

/**
 * AiSlide — AI Projects on the right side: two folders (owner, 2026-10-15).
 * ⚠ UNUSED SINCE 2026-10-26: its three folders became slides of their own
 * (VideoLibrarySlide, AgentsSlide, AppsSlide — the last renders this file's
 * Apps). Kept whole.
 * OPEN ON THE SLIDE since the next round, the same day (owner: "expand the
 * folders, show first folder expanded, and option to switch to the other
 * one"): they no longer open over it. Two folder tabs along the top; the
 * first, the Video Library, is open when the slide arrives, and a tab
 * switches the open folder over, in squares (usePixelPresence).
 *
 *   · AI VIDEO LIBRARY — opens into a player: the films' names down a narrow
 *     column on the left (15% of the width), the film playing in the rest.
 *     Empty for now (owner's call): the column says so and the screen waits.
 *   · AGENTS — opens into the AI identities the owner is building for
 *     personal use: Alfred, Donna, Ray, Andy and Dr. House, each with an
 *     introduction of about a hundred words (constants/agents.ts), chosen
 *     the same way — names on the left, the one chosen on the right.
 * Both fit the slide whole. The button in the corner says the full library
 * is still to come.
 *
 * THREE FOLDERS since 2026-10-17 (owner: "in AI projects add Cerci The
 * CERtificate Creation Interface, and the netlify link for H3len in ai apps
 * (a third tab, and AI video library as third tab)"): Agents, then
 *   · AI APPS — the two tools built for Tata IIS, as band 08 of its page shows
 *     them (TATA_TOOLS, TATA_TOOL_SHOTS): the names on the left; the chosen
 *     one's name spelled out, its screenshots turning in an app window, a line
 *     on what it does and, for H3LEN, the way into it live.
 * and the Video Library last. Agents is the one open when the slide arrives.
 */

import { useContext, useEffect, useRef, useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";
import { NearContext } from "@/components/home/nearness";
import { AGENTS } from "@/constants/agents";
import { TATA_TOOLS } from "@/constants/tataStory";
import { TATA_TOOL_SHOTS } from "@/constants/tataTools";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

/** Films for the library: none yet. Add { title, src, poster? } entries. */
const VIDEOS: { title: string; src: string; poster?: string }[] = [];

/** The apps. `full` spells the name out; the [bracketed] letters make it.
 *  ⚠ H3LEN's site is behind Netlify's private-site sign-in (still so on
 *  2026-10-17: a 401) — the link works only for invited accounts until the
 *  owner switches that off. */
const APPS = [
  { id: "cerci", name: "Cerci", full: "The [CER]tificate [C]reation [I]nterface", kind: "Desktop app · Tata IIS", link: null },
  { id: "h3len", name: "H3LEN", full: "[H]yper [3]D [L]andscape [EN]vironment", kind: "3D web app · Tata IIS", link: "Explore in 3D" },
] as const;
/** How long each screenshot holds. */
const SHOT_MS = 3600;

type Folder = "agents" | "apps" | "videos";

/** A folder, drawn small: a tab and a body, its front edge in blinking
 *  paint. Light on the dark (open) tab, dark on the closed ones. */
function FolderMark({ seed, open, className = "" }: { seed: number; open: boolean; className?: string }) {
  const ink = open ? "bg-white" : "bg-neutral-900";
  return (
    <span aria-hidden className={`relative block aspect-[5/4] w-[clamp(1.6rem,3.2vmin,2.2rem)] shrink-0 ${className}`}>
      <span className={`absolute left-0 top-0 h-[18%] w-[42%] rounded-t-[3px] ${ink}`} />
      <span className={`absolute inset-x-0 bottom-0 top-[12%] overflow-hidden rounded-[3px] rounded-tl-none ${ink}`}>
        <span className="absolute inset-x-[12%] bottom-[16%] flex gap-[8%]">
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className="pixel-blink block aspect-square flex-1"
              style={
                {
                  backgroundColor: RAINBOW[(i + seed * 3) % RAINBOW.length],
                  "--blink": `${(1.2 + hash(i, seed) * 1.8).toFixed(2)}s`,
                  "--delay": `${(-hash(seed, i) * 3).toFixed(2)}s`,
                } as unknown as React.CSSProperties
              }
            />
          ))}
        </span>
      </span>
    </span>
  );
}

function VideoLibrary() {
  const [i, setI] = useState(0);
  const film = VIDEOS[i];
  return (
    <div className="grid h-full grid-cols-[minmax(6.5rem,15%)_minmax(0,1fr)] gap-3">
      <div className="flex min-h-0 flex-col gap-1.5 border-r border-neutral-900/10 pr-3">
        <p className={META}>Films</p>
        {VIDEOS.length === 0 ? (
          <p className="font-helv text-[0.78rem] leading-snug text-neutral-500">Coming soon.</p>
        ) : (
          VIDEOS.map((v, k) => (
            <button
              key={v.src}
              type="button"
              onClick={() => setI(k)}
              aria-current={k === i ? "true" : undefined}
              className={`truncate rounded-full px-3 py-1.5 text-left text-[0.78rem] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                k === i ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900/5"
              }`}
            >
              {v.title}
            </button>
          ))
        )}
      </div>
      <div className="relative min-h-0 overflow-hidden rounded-xl bg-neutral-950">
        {film ? (
          <video key={film.src} src={film.src} poster={film.poster} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <p className="face-creative text-[clamp(1.4rem,3vw,2.6rem)] font-bold leading-none text-white">Coming soon.</p>
              <p className="font-helv mt-2 text-xs text-white/55">Films and motion made with AI. The reel is on its way.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Agents() {
  const [i, setI] = useState(0);
  const a = AGENTS[i];
  return (
    // Names down the left on a landscape screen; across the top, in one row,
    // on a portrait one, so the hundred words get the full width. On a short
    // screen (a phone on its side) the names close up so all five fit.
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 landscape:grid-cols-[minmax(6.5rem,22%)_minmax(0,1fr)] landscape:grid-rows-1 sm:gap-5">
      <div className="flex min-h-0 flex-wrap gap-1.5 border-b border-neutral-900/10 pb-3 portrait:gap-1 [@media(max-height:31.25rem)]:gap-0 landscape:flex-col landscape:flex-nowrap landscape:border-b-0 landscape:border-r landscape:pb-0 landscape:pr-3">
        <p className={`${META} w-full portrait:sr-only [@media(max-height:31.25rem)]:sr-only`}>Agents</p>
        {AGENTS.map((g, k) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setI(k)}
            aria-current={k === i ? "true" : undefined}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 portrait:gap-1.5 portrait:px-2 [@media(max-height:31.25rem)]:py-0 ${
              k === i ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900/5"
            }`}
          >
            <span aria-hidden className="block h-2 w-2 shrink-0" style={{ backgroundColor: RAINBOW[(k * 2) % RAINBOW.length] }} />
            <span className="face-creative truncate text-[0.86rem] font-bold portrait:text-[0.8rem] [@media(max-height:31.25rem)]:text-[0.76rem]">{g.name}</span>
          </button>
        ))}
      </div>
      <article className="flex min-h-0 flex-col justify-center gap-2 overflow-hidden [@media(max-height:42rem)]:gap-1 [@media(max-height:31.25rem)]:justify-start [@media(max-height:31.25rem)]:gap-1">
        <p className={META}>{a.role}</p>
        <h4 className="face-creative text-[clamp(1.5rem,3.6vw,3rem)] font-bold leading-none text-neutral-900 [@media(max-height:42rem)]:text-[1.3rem] [@media(max-height:31.25rem)]:text-[1.15rem]">{a.name}</h4>
        <p className="font-helv max-w-2xl text-[clamp(0.74rem,1.25vw,0.98rem)] leading-snug text-neutral-700 landscape:leading-relaxed [@media(max-height:42rem)]:text-[0.7rem] [@media(max-height:42rem)]:leading-[1.3] [@media(max-height:31.25rem)]:text-[0.68rem] [@media(max-height:31.25rem)]:landscape:leading-snug">{a.intro}</p>
      </article>
    </div>
  );
}

/** "The [CER]tificate…" → the bracketed letters in bold. */
function Spelled({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, k) =>
        part.startsWith("[") ? (
          <b key={k} className="font-bold text-neutral-900">
            {part.slice(1, -1)}
          </b>
        ) : (
          <span key={k}>{part}</span>
        ),
      )}
    </>
  );
}

/** One screenshot of the turn, coming in over the last in squares. */
function Shot({ src, thumb, alt, shown, top, load, reduceMotion }: { src: string; thumb: string; alt: string; shown: boolean; top: boolean; load: boolean; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 10, duration: 0.6, reduceMotion });
  return (
    <div ref={ref} aria-hidden={!top} className={`absolute inset-0 ${shown ? "" : "invisible"}`} style={{ zIndex: top ? 2 : 1 }}>
      {load && (
        // eslint-disable-next-line @next/next/no-img-element -- a screenshot, at the window's size
        <img src={thumb} srcSet={`${thumb} 960w, ${src} 2400w`} sizes="(orientation: landscape) 50vw, 92vw" alt={top ? alt : ""} decoding="async" className="block h-full w-full object-cover" />
      )}
    </div>
  );
}

/** An app's screenshots in a bare app window, turning while `turning`.
 *  `inView`: its folder is the open one — a shot's squares set it visible
 *  outright, which would show it through a closed folder. */
function AppWindow({ id, name, inView, turning, reduceMotion }: { id: (typeof APPS)[number]["id"]; name: string; inView: boolean; turning: boolean; reduceMotion: boolean }) {
  const near = useContext(NearContext);
  const shots = TATA_TOOL_SHOTS[id];
  const [{ cur, prev }, setTurn] = useState<{ cur: number; prev: number | null }>({ cur: 0, prev: null });
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (!turning || hold || reduceMotion || shots.length < 2) return;
    const t = window.setInterval(() => setTurn((s) => ({ cur: (s.cur + 1) % shots.length, prev: s.cur })), SHOT_MS);
    return () => window.clearInterval(t);
  }, [turning, hold, reduceMotion, shots.length]);
  useEffect(() => {
    if (prev === null) return;
    const t = window.setTimeout(() => setTurn((s) => (s.prev === prev ? { ...s, prev: null } : s)), 800);
    return () => window.clearTimeout(t);
  }, [prev]);
  const next = (cur + 1) % shots.length;
  return (
    // As large as its box allows at 16:9, with the window bar above and the
    // dashes below (2.5rem between them) — on a portrait screen, the width.
    <div className="flex items-center [container-type:inline-size] [grid-area:w] landscape:min-h-0 landscape:[container-type:size]">
      <figure className="w-[min(100cqw,calc((100cqh-2.5rem)*16/9))]" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        <div className="overflow-hidden rounded-lg bg-white shadow-[0_18px_44px_-22px_rgba(0,0,0,0.45)] ring-1 ring-neutral-900/15">
          {/* A bare app window bar — three dots, nothing claimed. */}
          <span aria-hidden className="flex h-5 items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-2.5">
            {[0, 1, 2].map((d) => (
              <span key={d} className="block size-1.5 rounded-full bg-neutral-300" />
            ))}
          </span>
          <div className="relative aspect-video w-full bg-neutral-100">
            {shots.map((s, k) => (
              <Shot key={s.url} src={s.url} thumb={s.thumb} alt={`${name} — ${s.name}`} shown={inView && (k === cur || k === prev)} top={k === cur} load={near && (k === cur || k === prev || k === next)} reduceMotion={reduceMotion} />
            ))}
          </div>
        </div>
        <figcaption className="mt-2 flex h-3 items-center gap-3">
          <span aria-hidden className="flex max-w-[12rem] flex-1 gap-1.5">
            {shots.map((s, k) => (
              <span key={s.url} className={`block h-[3px] flex-1 rounded-full transition-colors duration-500 ${k === cur ? "bg-neutral-800" : "bg-neutral-300"}`} />
            ))}
          </span>
          <span className={`${META} truncate !tracking-[0.18em]`} aria-live="polite">
            {shots[cur].name}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

export function Apps({ inView, turning, reduceMotion }: { inView: boolean; turning: boolean; reduceMotion: boolean }) {
  const [i, setI] = useState(0);
  const app = APPS[i];
  const tool = TATA_TOOLS.find((t) => t.id === app.id)!;
  const href = "href" in tool ? tool.href : null;
  // A small phone has less room than the app needs: there the column
  // scrolls by itself (and takes the finger while it can).
  const artRef = useRef<HTMLElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = artRef.current;
    if (!el) return;
    const look = () => setScrolls(el.scrollHeight > el.clientHeight + 1);
    look();
    const ro = new ResizeObserver(look);
    ro.observe(el);
    Array.from(el.children).forEach((k) => ro.observe(k));
    return () => ro.disconnect();
  }, [i]);
  return (
    // As Agents: the names down the left on a landscape screen, across the
    // top on a portrait one.
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 landscape:grid-cols-[minmax(6.5rem,22%)_minmax(0,1fr)] landscape:grid-rows-1 sm:gap-5">
      <div className="flex min-h-0 flex-wrap gap-1.5 border-b border-neutral-900/10 pb-3 portrait:gap-1 [@media(max-height:31.25rem)]:gap-0 landscape:flex-col landscape:flex-nowrap landscape:border-b-0 landscape:border-r landscape:pb-0 landscape:pr-3">
        <p className={`${META} w-full portrait:sr-only [@media(max-height:31.25rem)]:sr-only`}>Apps</p>
        {APPS.map((g, k) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setI(k)}
            aria-current={k === i ? "true" : undefined}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 portrait:gap-1.5 portrait:px-2 [@media(max-height:31.25rem)]:py-0.5 ${
              k === i ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900/5"
            }`}
          >
            <span aria-hidden className="block h-2 w-2 shrink-0" style={{ backgroundColor: RAINBOW[(k * 2 + 5) % RAINBOW.length] }} />
            <span className="face-creative truncate text-[0.86rem] font-bold portrait:text-[0.8rem] [@media(max-height:31.25rem)]:text-[0.76rem]">{g.name}</span>
          </button>
        ))}
      </div>
      {/* The chosen app: on a landscape screen its name and what it does in
          a column, its window the full height beside them; on a portrait
          one, name, window and words one under another. */}
      <article ref={artRef} data-own-scroll={scrolls || undefined} className="grid min-h-0 content-start gap-2 overflow-y-auto overscroll-contain [grid-template-areas:'h'_'w'_'t'] landscape:grid-cols-[minmax(10rem,34%)_minmax(0,1fr)] landscape:grid-rows-[auto_minmax(0,1fr)] landscape:content-stretch landscape:gap-x-5 landscape:[grid-template-areas:'h_w'_'t_w'] sm:gap-y-3 [@media(max-height:31.25rem)]:gap-y-1">
        <header className="[grid-area:h]">
          <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>{app.kind}</p>
          <h4 className="face-creative mt-1 text-[clamp(1.5rem,3.6vw,3rem)] font-bold leading-none text-neutral-900 [@media(max-height:42rem)]:text-[1.3rem] [@media(max-height:31.25rem)]:mt-0.5 [@media(max-height:31.25rem)]:text-[1.15rem]">{app.name}</h4>
          <p className="font-helv mt-1 text-[clamp(0.78rem,1.3vw,1rem)] leading-snug text-neutral-500 [@media(max-height:31.25rem)]:text-[0.7rem]">
            <Spelled text={app.full} />
          </p>
        </header>
        <AppWindow key={app.id} id={app.id} name={app.name} inView={inView} turning={turning} reduceMotion={reduceMotion} />
        <div className="flex flex-col gap-3 [grid-area:t] landscape:min-h-0 [@media(max-height:31.25rem)]:gap-1">
          <p className="font-helv text-[clamp(0.74rem,1.2vw,0.95rem)] leading-snug text-neutral-700 landscape:leading-relaxed [@media(max-height:42rem)]:text-[0.7rem] [@media(max-height:42rem)]:leading-[1.35] [@media(max-height:31.25rem)]:text-[0.64rem] [@media(max-height:31.25rem)]:landscape:leading-[1.25]">{tool.text}</p>
          {href && app.link && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${META} self-start whitespace-nowrap rounded-full !text-neutral-900 px-3 py-1.5 ring-1 ring-neutral-900/25 transition-colors hover:bg-neutral-950 hover:!text-white [@media(max-height:31.25rem)]:py-1`}
            >
              {app.link} <span aria-hidden>↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </article>
    </div>
  );
}

export function AiSlide({ reduceMotion, live = true }: { reduceMotion: boolean; live?: boolean }) {
  const [folder, setFolder] = useState<Folder>("agents");
  const agentsRef = usePixelPresence<HTMLDivElement>(folder === "agents", { cell: 10, duration: 0.5, reduceMotion });
  const appsRef = usePixelPresence<HTMLDivElement>(folder === "apps", { cell: 10, duration: 0.5, reduceMotion });
  const videosRef = usePixelPresence<HTMLDivElement>(folder === "videos", { cell: 10, duration: 0.5, reduceMotion });
  const folders: [Folder, string, string][] = [
    ["agents", "Agents", `${AGENTS.length} identities`],
    ["apps", "AI Apps", `${APPS.length} apps`],
    ["videos", "AI Video Library", VIDEOS.length ? `${VIDEOS.length} films` : "Coming soon"],
  ];
  return (
    <section aria-label="AI Projects" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        {/* The title — on a short screen (a phone on its side) the folders
            need the room, and the strip above names the slide anyway. */}
        <div className="mb-3 shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={META}>Creative · 03 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">AI Projects</h2>
        </div>
        {/* The folders' tabs, then the open folder. Pills, as every button
            (owner, 2026-10-18), the open one dark — as the Arts slide's. */}
        <div role="tablist" aria-label="AI Projects folders" className="mb-2.5 flex shrink-0 items-stretch gap-1.5 sm:gap-2">
          {folders.map(([id, name, sub], k) => {
            const open = folder === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`ai-tab-${id}`}
                aria-selected={open}
                aria-controls={`ai-folder-${id}`}
                onClick={() => setFolder(id)}
                className={`relative flex min-w-0 items-center gap-2.5 rounded-full px-4 py-2 text-left ring-1 max-sm:flex-1 max-sm:justify-center max-sm:text-center outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:px-5 sm:py-2.5 ${
                  open
                    ? "bg-neutral-950 text-white ring-neutral-950"
                    : "bg-white/85 text-neutral-900 ring-neutral-900/10 hover:bg-white"
                }`}
              >
                {/* On a narrow screen the three need the room: no mark, no count, and
                    a long name may take two lines. */}
                <FolderMark seed={k + 1} open={open} className="max-sm:hidden" />
                <span className="min-w-0">
                  <span className="face-creative block truncate text-[clamp(0.85rem,1.5vw,1.15rem)] font-bold leading-tight max-sm:line-clamp-2 max-sm:whitespace-normal max-sm:leading-[1.1]">{name}</span>
                  <span className={`${META} mt-0.5 block truncate ${open ? "!text-white/55" : ""} max-sm:hidden [@media(max-height:31.25rem)]:hidden`}>{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08]">
          <div
            ref={agentsRef}
            role="tabpanel"
            id="ai-folder-agents"
            aria-labelledby="ai-tab-agents"
            aria-hidden={folder !== "agents"}
            className={`absolute inset-0 p-3 sm:p-5 [@media(max-height:31.25rem)]:p-3 ${folder === "agents" ? "" : "invisible"}`}
          >
            <Agents />
          </div>
          <div
            ref={appsRef}
            role="tabpanel"
            id="ai-folder-apps"
            aria-labelledby="ai-tab-apps"
            aria-hidden={folder !== "apps"}
            className={`absolute inset-0 p-3 sm:p-5 [@media(max-height:31.25rem)]:p-3 ${folder === "apps" ? "" : "invisible"}`}
          >
            <Apps inView={folder === "apps"} turning={live && folder === "apps"} reduceMotion={reduceMotion} />
          </div>
          <div
            ref={videosRef}
            role="tabpanel"
            id="ai-folder-videos"
            aria-labelledby="ai-tab-videos"
            aria-hidden={folder !== "videos"}
            className={`absolute inset-0 p-3 sm:p-5 [@media(max-height:31.25rem)]:p-3 ${folder === "videos" ? "" : "invisible"}`}
          >
            <VideoLibrary />
          </div>
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative">Full Library — Coming Soon</PixelButton>
      </div>
    </section>
  );
}
