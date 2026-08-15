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
import { SiteFooter } from "@/components/footer/SiteFooter";
import {
  readArtCollections,
  readExtinctsSlides,
  readLogofolio,
} from "@/content/catalogue";

export default function Home() {
  // Every mark, for the Logofolio board.
  const logos = readLogofolio();

  // The Extincts jury deck.
  const extinctsSlides = readExtinctsSlides();

  // The Art room's collections — Art draws its own body, not board cells.
  const artCollections = readArtCollections();

  return (
    <main className="w-full bg-gallery">
      <HeroStage />
      {/* Below `lg` the stage's pins are hidden, which left the eight sections
          — and every client page behind them — with no route in at all. This is
          that route; above `lg` it hides and the pins take over. */}
      <SectionNav />
      <SectionPanel
        logos={logos}
        extinctsSlides={extinctsSlides}
        artCollections={artCollections}
      />
      <SiteFooter />
    </main>
  );
}
