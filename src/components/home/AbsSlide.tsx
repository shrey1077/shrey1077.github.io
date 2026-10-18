"use client";

/**
 * AbsSlide — ABS Wholesale with the two brands built there, Luzid and
 * Kartpipe, three in one (owner, 2026-10-15). Its fifth version (owner,
 * 2026-10-18: "I want ABS logo to be on top left, big. and Luzid and kartpipe
 * at the bottom left corner above the band. and instead of 5 sliders, have 3
 * sliders so images will appear bigger, and instead of plain 3 column
 * vertical animation … a random tetris pieces like composition, where we have
 * our pieces in three sizes only 9:16 frame, 16:9 and 1:1 frames … inside a
 * rounded rectangular section, red in fill and gold gradient on bold corners,
 * colors like in ABS logo. On clicking on luzid, its work will appear in one
 * slider horizontal, covering top half of screen and keep Luzid brand info"):
 *
 *   ┌───────────┬╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮┐
 *   │ (ABS)     │┃ ▢ ▯ ▭▭   three columns of pieces,  ┃│
 *   │  the coin │┃ ▯ ▢ ▭▭   1:1, 9:16 and 16:9, fitted ┃│
 *   │           │┃ ▢ ▯ ▢    like Tetris, rising slowly ┃│
 *   │ Built here│╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯│
 *   │ Luzid Kart│                 [View Full Project →]│
 *   └───────────┴──────────────────────────────────────┘
 *
 * THE WALL is ABS's: a panel in the coin's own colours — oxblood, lit from
 * the upper left, inside a thick rim of gold — and in it every plate, packed
 * three columns wide in pieces of three shapes only. The packing is made of
 * BLOCKS worked out to fit exactly (squares a column wide, tall 9:16s a column
 * wide, wide 16:9s two columns wide, on a grid a sixteenth of a column high),
 * each flat at top and foot, so the wall runs twice over and rises by one run
 * without a seam. Each plate goes to the piece nearest its own shape; one far
 * from its frame stands whole on a darker red mat rather than being cropped
 * away. It holds still under the pointer; reduced motion, still.
 *
 * LUZID AND KARTPIPE, picked, show their work in one row along the top half,
 * running sideways, and the brand underneath it: what it is, why its logo is
 * the way it is (the owner's words: Luzid's "selected from a lot of options,
 * for having some difficulty in reading it, thus demanding more attention from
 * viewers"; Kartpipe's "idea suggested by client include pipe and vape in
 * logo"), and what was done.
 *
 * Every logo is drawn by its INK — its file's padding cut off (Ink) — and
 * the one not picked is grey until the pointer finds it. A phone held upright
 * puts the coin and the two marks in a row along the top.
 */

import { useState } from "react";
import { RoomImage as Image } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { ABS_BRANDS, type Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";

const WORK = "/content/clients/abs/work";
const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.28em] text-neutral-500`;

/** Each folder's plates, width ÷ height, 01 … n — measured off the files. */
const ASPECTS: Record<string, readonly number[]> = {
  "abs-house": [1.419, 0.873, 2, 1, 0.713, 0.711],
  deathrow: [1, 1],
  himax: [1, 1, 1],
  jungo: [1, 1],
  kartpipe: [1, 1, 1],
  luzid: [1, 1, 0.8, 0.8, 2.412, 1, 1],
  misc: [0.8, 0.8, 1, 0.8, 1, 0.8, 1, 1, 1],
  "polk-a-dot": [1, 1],
  puffco: [1, 1, 1, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.052, 1.052],
  shruumz: [1, 1],
  stiiizy: [1, 1, 1],
  tyson: [1, 1, 1],
};

interface Plate {
  src: string;
  /** Width ÷ height. */
  a: number;
}

/** A folder's plates, 01 … n. */
const plates = (folder: string): Plate[] =>
  (ASPECTS[folder] ?? []).map((a, i) => ({ src: `${WORK}/${folder}/${String(i + 1).padStart(2, "0")}.webp`, a }));

/** Several folders' plates dealt in turn, so the brands mix down the wall. */
function interleave(lists: Plate[][]): Plate[] {
  const out: Plate[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}

// ── The wall's pieces ────────────────────────────────────────────────────
// A grid three columns wide and a sixteenth of a column high: a square is
// 1 × 16, a 9:16 1 × 28 (0.571 — a hair off 0.5625), a 16:9 2 × 18 (exact).

type Kind = "S" | "T" | "W";
const SPAN: Record<Kind, { w: number; h: number; a: number }> = {
  S: { w: 1, h: 16, a: 1 },
  T: { w: 1, h: 28, a: 16 / 28 },
  W: { w: 2, h: 18, a: 32 / 18 },
};

interface Piece {
  k: Kind;
  /** Column, 0 … 2, and row, in sixteenths, from the block's top. */
  c: number;
  r: number;
}

/** "S0@0 T2@16 …" — a piece's kind, column and row. */
function block(spec: string): { h: number; pieces: Piece[] } {
  const pieces = spec.split(" ").map((s) => ({ k: s[0] as Kind, c: Number(s[1]), r: Number(s.slice(3)) }));
  return { h: Math.max(...pieces.map((p) => p.r + SPAN[p.k].h)), pieces };
}

/** The blocks, each exactly flat at top and foot (found by search: every way
 *  of stacking the three shapes, at most eight pieces, that ends level), and
 *  the order they are dealt in — a talls-and-squares weave, a row of squares
 *  to breathe, a block with two wides and two talls beside a stack of
 *  squares, each now and then mirrored. */
const WEAVE = block("S0@0 S1@0 T2@0 T0@16 T1@16 S2@28");
const WEAVE_B = block("T0@0 S1@0 T2@0 T1@16 S0@28 S2@28");
const WEAVE_C = block("T0@0 S1@0 S2@0 T1@16 T2@16 S0@28");
const ROW = block("S0@0 S1@0 S2@0");
const WIDES = block("S0@0 W1@0 S0@16 T1@18 T2@18 S0@32 W1@46 S0@48");
const WIDES_M = block("W0@0 S2@0 S2@16 T0@18 T1@18 S2@32 W0@46 S2@48");
const WIDES_T = block("S0@0 T1@0 T2@0 S0@16 W1@28 S0@32 W1@46 S0@48");
const DEAL = [WEAVE, ROW, WIDES, WEAVE_B, ROW, WIDES_M, WEAVE_C, ROW, WIDES_T];

const kindOf = (a: number): Kind => (a <= 0.9 ? "T" : a >= 1.3 ? "W" : "S");

interface Placed {
  src: string;
  k: Kind;
  c: number;
  r: number;
  /** Cropped to its frame, or whole on the mat. */
  cover: boolean;
}

/** Every plate placed in the blocks, dealt in turn until each has a piece;
 *  a piece takes the first plate left of its own shape, else the first left
 *  of any; once all are placed, the last block's spare pieces take them
 *  again from the start. */
function compose(all: Plate[]): { rows: number; placed: Placed[] } {
  const left = [...all];
  const placed: Placed[] = [];
  let rows = 0;
  let again = 0;
  for (let b = 0; left.length > 0; b++) {
    const { h, pieces } = DEAL[b % DEAL.length];
    for (const p of pieces) {
      let i = left.findIndex((x) => kindOf(x.a) === p.k);
      if (i < 0) i = left.findIndex((x) => kindOf(x.a) === "S");
      if (i < 0) i = 0;
      const plate = left.length ? left.splice(i, 1)[0] : all[again++ % all.length];
      const fit = Math.abs(Math.log(plate.a / SPAN[p.k].a));
      placed.push({ src: plate.src, k: p.k, c: p.c, r: rows + p.r, cover: fit < 0.38 });
    }
    rows += h;
  }
  return { rows, placed };
}

/** ABS's wall: the oxblood panel in its gold rim, and the pieces rising. */
function Wall({ all, shown, active }: { all: Plate[]; shown: boolean; active: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 12, duration: 0.6, reduceMotion: !active });
  const { rows, placed } = compose(all);
  return (
    <div ref={ref} aria-hidden={!shown} className={`absolute inset-0 ${shown ? "" : "invisible"}`}>
      {/* The rim: the coin's gold, lit and shaded round the edge. */}
      <div className="h-full rounded-[clamp(1.25rem,2.4vw,2.25rem)] bg-[linear-gradient(135deg,#f6e27a_0%,#e5a623_18%,#bb792f_38%,#ef9e26_58%,#e9de76_76%,#c98a2b_100%)] p-[clamp(6px,0.75vw,11px)] shadow-[0_24px_60px_-28px_rgba(110,16,24,0.7)]">
        {/* The ground: the coin's oxblood, lit from the upper left. */}
        <div className="art-row relative h-full overflow-hidden rounded-[calc(clamp(1.25rem,2.4vw,2.25rem)-clamp(6px,0.75vw,11px))] bg-[radial-gradient(ellipse_at_28%_18%,#ae424a_0%,#a42833_34%,#941b22_66%,#6e1018_100%)] px-[clamp(0.35rem,0.9vw,0.75rem)] [container-type:inline-size]">
          <ul
            aria-label="ABS Wholesale — work"
            className={`abs-track grid grid-cols-3 ${active && shown ? "" : "[animation-play-state:paused]"}`}
            style={
              {
                gridAutoRows: "calc(100cqw / 48)",
                gridTemplateRows: `repeat(${rows * 2}, calc(100cqw / 48))`,
                "--abs-duration": `${(rows / 16) * 3.4}s`,
              } as unknown as React.CSSProperties
            }
          >
            {[0, 1].map((copy) =>
              placed.map((p, i) => (
                <li
                  key={`${copy}-${i}`}
                  className="p-[clamp(0.2rem,0.45vw,0.4rem)]"
                  style={{ gridColumn: `${p.c + 1} / span ${SPAN[p.k].w}`, gridRow: `${copy * rows + p.r + 1} / span ${SPAN[p.k].h}` }}
                >
                  <span className={`relative block h-full w-full overflow-hidden rounded-[clamp(0.5rem,1vw,0.9rem)] ${p.cover ? "" : "bg-[#5c0d16]"}`}>
                    <Image src={p.src} alt="" fill sizes="(orientation: portrait) 33vw, 24vw" className={p.cover ? "object-cover" : "object-contain"} />
                  </span>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  ink: Ink;
  href: string;
  plates: Plate[];
  /** Luzid and Kartpipe: what it is, why its logo, what was done. */
  sector?: string;
  why?: string;
  points?: readonly string[];
}

/** Luzid's or Kartpipe's: its work in one row along the top half, sliding
 *  sideways, and the brand under it. */
function BrandRow({ brand, shown, active }: { brand: Brand; shown: boolean; active: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(shown, { cell: 12, duration: 0.6, reduceMotion: !active });
  // Enough plates in a run to more than fill the row: a short set repeats.
  const run = brand.plates.length >= 6 ? brand.plates : Array.from({ length: 6 }, (_, i) => brand.plates[i % brand.plates.length]);
  return (
    <div ref={ref} aria-hidden={!shown} className={`absolute inset-0 flex flex-col gap-[clamp(0.75rem,3vh,2rem)] ${shown ? "" : "invisible"}`}>
      <div className="art-row relative h-1/2 shrink-0 overflow-hidden rounded-[clamp(1rem,2vw,1.75rem)] bg-neutral-100 ring-1 ring-neutral-900/10">
        <ul
          aria-label={`${brand.name} — work`}
          className={`art-track flex h-full w-max gap-[clamp(0.4rem,0.9vw,0.75rem)] p-[clamp(0.4rem,0.9vw,0.75rem)] ${active && shown ? "" : "[animation-play-state:paused]"}`}
          style={{ "--art-duration": `${run.length * 5}s` } as unknown as React.CSSProperties}
        >
          {[...run, ...run].map((p, i) => (
            <li key={`${p.src}-${i}`} className="relative h-full shrink-0 overflow-hidden rounded-[clamp(0.6rem,1.2vw,1rem)]" style={{ aspectRatio: String(p.a) }}>
              <Image src={p.src} alt="" fill sizes="40vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
      <div className="min-h-0 max-w-[44rem] overflow-hidden">
        {brand.sector && <p className={META}>{brand.sector}</p>}
        <h3 className="face-logic mt-2 text-[clamp(1.4rem,2.6vw,2.4rem)] font-bold leading-none tracking-[0.04em] text-neutral-900 [@media(max-height:31.25rem)]:mt-1 [@media(max-height:31.25rem)]:text-[1.15rem]">
          {brand.name}
        </h3>
        {brand.why && (
          <p className="font-helv mt-[clamp(0.5rem,1.6vh,1rem)] text-[clamp(0.86rem,1.1vw,1.05rem)] leading-snug text-neutral-800 [@media(max-height:31.25rem)]:mt-1 [@media(max-height:31.25rem)]:text-[0.74rem]">
            <span className="font-bold">The logo: </span>
            {brand.why}
          </p>
        )}
        {brand.points && (
          <ul className="font-helv mt-[clamp(0.4rem,1.4vh,0.9rem)] list-disc space-y-1 pl-4 text-[clamp(0.76rem,0.95vw,0.9rem)] leading-snug text-neutral-600 marker:text-neutral-400 [@media(max-height:42rem)]:hidden">
            {brand.points.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Where a logo's ink lies in its file (px), measured off the files
 *  (.perf-tools/tmp/inkbox.mjs): the file's size, then the ink's box. */
interface Ink {
  fw: number;
  fh: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A logo by its ink: a box the ink's shape whose area is `size`² (so logos
 *  of one size cover the same), the file placed in it so the ink fills it. */
function InkLogo({ src, ink, size }: { src: string; ink: Ink; size: string }) {
  const s = Math.sqrt(ink.w / ink.h);
  return (
    <span className="relative block overflow-hidden" style={{ width: `calc(${size} * ${s.toFixed(4)})`, height: `calc(${size} / ${s.toFixed(4)})` }}>
      <span
        className="absolute block"
        style={{
          left: `${((-ink.x / ink.w) * 100).toFixed(3)}%`,
          top: `${((-ink.y / ink.h) * 100).toFixed(3)}%`,
          width: `${((ink.fw / ink.w) * 100).toFixed(3)}%`,
          height: `${((ink.fh / ink.h) * 100).toFixed(3)}%`,
        }}
      >
        <Image src={src} alt="" fill sizes="16rem" className="object-fill" />
      </span>
    </span>
  );
}

/** A logo that picks its brand; the one picked in colour, with a row of
 *  blinking pixels beside it. */
function BrandTab({ brand, on, size, onPick }: { brand: Brand; on: boolean; size: string; onPick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      aria-label={brand.name}
      onClick={onPick}
      className={`group relative flex shrink-0 items-center rounded-full p-1.5 outline-none transition-[opacity,filter] duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900/50 ${
        on ? "" : "opacity-55 grayscale hover:opacity-100 hover:grayscale-0"
      }`}
    >
      <InkLogo src={brand.logo} ink={brand.ink} size={size} />
      {on && (
        <span aria-hidden className="absolute -right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-[3px]">
          {[0, 1, 2].map((k) => (
            <span key={k} className="pixel-blink block h-[4px] w-[4px] bg-neutral-900" style={{ "--blink": `${1.2 + k * 0.4}s` } as unknown as React.CSSProperties} />
          ))}
        </span>
      )}
    </button>
  );
}

export function AbsSlide({ item, active }: { item: Showcase; active: boolean }) {
  const [luzid, kartpipe] = ABS_BRANDS;
  const brands: Brand[] = [
    {
      id: "abs",
      name: "ABS Wholesale",
      // ABS's badge on a clear ground (the band's sits on white).
      logo: "/content/clients/abs/abs-logo.png",
      ink: { fw: 480, fh: 409, x: 51, y: 46, w: 336, h: 335 },
      href: item.report.href ?? "/clients/abs",
      plates: interleave(["deathrow", "tyson", "abs-house", "puffco", "stiiizy", "himax", "jungo", "polk-a-dot", "shruumz", "misc"].map(plates)),
    },
    {
      id: "luzid",
      name: luzid.name,
      logo: luzid.mark ?? "",
      ink: { fw: 625, fh: 354, x: 148, y: 107, w: 329, h: 140 },
      href: luzid.report.href ?? "/clients/abs#luzid",
      plates: plates("luzid"),
      sector: luzid.sector,
      why: "picked from a long list of options for being a little hard to read — so it asks more of the viewer’s attention, and holds it.",
      points: luzid.points.slice(1, 3),
    },
    {
      id: "kartpipe",
      name: kartpipe.name,
      logo: "/content/clients/abs/kartpipe-logo-black.png",
      ink: { fw: 1143, fh: 527, x: 0, y: 0, w: 1143, h: 527 },
      href: kartpipe.report.href ?? "/clients/abs#kartpipe",
      plates: plates("kartpipe"),
      sector: kartpipe.sector,
      why: "the client’s own idea — the pipe and the vape, both in the mark.",
      points: kartpipe.points.slice(0, 2),
    },
  ];
  const [pick, setPick] = useState("abs");
  const brand = brands.find((b) => b.id === pick) ?? brands[0];
  const [abs, ...built] = brands;

  return (
    <section aria-label={`${item.name}, Luzid and Kartpipe`} data-side="logic" className="absolute inset-0 overflow-hidden">
      <h2 className="sr-only">{item.name} — with Luzid and Kartpipe</h2>
      {/* The frame down to the band: the logos' column, its foot at the
          band; the wall, with the way in under it. */}
      <div className="slide-frame is-logic absolute inset-0 flex items-stretch gap-[clamp(0.75rem,2.6vw,2.75rem)] !pb-[calc(7svh+0.75rem)] portrait:flex-col">
        <div
          role="tablist"
          aria-label="Brands"
          className="flex w-[clamp(8rem,19vw,16rem)] shrink-0 flex-col items-start justify-between portrait:w-full portrait:flex-row portrait:items-end"
        >
          {/* ABS, big, top left. */}
          <BrandTab brand={abs} on={pick === abs.id} size="min(clamp(4.25rem,17vw,13rem),24vh)" onPick={() => setPick(abs.id)} />
          {/* The two brands built there, bottom left, on the band. */}
          <div className="flex flex-col gap-2 portrait:items-end">
            <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>Built at ABS</p>
            <div className="flex items-center gap-[clamp(0.25rem,1vw,0.75rem)]">
              {built.map((b) => (
                <BrandTab key={b.id} brand={b} on={pick === b.id} size="min(clamp(2.4rem,4.6vw,4.4rem),9vh)" onPick={() => setPick(b.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* A hairline between the logos and their work. */}
        <span aria-hidden className="w-px shrink-0 self-stretch bg-neutral-900/15 portrait:hidden" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="relative min-h-0 flex-1">
            <Wall all={abs.plates} shown={pick === abs.id} active={active} />
            {built.map((b) => (
              <BrandRow key={b.id} brand={b} shown={pick === b.id} active={active} />
            ))}
          </div>
          <div className="flex shrink-0 justify-end">
            <PixelButton side="logic" href={brand.href}>
              {item.report.label} <span aria-hidden>→</span>
            </PixelButton>
          </div>
        </div>
      </div>
    </section>
  );
}
