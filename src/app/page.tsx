/**
 * Homepage.
 *
 *   Flythrough   the hero (HeroStage — the brain, the two voices, the pins)
 *                and every room as one flight in depth: each scroll flies the
 *                camera through to the next full-screen slide — one per
 *                project on the left, one per body of work on the right, each
 *                in four quadrants (2026-10-15; constants/showcase.ts). A pin,
 *                a mark in the strip along the top or the sections menu flies
 *                straight to its slide in one step.
 *                Below `lg`, where the pins are hidden, the flythrough's own
 *                rail and scroll are the way in. (SectionNav, the compact
 *                board that used to sit here for those widths, was removed on
 *                2026-10-03 — after the run it only repeated the slides.)
 *   SiteFooter   (~10vh)  minimal contact footer
 *
 * The two-column Designer/Artist showcase that used to sit between the stage
 * and the footer is gone: it was a second, parallel route to the same eight
 * sections, and the pins have replaced it.
 *
 * Stays a Server Component so it can read the content folders (catalogue.ts is
 * node:fs-backed) for Arts & Crafts' pieces and the writings' covers. (The boards that
 * needed the logofolio, the publication covers and the study plates went on
 * 2026-10-15; those now live on their own pages.)
 */

import { HeroStage } from "@/components/home/HeroStage";
import { Flythrough } from "@/components/home/Flythrough";
import { HOME_TYPE } from "@/constants/faces";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { PortraitHint } from "@/components/home/PortraitHint";
import fs from "node:fs";
import path from "node:path";
import { readCasePlates, readLogofolio, readPublicationPages } from "@/content/catalogue";
import { PROJECT_STUDIES, STUDY_CONTENT_SLUG } from "@/constants/projectStudies";
import type { Wall } from "@/components/home/AllProjectsSlide";
import { SIX_WRITINGS } from "@/constants/showcase";
import type { ArtThumb } from "@/components/home/ArtSlide";
import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { SITE_DESCRIPTION, pageMeta } from "@/constants/seo";

/** The site's own title and preview (constants/seo), and its address. */
export const metadata: Metadata = pageMeta({ path: "/" });

/** Who the site is about, for search engines (schema.org Person). */
const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: SITE.role,
  url: SITE.website,
  image: `${SITE.website}/og/og-image.jpg`,
  description: SITE_DESCRIPTION,
  sameAs: [SITE.linkedin, SITE.behance].filter(Boolean),
};

export default function Home() {
  // Arts & Crafts' slider: the slide-size copies of the pieces it plays, in
  // order, and their sizes (scripts/make-art-slides.mjs writes the list).
  const artThumbs: ArtThumb[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "content", "art", "_slides.json"), "utf8"),
  );

  // The All Projects wall: the independent commissions with their plates
  // (as /all-works reads them), and the marks the owner drew. Vivid is on
  // the wall as a page of its own, so not as a commission.
  const wall: Wall = {
    studies: PROJECT_STUDIES.filter((s) => s.id !== "vivid").map((s) => ({
      id: s.id,
      name: s.name,
      kind: s.kind,
      logo: s.logo,
      study: s,
      plates: readCasePlates(STUDY_CONTENT_SLUG, s.folder),
    })),
    marks: readLogofolio().map((m) => ({ slug: m.slug, name: m.name, url: m.url })),
  };

  // The six writings' covers — each one's first rendered page.
  const covers = Object.fromEntries(SIX_WRITINGS.map((slug) => [slug, readPublicationPages(slug)[0]]));

  return (
    <main
      className={`w-full bg-gallery ${HOME_TYPE}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }} />
      <Flythrough artThumbs={artThumbs} covers={covers} wall={wall}>
        <HeroStage />
      </Flythrough>
      <SiteFooter />
      {/* Phones held upright: turn sideways, or try a laptop (Step 7). */}
      <PortraitHint />
    </main>
  );
}
