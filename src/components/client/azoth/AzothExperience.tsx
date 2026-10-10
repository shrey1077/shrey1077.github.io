/**
 * AzothExperience — the bespoke Azoth Biotech client page.
 *
 * ⚠ RE-COMPOSED 2026-10-06 (owner: "redo the azoth page… use the new color
 * logo, and recompose all info on the page… start under" the hero). The hero
 * — the rocky ridge and the flowering one under the spotlight — is untouched;
 * everything under it was laid out again around the COLOUR LOCKUP and its two
 * inks, Culture teal and Lab navy (see azothExperience.ts):
 *
 *   masthead      the colour lockup, the line, the scope, the facts, an index
 *   01 the mark   the brief, then the mark's growth: culture → grid → seal
 *   02 the system the two inks as one bar, the lockups on their plates, type
 *   03 the family the house and its five proposed lines on one rail;
 *                 Mycoveda set apart
 *   04 Naturalist the brand board, Brain Fuel, the social strip
 *   05 Mushroomworks  the system sheet, the social strip
 *   06 the house  the parent's own programme, on navy
 *   07 explorations   the sheets of the roads not taken
 *
 * ⚠ The design rules it keeps: SQUARE corners and hairlines throughout (a
 * lab's precision — the old page was uniform rounded cards), asymmetric
 * grids, teal as the ONE signal on every surface, navy as the voice. Faces:
 * .az-wide (Michroma) for numbers and labels, .az-text (Barlow) to read,
 * .az-mono (Plex Mono) for the data — globals.css.
 *
 * Server Component; the zoom and the post strips are client children.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { AzothHero } from "@/components/client/azoth/AzothHero";
import { AzothStrip } from "@/components/client/azoth/AzothStrip";
import { AzothZoom } from "@/components/client/azoth/AzothZoom";
import {
  AZOTH,
  AZOTH_BRAIN_FUEL,
  AZOTH_BRAIN_FUEL_NOTE,
  AZOTH_BRANDS,
  AZOTH_CHAPTERS,
  AZOTH_HOUSE,
  AZOTH_INK,
  AZOTH_MARK,
  AZOTH_MARK_STORY,
  AZOTH_MUSHROOMWORKS_SHEET,
  AZOTH_MYCOVEDA,
  AZOTH_NATURALIST_ARTWORK,
  AZOTH_REJECTED,
  AZOTH_SYSTEM,
} from "@/constants/azothExperience";

function readWork(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", "content", "clients", "azoth-biotech", "work", folder);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".webp"))
      .sort()
      .map((f) => `/content/clients/azoth-biotech/work/${folder}/${f}`);
  } catch {
    return [];
  }
}

const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
/** The cool lab white the alternate chapters sit on. */
const LAB = "#f3f5f7";
/** Lab-data labels — mono caps. LABEL_BASE leaves size and colour to the caller. */
const LABEL_BASE = "az-mono uppercase tracking-[0.16em]";
const LABEL = `${LABEL_BASE} text-[0.62rem] text-neutral-500`;
const BODY = "az-text text-[0.98rem] leading-[1.7] text-neutral-600";
const RULE = "border-neutral-900/10";

/** A chapter's head: its number in the wide face, its name, its headline. */
function ChapterHead({
  n,
  label,
  title,
  dark = false,
}: {
  n: string;
  label: string;
  title?: string;
  dark?: boolean;
}) {
  return (
    <header>
      <p className="flex items-baseline gap-3">
        <span className="az-wide text-[0.7rem] tracking-[0.12em]" style={{ color: AZOTH_INK.teal }}>
          {n}
        </span>
        <span className={`az-wide text-[0.62rem] uppercase tracking-[0.22em] ${dark ? "text-white/60" : "text-neutral-500"}`}>
          {label}
        </span>
      </p>
      {title && (
        <h2
          className={`az-text mt-4 text-[clamp(1.8rem,3.2vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.02em] ${
            dark ? "text-white" : ""
          }`}
          style={dark ? undefined : { color: AZOTH_INK.navy }}
        >
          {title}
        </h2>
      )}
    </header>
  );
}

/** The seal in teal: the black master mark — the monogram clipped by its
 *  circle — used as a mask over the ink, so it is the logo's own teal, not a
 *  recoloured file. */
function TealSeal({ className = "" }: { className?: string }) {
  const mask = `url("${encodeURI(AZOTH_MARK.seal.src)}") center / contain no-repeat`;
  return (
    <span
      aria-hidden
      className={`block ${className}`}
      style={{ backgroundColor: AZOTH_INK.teal, mask, WebkitMask: mask }}
    />
  );
}

export function AzothExperience() {
  const naturalistPosts = readWork("naturalist");
  const mushroomworksPosts = readWork("mushroomworks");
  const [naturalist, mushroomworks] = AZOTH_BRANDS;
  const lockups = AZOTH_MARK.lockups;
  const lockupPlates = [lockups.stacked, lockups.horizontal, lockups.reversed].map((l) => ({
    src: l.src,
    name: `Azoth Biotech — ${l.name.toLowerCase()} lockup`,
  }));
  const housePlates = AZOTH_HOUSE.pieces.map((p) => ({ src: p.src, name: p.caption }));
  const rejectedPlates = AZOTH_REJECTED.map((r) => ({ src: r.src, name: `${r.name} — logo explorations` }));

  return (
    <main className="az-text min-h-dvh w-full bg-white" style={{ color: AZOTH_INK.navy }}>
      {/* The client-supplied hero, full bleed — kept exactly as it was. */}
      <AzothHero />

      <ExperienceTransition>
        {/* ── Masthead — the hero's "Explore" lands here (#work). ── */}
        <section id="work" className="scroll-mt-0 bg-white">
          <div className={`${SHELL} pb-16 pt-8 lg:pb-20`}>
            <Link
              href="/"
              className="az-mono group inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-neutral-500 outline-none transition-colors hover:text-neutral-900 focus-visible:text-neutral-900"
            >
              <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              Back
            </Link>

            <div className="mt-12 grid grid-cols-1 items-end gap-x-14 gap-y-10 lg:grid-cols-12">
              {/* The colour lockup — the page's logo. */}
              <div className="lg:col-span-4">
                <Image
                  src={AZOTH.logo.src}
                  alt="Azoth Biotech — the colour lockup: the teal monogram over the navy wordmark"
                  width={AZOTH.logo.w}
                  height={AZOTH.logo.h}
                  priority
                  sizes="(max-width: 1024px) 60vw, 360px"
                  className="h-auto w-[min(70%,20rem)] lg:w-full lg:max-w-[22rem]"
                />
              </div>
              <div className="lg:col-span-8">
                <p className="az-wide text-[0.62rem] uppercase tracking-[0.22em] text-neutral-500">
                  Client <span style={{ color: AZOTH_INK.teal }}>/</span> Biotechnology
                </p>
                <h2 className="mt-5 text-[clamp(2rem,4.1vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
                  {AZOTH.tagline}
                </h2>
                <p className={`${BODY} mt-6 max-w-[62ch]`}>{AZOTH.scope}</p>
              </div>
            </div>

            {/* The facts, then the way down — one ruled row each. */}
            <dl className={`mt-14 grid grid-cols-2 border-t ${RULE} sm:grid-cols-4`}>
              {AZOTH.facts.map((f) => (
                <div key={f.label} className={`border-b ${RULE} py-4 pr-4 sm:border-b-0`}>
                  <dt className={LABEL}>{f.label}</dt>
                  <dd className="mt-1.5 text-[0.95rem] font-medium">
                    {f.href ? (
                      <a
                        href={f.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-[#28A898]/50 underline-offset-4 transition-colors hover:decoration-[#28A898]"
                      >
                        {f.value}
                      </a>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <nav aria-label="On this page" className={`border-t ${RULE} pt-4`}>
              <ol className="flex flex-wrap gap-x-7 gap-y-2">
                {AZOTH_CHAPTERS.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className="az-wide inline-flex items-baseline gap-2 text-[0.6rem] uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-[#283078]"
                    >
                      <span style={{ color: AZOTH_INK.teal }}>{c.n}</span>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {/* ── 01 — The mark: the brief, then culture → grid → seal. ── */}
        <section id="mark" className="scroll-mt-0" style={{ backgroundColor: LAB }}>
          <div className={`${SHELL} grid grid-cols-1 gap-x-14 gap-y-12 py-16 lg:grid-cols-12 lg:py-24`}>
            <div className="lg:col-span-4">
              <ChapterHead n="01" label="The mark" title={AZOTH_MARK_STORY.headline} />
              <p className={`${BODY} mt-6`}>{AZOTH_MARK_STORY.brief}</p>
              <p className={`${BODY} mt-4`}>{AZOTH_MARK_STORY.build}</p>
            </div>

            {/* Three stages on one rail. */}
            <ol className="relative grid grid-cols-3 gap-2 sm:gap-4 lg:col-span-8 lg:self-center">
              <span aria-hidden className="absolute left-0 right-0 top-1/3 h-px bg-[#283078]/15" />
              {[
                {
                  step: "i.",
                  caption: "The culture — strains of mycelium, a petri dish",
                  body: (
                    <Image
                      src={AZOTH_MARK.construction.src}
                      alt="Construction sketch — strains of mycelium inside a petri dish"
                      width={AZOTH_MARK.construction.w}
                      height={AZOTH_MARK.construction.h}
                      sizes="(max-width: 640px) 80vw, 260px"
                      className="h-auto w-full"
                    />
                  ),
                },
                {
                  step: "ii.",
                  caption: "The grid — open strokes, rounded at every tip",
                  body: (
                    <Image
                      src={AZOTH_MARK.mark.src}
                      alt="The Azoth monogram in black"
                      width={AZOTH_MARK.mark.w}
                      height={AZOTH_MARK.mark.h}
                      sizes="(max-width: 640px) 50vw, 160px"
                      className="mx-auto h-auto w-[62%]"
                    />
                  ),
                },
                {
                  step: "iii.",
                  caption: "The seal — clipped by a circle, in culture teal",
                  body: <TealSeal className="mx-auto aspect-square w-[78%]" />,
                },
              ].map((s) => (
                <li key={s.step} className="relative flex flex-col bg-white ring-1 ring-[#283078]/10">
                  <div className="flex aspect-square items-center justify-center p-3 sm:p-6">{s.body}</div>
                  <p className={`border-t ${RULE} az-mono px-2 py-2.5 text-[0.55rem] leading-relaxed tracking-[0.04em] text-neutral-500 sm:px-4 sm:py-3 sm:text-[0.62rem]`}>
                    <span className="mr-2 uppercase" style={{ color: AZOTH_INK.teal }}>
                      {s.step}
                    </span>
                    {s.caption}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 02 — The system: the inks, the lockups, the type. ── */}
        <section id="system" className="scroll-mt-0 bg-white">
          <div className={`${SHELL} py-16 lg:py-24`}>
            <div className="grid grid-cols-1 items-end gap-x-14 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <ChapterHead n="02" label="The system" title={AZOTH_SYSTEM.line} />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-6">
                {[
                  { k: "Display", name: AZOTH_SYSTEM.type.display, note: AZOTH_SYSTEM.type.displayNote },
                  { k: "Text", name: AZOTH_SYSTEM.type.text, note: AZOTH_SYSTEM.type.textNote },
                ].map((t) => (
                  <div key={t.k} className={`border-t ${RULE} pt-3`}>
                    <p className={LABEL}>Type — {t.k}</p>
                    <p className="mt-1.5 text-[1.05rem] font-semibold">{t.name}</p>
                    <p className="mt-1.5 text-[0.86rem] leading-relaxed text-neutral-600">{t.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* The two inks as ONE bar, teal the larger — it is the signal. */}
            <div className="mt-12 flex flex-col sm:flex-row">
              {AZOTH_MARK.inks.map((ink, i) => (
                <div
                  key={ink.hex}
                  className={`flex min-h-[11rem] flex-col justify-between p-6 text-white sm:p-8 ${i === 0 ? "sm:flex-[1.6]" : "sm:flex-1"}`}
                  style={{ backgroundColor: ink.hex }}
                >
                  <p className="az-wide text-[0.66rem] uppercase tracking-[0.2em]">{ink.name}</p>
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                    <p className="max-w-[34ch] text-[0.86rem] leading-snug text-white/85">{ink.role}</p>
                    <p className="az-mono text-[0.95rem] tracking-[0.06em]">{ink.hex}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* The lockups, each on the plate it is made for. */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
              <AzothZoom plates={lockupPlates} at={0} label="the stacked colour lockup" className="md:col-span-4 md:row-span-2">
                <span className="relative flex h-full min-h-[18rem] flex-col bg-white ring-1 ring-[#283078]/10">
                  <span className="relative m-8 flex-1">
                    <Image src={lockups.stacked.src} alt="" fill sizes="(max-width: 768px) 80vw, 360px" className="object-contain" />
                  </span>
                  <span className={`border-t ${RULE} px-4 py-3 ${LABEL}`}>Lockup — {lockups.stacked.name}</span>
                </span>
              </AzothZoom>
              {[
                { l: lockups.horizontal, at: 1, ring: "ring-[#283078]/10", text: LABEL },
                { l: lockups.reversed, at: 2, ring: "ring-transparent", text: `${LABEL_BASE} text-[0.62rem] text-white/60` },
              ].map(({ l, at, ring, text }) => (
                <AzothZoom key={l.name} plates={lockupPlates} at={at} label={`the ${l.name.toLowerCase()} lockup`} className="md:col-span-8">
                  <span className={`flex h-full flex-col ring-1 ${ring}`} style={{ backgroundColor: l.plate }}>
                    <span className="flex flex-1 items-center justify-center px-8 py-10">
                      <Image
                        src={l.src}
                        alt=""
                        width={l.w}
                        height={l.h}
                        sizes="(max-width: 768px) 80vw, 420px"
                        className="h-auto w-[min(80%,26rem)]"
                      />
                    </span>
                    <span className={`px-4 pb-3 ${text}`}>Lockup — {l.name}</span>
                  </span>
                </AzothZoom>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 — The family: the house, its five lines on one rail, and
            Mycoveda set apart. ── */}
        <section id="family" className="scroll-mt-0" style={{ backgroundColor: LAB }}>
          <div className={`${SHELL} py-16 lg:py-24`}>
            <div className="grid grid-cols-1 gap-x-14 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <ChapterHead n="03" label="The family" title="One house, many fruiting bodies." />
              </div>
              <p className={`${BODY} lg:col-span-6 lg:col-start-7 lg:self-end`}>
                Five lines were proposed under the parent, each with its own mark while staying inside the house&apos;s
                teal-and-grey grammar — sheets that show the system thinking: lockups, reverses and typography tested
                together, not logo by logo.
              </p>
            </div>

            {/* The house, dropping onto the rail its lines hang from. */}
            <div className="mt-14">
              <div className="flex items-center gap-4">
                <TealSeal className="size-14 shrink-0" />
                <div>
                  <p className="az-wide text-[0.72rem] uppercase tracking-[0.18em]">Azoth Biotech</p>
                  <p className={`${LABEL} mt-1`}>The house — parent client</p>
                </div>
              </div>
              <div aria-hidden className="ml-7 h-8 w-px bg-[#283078]/25" />
              <ul className="grid grid-cols-2 border-t border-[#283078]/25 sm:grid-cols-3 lg:grid-cols-5">
                {AZOTH_BRANDS.map((b) => (
                  <li key={b.id} className="relative pr-3 pt-6">
                    {/* The drop from the rail. */}
                    <span aria-hidden className="absolute left-7 top-0 h-6 w-px bg-[#283078]/25" />
                    <div className="flex h-full flex-col bg-white ring-1 ring-[#283078]/10">
                      <div className="flex h-28 items-center justify-center px-5">
                        {b.logo ? (
                          // A stacked mark (symbol over name) needs the taller box.
                          <span className={`relative block w-full ${b.id === "mushroomworks" ? "h-20" : "h-14"}`}>
                            <Image src={b.logo} alt={b.name} fill sizes="200px" className="object-contain" />
                          </span>
                        ) : (
                          // Lion's Mane has no standalone mark — its name, as
                          // its sheet sets it, in its own purple.
                          <span className="text-center text-[1.35rem] font-extrabold uppercase leading-none" style={{ color: b.accent }}>
                            {b.name}
                          </span>
                        )}
                      </div>
                      <div className={`mt-auto border-t ${RULE} px-4 py-3`}>
                        <p className="text-[0.88rem] font-semibold">{b.name}</p>
                        <p className="mt-0.5 text-[0.78rem] leading-snug text-neutral-600">{b.caption}</p>
                        <p className={`${LABEL_BASE} mt-2 text-[0.56rem] text-neutral-500`}>{b.descriptor}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mycoveda — off the rail, on purpose. */}
            <div className="mt-10 grid grid-cols-1 items-center gap-6 border border-dashed border-[#283078]/30 p-6 sm:grid-cols-[13rem_1fr] sm:p-8">
              <span className="relative block h-12 w-full">
                <Image src={AZOTH_MYCOVEDA.logo} alt="Mycoveda" fill sizes="208px" className="object-contain object-left" />
              </span>
              <div>
                <p className={LABEL}>Apart — a separate client, in development</p>
                <p className="mt-2 max-w-[70ch] text-[0.9rem] leading-relaxed text-neutral-600">{AZOTH_MYCOVEDA.note}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 — Naturalist: the board, the bottle, the strip. ── */}
        <section id="naturalist" className="scroll-mt-0 bg-white">
          <div className={`${SHELL} grid grid-cols-1 gap-x-14 gap-y-12 py-16 lg:grid-cols-12 lg:py-24`}>
            <AzothZoom plates={[{ src: AZOTH_NATURALIST_ARTWORK.src, name: "Naturalist — the brand board" }]} label="the Naturalist brand board" className="lg:sticky lg:top-8 lg:col-span-5 lg:self-start">
              <Image
                src={AZOTH_NATURALIST_ARTWORK.src}
                alt="Naturalist — the full brand board: logo, packaging, colour, typography, the e-commerce site"
                width={AZOTH_NATURALIST_ARTWORK.w}
                height={AZOTH_NATURALIST_ARTWORK.h}
                sizes="(max-width: 1024px) 92vw, 480px"
                className="h-auto w-full ring-1 ring-black/10 transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
            </AzothZoom>

            <div className="min-w-0 lg:col-span-7">
              <ChapterHead n="04" label="Naturalist" />
              <span className="relative mt-6 block h-12 w-56">
                <Image src={naturalist.logo} alt={naturalist.name} fill sizes="224px" className="object-contain object-left" />
              </span>
              <p className={`${LABEL} mt-3`} style={{ color: naturalist.accent }}>
                {naturalist.descriptor}
              </p>
              <p className={`${BODY} mt-4 max-w-[60ch]`}>{naturalist.blurb}</p>

              {/* Brain Fuel, as packaged. */}
              <div className={`mt-8 grid grid-cols-[5.5rem_1fr] items-center gap-6 border-t ${RULE} pt-6 sm:grid-cols-[7rem_1fr]`}>
                {/* A white bottle on a white ground — framed on the lab grey, or
                    it disappears into the page. */}
                <AzothZoom
                  plates={[{ src: AZOTH_BRAIN_FUEL.src, name: "Naturalist Brain Fuel — as packaged" }]}
                  label="the Brain Fuel bottle"
                  className="bg-[#f3f5f7] p-3 ring-1 ring-[#283078]/10"
                >
                  <Image
                    src={AZOTH_BRAIN_FUEL.src}
                    alt="Naturalist Brain Fuel — a 100 ml dropper bottle with its label"
                    width={AZOTH_BRAIN_FUEL.w}
                    height={AZOTH_BRAIN_FUEL.h}
                    sizes="112px"
                    className="h-auto w-full ring-1 ring-black/5"
                  />
                </AzothZoom>
                <div>
                  <p className={LABEL} style={{ color: naturalist.accent }}>
                    Packaging — Brain Fuel
                  </p>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-neutral-600">{AZOTH_BRAIN_FUEL_NOTE}</p>
                </div>
              </div>

              <div className={`mt-8 border-t ${RULE} pt-6`}>
                <AzothStrip posts={naturalistPosts} label={naturalist.name} accent={naturalist.accent} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 05 — Mushroomworks: mirrored — the strip, then the sheet. ── */}
        <section id="mushroomworks" className="scroll-mt-0" style={{ backgroundColor: LAB }}>
          <div className={`${SHELL} grid grid-cols-1 gap-x-14 gap-y-12 py-16 lg:grid-cols-12 lg:py-24`}>
            <div className="min-w-0 lg:col-span-7">
              <ChapterHead n="05" label="Mushroomworks" />
              <span className="relative mt-6 block h-24 w-32">
                <Image src={mushroomworks.logo} alt={mushroomworks.name} fill sizes="128px" className="object-contain object-left" />
              </span>
              <p className={`${LABEL} mt-3`} style={{ color: mushroomworks.accent }}>
                {mushroomworks.descriptor}
              </p>
              <p className={`${BODY} mt-4 max-w-[60ch]`}>{mushroomworks.blurb}</p>
              <div className={`mt-8 border-t ${RULE} pt-6`}>
                <AzothStrip posts={mushroomworksPosts} label={mushroomworks.name} accent={mushroomworks.accent} />
              </div>
            </div>
            <AzothZoom
              plates={[{ src: AZOTH_MUSHROOMWORKS_SHEET.src, name: "Mushroomworks — the system sheet" }]}
              label="the Mushroomworks system sheet"
              className="lg:sticky lg:top-8 lg:col-span-5 lg:self-start"
            >
              <span className="flex flex-col bg-white ring-1 ring-black/10">
                <Image
                  src={AZOTH_MUSHROOMWORKS_SHEET.src}
                  alt="Mushroomworks — the mark, its lockups and reverses on one sheet"
                  width={AZOTH_MUSHROOMWORKS_SHEET.w}
                  height={AZOTH_MUSHROOMWORKS_SHEET.h}
                  sizes="(max-width: 1024px) 92vw, 480px"
                  className="mx-auto h-auto w-full max-w-[26rem]"
                />
                <span className={`border-t ${RULE} px-4 py-3 ${LABEL}`}>{mushroomworks.caption}</span>
              </span>
            </AzothZoom>
          </div>
        </section>

        {/* ── 06 — The house: the parent's own programme, on navy. ── */}
        <section id="house" className="scroll-mt-0 text-white" style={{ backgroundColor: AZOTH_INK.navy }}>
          <div className={`${SHELL} grid grid-cols-1 gap-x-14 gap-y-10 py-16 lg:grid-cols-12 lg:py-24`}>
            <div className="lg:col-span-4">
              <ChapterHead n="06" label="The house" title="The parent, in its own voice." dark />
              <p className="mt-6 text-[0.98rem] leading-[1.7] text-white/75">{AZOTH_HOUSE.line}</p>
              <Image
                src={lockups.reversed.src}
                alt=""
                width={lockups.reversed.w}
                height={lockups.reversed.h}
                sizes="220px"
                className="mt-10 h-auto w-52 opacity-90"
              />
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
              {AZOTH_HOUSE.pieces.map((p, i) => (
                <li key={p.src}>
                  <AzothZoom plates={housePlates} at={i} label={p.caption}>
                    <span className="relative block aspect-[4/5] overflow-hidden bg-white/5">
                      <Image
                        src={p.src}
                        alt={p.caption}
                        fill
                        sizes="(max-width: 640px) 92vw, 400px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="az-mono mt-3 block text-[0.66rem] leading-relaxed tracking-[0.04em] text-white/60">
                      {p.caption}
                    </span>
                  </AzothZoom>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 07 — Explorations: the roads not taken. ── */}
        <section id="explorations" className="scroll-mt-0 bg-white">
          <div className={`${SHELL} grid grid-cols-1 gap-x-14 gap-y-12 py-16 lg:grid-cols-12 lg:py-24`}>
            <div className="lg:col-span-4">
              <ChapterHead n="07" label="Explorations" title="The road not taken." />
              <p className={`${BODY} mt-6`}>
                For every mark that shipped, a wall of ones that didn&apos;t. The exploration sheets behind Azoth and its
                brands — dozens of directions pressure-tested before the finals earned their place.
              </p>
            </div>
            {/* The sheets, laid out like paper on a bench — a slight turn each,
                squared up under the pointer. */}
            <ul className="grid grid-cols-3 gap-3 sm:gap-6 lg:col-span-8">
              {AZOTH_REJECTED.map((r, i) => (
                <li key={r.name} className={i === 0 ? "-rotate-2" : i === 2 ? "rotate-2" : "translate-y-4"}>
                  <AzothZoom plates={rejectedPlates} at={i} label={`the ${r.name} explorations`}>
                    <span className="block bg-white shadow-[0_18px_40px_-18px_rgba(40,48,120,0.45)] ring-1 ring-black/10 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0">
                      <Image
                        src={r.src}
                        alt={`${r.name} — logo explorations`}
                        width={r.w}
                        height={r.h}
                        sizes="(max-width: 1024px) 30vw, 260px"
                        className="h-auto w-full"
                      />
                    </span>
                    <span className={`${LABEL} mt-3 block`}>{r.name}</span>
                  </AzothZoom>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="border-t border-[#283078]/15 bg-white">
          <div className={`${SHELL} flex flex-wrap items-center justify-between gap-4 py-8`}>
            <p className={LABEL}>Azoth Biotech — identity, collateral, social &amp; web · client work, shown as portfolio record</p>
            <a href="#work" className={`${LABEL} transition-colors hover:text-[#283078]`}>
              Back to top ↑
            </a>
          </div>
        </footer>
      </ExperienceTransition>
    </main>
  );
}
