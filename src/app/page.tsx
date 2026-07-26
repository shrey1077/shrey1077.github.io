/**
 * Homepage.
 *
 * Phase 5 v4 layout — one full-viewport interactive stage plus the footer:
 *
 *   HeroStage  (100svh) the brain video, the landing headline, and (once a
 *              hemisphere is chosen) the section-panel navigation. The former
 *              PreviewPane flow was absorbed into the panels — clients open
 *              inline, on this page.
 *   SiteFooter (~10vh)  minimal contact footer
 *
 * Stays a Server Component so it can read the content folders (catalogue.ts
 * is node:fs-backed) for the art previews and the Logofolio wall.
 */

import { HeroStage } from "@/components/home/HeroStage";
import { CircuitBackdrop } from "@/components/home/CircuitBackdrop";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { readArtCollections, readLogofolio } from "@/content/catalogue";

export default function Home() {
  // The Art room's collections (Painting, Craft, …).
  const artCollections = readArtCollections();

  // Every mark, for the Logofolio panel's five-column wall.
  const logos = readLogofolio();

  return (
    <main className="w-full bg-gallery">
      <CircuitBackdrop />
      <HeroStage artCollections={artCollections} logos={logos} />
      <SiteFooter />
    </main>
  );
}
