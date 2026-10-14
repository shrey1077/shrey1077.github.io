/**
 * Writings & Publications — `/writings`: the shelf in full (2026-10-15),
 * opened by the room's button on the home page. The shelf is the one the
 * home page's Publications room drew (PublicationShelf), untouched; each
 * document opens at /publications/<slug>. The cover of each is its first
 * rendered page, resolved here because the shelf can't read the filesystem.
 */

import type { Metadata } from "next";
import { pageMeta } from "@/constants/seo";
import { RoomPage } from "@/components/pages/RoomPage";
import { PublicationShelf } from "@/components/home/PublicationShelf";
import { navSectionById } from "@/constants/navigation";
import { PUBLICATIONS } from "@/constants/publications";
import { readPublicationPages } from "@/content/catalogue";

export const metadata: Metadata = pageMeta({
  title: "Writings & Publications",
  description: "Field studies, essays, process books and bylines — the written work of Shrey Singh.",
  path: "/writings/",
});

export default function WritingsPage() {
  const covers = Object.fromEntries(PUBLICATIONS.map((p) => [p.slug, p.pages ? readPublicationPages(p.slug)[0] : undefined]));
  return (
    <RoomPage
      side="creative"
      eyebrow="Creative · To read"
      title="Writings & Publications"
      description={navSectionById("publications")?.description ?? ""}
    >
      <PublicationShelf publications={PUBLICATIONS} covers={covers} />
    </RoomPage>
  );
}
