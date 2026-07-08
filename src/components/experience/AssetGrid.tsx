/**
 * AssetGrid — the modular asset grid every gallery surface reuses.
 *
 * (Phase 2.5's GalleryGrid, renamed into the experience framework.) Takes
 * `ContentAsset[]` (the stable contract from src/content/catalogue.ts) and
 * renders a quiet, even grid — images today; video/document tiles join later
 * without changing callers.
 *
 * ⚑ SWAP POINT for the future immersive gallery: presentation upgrades (and
 * MediaViewer wiring) replace this component's internals; every caller
 * (photography collections, catalogue categories, GallerySection) keeps the
 * same data in.
 */

import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";

interface AssetGridProps {
  assets: ContentAsset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  const images = assets.filter((a) => a.kind === "image");

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((image) => (
        <li key={image.url} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <Image
            src={image.url}
            alt={image.name}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
