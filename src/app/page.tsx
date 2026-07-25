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
 * is node:fs-backed) and hand each experience client's work summary to the
 * panels for the inline client details.
 */

import { HeroStage } from "@/components/home/HeroStage";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { CLIENT_EXPERIENCES } from "@/constants/clientExperiences";
import { readArtPreviews, readCatalogue, readLogofolio } from "@/content/catalogue";
import type { ClientWorkMap } from "@/components/home/SectionPanels";

export default function Home() {
  // Work summaries for clients with a full experience — the panels' inline
  // detail shows these as painted catalogue cards.
  const workMap: ClientWorkMap = {};
  for (const experience of CLIENT_EXPERIENCES) {
    workMap[experience.slug] = {
      tagline: experience.tagline,
      categories: readCatalogue(experience.slug).map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        assetCount: category.assetCount,
      })),
    };
  }

  // A few art pieces for the Art panel's preview strip (typographic plates
  // stand in while public/content/art is empty).
  const artPreviews = readArtPreviews(3).map(({ name, url }) => ({ name, url }));

  // Every mark, for the Logofolio panel's five-column wall.
  const logos = readLogofolio();

  return (
    <main className="w-full bg-gallery">
      <HeroStage workMap={workMap} artPreviews={artPreviews} logos={logos} />
      <SiteFooter />
    </main>
  );
}
