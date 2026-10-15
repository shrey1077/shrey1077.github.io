"use client";

/**
 * ExtinctsSlide — the right side's first slide (owner, 2026-10-15: "For
 * Extincts Project (1st and topmost of right sections) i want my snow leopard
 * character … on right corner, and the three reports, a 1. Story button,
 * 2. Characters, 3. AI Creations buttons"). Since the same day's next round
 * ("put the buttons below the reports … use whole images not cutout (for
 * main slide as well)") the buttons sit under the reports, and the snow
 * leopard is his whole concept sheet, not the cutout lifted off it.
 *
 *   LANDSCAPE                                PORTRAIT (9:16)
 *   ┌─────────────────────────┬─────────┐    ┌───────────────────┐
 *   │ title                   │         │    │ title             │
 *   │                         │ Himch-  │    │ the three reports │
 *   │   the three reports     │ haya    │    ├─────────┬─────────┤
 *   │                         │ (sheet) │    │ 1 Story │ Himch-  │
 *   │ 1 Story  2 Chars  3 AI  │         │    │ 2 Chars │ haya    │
 *   └─────────────────────────┴─────────┘    │ 3 AI    │         │
 *                                            └─────────┴─────────┘
 * A report opens the room's own reader (ExtinctsRoom's, untouched); the
 * three buttons open panels over the slide (SlidePanel): the six stories;
 * the characters — every character sheet the owner has made, one at a time
 * with a grid of picks (scripts/make-extincts-characters.mjs); and the AI
 * creations. "View Full Project" (bottom left) opens /extincts. Everything is
 * sized to the screen — the covers by a container query — so nothing ever
 * scrolls.
 */

import { useEffect, useState } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { SlidePanel } from "@/components/home/SlidePanel";
import { ExtinctsReader } from "@/components/home/ExtinctsRoom";
import { EXTINCTS_REPORTS, EXTINCTS_STORIES, type ExtinctsReport } from "@/constants/extincts";
import { EXTINCTS_REPORT_PAGES } from "@/constants/extinctsReportPages";
import { typeVoiceClass } from "@/constants/typography";
import CHARACTERS from "../../../public/content/extincts/characters/characters.json";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.24em]`;
const RED = "#e3262b";
const pad = (n: number) => String(n).padStart(2, "0");

/** Himchhaya's concept sheet, whole — the first of the characters. (The
 *  cutout lifted off it, /content/extincts/himchhaya.webp, and the earlier
 *  copy of the sheet, himchhaya-sheet.webp, are no longer shown.) */
const SHEET = CHARACTERS[0];
/** A line under a character, where there is more to say than the name. */
const NOTES: Record<string, string> = {
  Himchhaya: "Antagonist · Panthera uncia, the snow leopard — “Some species go quietly. I learned to adapt.”",
};

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

/** Every character sheet, one at a time: the one picked, whole, and a grid
 *  of them all to pick from (beside it on a wide screen, under it on a tall
 *  one) — all sized to the panel, so nothing scrolls. ← and → step through
 *  while the pop-up is open. */
function Characters({ open }: { open: boolean }) {
  const [at, setAt] = useState(0);
  const n = CHARACTERS.length;
  const c = CHARACTERS[at];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setAt((v) => (v + 1) % n);
      else if (e.key === "ArrowLeft") setAt((v) => (v - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n]);
  const step = (d: number) => setAt((v) => (v + d + n) % n);
  const arrow =
    "absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg leading-none text-neutral-900 shadow ring-1 ring-neutral-200 outline-none transition hover:bg-neutral-900 hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-900/50";
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-3 landscape:grid-cols-[minmax(0,1fr)_minmax(8rem,26%)] landscape:grid-rows-1">
      <figure className="flex min-h-0 min-w-0 flex-col gap-2">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-neutral-100">
          <Image key={c.src} src={c.src} alt={c.name} fill sizes="(orientation: landscape) 66vw, 92vw" className="object-contain" />
          <button type="button" onClick={() => step(-1)} aria-label="Previous character" className={`${arrow} left-2`}>
            ‹
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next character" className={`${arrow} right-2`}>
            ›
          </button>
        </div>
        <figcaption className="shrink-0">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-graff truncate text-[clamp(0.9rem,1.6vw,1.25rem)] font-bold uppercase leading-tight text-neutral-900">{c.name}</span>
            <span className={`${META} shrink-0 tabular-nums text-neutral-500`}>
              {pad(at + 1)} / {pad(n)}
            </span>
          </span>
          {NOTES[c.name] && <span className="font-helv mt-0.5 block truncate text-xs text-neutral-600 [@media(max-height:31.25rem)]:hidden">{NOTES[c.name]}</span>}
        </figcaption>
      </figure>
      {/* The picks: two rows of six on a tall screen, four rows of three
          beside the picture on a wide one. */}
      <ul className="grid h-[min(8.5rem,20svh)] grid-cols-6 grid-rows-2 gap-1.5 landscape:h-full landscape:grid-cols-3 landscape:grid-rows-4">
        {CHARACTERS.map((k, i) => (
          <li key={k.src} className="min-h-0 min-w-0">
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={k.name}
              aria-current={i === at}
              className={`relative block h-full w-full overflow-hidden rounded-md bg-neutral-100 outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-900/50 ${
                i === at ? "ring-2 ring-[#e3262b]" : "opacity-70 ring-1 ring-neutral-200 hover:opacity-100"
              }`}
            >
              <Image src={k.thumb} alt="" fill sizes="8vw" className="object-cover object-top" />
            </button>
          </li>
        ))}
      </ul>
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
      <div className="slide-frame absolute inset-0 grid gap-3 [grid-template-areas:'t_t'_'r_r'_'b_l'] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,0.8fr)_minmax(0,1.2fr)] landscape:gap-x-6 landscape:gap-y-4 landscape:[grid-template-areas:'t_l'_'r_l'_'b_l'] landscape:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] landscape:grid-rows-[auto_minmax(0,1fr)_auto] [@media(max-height:31.25rem)]:landscape:gap-y-2">
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

        {/* The three buttons, under the reports — in a row on a wide
            screen, a column beside Himchhaya on a tall one. On a short
            screen (a phone on its side) they step down a size. */}
        <div className="flex min-h-0 flex-col items-start gap-2.5 [grid-area:b] landscape:flex-row landscape:flex-wrap landscape:items-center landscape:justify-center landscape:gap-3 [@media(max-height:31.25rem)]:gap-1.5 [@media(max-height:31.25rem)]:[&_span.h-11]:h-8">
          {buttons.map(([id, label], i) => (
            <PixelButton key={id} side="creative" onClick={() => setPanel(id)} ariaHaspopup="dialog">
              <span className="tabular-nums opacity-60">{i + 1}.</span> {label}
            </PixelButton>
          ))}
        </div>

        {/* The three reports — one height for all, by their own shapes, as
            large as the cell allows (a container query) — standing on the
            buttons, so the two read as one. */}
        <ul className="flex min-h-0 items-end justify-center gap-3 [container-type:size] [grid-area:r] sm:gap-4">
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

        {/* Himchhaya, in the right corner: his whole sheet, as large as the
            cell allows (a container query), against its foot and right. */}
        <div className="relative min-h-0 [container-type:size] [grid-area:l]">
          <span
            className="absolute bottom-0 right-0 block overflow-hidden rounded-lg shadow-[0_18px_34px_-16px_rgba(0,0,0,0.45)] ring-1 ring-neutral-200 landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2"
            style={{
              width: `min(100cqw, ${(SHEET.w / SHEET.h).toFixed(4)} * 100cqh)`,
              height: `min(100cqh, 100cqw / ${(SHEET.w / SHEET.h).toFixed(4)})`,
            }}
          >
            <Image
              src={SHEET.src}
              alt="Himchhaya, the snow leopard of the Extincts Project — his character concept sheet"
              fill
              sizes="(orientation: landscape) 28vw, 48vw"
              className="object-cover"
            />
          </span>
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
        <Characters open={panel === "characters"} />
      </SlidePanel>
      <SlidePanel open={panel === "ai"} onClose={close} side="creative" eyebrow="The Extincts Project · 3" title="AI Creations" reduceMotion={reduceMotion}>
        <AiCreations />
      </SlidePanel>

      {everRead && <ExtinctsReader report={reading} onClose={() => setReading(null)} />}
    </section>
  );
}
