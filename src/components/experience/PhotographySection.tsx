/**
 * PhotographySection — section 04: the client's photography collections.
 *
 * Architecture-first (per the brief): collections are read from the filesystem
 * (one per folder under `public/content/clients/<slug>/photography/`), each
 * rendering its images through the reusable AssetGrid — or a quiet
 * placeholder while empty. When photography becomes an immersive gallery,
 * AssetGrid's internals change; this section and its data contract do not.
 */

import type { PhotoCollection } from "@/content/catalogue";
import { AssetGrid } from "@/components/experience/AssetGrid";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface PhotographySectionProps {
  collections: PhotoCollection[];
}

export function PhotographySection({ collections }: PhotographySectionProps) {
  if (collections.length === 0) {
    return (
      <p className={`${META} text-xs text-neutral-400`}>Photography forthcoming</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {collections.map((collection) => (
        <article
          key={collection.id}
          className="flex flex-col gap-4 border border-neutral-200 bg-white p-5"
        >
          <header className="flex items-baseline justify-between gap-4">
            <h3 className="text-sm font-medium text-neutral-900">
              {collection.name}
            </h3>
            <span className={`${META} text-[0.55rem] text-neutral-400`}>
              {collection.images.length > 0
                ? `${collection.images.length} photo${collection.images.length === 1 ? "" : "s"}`
                : "Soon"}
            </span>
          </header>

          {collection.images.length > 0 ? (
            <AssetGrid assets={collection.images} />
          ) : (
            <div className="flex h-24 items-center justify-center border border-dashed border-neutral-200">
              <span className={`${META} text-[0.55rem] text-neutral-300`}>
                Collection forthcoming
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
