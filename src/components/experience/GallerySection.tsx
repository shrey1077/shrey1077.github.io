/**
 * GallerySection — a section body presenting a flat set of assets.
 *
 * The simplest framework section: images through AssetGrid, an elegant empty
 * state otherwise. For grouped imagery use PhotographySection (collections);
 * for navigable folders use CatalogueSection.
 */

import type { ContentAsset } from "@/content/catalogue";
import { AssetGrid } from "@/components/experience/AssetGrid";
import { typeVoiceClass } from "@/constants/typography";

interface GallerySectionProps {
  assets: ContentAsset[];
}

export function GallerySection({ assets }: GallerySectionProps) {
  const images = assets.filter((a) => a.kind === "image");

  if (images.length === 0) {
    return (
      <p className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}>
        Gallery forthcoming
      </p>
    );
  }

  return <AssetGrid assets={images} />;
}
