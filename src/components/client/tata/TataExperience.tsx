/**
 * TataExperience — the bespoke Tata IIS full-experience page.
 *
 * Diverges from the generic ClientExperience into the directed layout the
 * client asked for:
 *
 *   description (Helvetica) + "Powered by" endorsements
 *   the logo-guideline system (Tata full-width, IISA/IISM)    GuidelineSections
 *   a continuously moving partner marquee                     PartnerMarquee
 *   the work under four fixed headlines, as tiles         WorkSections
 *   contact footer                                            TataFooter
 *
 * Server Component: reads the (already curated) catalogue folders and regroups
 * them under the four families; the interactive pieces are client children.
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
/** Eyebrow / section-kicker label — a subheading (Helvetica Bold), small. */
const LABEL = "tata-subhead text-[0.62rem] uppercase tracking-[0.16em]";

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
    <main className="tata-scope tata-body relative min-h-dvh w-full bg-gallery px-6 py-14 sm:px-10" style={themeVars}>
      {/* Circuit-grid wash (gridNEW) — a fixed whisper behind the whole page. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <Image src={TATA_GRID} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="tata-body group inline-flex items-center gap-2 rounded text-[0.7rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
        >
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Back
        </Link>

        <ExperienceTransition>
          {/* The 16:9 hero film opened this page until 2026-08-17. It, VideoHero,
              TATA_HERO, hero.mp4, hero-poster.jpg and the pipeline step that
              built the poster are all gone — recover from git if it returns. */}

          {/* 1 — the mark. */}
          <div className="mt-6 flex justify-center border-b border-neutral-200 pb-10">
            <span className="relative block h-16 w-full max-w-md sm:h-20">
              <Image
                src={TATA_GUIDELINES.wordmark}
                alt="TATA IIS — Tata Indian Institute of Skills"
                fill
                priority
                sizes="(max-width: 640px) 80vw, 448px"
                className="object-contain"
              />
            </span>
          </div>

          {/* 2 — description + endorsements. */}
          <section className="mt-8 grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:py-16">
            <div>
              <span className={LABEL} style={{ color: "var(--brand-accent, #737373)" }}>
                Client — Enterprise · Systems
              </span>
              <p className="tata-body mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-neutral-700">
                {TATA_DESCRIPTION}
              </p>
            </div>
            <div className="lg:pl-8">
              <span className={`${LABEL} text-neutral-500`}>Powered by</span>
              <ul className="mt-5 flex flex-wrap items-center gap-x-9 gap-y-6">
                {TATA_POWERED_BY.map((p) =>
                  p.src ? (
                    <li key={p.name}>
                      <Image
                        src={p.src}
                        alt={p.name}
                        width={150}
                        height={52}
                        className="h-14 w-28 object-contain"
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
          </section>

          {/* 3 — the two campuses, side by side, ahead of the rulebooks. Each
              is the mark and the one line that describes its dialect; the
              guidelines themselves are the switch in the next section. */}
          <section
            aria-label="The two campuses"
            className="grid grid-cols-1 gap-10 border-t border-neutral-200 py-14 md:grid-cols-2 md:gap-16"
          >
            {[
              { kicker: "Campus dialect — Ahmedabad", d: TATA_GUIDELINES.iisa, align: "md:items-start md:text-left" },
              { kicker: "Campus dialect — Mumbai", d: TATA_GUIDELINES.iism, align: "md:items-end md:text-right" },
            ].map(({ kicker, d, align }) => (
              <div key={kicker} className={`flex flex-col items-center gap-5 text-center ${align}`}>
                <span className={`${LABEL} text-neutral-500`}>{kicker}</span>
                {/* Both marks share one box — same height, same max width — so
                    the two campuses read as equals. The source files are
                    different shapes, so sizing to the image made one larger. */}
                <span className="relative block h-20 w-full max-w-[16rem]">
                  <Image src={d.logo} alt={`${kicker} logo`} fill sizes="256px" className="object-contain" />
                </span>
                <p className="tata-body max-w-sm text-sm leading-relaxed text-neutral-600">{d.line}</p>
              </div>
            ))}
          </section>

          {/* 5 — the work, as six pins you click.
              ⚠ THIS PAGE IS CLICK-TO-VIEW NOW (owner, 2026-08-25). It used to
              render GuidelineSections and then every work section in one long
              scroll; both are now rooms behind pins, which is why
              GuidelineSections no longer appears above and WorkSections is no
              longer given the whole array. Nothing was dropped — the board
              renders the same two components, one room at a time. */}
          <section id="work" className="scroll-mt-8 pt-10">
            <h2 className="tata-heading text-3xl leading-[1.05] text-neutral-900 sm:text-4xl">
              The Work
            </h2>
            <p className="tata-body mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-neutral-700">
              {TATA_WORK_INTRO}
            </p>
            <div className="mt-12">
              <TataSectionsBoard sections={sections} />
            </div>
          </section>

          {/* 6 — authorship, then the contact footer. */}
          <section className="mt-16 rounded-3xl border border-neutral-200 bg-white/70 px-7 py-6">
            <span className={`${LABEL} block text-neutral-500`}>Created by</span>
            <p className="tata-subhead mt-2 text-[0.95rem] text-neutral-900">
              Shrey Singh
              <span className="tata-body text-neutral-600"> — Lead Manager, Tata IIS (2024&ndash;2026)</span>
            </p>
          </section>

          {/* The partner marquee, LAST — moved down from between the brand
              blocks and the work on the owner's instruction, 2026-08-25. It
              reads as a closing credit here rather than as an interruption
              partway down, and it no longer sits between the reader and the
              pins. */}
          <section className="mt-16 border-t border-neutral-200 py-6">
            <span className={`${LABEL} block px-1 text-neutral-500`}>In the company of</span>
            <PartnerMarquee logos={TATA_PARTNERS} />
          </section>

          <TataFooter />
        </ExperienceTransition>
      </div>
    </main>
  );
}
