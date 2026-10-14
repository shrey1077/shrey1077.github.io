"use client";

/**
 * AiSlide — AI Projects on the right side: two folders (owner, 2026-10-15).
 *
 *   · AI VIDEO LIBRARY — opens into a player: the films' names down a narrow
 *     column on the left (15% of the width), the film playing in the rest.
 *     Empty for now (owner's call): the column says so and the screen waits.
 *   · AGENTS — opens into the AI identities the owner is building for
 *     personal use: Alfred, Donna, Ray, Andy and Dr. House, each with an
 *     introduction of about a hundred words (constants/agents.ts), chosen
 *     the same way — names on the left, the one chosen on the right.
 * Both open over the slide (SlidePanel) and fit the screen whole. The button
 * in the corner says the full library is still to come.
 */

import { useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { SlidePanel } from "@/components/home/SlidePanel";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";
import { AGENTS } from "@/constants/agents";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

/** Films for the library: none yet. Add { title, src, poster? } entries. */
const VIDEOS: { title: string; src: string; poster?: string }[] = [];

type Folder = "videos" | "agents" | null;

/** A folder, drawn: a tab and a body, its front edge in blinking paint. */
function FolderMark({ seed }: { seed: number }) {
  return (
    <span aria-hidden className="relative block aspect-[5/4] w-[clamp(5.5rem,20vmin,13rem)]">
      <span className="absolute left-0 top-0 h-[18%] w-[42%] rounded-t-md bg-neutral-900 transition-colors duration-200 group-hover:bg-white" />
      <span className="absolute inset-x-0 bottom-0 top-[12%] overflow-hidden rounded-md rounded-tl-none bg-neutral-900 transition-colors duration-200 group-hover:bg-white">
        <span className="absolute inset-x-[10%] bottom-[14%] flex gap-[6%]">
          {Array.from({ length: 6 }, (_, i) => (
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
    // Names down the left on a landscape screen; across the top on a portrait
    // one, so the hundred words get the full width.
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)] gap-3 landscape:grid-cols-[minmax(6.5rem,22%)_minmax(0,1fr)] landscape:grid-rows-1 sm:gap-5">
      <div className="flex min-h-0 flex-wrap gap-1.5 border-b border-neutral-900/10 pb-3 landscape:flex-col landscape:flex-nowrap landscape:border-b-0 landscape:border-r landscape:pb-0 landscape:pr-3">
        <p className={`${META} w-full`}>Agents</p>
        {AGENTS.map((g, k) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setI(k)}
            aria-current={k === i ? "true" : undefined}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
              k === i ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900/5"
            }`}
          >
            <span aria-hidden className="block h-2 w-2 shrink-0" style={{ backgroundColor: RAINBOW[(k * 2) % RAINBOW.length] }} />
            <span className="face-creative truncate text-[0.86rem] font-bold">{g.name}</span>
          </button>
        ))}
      </div>
      <article className="flex min-h-0 flex-col justify-center gap-2 overflow-hidden">
        <p className={META}>{a.role}</p>
        <h4 className="face-creative text-[clamp(1.5rem,3.6vw,3rem)] font-bold leading-none text-neutral-900">{a.name}</h4>
        <p className="font-helv max-w-2xl text-[clamp(0.74rem,1.25vw,0.98rem)] leading-snug text-neutral-700 landscape:leading-relaxed">{a.intro}</p>
      </article>
    </div>
  );
}

export function AiSlide({ reduceMotion }: { reduceMotion: boolean }) {
  const [folder, setFolder] = useState<Folder>(null);
  const close = () => setFolder(null);
  const folders: [Exclude<Folder, null>, string, string][] = [
    ["videos", "AI Video Library", VIDEOS.length ? `${VIDEOS.length} films` : "Coming soon"],
    ["agents", "Agents", `${AGENTS.length} identities`],
  ];
  return (
    <section aria-label="AI Projects" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        <div className="shrink-0">
          <p className={META}>Creative · 03 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">AI Projects</h2>
        </div>
        <ul className="flex min-h-0 flex-1 items-center justify-center gap-[clamp(1.5rem,8vw,7rem)]">
          {folders.map(([id, name, sub], k) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setFolder(id)}
                aria-haspopup="dialog"
                className="group flex flex-col items-center gap-3 rounded-2xl p-3 outline-none transition-colors duration-200 hover:bg-neutral-950 focus-visible:bg-neutral-950 sm:p-5"
              >
                <FolderMark seed={k + 1} />
                <span className="text-center">
                  <span className="face-creative block text-[clamp(0.95rem,1.8vw,1.4rem)] font-bold leading-tight text-neutral-900 transition-colors group-hover:text-white group-focus-visible:text-white">
                    {name}
                  </span>
                  <span className={`${META} mt-1 block transition-colors group-hover:text-white/60 group-focus-visible:text-white/60`}>{sub}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative">Full Library — Coming Soon</PixelButton>
      </div>
      <SlidePanel open={folder === "videos"} onClose={close} side="creative" eyebrow="AI Projects · Folder 1" title="AI Video Library" reduceMotion={reduceMotion}>
        <VideoLibrary />
      </SlidePanel>
      <SlidePanel open={folder === "agents"} onClose={close} side="creative" eyebrow="AI Projects · Folder 2" title="Agents" reduceMotion={reduceMotion}>
        <Agents />
      </SlidePanel>
    </section>
  );
}
