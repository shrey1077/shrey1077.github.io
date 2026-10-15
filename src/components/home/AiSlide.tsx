"use client";

/**
 * AiSlide — AI Projects on the right side: two folders (owner, 2026-10-15).
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
 */

import { useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";
import { AGENTS } from "@/constants/agents";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

/** Films for the library: none yet. Add { title, src, poster? } entries. */
const VIDEOS: { title: string; src: string; poster?: string }[] = [];

type Folder = "videos" | "agents";

/** A folder, drawn small: a tab and a body, its front edge in blinking
 *  paint. Light on the dark (closed) tab, dark on the open one. */
function FolderMark({ seed, open }: { seed: number; open: boolean }) {
  const ink = open ? "bg-neutral-900" : "bg-white";
  return (
    <span aria-hidden className="relative block aspect-[5/4] w-[clamp(1.6rem,3.2vmin,2.2rem)] shrink-0">
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
              className={`truncate rounded-md px-2 py-1.5 text-left text-[0.78rem] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
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
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 portrait:gap-1.5 portrait:px-1.5 [@media(max-height:31.25rem)]:py-0 ${
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

export function AiSlide({ reduceMotion }: { reduceMotion: boolean }) {
  const [folder, setFolder] = useState<Folder>("videos");
  const videosRef = usePixelPresence<HTMLDivElement>(folder === "videos", { cell: 10, duration: 0.5, reduceMotion });
  const agentsRef = usePixelPresence<HTMLDivElement>(folder === "agents", { cell: 10, duration: 0.5, reduceMotion });
  const folders: [Folder, string, string][] = [
    ["videos", "AI Video Library", VIDEOS.length ? `${VIDEOS.length} films` : "Coming soon"],
    ["agents", "Agents", `${AGENTS.length} identities`],
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
        {/* The folders' tabs, then the open folder — the tab it hangs from
            joins it, as a folder's would. */}
        <div role="tablist" aria-label="AI Projects folders" className="flex shrink-0 items-end gap-1.5">
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
                className={`relative flex min-w-0 items-center gap-2.5 rounded-t-xl px-3 py-2 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/40 sm:px-4 sm:py-2.5 ${
                  open
                    ? "z-[1] -mb-px bg-white text-neutral-900 shadow-[0_-1px_0_0_rgba(0,0,0,0.08),1px_0_0_0_rgba(0,0,0,0.08),-1px_0_0_0_rgba(0,0,0,0.08)]"
                    : "bg-neutral-950 text-white hover:bg-neutral-800"
                }`}
              >
                <FolderMark seed={k + 1} open={open} />
                <span className="min-w-0">
                  <span className="face-creative block truncate text-[clamp(0.85rem,1.5vw,1.15rem)] font-bold leading-tight">{name}</span>
                  <span className={`${META} mt-0.5 block truncate ${open ? "" : "!text-white/55"} [@media(max-height:31.25rem)]:hidden`}>{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl rounded-tl-none bg-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08]">
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
        </div>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative">Full Library — Coming Soon</PixelButton>
      </div>
    </section>
  );
}
