/**
 * TataExperience — the bespoke Tata IIS full-experience page.
 *
 * ⚠ RE-LAID 2026-09-22 FROM THE OWNER'S COMP. It was a centred stack — wordmark,
 * description, the two campuses, then the work. It is now a two-column hero and
 * a run of numbered bands, which is what that comp asks for:
 *
 *   hero          wordmark, the pitch, the campaign artwork, endorsements
 *   01 institute  what Tata IIS is, against a campus photograph
 *   02 system     the parent mark over its two campus dialects
 *   03 brand DNA  five cards, each a real plate from the rulebooks
 *   04 the work   the owner's account, then the six rooms as cards
 *   05 collaborate
 *   marquee + TataFooter
 *
 * The copy and the pointers live in `tataStory.ts`; this file is the layout.
 *
 * ⚠ THE ROOMS BEHAVE EXACTLY AS BEFORE. Six of them, one open at a time, the
 * same sliders inside. Only their presentation changed — see TataSectionsBoard.
 *
 * ⚠ The comp's marks are redrawn approximations and its campus taglines are
 * invented. Everything on the page is the client's own file or the repo's own
 * words; tataStory.ts says so at more length, and it matters.
 *
 * Server Component: reads the (already curated) catalogue folders and regroups
 * them under the work families; the interactive pieces are client children.
 */

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { clientExperienceBySlug } from "@/constants/clientExperiences";
import { readCatalogueCategory } from "@/content/catalogue";
import {
  TATA_DESCRIPTION,
  TATA_POWERED_BY,
  TATA_PARTNERS,
  TATA_GRID,
  tataSubcatMockup,
} from "@/constants/tataExperience";
import { brandOf, TATA_SECTIONS, TATA_WORK_INTRO } from "@/constants/tataSections";
import {
  TATA_COLLABORATE,
  TATA_DNA,
  TATA_DNA_CARDS,
  TATA_HERO,
  TATA_INSTITUTE,
  TATA_LOCKUP,
  TATA_SYSTEM,
  TATA_WORK_BAND,
  type TataBand,
} from "@/constants/tataStory";
import { TATA_PINS } from "@/constants/tataPins";
import { TataRoomLink } from "@/components/client/tata/TataRoomLink";
import { SITE } from "@/constants/site";
import { TATA_THEMES, THEME_SLIDER_MAX } from "@/constants/tataThemes";
import type { GuidelineBrand } from "@/components/client/tata/GuidelineSlider";
import type { CollectionAsset } from "@/types/experience";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { PartnerMarquee } from "@/components/client/tata/PartnerMarquee";
import { TATA_GUIDELINES } from "@/constants/tataExperience";
import { type ResolvedSection } from "@/components/client/tata/WorkSections";
import { TataSectionsBoard } from "@/components/client/tata/TataSectionsBoard";
import { TataFooter } from "@/components/client/tata/TataFooter";

const SLUG = "tata-iis";
/* ⚠ THESE LIVE AT MODULE SCOPE, and must stay there. Declaring a component
 * inside another one makes React see a brand-new type on every render, which
 * remounts its whole subtree — the lint rule `react-hooks/static-components`
 * fails the build over it. They were defined inside TataExperience first and
 * moved straight back out. */

/** Every band shares one inset, so the numbers line up down the page. */
const SHELL = "mx-auto w-full max-w-7xl px-6 sm:px-10";
/** The small letterspaced caps the comp sets every label in. */
const KICKER = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

/** The words set small down the right edge of a band. Desktop only: they are
 *  atmosphere, and on a phone they would be four more lines to scroll past. */
const Rail = ({ words }: { words: readonly string[] }) => (
  <p aria-hidden className={`${KICKER} hidden self-start leading-[2.2] xl:block`}>
    {words.map((w) => (
      <span key={w} className="block">
        {w}
      </span>
    ))}
  </p>
);

/** One numbered band: the number, the words, the evidence, the rail. */
const Band = ({
  band,
  ground = "bg-white/45",
  cta,
  children,
}: {
  band: TataBand;
  ground?: string;
  cta?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className={`border-t border-neutral-200/70 ${ground}`}>
    <div
      className={`${SHELL} grid grid-cols-1 items-start gap-y-8 py-14 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:gap-x-10 lg:py-20`}
    >
      {/* The number is decoration — the heading below carries the meaning,
          and a screen reader announcing "zero one" first helps nobody. */}
      <p aria-hidden className="tata-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.85] text-neutral-300">
        {band.number}
      </p>

      <div className="max-w-md">
        <span className={KICKER}>{band.kicker}</span>
        <h2 className="tata-display mt-4 text-[clamp(1.55rem,2.7vw,2.25rem)] leading-[1.12] text-neutral-900">
          {band.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        {band.body && (
          <p className="tata-body mt-5 text-[0.9rem] leading-relaxed text-neutral-700">{band.body}</p>
        )}
        {cta && <div className="mt-7">{cta}</div>}
      </div>

      <div className="min-w-0">{children}</div>

      {band.rail ? <Rail words={band.rail} /> : <span aria-hidden />}
    </div>
  </section>
);

export function TataExperience() {
  const theme = clientExperienceBySlug(SLUG)?.brandTheme;
  // The page speaks in exactly two typefaces: Copperplate Gothic Bold for
  // headings (.tata-heading) and Helvetica for everything else. The
  // `tata-scope` class (see globals.css) collapses any shared component's
  // voiced utilities to Helvetica so no third face leaks in.
  const themeVars = {
    "--brand-accent": theme?.accent ?? "#14279B",
  } as React.CSSProperties;

  // A mockup cutout is used only when its file is actually on disk (the
  // slice script may not have produced every one) — a missing PNG then just
  // renders as a plain row/chip instead of a broken image.
  const mockupIfPresent = (url: string): string | undefined =>
    fs.existsSync(path.join(process.cwd(), "public", url.replace(/^\//, "")))
      ? url
      : undefined;

  // Resolve every subsection against the catalogue. A subsection with no
  // folder — or a folder that has no assets yet — keeps its slot in the grid
  // and renders as a pending tile, so the taxonomy always reads whole.
  /* The theme slider each section opens with. Same switch as the guidelines —
   * Tata IIS / IISA / IISM — but showing that section's OWN work, split by
   * `brandOf()` on the filename.
   *
   * ⚠ Digital is fed from the Mockups folder specifically (the owner's ask),
   * not from every Digital subsection: 68 themed mockups already sit there and
   * they are the staged, presentable face of that section. Every other section
   * pools all of its subsections. A brand with nothing to show is dropped
   * rather than rendered as an empty deck. */
  const themePool = (assets: CollectionAsset[]): GuidelineBrand[] =>
    TATA_THEMES.map((t) => ({
      ...t,
      plates: assets
        .filter((a) => a.kind === "image" && brandOf(a.name) === t.id)
        .slice(0, THEME_SLIDER_MAX)
        .map((a) => ({ name: a.caption ?? a.name, url: a.url, kind: "image" as const })),
    })).filter((b) => b.plates.length > 0);

  const sections: ResolvedSection[] = TATA_SECTIONS.map((s, si) => ({
    id: s.id,
    title: s.title,
    blurb: s.blurb,
    accent: s.accent,
    /* ⚠ Alternating grounds, starting BLACK on Digital — the owner's
     * zig-zag. Driven off the index so inserting a section re-flows the
     * pattern instead of stranding two dark bands together. */
    dark: si % 2 === 0,
    /** Print reads four across; every other section keeps three. */
    cols: s.id === "print" ? 4 : 3,
    items: s.items.map((item) => {
      const data = item.folder ? readCatalogueCategory(SLUG, item.folder) : null;
      // `pick` slices one folder across two subsections (the films split).
      const assets = item.pick
        ? (data?.assets ?? []).filter((a) => item.pick!.includes(a.name))
        : (data?.assets ?? []);
      return {
        key: `${s.id}:${item.label}`,
        label: item.label,
        note: item.note,
        count: item.pick ? assets.length : (data?.category.assetCount ?? 0),
        assets,
        curated: data?.curated ?? false,
        mockup: item.folder ? mockupIfPresent(tataSubcatMockup(item.folder)) : undefined,
      };
    }),
  })).map((s) => {
    const digitalMockups =
      s.id === "digital"
        ? (s.items.find((i) => i.label === "Mockups")?.assets ?? [])
        : [];
    const pool = s.id === "digital" ? digitalMockups : s.items.flatMap((i) => i.assets);
    return { ...s, themes: themePool(pool) };
  });

  return (
    <main className="tata-scope tata-body relative min-h-dvh w-full bg-gallery" style={themeVars}>
      {/* Circuit-grid wash (gridNEW) — a fixed whisper behind the whole page. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Image src={TATA_GRID} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
      </div>

      <div className="relative z-10">
        <ExperienceTransition>
          {/* ── Hero ─────────────────────────────────────────────────────────
              The 16:9 hero film opened this page until 2026-08-17. It, VideoHero,
              the old TATA_HERO, hero.mp4, hero-poster.jpg and the pipeline step
              that built the poster are all gone — recover from git if it ever
              returns. What sits here now is the owner's campaign artwork. */}
          <header className="relative">
            <div className={`${SHELL} pt-8`}>
              <Link
                href="/"
                className="tata-body group inline-flex items-center gap-2 rounded text-[0.7rem] uppercase tracking-[0.18em] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
              >
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Back
              </Link>
            </div>

            {/* The rail runs down the outer edge, clear of the shell's inset. */}
            <div aria-hidden className="pointer-events-none absolute right-6 top-24 hidden xl:block">
              <p className={`${KICKER} leading-[2.2]`}>
                {TATA_HERO.rail.map((w) => (
                  <span key={w} className="block">
                    {w}
                  </span>
                ))}
              </p>
            </div>
            <div aria-hidden className="pointer-events-none absolute bottom-24 right-6 hidden text-right xl:block">
              <p className={`${KICKER} leading-[1.9]`}>
                {TATA_HERO.railFoot.map((w) => (
                  <span key={w} className="block">
                    {w}
                  </span>
                ))}
              </p>
            </div>

            <div
              className={`${SHELL} grid grid-cols-1 items-start gap-10 pb-12 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14 lg:pb-16`}
            >
              {/* ── The words ── */}
              <div className="flex flex-col">
                <span className={KICKER}>{TATA_HERO.eyebrow.join("   /   ")}</span>

                {/* The real wordmark file — never type set to look like it. */}
                <span className="relative mt-6 block h-14 w-full max-w-[21rem] sm:h-[4.5rem]">
                  <Image
                    src={TATA_GUIDELINES.wordmark}
                    alt="TATA IIS — Tata Indian Institute of Skills"
                    fill
                    priority
                    sizes="336px"
                    className="object-contain object-left"
                  />
                </span>

                <span aria-hidden className="mt-8 block h-px w-9 bg-neutral-400" />

                <h1 className="tata-display mt-6 text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.06] text-neutral-900">
                  {TATA_HERO.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>

                <span aria-hidden className="mt-7 block h-px w-9 bg-neutral-400" />

                <p className="tata-body mt-6 max-w-xl text-[0.92rem] leading-relaxed text-neutral-700">
                  {TATA_DESCRIPTION}
                </p>

                {/* What the page holds, named up front. These ARE the rooms, so
                    the list cannot drift from what opens further down. */}
                {/* ⚠ The separator TRAILS its item rather than leading the
                    next one. Leading it puts a stray "/" at the start of any
                    line the list wraps onto, which is what it did first. */}
                <ul className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {TATA_PINS.map((pin, i) => (
                    <li key={pin.id} className={KICKER}>
                      {pin.label}
                      {i < TATA_PINS.length - 1 && (
                        <span aria-hidden className="ml-2 text-neutral-300">
                          /
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                <p aria-hidden className={`${KICKER} mt-10 flex items-center gap-3`}>
                  <span className="block h-7 w-px bg-neutral-300" />
                  Scroll
                </p>
              </div>

              {/* ── The artwork, and who stands behind the institute ── */}
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                <span className="relative block aspect-[1071/1469] w-full overflow-hidden">
                  <Image
                    src={TATA_HERO.art}
                    alt={TATA_HERO.artAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 46vw"
                    className="object-contain object-top"
                  />
                </span>

                <div className="sm:w-[11rem] sm:pt-6">
                  <span className={KICKER}>Powered by</span>
                  <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-7 sm:flex-col sm:items-start">
                    {TATA_POWERED_BY.map((p) =>
                      p.src ? (
                        <li key={p.name}>
                          <Image
                            src={p.src}
                            alt={p.name}
                            width={220}
                            height={76}
                            className="h-14 w-40 object-contain object-left"
                          />
                        </li>
                      ) : (
                        <li key={p.name} className="max-w-[8.5rem] leading-tight">
                          <span className="tata-subhead text-[0.72rem] text-neutral-700">{p.name}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </header>

          {/* ── 01 — the institute ── */}
          <Band band={TATA_INSTITUTE} ground="bg-white/55">
            <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-sm">
              <Image
                src={TATA_INSTITUTE.photo}
                alt={TATA_INSTITUTE.photoAlt}
                fill
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="object-cover"
              />
            </span>
          </Band>

          {/* ── 02 — one parent mark, two campus dialects ──
              ⚠ The three marks are the SUPPLIED files. The comp's versions are
              redrawn and wrong in the details; this is the client's identity, so
              it is the rulebook's own artwork or nothing. */}
          <Band
            band={TATA_SYSTEM}
            ground="bg-neutral-100/40"
            cta={<TataRoomLink room="brand-guidelines">Explore brand system</TataRoomLink>}
          >
            <div className="flex flex-col items-center">
              <span className="relative block h-14 w-full max-w-[15rem]">
                <Image
                  src={TATA_LOCKUP.parent.logo}
                  alt={`${TATA_LOCKUP.parent.label} logo`}
                  fill
                  sizes="240px"
                  className="object-contain"
                />
              </span>

              {/* The bracket that makes the three read as one family. */}
              <svg
                aria-hidden
                viewBox="0 0 100 16"
                preserveAspectRatio="none"
                className="mt-5 h-5 w-full max-w-2xl text-neutral-300"
              >
                <path
                  d="M50 0 V6 M14 6 H86 M14 6 V16 M86 6 V16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="mt-5 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6">
                {TATA_LOCKUP.campuses.map((c) => (
                  <div key={c.label} className="flex flex-col items-center text-center">
                    {/* ⚠ The BOX is divided by the file's ink fill, so both
                        marks end up the same height on screen however much
                        transparent padding their PNG carries. Sizing the box
                        alone is what left Mumbai a third the size of
                        Ahmedabad. The extra height is empty pixels, so the
                        marks still sit on one line. */}
                    {/* ⚠ The OUTER box is a fixed height for both campuses, so
                        the two marks sit on one line and their captions start
                        level; the inner box is the one divided by the ink fill.
                        Mumbai's inner box overflows this — deliberately. What
                        overflows is transparent padding, and centring it is
                        what keeps the two marks optically the same size
                        without a second copy of the file on disk. */}
                    <span className="flex h-24 w-full items-center justify-center">
                      <span
                        className="relative block w-full"
                        style={{ height: `${4 / c.inkFill}rem`, maxWidth: `${13 / c.inkFill}rem` }}
                      >
                        <Image src={c.logo} alt={`${c.label} logo`} fill sizes="240px" className="object-contain" />
                      </span>
                    </span>
                    <p className="tata-body mt-4 max-w-xs text-[0.82rem] leading-relaxed text-neutral-600">{c.line}</p>
                    {/* The campus palette, from its own rulebook. */}
                    <ul className="mt-4 flex items-center gap-2">
                      {c.colours.map((col) => (
                        <li key={col.hex} className="flex items-center gap-1.5">
                          <span aria-hidden className="block size-3 rounded-full" style={{ backgroundColor: col.hex }} />
                          <span className="tata-body text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500">
                            {col.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Band>

          {/* ── 03 — brand DNA, as five cards of real evidence ── */}
          <Band
            band={TATA_DNA}
            ground="bg-white/55"
            cta={<TataRoomLink room="brand-guidelines">View brand guidelines</TataRoomLink>}
          >
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
              {TATA_DNA_CARDS.map((card) => (
                <li key={card.title} className="flex flex-col gap-3 rounded-sm border border-neutral-200 bg-white/80 p-3">
                  <span className={KICKER}>{card.title}</span>

                  {card.swatches ? (
                    // The colour card paints itself from the rulebooks' hexes —
                    // a screenshot of colour would be colour at second hand.
                    <span className="flex aspect-[16/10] flex-wrap content-center items-center gap-2">
                      {card.swatches.map((c) => (
                        <span
                          key={c.hex}
                          title={`${c.name} ${c.hex}`}
                          className="block size-7 rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="relative block aspect-[16/10] w-full overflow-hidden bg-white">
                      <Image
                        src={card.plate!}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 18vw"
                        className="object-contain"
                      />
                    </span>
                  )}

                  <span className="tata-body mt-auto block text-[0.55rem] uppercase leading-[1.9] tracking-[0.14em] text-neutral-500">
                    {card.words.map((w) => (
                      <span key={w} className="block">
                        {w}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Band>

          {/* ── 04 — the work, then the six rooms ──
              ⚠ THIS PAGE IS CLICK-TO-VIEW (owner, 2026-08-25). It used to render
              GuidelineSections and then every work section in one long scroll;
              both are rooms behind the cards now, which is why GuidelineSections
              does not appear above and WorkSections is not given the whole
              array. Nothing was dropped — the board renders the same two
              components, one room at a time. */}
          <section id="work" className="scroll-mt-4 border-t border-neutral-200/70 bg-neutral-100/40">
            <div
              className={`${SHELL} grid grid-cols-1 items-start gap-y-8 pt-14 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-x-10 lg:pt-20`}
            >
              <p aria-hidden className="tata-display text-[clamp(2.6rem,5.5vw,4.5rem)] leading-[0.85] text-neutral-300">
                {TATA_WORK_BAND.number}
              </p>
              <div className="max-w-md">
                <span className={KICKER}>{TATA_WORK_BAND.kicker}</span>
                <h2 className="tata-display mt-4 text-[clamp(1.55rem,2.7vw,2.25rem)] leading-[1.12] text-neutral-900">
                  {TATA_WORK_BAND.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
              </div>
              {/* The owner's own account of the job — long, first-person and
                  already written. It sits beside the photograph rather than
                  under the headline because it runs three times a band's
                  usual paragraph. */}
              <div className="min-w-0">
                <p className="tata-body text-[0.9rem] leading-relaxed text-neutral-700">{TATA_WORK_INTRO}</p>
                <span className="relative mt-8 block aspect-[16/9] w-full overflow-hidden rounded-sm">
                  <Image
                    src={TATA_WORK_BAND.photo}
                    alt={TATA_WORK_BAND.photoAlt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 46vw"
                    className="object-cover"
                  />
                </span>
              </div>
            </div>

            <div className={`${SHELL} pb-16 pt-12 lg:pb-20`}>
              <TataSectionsBoard sections={sections} />
            </div>
          </section>

          {/* ── 05 — collaborate ── */}
          <Band band={TATA_COLLABORATE} ground="bg-white/55">
            <div className="flex flex-wrap items-start gap-x-16 gap-y-8">
              <div>
                <span className={KICKER}>Get in touch</span>
                <p className="tata-body mt-3 text-[0.95rem] text-neutral-900">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="border-b border-neutral-300 pb-0.5 transition-colors hover:border-neutral-900"
                  >
                    {SITE.email}
                  </a>
                </p>
              </div>
              <div>
                <span className={KICKER}>Follow</span>
                {/* ⚠ Only the two profiles the site actually knows. The comp
                    shows four; site.ts has LinkedIn and Behance, flagged there
                    as placeholders to replace, and inventing the other two
                    would put dead links on a client's page. */}
                <ul className="mt-3 flex items-center gap-6">
                  {[
                    { label: "LinkedIn", href: SITE.linkedin },
                    { label: "Behance", href: SITE.behance },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="tata-body border-b border-neutral-300 pb-0.5 text-[0.8rem] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Band>

          {/* The partner marquee, LAST — moved down from between the brand
              blocks and the work on the owner's instruction, 2026-08-25. It
              reads as a closing credit here rather than as an interruption
              partway down, and it no longer sits between the reader and the
              rooms. */}
          <section className="border-t border-neutral-200/70 py-8">
            <div className={SHELL}>
              <span className={`${KICKER} block px-1`}>In the company of</span>
            </div>
            <PartnerMarquee logos={TATA_PARTNERS} />
          </section>

          {/* ⚠ The client's own contact block stays. The comp ends on a thin
              "TATA IIS — PORTFOLIO / SHREY SINGH" strip and drops the
              institute's addresses, phone and CIN; those are real, they were
              asked for, and 05 above already carries the owner's own details. */}
          <div className={SHELL}>
            <TataFooter />
          </div>
        </ExperienceTransition>
      </div>
    </main>
  );
}
