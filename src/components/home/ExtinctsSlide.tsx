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
 *
 * THE SHEETS, IN TURN (owner, 2026-10-17: "i want my character sheet to take
 * entire height of screen on right and half character visible, and keep them
 * changing every 7 seconds, one per species"): each species' lead sheet —
 * Himchhaya, Southwind, Ghosthorn & Whisper, Dodohuf, The Living Shield,
 * NoMad — the full height of the screen at its right edge, its left half in
 * view and the rest past the edge; every SHEET_MS the next arrives over it in
 * squares (SheetCycle). On a tall screen they stand in the lower right,
 * beside the buttons. The Characters pop-up holds all 28 artworks.
 *
 * THE KEY ART, THE WHOLE SLIDE (owner, 2026-10-17: "for extincts page i need
 * this bg on complete slide and the buttons on right side"; the same day,
 * asked: the turning sheets go, the reports join the buttons on the right,
 * no preference on the title): the EXMANGA key art fills the slide from the
 * strip's foot down — the strip and the menu would stand over its own title,
 * top right — and the room above takes on its sky (SKY, the colours along its
 * top edge), the art fading into it. On a wide screen the art keeps its right
 * edge and top (its title) whatever it crops; the reports and the three
 * buttons stand in a column on the right, over the city, under its title, on
 * a shade; the slide's own title is for screen readers only (the art carries
 * it). On a tall screen the art shows its cast, the title stays (the art's is
 * cropped off), and the reports and buttons stand at the foot. SheetCycle is
 * kept, unused.
 *
 * THE KEY ART MOVES since 2026-10-18 (owner: "use 0 to 2seconds footage of
 * this video as a bg for extincts slide, and link it with horizontal mouse
 * movement"): the first two seconds of the owner's Flow film of the council on
 * the ridge — the camera pulling back from them, the title fading — as stills
 * (scripts/prepare-extincts-council.mjs), scrubbed by the pointer across the
 * whole slide: its left edge the first frame, its right edge the last
 * (FilmScrub). A finger dragged across does it on a touch screen; with none,
 * it plays there and back by itself. Cropped as the still was: its right edge
 * and top on a wide screen, the cast on a tall one. The still (key-art.webp,
 * key-art-960.webp) stays on disk, unused.
 */

import { useEffect, useState } from "react";
import { FilmScrub, type FilmCut } from "@/components/home/FilmScrub";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePixelPresence } from "@/components/home/pixelReveal";
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
/** The red, lifted, where it stands on the dark art. */
const RED_ON_DARK = "#ff5a5f";
const pad = (n: number) => String(n).padStart(2, "0");

/** The council on the ridge, 0–2 s of the owner's film, 25 frames
 *  (scripts/prepare-extincts-council.mjs). */
const COUNCIL: FilmCut = { dir: "/content/extincts/council", frames: 25, w: 1920, h: 1080, big: 1280, small: 960 };
/** The sky along the art's top edge, left to right (read off its pixels). */
const SKY = "linear-gradient(90deg, rgb(50,72,114), rgb(10,39,78) 45%, rgb(4,21,46))";

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
      {/* The picks — all 28, scrolled in their own box: seven across under
          the picture on a tall screen, four across beside it on a wide one. */}
      <ul className="grid h-[min(8.5rem,20svh)] auto-rows-[3.9rem] grid-cols-7 gap-1.5 overflow-y-auto overscroll-contain landscape:h-full landscape:auto-rows-[5.5rem] landscape:grid-cols-4 [@media(max-height:31.25rem)]:landscape:auto-rows-[3.4rem]">
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

/** Each species' lead sheet, in the order the archive gives them. */
const LEADS = CHARACTERS.filter((c) => "lead" in c && c.lead);
/** How long each sheet holds. */
const SHEET_MS = 7000;

/** One sheet of the cycle: the full height of its box, its left half in
 *  view (the box is half the sheet's width; the picture twice the box's). */
function SheetLayer({ sheet, shown, top, load, reduceMotion }: { sheet: (typeof LEADS)[number]; shown: boolean; top: boolean; load: boolean; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 14, duration: 0.9, reduceMotion });
  return (
    <div ref={ref} aria-hidden={!top} className={`absolute inset-0 overflow-hidden ${shown ? "" : "invisible"}`} style={{ zIndex: top ? 2 : 1 }}>
      {load && (
        // eslint-disable-next-line @next/next/no-img-element -- half a sheet, placed by its own width
        <img src={sheet.src} alt={top ? `${sheet.name} — ${sheet.species}, character sheet` : ""} className="absolute left-0 top-0 h-full w-[200%] max-w-none object-cover object-left" />
      )}
    </div>
  );
}

export function SheetCycle({ live, reduceMotion }: { live: boolean; reduceMotion: boolean }) {
  const [{ cur, prev }, setTurn] = useState<{ cur: number; prev: number | null }>({ cur: 0, prev: null });
  useEffect(() => {
    if (!live || LEADS.length < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setTurn((t) => ({ cur: (t.cur + 1) % LEADS.length, prev: t.cur }));
    }, SHEET_MS);
    return () => window.clearInterval(id);
  }, [live]);
  // Once the new one has come in over it, the last one goes.
  useEffect(() => {
    if (prev === null) return;
    const id = window.setTimeout(() => setTurn((t) => (t.prev === prev ? { ...t, prev: null } : t)), 1100);
    return () => window.clearTimeout(id);
  }, [prev]);
  const next = (cur + 1) % LEADS.length;
  const here = LEADS[cur];
  return (
    <>
      {LEADS.map((sh, i) => (
        <SheetLayer key={sh.src} sheet={sh} shown={i === cur || i === prev} top={i === cur} load={i === cur || i === prev || i === next} reduceMotion={reduceMotion} />
      ))}
      {/* Whose sheet it is. */}
      <p aria-live="polite" className="pointer-events-none absolute bottom-[calc(7svh+0.9rem)] left-3 z-[3] rounded-full bg-neutral-950/75 px-3 py-1.5 backdrop-blur-sm">
        <span className="font-graff block text-[0.72rem] font-bold uppercase leading-none tracking-[0.06em] text-white">{here.name}</span>
        <span className={`${META} mt-1 block text-white/60`}>
          {here.species} · {pad(cur + 1)} / {pad(LEADS.length)}
        </span>
      </p>
    </>
  );
}

export function ExtinctsSlide({ reduceMotion, live = true }: { reduceMotion: boolean; live?: boolean }) {
  const tall = useMediaQuery("(orientation: portrait)");
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
    <section aria-label="The Extincts Project" data-side="creative" className="absolute inset-0 overflow-hidden" style={{ background: SKY }}>
      {/* The key art, from the strip's foot down, fading in from the sky
          above it; a shade under the words. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem))] [mask-image:linear-gradient(to_bottom,transparent,black_2.5rem)]">
        <FilmScrub cut={COUNCIL} live={live} reduceMotion={reduceMotion} fit="cover" focus={tall ? { x: 0.3, y: 0.5 } : { x: 1, y: 0 }} />
        <p className="sr-only">The council of The Extincts Project on a snowy ridge above a city at war</p>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,8,20,0.55),transparent_32%),linear-gradient(to_top,rgba(3,8,20,0.88),rgba(3,8,20,0.4)_42%,transparent_62%)] landscape:bg-[radial-gradient(42%_62%_at_100%_80%,rgba(3,8,20,0.82),rgba(3,8,20,0.5)_55%,transparent)]" />

      {/* Wide: the reports over the buttons, a column on the right, clear of
          the art's title. Tall: the title at the top, the art's cast between,
          the reports and the buttons at the foot. */}
      <div className="slide-frame absolute inset-0 grid gap-3 [grid-template-areas:'t'_'.'_'r'_'b'] grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto_auto] landscape:!pt-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem)+max((100svh-max(2vh,0.75rem)-var(--strip-h,3.75rem))*0.095,5.35vw)+0.75rem)] landscape:[grid-template-areas:'._r'_'._b'] landscape:grid-cols-[minmax(0,1fr)_minmax(15rem,30%)] landscape:grid-rows-[minmax(0,1fr)_auto] landscape:gap-y-4 [@media(max-height:31.25rem)]:landscape:grid-cols-[minmax(0,1fr)_minmax(15rem,46%)] [@media(max-height:31.25rem)]:landscape:gap-y-2">
        {/* The title — the art carries its own on a wide screen. */}
        <div className="[grid-area:t] landscape:sr-only">
          <p className={`${META} text-white/60 [@media(max-height:31.25rem)]:hidden`}>Creative · 01 / 04</p>
          <h2 className="font-graff mt-1.5 text-[clamp(1.5rem,3.4vw,3.2rem)] font-bold uppercase leading-[0.92] text-white [@media(max-height:31.25rem)]:mt-0 [@media(max-height:31.25rem)]:text-[1.15rem]">
            The <span style={{ color: RED }}>Extincts</span> Project
          </h2>
          <p className="font-helv mt-1.5 text-[0.8rem] leading-snug text-white/75 [@media(max-height:31.25rem)]:hidden">
            An ongoing personal series on what we&apos;ve lost.
          </p>
        </div>

        {/* The three buttons, under the reports — stacked on the right on a
            wide screen; on a tall one, or a short one (a phone on its side,
            a size down), in a row to the right. */}
        <div className="flex min-h-0 flex-row flex-wrap items-center justify-end gap-2 [grid-area:b] landscape:flex-col landscape:items-end landscape:gap-2.5 [@media(max-height:31.25rem)]:landscape:flex-row [@media(max-height:31.25rem)]:gap-1.5 [@media(max-height:31.25rem)]:[&_span.h-11]:h-8">
          {buttons.map(([id, label], i) => (
            <PixelButton key={id} side="creative" onClick={() => setPanel(id)} ariaHaspopup="dialog">
              <span className="tabular-nums opacity-60">{i + 1}.</span> {label}
            </PixelButton>
          ))}
        </div>

        {/* The three reports — one height for all, by their own shapes, as
            large as the cell allows (a container query) — standing on the
            buttons, so the two read as one. */}
        <ul className="flex min-h-0 items-end justify-end gap-3 [--labels:2.6rem] [container-type:size] [grid-area:r] portrait:h-[min(24svh,15rem)] sm:gap-4 [@media(max-height:31.25rem)]:[--labels:0rem]">
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
                    className="relative block overflow-hidden rounded-md shadow-[0_14px_30px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/25 transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-white/70"
                    style={{
                      aspectRatio: `${cover.w} / ${cover.h}`,
                      // The three side by side fill the width, or the height
                      // less the labels, whichever runs out first.
                      height: `min(calc(100cqh - var(--labels)), calc((100cqw - 2.25rem) / ${COVERS_WIDE.toFixed(3)}))`,
                    }}
                  >
                    <Image src={cover.src} alt={`${r.title} — report cover`} fill sizes="22vw" className="object-cover" />
                  </span>
                  {/* No wider than its cover: the width is the cover's, the words fit it.
                      On a short screen (a phone on its side) the covers are too
                      small for words; the button still names its report. */}
                  <span className="block w-0 min-w-full text-center [@media(max-height:31.25rem)]:hidden">
                    <span className={`${META} block`} style={{ color: RED_ON_DARK }}>
                      Report {pad(i + 1)}
                    </span>
                    <span className="font-graff block truncate text-[0.72rem] font-bold leading-tight text-white sm:text-[0.82rem]">
                      {r.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

      </div>

      {/* (The sheets in turn — SheetCycle — stood at the right edge here
          until the key art took the slide, 2026-10-17.) */}

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
