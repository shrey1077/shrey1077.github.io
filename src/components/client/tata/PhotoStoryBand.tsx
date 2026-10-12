/**
 * PhotoStoryBand — band 07 of the Tata IIS page: Photo / Videography,
 * Editing (owner, 2026-10-04). The three aspects the camera work covered —
 * industry visits, student and professional testimonials, and events and
 * campus (owner, 2026-10-11) — and the films cut from it in the three visual
 * themes.
 *
 * Server Component: it gathers each aspect's photographs; PhotoStory, a
 * client component, is the whole band — its tabs sit in the band's margin
 * column (2026-10-05), so it lays the band out itself.
 */

import { PhotoStory } from "@/components/client/tata/PhotoStory";
import { TATA_PHOTO_STORY } from "@/constants/tataPhotos";
import { TATA_FILMS, TATA_PHOTO_ASPECTS, TATA_PHOTO_BAND } from "@/constants/tataStory";

export function PhotoStoryBand() {
  const aspects = TATA_PHOTO_ASPECTS.map((a) => ({
    id: a.id,
    title: a.title,
    text: a.text,
    photos: "photos" in a ? (TATA_PHOTO_STORY[a.photos] ?? []) : undefined,
  }));
  return <PhotoStory band={TATA_PHOTO_BAND} aspects={aspects} films={TATA_FILMS} />;
}
