"use client";

/**
 * VideoLibrarySlide — AI Video Library, the right side's first slide (owner,
 * 2026-10-26: "First right slide will be for AI video library"). It was a
 * folder of the AI Projects slide (AiSlide) until then.
 *
 * The films come as YouTube links (owner, 2026-10-19: "dont make site heavier
 * i ll upload youtube links"): each stands as its YouTube still and loads the
 * player only when asked — nothing of YouTube's is fetched until then, and the
 * player is the privacy-enhanced one (youtube-nocookie). The names down the
 * left, the one chosen playing in the rest; on a portrait screen the names
 * across the top. Until the links come, the screen says the reel is coming.
 *
 * ADD A FILM: an entry in FILMS — its title, and the id from its link
 * (youtube.com/watch?v=ID or youtu.be/ID).
 */

import { useState } from "react";
import { PixelButton } from "@/components/home/PixelButton";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

/** The films, in order: none yet. { title: "…", youtube: "ID", note?: "…" }. */
const FILMS: { title: string; youtube: string; note?: string }[] = [];

export function VideoLibrarySlide() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const film = FILMS[i];
  return (
    <section aria-label="AI Video Library" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        <div className="mb-3 shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={META}>AI Design · 01 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">AI Video Library</h2>
        </div>
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08] sm:p-5 landscape:grid-cols-[minmax(7rem,18%)_minmax(0,1fr)] landscape:grid-rows-1 landscape:gap-5">
          <div className="flex min-h-0 flex-wrap content-start gap-1.5 border-b border-neutral-900/10 pb-3 landscape:flex-col landscape:flex-nowrap landscape:border-b-0 landscape:border-r landscape:pb-0 landscape:pr-3">
            <p className={`${META} w-full portrait:sr-only`}>Films</p>
            {FILMS.length === 0 ? (
              <p className="font-helv text-[0.78rem] leading-snug text-neutral-500">Coming soon.</p>
            ) : (
              FILMS.map((f, k) => (
                <button
                  key={f.youtube}
                  type="button"
                  onClick={() => {
                    setI(k);
                    setPlaying(null);
                  }}
                  aria-current={k === i ? "true" : undefined}
                  className={`truncate rounded-full px-3 py-1.5 text-left text-[0.8rem] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                    k === i ? "bg-neutral-900 text-white" : "text-neutral-800 hover:bg-neutral-900/5"
                  }`}
                >
                  <span className="face-creative font-bold">{f.title}</span>
                </button>
              ))
            )}
          </div>
          <div className="relative min-h-0 overflow-hidden rounded-xl bg-neutral-950">
            {film ? (
              playing === film.youtube ? (
                <iframe
                  key={film.youtube}
                  src={`https://www.youtube-nocookie.com/embed/${film.youtube}?autoplay=1&rel=0&modestbranding=1`}
                  title={film.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(film.youtube)}
                  aria-label={`Play ${film.title}`}
                  className="group absolute inset-0 grid place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own still, only once there is a film */}
                  <img src={`https://i.ytimg.com/vi/${film.youtube}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                  <span className="relative grid size-16 place-items-center rounded-full bg-white/90 text-neutral-950 shadow-lg transition-transform group-hover:scale-105">
                    <span aria-hidden className="ml-1 text-xl">▶</span>
                  </span>
                  {film.note && <span className="font-helv absolute bottom-3 left-4 text-xs text-white/80">{film.note}</span>}
                </button>
              )
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
      </div>
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative">Full Library — Coming Soon</PixelButton>
      </div>
    </section>
  );
}
