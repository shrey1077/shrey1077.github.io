/**
 * All Works — `/all-works`: everything that is not one of the home page's
 * project slides (owner, 2026-10-15), linked by "See all" after the last mark
 * in the strip and in the sections menu.
 *
 *   · Vivid ProTech and Post Grad. UID — slides of their own until
 *     2026-10-16, on the home page's All Projects wall since — opening their
 *     pages;
 *   · the independent commissions (FREELANCE_EXPERIENCE's brands, through
 *     PROJECT_STUDIES) — all but Vivid, which has a page of its own — each
 *     opening its preview in place;
 *   · the 2022 chess site, shipped verbatim under /chess.
 * The plates are read here, server-side, as the home page used to for its
 * Projects board.
 */

import type { Metadata } from "next";
import { pageMeta } from "@/constants/seo";
import { RoomPage } from "@/components/pages/RoomPage";
import { AllWorksGrid, type WorkCard } from "@/components/pages/AllWorksGrid";
import { PROJECT_STUDIES, STUDY_CONTENT_SLUG } from "@/constants/projectStudies";
import { clientBySlug } from "@/constants/clients";
import { PAGE_PROJECTS } from "@/constants/showcase";
import { readCasePlates } from "@/content/catalogue";

export const metadata: Metadata = pageMeta({
  title: "All Works",
  description: "Every project beyond the selected nine — independent commissions, marks and a chess site, by Shrey Singh.",
  path: "/all-works/",
});

/** With pages of their own — shown as those, not as a commission. */
const ON_SLIDES = new Set(["vivid"]);

export default function AllWorksPage() {
  const studies: WorkCard[] = PROJECT_STUDIES.filter((s) => !ON_SLIDES.has(s.id)).map((s) => {
    const plates = readCasePlates(STUDY_CONTENT_SLUG, s.folder);
    return {
      key: s.id,
      name: s.name,
      kind: s.kind,
      image: s.logo ?? plates[0]?.url,
      mark: !!s.logo,
      study: s,
      plates,
    };
  });
  const chess = clientBySlug("chess");
  const pages: WorkCard[] = PAGE_PROJECTS.map((it) => ({ key: it.id, name: it.name, kind: it.sector, image: it.mark, mark: true, href: it.report.href }));
  const cards: WorkCard[] = [
    ...pages,
    ...studies,
    ...(chess
      ? [{ key: chess.slug, name: chess.name, kind: chess.sector, image: chess.cardLogo, mark: true, href: chess.href }]
      : []),
  ];
  return (
    <RoomPage
      side="logic"
      eyebrow="Projects · Everything else"
      title="All Works"
      description="Beyond the selected nine: independent commissions — identities, campaigns, information design and early interiors — and a chess site."
    >
      <AllWorksGrid cards={cards} />
    </RoomPage>
  );
}
