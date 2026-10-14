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
 * node:fs-backed) for the Arts & Crafts room's collections. (The boards that
 * needed the logofolio, the publication covers and the study plates went on
 * 2026-10-15; those now live on their own pages.)
 */

import { HeroStage } from "@/components/home/HeroStage";
import { Flythrough } from "@/components/home/Flythrough";
import { HOME_TYPE } from "@/constants/faces";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { PortraitHint } from "@/components/home/PortraitHint";
import { readArtCollections } from "@/content/catalogue";
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
  // The Arts & Crafts room's tree: each collection, its first piece and how
  // many pieces it holds — not the pieces themselves, which its page reads.
  const art = readArtCollections().map((c) => ({ name: c.name, cover: c.images[0], count: c.images.length }));

  return (
    <main
      className={`w-full bg-gallery ${HOME_TYPE}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }} />
      <Flythrough art={art}>
        <HeroStage />
      </Flythrough>
      <SiteFooter />
      {/* Phones held upright: turn sideways, or try a laptop (Step 7). */}
      <PortraitHint />
    </main>
  );
}
