"use client";

/**
 * CatalogueGallery — a category page's image gallery, viewer-wired.
 *
 * The immersive step past AssetGrid for catalogue routes: artifacts sit as
 * contained plates on the quiet sheet with their captions beneath; choosing
 * one opens it in the white MediaViewer. Client component only for the
 * viewing state — data arrives from the server route.
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

interface CatalogueGalleryProps {
  assets: CollectionAsset[];
}

export function CatalogueGallery({ assets }: CatalogueGalleryProps) {
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  const images = assets
    .filter((a) => a.kind === "image")
    .slice(0, MAX_VISIBLE);
  if (images.length === 0) return null;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((image) => (
          <li key={image.url}>
            <button
              type="button"
              onClick={() => setViewing(image)}
              aria-label={`View ${image.caption ?? image.name}`}
              className="group block w-full outline-none"
            >
              <span className="relative block aspect-[4/5] overflow-hidden border border-neutral-200 bg-neutral-50 transition-colors duration-300 group-hover:border-neutral-400 group-focus-visible:border-neutral-900">
                <Image
                  src={image.url}
                  alt={image.caption ?? image.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 320px"
                  className="object-contain p-2 transition-transform duration-700 group-hover:scale-[1.015]"
                />
              </span>
              {image.caption && (
                <span
                  className={`${typeVoiceClass("logic", "meta")} mt-2 block text-left text-[0.6rem] leading-relaxed text-neutral-400 transition-colors duration-300 group-hover:text-neutral-600`}
                >
                  {image.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
