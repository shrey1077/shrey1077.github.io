/**
 * Homepage.
 *
 *   Flythrough   the hero (HeroStage — the brain, the two voices, the pins)
 *                and all eight sections as one flight in depth: each scroll
 *                flies the camera through to the next full-screen slide, the
 *                four logic rooms then the four creative (2026-10-02). A pin
 *                flies straight to its slide.
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
 * node:fs-backed) for the Logofolio wall, the Extincts deck and the Art room.
 */

import { HeroStage } from "@/components/home/HeroStage";
import { Flythrough } from "@/components/home/Flythrough";
import { UNIFY_FACES_ON_HOME } from "@/constants/faces";
import { SiteFooter } from "@/components/footer/SiteFooter";
import {
  readArtCollections,
  readLogofolio,
  readCasePlates,
  readMarkPlates,
  readPublicationPages,
} from "@/content/catalogue";
import { PUBLICATIONS } from "@/constants/publications";
import { PROJECT_STUDIES, STUDY_CONTENT_SLUG } from "@/constants/projectStudies";

export default function Home() {
  // Every mark, for the Logofolio board.
  const logos = readLogofolio();

  // The Art room's collections — Art draws its own body, not board cells.
  const artCollections = readArtCollections();

  // Publications draws its own body too. The shelf is a client component and
  // cannot read the filesystem, so the cover of each document — its first
  // rendered page — is resolved here. The text-only entries have none, and the
  // shelf draws a typographic spine for those.
  const publicationCovers = Object.fromEntries(
    PUBLICATIONS.map((p) => [p.slug, p.pages ? readPublicationPages(p.slug)[0] : undefined]),
  );

  // The eight independent commissions on the Projects board open a preview
  // rather than a page, and the preview is a client component — so their plates
  // are read here, the same way publication covers are.
  // ⚠ They still live under the `freelance` CONTENT folder even though no
  // client owns that slug any more; see constants/projectStudies.ts.
  const studyPlates = Object.fromEntries(
    PROJECT_STUDIES.map((s) => [s.id, readCasePlates(STUDY_CONTENT_SLUG, s.folder)]),
  );

  // Board marks, trimmed to their ink and scaled to match one another. Keyed
  // by original url, so the board swaps art and scale without anything that
  // references a logo having to know. See scripts/prepare_logo_marks.py.
  const markPlates = readMarkPlates();

  return (
    <main
      className={`w-full bg-gallery ${UNIFY_FACES_ON_HOME ? "faces-unified" : ""}`}
    >
      <Flythrough
        data={{ logos, artCollections, publicationCovers, studyPlates, markPlates }}
      >
        <HeroStage />
      </Flythrough>
      <SiteFooter />
    </main>
  );
}
