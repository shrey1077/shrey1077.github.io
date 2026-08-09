/**
 * TataExperience — the bespoke Tata IIS full-experience page.
 *
 * Diverges from the generic ClientExperience into the directed layout the
 * client asked for:
 *
 *   16:9 hero film (plays once, freezes)                      VideoHero
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
  TATA_HERO,
  TATA_DESCRIPTION,
  TATA_POWERED_BY,
  TATA_PARTNERS,
  TATA_GRID,
  tataSubcatMockup,
} from "@/constants/tataExperience";
import { TATA_SECTIONS, TATA_WORK_INTRO } from "@/constants/tataSections";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { VideoHero } from "@/components/client/tata/VideoHero";
import { PartnerMarquee } from "@/components/client/tata/PartnerMarquee";
import { GuidelineSections } from "@/components/client/tata/GuidelineSections";
import {
  WorkSections,
  type ResolvedSection,
} from "@/components/client/tata/WorkSections";
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
  const sections: ResolvedSection[] = TATA_SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    blurb: s.blurb,
    accent: s.accent,
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
  }));

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
          {/* 1 — the 16:9 hero film. */}
          <div className="mt-8">
            <VideoHero src={TATA_HERO.src} poster={TATA_HERO.poster} />
          </div>

          {/* 2 — description + endorsements. */}
          <section className="grid grid-cols-1 gap-10 border-t border-neutral-200 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:py-16">
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

          {/* 3 — the logo-guideline system. */}
          <GuidelineSections />

          {/* 4 — the partner marquee. */}
          <section className="border-t border-neutral-200 py-6">
            <span className={`${LABEL} block px-1 text-neutral-500`}>In the company of</span>
            <PartnerMarquee logos={TATA_PARTNERS} />
          </section>

          {/* 5 — the work: one heading, the note, then the five headlines. */}
          <section id="work" className="scroll-mt-8 pt-10">
            <h2 className="tata-heading text-3xl leading-[1.05] text-neutral-900 sm:text-4xl">
              The Work
            </h2>
            <p className="tata-body mt-6 max-w-3xl text-[0.95rem] leading-relaxed text-neutral-700">
              {TATA_WORK_INTRO}
            </p>
            <div className="mt-12">
              <WorkSections sections={sections} />
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

          <TataFooter />
        </ExperienceTransition>
      </div>
    </main>
  );
}
