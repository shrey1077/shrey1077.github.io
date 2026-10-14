/**
 * Arts & Crafts — `/arts-and-crafts`: the collections in full (2026-10-15),
 * opened by the room's button on the home page. The room itself is the one
 * the home page drew until then (ArtCollections), untouched — one tile per
 * folder under public/content/art, each opening its gallery.
 */

import type { Metadata } from "next";
import { pageMeta } from "@/constants/seo";
import { RoomPage } from "@/components/pages/RoomPage";
import { ArtCollections } from "@/components/home/ArtCollections";
import { navSectionById } from "@/constants/navigation";
import { readArtCollections } from "@/content/catalogue";

export const metadata: Metadata = pageMeta({
  title: "Arts & Crafts",
  description: "Drawings, paintings and studies away from the screen — sketchbooks, observational work and things made by hand, by Shrey Singh.",
  path: "/arts-and-crafts/",
});

export default function ArtsAndCraftsPage() {
  return (
    <RoomPage
      side="creative"
      eyebrow="Creative · By hand"
      title="Arts & Crafts"
      description={navSectionById("art")?.description ?? ""}
    >
      <div className="h-[calc(100dvh-17rem)] min-h-[30rem]">
        <ArtCollections collections={readArtCollections()} />
      </div>
    </RoomPage>
  );
}
