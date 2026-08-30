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
import { JourneyStage } from "@/components/home/JourneyStage";
import { SiteFooter } from "@/components/footer/SiteFooter";
import {
  readArtCollections,
  readExtinctsSlides,
  readLogofolio,
  readMarkPlates,
  readPublicationPages,
} from "@/content/catalogue";
import { PUBLICATIONS } from "@/constants/publications";

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

  // ⚠ `studyPlates` USED TO BE READ HERE and is not any more. The eight
  // independent commissions on the Projects board opened a preview in place
  // (ProjectPreview) rather than a page, and those plates fed it — but that
  // board lived in SectionPanel, which the scroll journey replaced. The plane
  // shows BrandCardSlider for that room and has no in-place study preview.
  // To restore it: read the plates back with
  //   Object.fromEntries(PROJECT_STUDIES.map((s) =>
  //     [s.id, readCasePlates(STUDY_CONTENT_SLUG, s.folder)]))
  // and give JourneyStage a renderer for `projects` that uses them. The plates
  // still live under the `freelance` CONTENT folder even though no client owns
  // that slug; see constants/projectStudies.ts.

  // Board marks, trimmed to their ink and scaled to match one another. Keyed
  // by original url, so the board swaps art and scale without anything that
  // references a logo having to know. See scripts/prepare_logo_marks.py.
  const markPlates = readMarkPlates();

  return (
    <main className="w-full bg-gallery">
      <HeroStage />
      {/* Below `lg` the stage's pins are hidden, which left the eight sections
          — and every client page behind them — with no route in at all. This is
          that route; above `lg` it hides and the pins take over. */}
      <SectionNav />
      {/* The scroll journey: fly into the brain, then the eight exsecs on a
          2D plane. ⚠ It REPLACES the old click-to-open overlay as the way the
          sections are reached — SectionPanel stays mounted only so the pins
          keep working as a jump, which JourneyStage listens for on the same
          PIN_OPEN_EVENT. See docs/HANDOFF/16_SCROLL_JOURNEY_SPEC.md. */}
      <JourneyStage
        artCollections={artCollections}
        logos={logos}
        extinctsSlides={extinctsSlides}
        publicationCovers={publicationCovers}
        markPlates={markPlates}
      />
{/* ⚠ SectionPanel (the click-to-open overlay) is OFF the page. It and
          JourneyStage both listen on PIN_OPEN_EVENT, so leaving it mounted made
          a pin click open the overlay AND scroll the journey at the same time.
          The journey is the route to the sections now; the pins jump.
          The component is kept, unreferenced.
          ⚠ ONE THING WENT WITH IT: the overlay's `projects` board could open a
          study in place via ProjectPreview (studyPlates). The plane shows
          BrandCardSlider for that room and has no in-place study preview yet. */}
      <SiteFooter />
    </main>
  );
}
