/**
 * Homepage.
 *
 *   HeroStage    (100svh) the brain, the two words, and the section pins that
 *                float either side of it — the way into the sections at `lg`
 *                and up, where the pins' geometry actually fits.
 *   SectionNav   (<lg)    the same eight sections as a plain board, for the
 *                widths where the pins are hidden. Drives the same panel.
 *   SectionPanel (opens)  what a pin opens: the section's contents as a board,
 *                on circuit board for logic, on thrown paint for creative.
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
import { SectionNav } from "@/components/home/SectionNav";
import { SectionPanel } from "@/components/home/SectionPanel";
import { UNIFY_FACES_ON_HOME } from "@/constants/faces";
import { SiteFooter } from "@/components/footer/SiteFooter";
import {
  readArtCollections,
  readExtinctsSlides,
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

  // The Extincts jury deck.
  const extinctsSlides = readExtinctsSlides();

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
      <HeroStage />
      {/* Below `lg` the stage's pins are hidden, which left the eight sections
          — and every client page behind them — with no route in at all. This is
          that route; above `lg` it hides and the pins take over. */}
      <SectionNav />
      <SectionPanel
        logos={logos}
        extinctsSlides={extinctsSlides}
        artCollections={artCollections}
        publicationCovers={publicationCovers}
        studyPlates={studyPlates}
        markPlates={markPlates}
      />
      <SiteFooter />
    </main>
  );
}
