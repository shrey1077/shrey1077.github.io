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
 *   four expandable work families → sub-cats → portrait slider CategoryAccordion
 *   contact footer                                            TataFooter
 *
 * Server Component: reads the (already curated) catalogue folders and regroups
 * them under the four families; the interactive pieces are client children.
 */

import Link from "next/link";
import Image from "next/image";
import { clientExperienceBySlug } from "@/constants/clientExperiences";
import { readCatalogueCategory } from "@/content/catalogue";
import {
  TATA_HERO,
  TATA_DESCRIPTION,
  TATA_POWERED_BY,
  TATA_PARTNERS,
  TATA_GROUPS,
} from "@/constants/tataExperience";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { VideoHero } from "@/components/client/tata/VideoHero";
import { PartnerMarquee } from "@/components/client/tata/PartnerMarquee";
import { GuidelineSections } from "@/components/client/tata/GuidelineSections";
import {
  CategoryAccordion,
  type AccordionGroup,
} from "@/components/client/tata/CategoryAccordion";
import { TataFooter } from "@/components/client/tata/TataFooter";
import { typeVoiceClass } from "@/constants/typography";

const SLUG = "tata-iis";
const META = typeVoiceClass("logic", "meta");
const HELVETICA = 'Helvetica, "Helvetica Neue", Arial, sans-serif';

export function TataExperience() {
  const theme = clientExperienceBySlug(SLUG)?.brandTheme;
  const themeVars = theme
    ? ({
        "--brand-font": `var(${theme.fontVar})`,
        "--brand-accent": theme.accent,
        ...(theme.tracking ? { "--brand-tracking": theme.tracking } : {}),
        ...(theme.uppercase ? { "--brand-transform": "uppercase" } : {}),
      } as React.CSSProperties)
    : undefined;

  // Regroup the curated catalogue folders under the four work families.
  const groups: AccordionGroup[] = TATA_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    blurb: g.blurb,
    accent: g.accent,
    subcategories: g.children
      .map((childId) => {
        const data = readCatalogueCategory(SLUG, childId);
        if (!data) return null;
        return {
          id: data.category.id,
          title: data.category.name,
          count: data.category.assetCount,
          assets: data.assets,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null),
  })).filter((g) => g.subcategories.length > 0);

  return (
    <main className="min-h-dvh w-full bg-gallery px-6 py-14 sm:px-10" style={themeVars}>
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className={`${META} group inline-flex items-center gap-2 rounded text-[0.65rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2`}
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
              <span className={`${META} text-xs`} style={{ color: "var(--brand-accent, #737373)" }}>
                Client — Enterprise · Systems
              </span>
              <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-neutral-700" style={{ fontFamily: HELVETICA }}>
                {TATA_DESCRIPTION}
              </p>
            </div>
            <div className="lg:pl-8">
              <span className={`${META} text-[0.62rem] text-neutral-500`}>Powered by</span>
              <ul className="mt-5 flex flex-wrap items-center gap-x-9 gap-y-6">
                {TATA_POWERED_BY.map((p) =>
                  p.src ? (
                    <li key={p.name}>
                      <Image
                        src={p.src}
                        alt={p.name}
                        width={150}
                        height={52}
                        className="h-10 w-auto object-contain sm:h-12"
                      />
                    </li>
                  ) : (
                    <li key={p.name} className="max-w-[8.5rem] leading-tight">
                      <span className="text-[0.72rem] font-medium text-neutral-700">{p.name}</span>
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
            <span className={`${META} px-1 text-[0.62rem] text-neutral-500`}>In the company of</span>
            <PartnerMarquee logos={TATA_PARTNERS} />
          </section>

          {/* 5 — the four work families. */}
          <section className="pt-4">
            <span className={`${META} px-1 text-[0.62rem]`} style={{ color: "var(--brand-accent, #737373)" }}>
              The work
            </span>
            <div className="mt-6">
              <CategoryAccordion groups={groups} />
            </div>
          </section>

          {/* 6 — contact footer. */}
          <TataFooter />
        </ExperienceTransition>
      </div>
    </main>
  );
}
