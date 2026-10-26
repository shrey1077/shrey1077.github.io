/**
 * AzothExperience — the bespoke Azoth Biotech client page.
 *
 * ⚠ RE-COMPOSED 2026-10-06 (owner: "redo the azoth page… use the new color
 * logo, and recompose all info on the page… start under" the hero), and
 * again on 2026-10-17 (owner: "redesign the azoth page (not slide) below the
 * top artwork, need impeccable typography and composition … I want to
 * display all my posts as currently visible"). The hero — the rocky ridge
 * and the flowering one under the spotlight — is untouched.
 *
 * THE 2026-10-17 COMPOSITION — an editorial page on a twelve-column grid:
 *
 *   ┌──────────┬──────────────────────────────────────────────┐
 *   │ 01       │ Headline, balanced, two lines at most.        │
 *   │ THE MARK │ The lead, larger than the body.               │
 *   │ (margin) │ ──────────────────────────────────────────── │
 *   │          │ The work, on the content column (9 of 12)     │
 *   └──────────┴──────────────────────────────────────────────┘
 *     the posts, the width of the page, in full rows
 *
 *   · Every chapter opens the same way (ChapterHead): its number large in the
 *     margin, its name under it; the headline and lead in the content column.
 *     One alignment from top to bottom — everything starts at column 4.
 *   · One type scale (EYEBROW, H2, LEAD, BODY, CAPTION): the reading sizes
 *     up (the body was 15.7 px in grey, the captions 9 px), the body in
 *     neutral-700 for contrast, headlines balanced and paragraphs set
 *     `pretty`, measures held to 58–64 characters.
 *   · A chapter bar under the masthead stays at the top and marks the
 *     chapter being read (AzothChapterNav) — the page runs ten screens.
 *   · Every post stays on the page (AzothPosts): full rows on a wide screen
 *     (18 → six across, 14 → seven), any short last row centred narrower;
 *     a post opens large and the viewer walks the set.
 *
 * The design rules it keeps: SQUARE corners and hairlines (a lab's
 * precision), teal as the ONE signal on every surface, navy as the voice.
 * Faces: .az-wide (Michroma) for numbers and labels, .az-text (Barlow) to
 * read, .az-mono (Plex Mono) for the data — globals.css.
 *
 * Server Component; the zoom, the chapter bar and the posts are client
 * children.
 */

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { AzothHero } from "@/components/client/azoth/AzothHero";
import { AzothZoom } from "@/components/client/azoth/AzothZoom";
import { AzothPosts } from "@/components/client/azoth/AzothPosts";
import { AzothChapterNav } from "@/components/client/azoth/AzothChapterNav";
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

// ── The grid and the type scale ───────────────────────────────────────────
const SHELL = "mx-auto w-full max-w-[84rem] px-5 sm:px-10 lg:px-14";
/** The content column: columns 4–12 on a wide screen. */
const CONTENT = "lg:col-span-9 lg:col-start-4";
/** A chapter's vertical rhythm. */
const CHAPTER = "scroll-mt-12 py-20 sm:py-24 lg:py-32";
/** The cool lab white the alternate chapters sit on. */
const LAB = "#f3f5f7";
const RULE = "border-[#283078]/12";

const EYEBROW = "az-mono text-[0.72rem] uppercase leading-none tracking-[0.18em] text-neutral-500";
const H2 = "az-text text-balance text-[clamp(2rem,3.4vw,3.15rem)] font-semibold leading-[1.06] tracking-[-0.025em]";
const LEAD = "az-text text-pretty text-[clamp(1.08rem,1.3vw,1.22rem)] leading-[1.6] text-neutral-700";
const BODY = "az-text text-pretty text-[1rem] leading-[1.72] text-neutral-700";
const CAPTION = "az-mono text-[0.72rem] leading-[1.6] tracking-[0.02em] text-neutral-500";

/** A chapter's opening: the number large in the margin with its name under
 *  it; the headline (or a brand's mark) and the lead in the content column. */
function ChapterHead({
  n,
  label,
  title,
  mark,
  kicker,
  lead,
  dark = false,
}: {
  n: string;
  label: string;
  title?: string;
  /** In place of a headline: the brand's own mark. */
  mark?: React.ReactNode;
  /** A line above the headline (a brand's descriptor). */
  kicker?: React.ReactNode;
  lead?: string;
  dark?: boolean;
}) {
  return (
    <header className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:gap-x-10">
      <div className="flex items-baseline gap-4 lg:col-span-3 lg:flex-col lg:gap-3">
        <span className="az-wide text-[clamp(1.6rem,3vw,2.6rem)] leading-none tracking-[0.02em]" style={{ color: AZOTH_INK.teal }}>
          {n}
        </span>
        <span className={`az-wide text-[0.66rem] uppercase tracking-[0.22em] ${dark ? "text-white/60" : "text-neutral-500"}`}>{label}</span>
      </div>
      <div className={CONTENT}>
        {kicker}
        {mark}
        {title && (
          <h2 className={`${H2} max-w-[20ch] ${dark ? "text-white" : ""}`} style={dark ? undefined : { color: AZOTH_INK.navy }}>
            {title}
          </h2>
        )}
        {lead && <p className={`${LEAD} mt-6 max-w-[58ch] ${dark ? "!text-white/75" : ""}`}>{lead}</p>}
      </div>
    </header>
  );
}

/** The seal in teal: the black master mark — the monogram clipped by its
 *  circle — used as a mask over the ink, so it is the logo's own teal, not a
 *  recoloured file. */
function TealSeal({ className = "" }: { className?: string }) {
  const mask = `url("${encodeURI(AZOTH_MARK.seal.src)}") center / contain no-repeat`;
  return <span aria-hidden className={`block ${className}`} style={{ backgroundColor: AZOTH_INK.teal, mask, WebkitMask: mask }} />;
}

/** A brand's social system: its count, then every post, the page's width. */
function Posts({ posts, brand, accent }: { posts: string[]; brand: string; accent: string }) {
  return (
    <div className={`${SHELL} pb-20 sm:pb-24 lg:pb-32`}>
      <div className={`mb-6 flex items-baseline justify-between gap-4 border-t ${RULE} pt-5`}>
        <p className={EYEBROW}>
          <span style={{ color: accent }}>The social system</span> · {brand}
        </p>
        <p className={`${EYEBROW} tabular-nums`}>{posts.length} posts</p>
      </div>
      <AzothPosts posts={posts} brand={brand} accent={accent} />
    </div>
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
  const family = AZOTH_BRANDS.length;

  return (
    <main className="az-text min-h-dvh w-full bg-white" style={{ color: AZOTH_INK.navy }}>
      {/* The client-supplied hero, full bleed — kept exactly as it was. */}
      <AzothHero />

      <ExperienceTransition>
        {/* ── Masthead — the hero's "Explore" lands here (#work). ── */}
        <section id="work" className="scroll-mt-0 bg-white">
          <div className={`${SHELL} grid grid-cols-1 gap-x-10 gap-y-12 pb-16 pt-16 sm:pt-20 lg:grid-cols-12 lg:pb-20 lg:pt-28`}>
            {/* The colour lockup — the page's logo — in the margin columns. */}
            <div className="lg:col-span-3">
              <Image
                src={AZOTH.logo.src}
                alt="Azoth Biotech — the colour lockup: the teal monogram over the navy wordmark"
                width={AZOTH.logo.w}
                height={AZOTH.logo.h}
                priority
                sizes="(max-width: 1024px) 50vw, 280px"
                className="h-auto w-[min(56%,15rem)] lg:w-full lg:max-w-[16rem]"
              />
            </div>
            <div className={CONTENT}>
              <p className={EYEBROW}>
                Client <span style={{ color: AZOTH_INK.teal }}>/</span> Biotechnology
              </p>
              <h2 className="az-text mt-6 max-w-[22ch] text-balance text-[clamp(2.25rem,4.6vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
                {AZOTH.tagline}
              </h2>
              <p className={`${LEAD} mt-8 max-w-[60ch]`}>{AZOTH.scope}</p>

              {/* The facts — one ruled row. */}
              <dl className={`mt-12 grid grid-cols-2 border-t ${RULE} sm:grid-cols-4`}>
                {AZOTH.facts.map((f, i) => (
                  <div key={f.label} className={`border-b ${RULE} py-5 pr-4 sm:border-b-0 ${i % 2 === 1 ? "pl-4 sm:pl-0" : ""}`}>
                    <dt className={EYEBROW}>{f.label}</dt>
                    <dd className="mt-2.5 text-[1.02rem] font-medium leading-snug">
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
            </div>
          </div>
        </section>

        {/* The chapters, kept at the top from here on. */}
        <AzothChapterNav chapters={AZOTH_CHAPTERS} shell={SHELL} />

        {/* ── 01 — The mark: the brief, then culture → grid → seal. ── */}
        <section id="mark" className={CHAPTER} style={{ backgroundColor: LAB }}>
          <div className={SHELL}>
            <ChapterHead n="01" label="The mark" title={AZOTH_MARK_STORY.headline} lead={AZOTH_MARK_STORY.brief} />
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              <div className={CONTENT}>
                <p className={`${BODY} max-w-[62ch]`}>{AZOTH_MARK_STORY.build}</p>
                {/* Three stages on one rail. */}
                <ol className="relative mt-12 grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    {
                      step: "i",
                      caption: "The culture — strains of mycelium, a petri dish",
                      body: (
                        <Image
                          src={AZOTH_MARK.construction.src}
                          alt="Construction sketch — strains of mycelium inside a petri dish"
                          width={AZOTH_MARK.construction.w}
                          height={AZOTH_MARK.construction.h}
                          sizes="(max-width: 640px) 80vw, 300px"
                          className="h-auto w-full"
                        />
                      ),
                    },
                    {
                      step: "ii",
                      caption: "The grid — open strokes, rounded at every tip",
                      body: (
                        <Image
                          src={AZOTH_MARK.mark.src}
                          alt="The Azoth monogram in black"
                          width={AZOTH_MARK.mark.w}
                          height={AZOTH_MARK.mark.h}
                          sizes="(max-width: 640px) 50vw, 180px"
                          className="mx-auto h-auto w-[60%]"
                        />
                      ),
                    },
                    {
                      step: "iii",
                      caption: "The seal — clipped by a circle, in culture teal",
                      body: <TealSeal className="mx-auto aspect-square w-[74%]" />,
                    },
                  ].map((s) => (
                    <li key={s.step} className="flex flex-col bg-white ring-1 ring-[#283078]/10">
                      <div className="flex aspect-square items-center justify-center p-3 sm:p-6 lg:p-8">{s.body}</div>
                      <p className={`border-t ${RULE} ${CAPTION} flex gap-2 px-2.5 py-2.5 max-sm:!text-[0.6rem] max-sm:!leading-[1.45] sm:gap-3 sm:px-4 sm:py-3.5`}>
                        <span className="az-wide shrink-0 uppercase" style={{ color: AZOTH_INK.teal }}>
                          {s.step}
                        </span>
                        {s.caption}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 — The system: the type, the inks, the lockups. ── */}
        <section id="system" className={`${CHAPTER} bg-white`}>
          <div className={SHELL}>
            <ChapterHead n="02" label="The system" title={AZOTH_SYSTEM.line} />
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              <div className={CONTENT}>
                {/* The two faces, side by side. */}
                <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
                  {[
                    { k: "Display", name: AZOTH_SYSTEM.type.display, note: AZOTH_SYSTEM.type.displayNote },
                    { k: "Text", name: AZOTH_SYSTEM.type.text, note: AZOTH_SYSTEM.type.textNote },
                  ].map((t) => (
                    <div key={t.k} className={`border-t ${RULE} pt-5`}>
                      <p className={EYEBROW}>Type — {t.k}</p>
                      <p className="mt-3 text-[1.25rem] font-semibold leading-snug">{t.name}</p>
                      <p className={`${BODY} mt-2 max-w-[44ch]`}>{t.note}</p>
                    </div>
                  ))}
                </div>

                {/* The two inks as ONE bar, teal the larger — it is the signal. */}
                <div className="mt-14 flex flex-col sm:flex-row">
                  {AZOTH_MARK.inks.map((ink, i) => (
                    <div
                      key={ink.hex}
                      className={`flex min-h-[12rem] flex-col justify-between p-6 text-white sm:p-8 ${i === 0 ? "sm:flex-[1.6]" : "sm:flex-1"}`}
                      style={{ backgroundColor: ink.hex }}
                    >
                      <p className="az-wide text-[0.7rem] uppercase tracking-[0.2em]">{ink.name}</p>
                      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                        <p className="max-w-[34ch] text-[0.95rem] leading-snug text-white/85">{ink.role}</p>
                        <p className="az-mono text-[1rem] tracking-[0.06em]">{ink.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* The lockups, each on the plate it is made for. */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                  <AzothZoom plates={lockupPlates} at={0} label="the stacked colour lockup" className="md:col-span-5 md:row-span-2">
                    <span className="flex h-full min-h-[20rem] flex-col bg-white ring-1 ring-[#283078]/10">
                      <span className="relative m-10 flex-1">
                        <Image src={lockups.stacked.src} alt="" fill sizes="(max-width: 768px) 80vw, 380px" className="object-contain" />
                      </span>
                      <span className={`border-t ${RULE} px-4 py-3.5 ${CAPTION}`}>Lockup — {lockups.stacked.name}</span>
                    </span>
                  </AzothZoom>
                  {[
                    { l: lockups.horizontal, at: 1, ring: "ring-[#283078]/10", text: CAPTION },
                    { l: lockups.reversed, at: 2, ring: "ring-transparent", text: `${CAPTION} !text-white/65` },
                  ].map(({ l, at, ring, text }) => (
                    <AzothZoom key={l.name} plates={lockupPlates} at={at} label={`the ${l.name.toLowerCase()} lockup`} className="md:col-span-7">
                      <span className={`flex h-full flex-col ring-1 ${ring}`} style={{ backgroundColor: l.plate }}>
                        <span className="flex flex-1 items-center justify-center px-8 py-12">
                          <Image src={l.src} alt="" width={l.w} height={l.h} sizes="(max-width: 768px) 80vw, 420px" className="h-auto w-[min(78%,24rem)]" />
                        </span>
                        <span className={`px-4 pb-3.5 ${text}`}>Lockup — {l.name}</span>
                      </span>
                    </AzothZoom>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 03 — The family: the house, its lines on one rail, and Mycoveda
            set apart. ── */}
        <section id="family" className={CHAPTER} style={{ backgroundColor: LAB }}>
          <div className={SHELL}>
            <ChapterHead
              n="03"
              label="The family"
              title="One house, many fruiting bodies."
              lead="Four lines were proposed under the parent, each with its own mark while staying inside the house's teal-and-grey grammar — sheets that show the system thinking: lockups, reverses and typography tested together, not logo by logo."
            />
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              <div className={CONTENT}>
                {/* The house, dropping onto the rail its lines hang from. */}
                <div className="flex items-center gap-4">
                  <TealSeal className="size-14 shrink-0" />
                  <div>
                    <p className="az-wide text-[0.78rem] uppercase tracking-[0.18em]">Azoth Biotech</p>
                    <p className={`${EYEBROW} mt-2`}>The house — parent client</p>
                  </div>
                </div>
                <div aria-hidden className="ml-7 h-8 w-px bg-[#283078]/25" />
                {/* Two across, three, then all in a row — the last of an
                    odd row takes the row, so none stands alone. Four since
                    Lion's Mane came off (2026-10-26): two by two, then four. */}
                <ul className={`grid grid-cols-2 gap-3 border-t border-[#283078]/25 ${family === 4 ? "sm:grid-cols-4 lg:grid-cols-4" : "sm:grid-cols-6 lg:grid-cols-5"}`}>
                  {AZOTH_BRANDS.map((b, i) => {
                    const lastOdd = i === family - 1 && family % 2 === 1;
                    const smWide = family === 5 && i >= 3;
                    return (
                      <li key={b.id} className={`relative pt-6 ${lastOdd ? "col-span-2 sm:col-span-2" : ""} ${smWide ? "sm:!col-span-3" : "sm:col-span-2"} lg:!col-span-1`}>
                        {/* The drop from the rail. */}
                        <span aria-hidden className="absolute left-7 top-0 h-6 w-px bg-[#283078]/25" />
                        <div className="flex h-full flex-col bg-white ring-1 ring-[#283078]/10">
                          <div className="flex h-32 items-center justify-center px-5">
                            {b.logo ? (
                              <span className={`relative block w-full ${b.id === "mushroomworks" ? "h-24" : "h-14"}`}>
                                <Image src={b.logo} alt={b.name} fill sizes="200px" className="object-contain" />
                              </span>
                            ) : (
                              // Lion's Mane has no standalone mark — its name, as
                              // its sheet sets it, in its own purple.
                              <span className="text-center text-[1.4rem] font-extrabold uppercase leading-none" style={{ color: b.accent }}>
                                {b.name}
                              </span>
                            )}
                          </div>
                          {/* The words start on one line across the row, under the marks (since
                              2026-10-26; they stood at the card's foot, so a longer
                              card's began higher). */}
                          <div className={`border-t ${RULE} px-4 py-4`}>
                            <p className="text-[0.95rem] font-semibold leading-snug">{b.name}</p>
                            <p className="mt-1 text-[0.86rem] leading-snug text-neutral-600">{b.caption}</p>
                            <p className={`${CAPTION} mt-3 uppercase !tracking-[0.12em]`}>{b.descriptor}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Mycoveda — off the rail, on purpose. */}
                <div className="mt-12 grid grid-cols-1 items-center gap-6 border border-dashed border-[#283078]/30 p-6 sm:grid-cols-[9rem_1fr] sm:gap-10 sm:p-8">
                  {/* The official mark, its arch standing (2026-10-26). */}
                  <span className="relative block h-36 w-full max-w-[9rem] sm:h-40" style={{ aspectRatio: String(AZOTH_MYCOVEDA.logoAspect) }}>
                    <Image src={AZOTH_MYCOVEDA.logo} alt="Mycoveda" fill sizes="144px" className="object-contain object-left" />
                  </span>
                  <div>
                    <p className={EYEBROW}>Apart — a separate client</p>
                    <p className={`${BODY} mt-3 max-w-[64ch]`}>{AZOTH_MYCOVEDA.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 04 — Naturalist: the mark, the board and the bottle, then every
            post. ── */}
        <section id="naturalist" className="scroll-mt-12 bg-white">
          <div className={`${SHELL} pb-14 pt-20 sm:pt-24 lg:pb-20 lg:pt-32`}>
            <ChapterHead
              n="04"
              label="Naturalist"
              mark={
                <span className="relative block h-14 w-64 sm:h-16 sm:w-72">
                  <Image src={naturalist.logo} alt={naturalist.name} fill sizes="288px" className="object-contain object-left" />
                </span>
              }
              kicker={
                <p className={`${EYEBROW} mb-6`} style={{ color: naturalist.accent }}>
                  {naturalist.descriptor}
                </p>
              }
              lead={naturalist.blurb}
            />
            <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10">
              <AzothZoom
                plates={[{ src: AZOTH_NATURALIST_ARTWORK.src, name: "Naturalist — the brand board" }]}
                label="the Naturalist brand board"
                className="lg:col-span-6 lg:col-start-4"
              >
                <Image
                  src={AZOTH_NATURALIST_ARTWORK.src}
                  alt="Naturalist — the full brand board: logo, packaging, colour, typography, the e-commerce site"
                  width={AZOTH_NATURALIST_ARTWORK.w}
                  height={AZOTH_NATURALIST_ARTWORK.h}
                  sizes="(max-width: 1024px) 92vw, 620px"
                  className="h-auto w-full ring-1 ring-black/10 transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                />
              </AzothZoom>
              {/* Brain Fuel, as packaged — beside the board. */}
              <div className="grid grid-cols-[6.5rem_1fr] items-start gap-6 lg:col-span-3 lg:grid-cols-1 lg:content-start">
                <AzothZoom
                  plates={[{ src: AZOTH_BRAIN_FUEL.src, name: "Naturalist Brain Fuel — as packaged" }]}
                  label="the Brain Fuel bottle"
                  className="bg-[#f3f5f7] p-3 ring-1 ring-[#283078]/10 lg:p-5"
                >
                  <Image
                    src={AZOTH_BRAIN_FUEL.src}
                    alt="Naturalist Brain Fuel — a 100 ml dropper bottle with its label"
                    width={AZOTH_BRAIN_FUEL.w}
                    height={AZOTH_BRAIN_FUEL.h}
                    sizes="(max-width: 1024px) 104px, 260px"
                    className="mx-auto h-auto w-full max-w-[13rem] ring-1 ring-black/5"
                  />
                </AzothZoom>
                <div>
                  <p className={EYEBROW} style={{ color: naturalist.accent }}>
                    Packaging — Brain Fuel
                  </p>
                  <p className={`${BODY} mt-3 !text-[0.95rem]`}>{AZOTH_BRAIN_FUEL_NOTE}</p>
                </div>
              </div>
            </div>
          </div>
          <Posts posts={naturalistPosts} brand="Naturalist" accent={naturalist.accent} />
        </section>

        {/* ── 05 — Mushroomworks: the mark, the system sheet, then every post. ── */}
        <section id="mushroomworks" className="scroll-mt-12" style={{ backgroundColor: LAB }}>
          <div className={`${SHELL} pb-14 pt-20 sm:pt-24 lg:pb-20 lg:pt-32`}>
            <ChapterHead
              n="05"
              label="Mushroomworks"
              mark={
                <span className="relative block h-24 w-36 sm:h-28 sm:w-40">
                  <Image src={mushroomworks.logo} alt={mushroomworks.name} fill sizes="160px" className="object-contain object-left" />
                </span>
              }
              kicker={
                <p className={`${EYEBROW} mb-6`} style={{ color: mushroomworks.accent }}>
                  {mushroomworks.descriptor}
                </p>
              }
              lead={mushroomworks.blurb}
            />
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              <AzothZoom
                plates={[{ src: AZOTH_MUSHROOMWORKS_SHEET.src, name: "Mushroomworks — the system sheet" }]}
                label="the Mushroomworks system sheet"
                className="lg:col-span-5 lg:col-start-4"
              >
                <span className="flex flex-col bg-white ring-1 ring-black/10">
                  <Image
                    src={AZOTH_MUSHROOMWORKS_SHEET.src}
                    alt="Mushroomworks — the mark, its lockups and reverses on one sheet"
                    width={AZOTH_MUSHROOMWORKS_SHEET.w}
                    height={AZOTH_MUSHROOMWORKS_SHEET.h}
                    sizes="(max-width: 1024px) 92vw, 520px"
                    className="mx-auto h-auto w-full max-w-[30rem]"
                  />
                </span>
              </AzothZoom>
              {/* What the sheet holds — beside it, as Brain Fuel stands beside
                  Naturalist's board. */}
              <div className="mt-8 lg:col-span-3 lg:mt-0">
                <p className={EYEBROW} style={{ color: mushroomworks.accent }}>
                  The system sheet
                </p>
                {/* The sheet holds the MW mark, not the gear that is the brand's
                    official mark now (2026-10-26): its own caption. */}
                <p className="mt-3 text-[1.15rem] font-semibold leading-snug">The MW mark — the cap that grows into an arrow.</p>
                <p className={`${BODY} mt-3 !text-[0.95rem]`}>The mark, its lockups and its reverses, tested together on one sheet.</p>
              </div>
            </div>
          </div>
          <Posts posts={mushroomworksPosts} brand="Mushroomworks" accent={mushroomworks.accent} />
        </section>

        {/* ── 06 — The house: the parent's own programme, on navy. ── */}
        <section id="house" className={`${CHAPTER} text-white`} style={{ backgroundColor: AZOTH_INK.navy }}>
          <div className={SHELL}>
            <ChapterHead n="06" label="The house" title="The parent, in its own voice." lead={AZOTH_HOUSE.line} dark />
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              <div className={CONTENT}>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {AZOTH_HOUSE.pieces.map((p, i) => (
                    <li key={p.src}>
                      <AzothZoom plates={housePlates} at={i} label={p.caption}>
                        <span className="relative block aspect-[4/5] overflow-hidden bg-white/5">
                          <Image
                            src={p.src}
                            alt={p.caption}
                            fill
                            sizes="(max-width: 640px) 92vw, 440px"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        </span>
                        <span className={`${CAPTION} mt-3.5 block !text-white/65`}>{p.caption}</span>
                      </AzothZoom>
                    </li>
                  ))}
                </ul>
                <Image src={lockups.reversed.src} alt="" width={lockups.reversed.w} height={lockups.reversed.h} sizes="220px" className="mt-14 h-auto w-48 opacity-90" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 07 — Explorations: the roads not taken. ── */}
        <section id="explorations" className={`${CHAPTER} bg-white`}>
          <div className={SHELL}>
            <ChapterHead
              n="07"
              label="Explorations"
              title="The road not taken."
              lead="For every mark that shipped, a wall of ones that didn't. The exploration sheets behind Azoth and its brands — dozens of directions pressure-tested before the finals earned their place."
            />
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 lg:gap-x-10">
              {/* The sheets, laid like paper on a bench — a slight turn each,
                  squared up under the pointer. */}
              <ul className={`${CONTENT} grid grid-cols-3 gap-3 sm:gap-8`}>
                {AZOTH_REJECTED.map((r, i) => (
                  <li key={r.name} className={i === 0 ? "-rotate-2" : i === 2 ? "rotate-2" : "translate-y-4"}>
                    <AzothZoom plates={rejectedPlates} at={i} label={`the ${r.name} explorations`}>
                      <span className="block bg-white shadow-[0_18px_40px_-18px_rgba(40,48,120,0.45)] ring-1 ring-black/10 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-0">
                        <Image src={r.src} alt={`${r.name} — logo explorations`} width={r.w} height={r.h} sizes="(max-width: 1024px) 30vw, 300px" className="h-auto w-full" />
                      </span>
                      <span className={`${CAPTION} mt-4 block uppercase !tracking-[0.12em]`}>{r.name}</span>
                    </AzothZoom>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className={`border-t ${RULE} bg-white`}>
          <div className={`${SHELL} flex flex-wrap items-center justify-between gap-4 py-10`}>
            <p className={`${CAPTION} max-w-[60ch]`}>Azoth Biotech — identity, collateral, social &amp; web · client work, shown as portfolio record</p>
            <a href="#work" className={`${EYEBROW} transition-colors hover:text-[#283078]`}>
              Back to top ↑
            </a>
          </div>
        </footer>
      </ExperienceTransition>
    </main>
  );
}
