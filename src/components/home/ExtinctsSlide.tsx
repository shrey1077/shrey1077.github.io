"use client";

/**
 * ExtinctsSlide — the right side's first slide (owner, 2026-10-15: "For
 * Extincts Project (1st and topmost of right sections) i want my snow leopard
 * character cutout on right corner, and the three reports, a 1. Story button,
 * 2. Characters, 3. AI Creations buttons on the left side of frame").
 *
 *   LANDSCAPE                                PORTRAIT (9:16)
 *   ┌─────────┬───────────────┬─────────┐    ┌───────────────────┐
 *   │ title   │               │         │    │ title             │
 *   │         │  the three    │ Himch-  │    │ the three reports │
 *   │ 1 Story │   reports     │ haya    │    ├─────────┬─────────┤
 *   │ 2 Chars │               │ (cut-   │    │ 1 Story │ Himch-  │
 *   │ 3 AI    │               │  out)   │    │ 2 Chars │ haya    │
 *   └─────────┴───────────────┴─────────┘    │ 3 AI    │         │
 *                                            └─────────┴─────────┘
 * A report opens the room's own reader (ExtinctsRoom's, untouched); the
 * three buttons open panels over the slide (SlidePanel): the six stories;
 * Himchhaya, the snow leopard — the character concept the owner sent; and
 * the AI creations, his EXMANGA character sheet so far. "View Full Project"
 * (bottom left) opens /extincts. Everything is sized to the screen — the
 * covers by a container query — so nothing ever scrolls.
 */

import { useState } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { SlidePanel } from "@/components/home/SlidePanel";
import { ExtinctsReader } from "@/components/home/ExtinctsRoom";
import { EXTINCTS_REPORTS, EXTINCTS_STORIES, type ExtinctsReport } from "@/constants/extincts";
import { EXTINCTS_REPORT_PAGES } from "@/constants/extinctsReportPages";
import { typeVoiceClass } from "@/constants/typography";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.24em]`;
const RED = "#e3262b";
const pad = (n: number) => String(n).padStart(2, "0");

/** The character the owner sent (2026-10-15): the cutout, lifted off his
 *  concept sheet, and the sheet itself. */
const CUTOUT = { src: "/content/extincts/himchhaya.webp", w: 705, h: 1227 };
const SHEET = { src: "/content/extincts/himchhaya-sheet.webp", w: 1122, h: 1402 };

type Panel = "story" | "characters" | "ai" | null;

/** The three covers side by side are this many heights wide — so one
 *  height for all three can be worked out from the width they share. */
const COVERS_WIDE = EXTINCTS_REPORTS.reduce((n, r) => {
  const c = (EXTINCTS_REPORT_PAGES[r.id] ?? [])[0];
  return n + (c ? c.w / c.h : 0);
}, 0);

function Stories() {
  return (
    <div className="flex h-full flex-col gap-3">
      <ul className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5 landscape:grid-cols-3 landscape:grid-rows-2">
        {EXTINCTS_STORIES.map((s, i) => (
          <li key={s.name} className="relative flex min-h-0 flex-col justify-between overflow-hidden rounded-xl bg-neutral-950 p-3 sm:p-4">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: RED }} />
            <span className={`${META} text-white/45`}>Story {pad(i + 1)}</span>
            <span className="block">
              <span className="font-graff block text-[0.72rem] font-bold uppercase tracking-[0.12em]" style={{ color: RED }}>
                {s.lead}
              </span>
              <span className="font-graff block text-[clamp(0.95rem,2.2vw,1.7rem)] font-bold uppercase leading-[0.95] text-white">
                {s.name}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="font-helv shrink-0 text-xs text-neutral-500">The script and the storyboards are still to come.</p>
    </div>
  );
}

function Characters() {
  const facts: [string, string][] = [
    ["Species", "Panthera uncia — the snow leopard"],
    ["Role", "Antagonist"],
    ["Theme", "Heritage · Intelligence · Control · Survival beyond extinction"],
  ];
  return (
    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-3 landscape:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] landscape:grid-rows-1">
      <div className="relative min-h-0">
        <Image src={CUTOUT.src} alt="Himchhaya, the snow leopard" fill sizes="(orientation: landscape) 30vw, 60vw" className="object-contain" />
      </div>
      <div className="flex min-h-0 flex-col justify-center gap-3">
        <p className={`${META}`} style={{ color: RED }}>
          Character concept 01 · EXMANGA
        </p>
        <p className="font-graff text-[clamp(1.4rem,3.4vw,3rem)] font-bold uppercase leading-none">
          Himchhaya <span className="text-[0.45em] tracking-[0.1em] text-neutral-400">(working name)</span>
        </p>
        <dl className="grid gap-1.5 text-[0.82rem]">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className={`${META} w-16 shrink-0 self-center text-neutral-500`}>{k}</dt>
              <dd className="text-neutral-800">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="font-helv border-l-2 pl-3 text-[0.9rem] italic text-neutral-700" style={{ borderColor: RED }}>
          “Some species go quietly. I learned to adapt.”
        </p>
        <p className="font-helv text-xs text-neutral-500">More characters are still to come.</p>
      </div>
    </div>
  );
}

function AiCreations() {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative min-h-0 flex-1">
        <Image
          src={SHEET.src}
          alt="Himchhaya — the EXMANGA character concept sheet: face, neural spine, utility belt, tail system, katana and handgun"
          fill
          sizes="(orientation: landscape) 60vw, 92vw"
          className="object-contain"
        />
      </div>
      <p className="font-helv shrink-0 text-center text-xs text-neutral-500">
        EXMANGA — Character Concept 01, made with AI. More creations are on their way.
      </p>
    </div>
  );
}

export function ExtinctsSlide({ reduceMotion }: { reduceMotion: boolean }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [reading, setReading] = useState<ExtinctsReport | null>(null);
  // The reader mounts on the first open, never in the static render.
  const [everRead, setEverRead] = useState(false);
  const close = () => setPanel(null);

  const buttons: [Exclude<Panel, null>, string][] = [
    ["story", "Story"],
    ["characters", "Characters"],
    ["ai", "AI Creations"],
  ];

  return (
    <section aria-label="The Extincts Project" data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 grid gap-3 [grid-template-areas:'t_t'_'r_r'_'b_l'] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,0.8fr)_minmax(0,1.2fr)] landscape:gap-5 landscape:[grid-template-areas:'t_r_l'_'b_r_l'] landscape:grid-cols-[minmax(min-content,0.7fr)_minmax(0,1.75fr)_minmax(0,0.85fr)] landscape:grid-rows-[auto_minmax(0,1fr)]">
        {/* The title. */}
        <div className="[grid-area:t]">
          <p className={`${META} text-neutral-500 [@media(max-height:31.25rem)]:hidden`}>Creative · 01 / 04</p>
          <h2 className="font-graff mt-1.5 text-[clamp(1.5rem,3.4vw,3.2rem)] font-bold uppercase leading-[0.92] text-neutral-900 [@media(max-height:31.25rem)]:mt-0 [@media(max-height:31.25rem)]:text-[1.15rem]">
            The <span style={{ color: RED }}>Extincts</span> Project
          </h2>
          <p className="font-helv mt-1.5 text-[0.8rem] leading-snug text-neutral-600 [@media(max-height:31.25rem)]:hidden">
            An ongoing personal series on what we&apos;ve lost.
          </p>
        </div>

        {/* The three buttons, on the left. */}
        {/* On a short screen (a phone on its side) they step down a size. */}
        <div className="flex min-h-0 flex-col items-start gap-2.5 [grid-area:b] landscape:justify-center [@media(max-height:31.25rem)]:gap-1.5 [@media(max-height:31.25rem)]:[&_span.h-11]:h-8">
          {buttons.map(([id, label], i) => (
            <PixelButton key={id} side="creative" onClick={() => setPanel(id)} ariaHaspopup="dialog">
              <span className="tabular-nums opacity-60">{i + 1}.</span> {label}
            </PixelButton>
          ))}
        </div>

        {/* The three reports — one height for all, by their own shapes, as
            large as the cell allows (a container query). */}
        <ul className="flex min-h-0 items-end justify-center gap-3 [container-type:size] [grid-area:r] landscape:items-center sm:gap-4">
          {EXTINCTS_REPORTS.map((r, i) => {
            const cover = (EXTINCTS_REPORT_PAGES[r.id] ?? [])[0];
            if (!cover) return null;
            return (
              <li key={r.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setEverRead(true);
                    setReading(r);
                  }}
                  className="group flex flex-col items-center gap-1.5 outline-none"
                  aria-label={`Read report ${i + 1}: ${r.title}`}
                >
                  <span
                    className="relative block overflow-hidden rounded-md shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)] ring-1 ring-neutral-200 transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-neutral-900/50"
                    style={{
                      aspectRatio: `${cover.w} / ${cover.h}`,
                      // The three side by side fill the width, or the height
                      // less the labels, whichever runs out first.
                      height: `min(calc(100cqh - 2.6rem), calc((100cqw - 2.25rem) / ${COVERS_WIDE.toFixed(3)}))`,
                    }}
                  >
                    <Image src={cover.src} alt={`${r.title} — report cover`} fill sizes="22vw" className="object-cover" />
                  </span>
                  {/* No wider than its cover: the width is the cover's, the words fit it. */}
                  <span className="block w-0 min-w-full text-center">
                    <span className={`${META} block`} style={{ color: RED }}>
                      Report {pad(i + 1)}
                    </span>
                    <span className="font-graff block truncate text-[0.72rem] font-bold leading-tight text-neutral-900 sm:text-[0.82rem]">
                      {r.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Himchhaya, in the right corner. */}
        <div className="relative min-h-0 [grid-area:l]">
          <Image
            src={CUTOUT.src}
            alt="Himchhaya, the snow leopard of the Extincts Project"
            fill
            sizes="(orientation: landscape) 28vw, 48vw"
            className="object-contain object-[right_bottom] drop-shadow-[0_18px_24px_rgba(0,0,0,0.25)]"
          />
        </div>
      </div>

      {/* The way into the whole project, bottom left. */}
      <div className="slide-corner-left absolute z-10">
        <PixelButton side="creative" href="/extincts">
          View Full Project <span aria-hidden>↗</span>
        </PixelButton>
      </div>

      <SlidePanel open={panel === "story"} onClose={close} side="creative" eyebrow="The Extincts Project · 1" title="Story" reduceMotion={reduceMotion}>
        <Stories />
      </SlidePanel>
      <SlidePanel open={panel === "characters"} onClose={close} side="creative" eyebrow="The Extincts Project · 2" title="Characters" reduceMotion={reduceMotion}>
        <Characters />
      </SlidePanel>
      <SlidePanel open={panel === "ai"} onClose={close} side="creative" eyebrow="The Extincts Project · 3" title="AI Creations" reduceMotion={reduceMotion}>
        <AiCreations />
      </SlidePanel>

      {everRead && <ExtinctsReader report={reading} onClose={() => setReading(null)} />}
    </section>
  );
}
