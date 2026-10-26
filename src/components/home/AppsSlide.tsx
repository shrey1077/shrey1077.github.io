"use client";

/**
 * AppsSlide — AI Apps & Software, the right side's third slide (owner,
 * 2026-10-26: "Third slide will be for AI apps and softwares"). It was a
 * folder of the AI Projects slide (AiSlide) until then; the folder's content,
 * Apps — Cerci and H3LEN, the names down the left, the one chosen in an app
 * window turning through its screenshots — is the slide's whole now.
 */

import { Apps } from "@/components/home/AiSlide";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

export function AppsSlide({ reduceMotion, live }: { reduceMotion: boolean; live: boolean }) {
  return (
    <section aria-label="AI Apps & Software" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex flex-col">
        <div className="mb-3 shrink-0 [@media(max-height:31.25rem)]:sr-only">
          <p className={META}>AI Design · 03 / 04</p>
          <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">AI Apps &amp; Software</h2>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] ring-1 ring-neutral-900/[0.08] sm:p-5 [@media(max-height:31.25rem)]:p-3">
          <Apps inView turning={live} reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  );
}
