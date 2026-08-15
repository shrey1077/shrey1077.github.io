"use client";

/**
 * CatalogueGallery — a category page's image gallery, viewer-wired.
 *
 * The immersive step past AssetGrid for catalogue routes: artifacts sit as
 * contained plates on the quiet sheet with their captions beneath; choosing
 * one opens it in the white MediaViewer. Client component only for the
 * viewing state — data arrives from the server route.
 *
 * Robustness: the first row is eager + priority (never lazy behind a reveal),
 * so a category page can't land on blank space while images defer. The plates
 * keep a shared 4:3 window (contain) so wildly different artifacts — tall
 * posters, wide billboards — read as one honest wall rather than uniform
 * portrait slots that turn a landscape into a thin strip.
 */

import { useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import type { CollectionAsset } from "@/types/experience";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { typeVoiceClass } from "@/constants/typography";

/** Curation discipline: a section shows at most seven artifacts. The meta's
 *  caption order decides WHICH seven (readCatalogueCategory sorts by it). */
const MAX_VISIBLE = 7;
/** How many load eagerly (above the fold on a category page). */
const EAGER = 3;

interface CatalogueGalleryProps {
  assets: CollectionAsset[];
  /** Overrides MAX_VISIBLE — see the `maxVisible` note in catalogue.ts. */
  maxVisible?: number;
  /** false drops the caption line under each plate. */
  showCaptions?: boolean;
}

export function CatalogueGallery({
  assets,
  maxVisible = MAX_VISIBLE,
  showCaptions = true,
}: CatalogueGalleryProps) {
  // Index rather than the asset itself, so the viewer can walk the set.
  const [at, setAt] = useState<number | null>(null);

  const images = assets.filter((a) => a.kind === "image").slice(0, maxVisible);
  if (images.length === 0) return null;

  const viewing = at === null ? null : (images[at] as ContentAsset);
  const step = (d: number) =>
    setAt((i) => (i === null ? i : (i + d + images.length) % images.length));

  return (
    <div>
      {/* Three across from `sm` up — the deck rooms are built as 3x3. */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
        {images.map((image, i) => (
          <li key={image.url}>
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={`View ${image.caption ?? image.name}`}
              className="group block w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/50 focus-visible:ring-offset-2"
            >
              <span className="relative block aspect-[4/3] overflow-hidden border border-neutral-200 bg-neutral-50 transition-colors duration-300 group-hover:border-neutral-500 group-focus-visible:border-neutral-900">
                <Image
                  src={image.url}
                  alt={image.caption ?? image.name}
                  fill
                  priority={i < EAGER}
                  loading={i < EAGER ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 50vw, 320px"
                  className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </span>
              {showCaptions && image.caption && (
                <span
                  className={`${typeVoiceClass("logic", "meta")} mt-2 block text-left text-[0.6rem] leading-relaxed text-neutral-500 transition-colors duration-300 group-hover:text-neutral-800`}
                >
                  {image.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <MediaViewer
        asset={viewing}
        onClose={() => setAt(null)}
        // Only a set worth walking gets arrows; a single plate stays a lightbox.
        onPrev={images.length > 1 ? () => step(-1) : undefined}
        onNext={images.length > 1 ? () => step(1) : undefined}
        position={at === null ? undefined : { at: at + 1, of: images.length }}
      />
    </div>
  );
}
