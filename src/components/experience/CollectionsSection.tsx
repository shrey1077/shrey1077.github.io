/**
 * CollectionsSection — a folder-driven section body (framework).
 *
 * Renders one block per curated collection (readSections — one folder under
 * `sections/<Section>/`), each in the presentation voice its `_meta.json`
 * declares (types/experience.ts):
 *
 *   strip        wide artifacts, one per beat, captioned
 *   grid         quiet 3-col plates on the neutral sheet
 *   publication  2-col spreads
 *   showcase     a single artifact, large and centered
 *   pairs        2-up portrait pairs (question/answer rhythm)
 *   row          small supporting row
 *   video-wall   VideoWall (client) — posters first, one player at a time
 *
 * Server Component; only the video wall crosses the client boundary.
 */

import Image from "next/image";
import type { CollectionAsset, SectionCollection } from "@/types/experience";
import { Reveal } from "@/components/experience/Reveal";
import { VideoWall } from "@/components/experience/VideoWall";
import { typeVoiceClass } from "@/constants/typography";

function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p
      className={`${typeVoiceClass("logic", "meta")} mt-2.5 text-[0.6rem] leading-relaxed text-neutral-400`}
    >
      {text}
    </p>
  );
}

/** A framed artifact: contained on the quiet sheet, hairline border. */
function Plate({
  asset,
  aspect,
  sizes,
}: {
  asset: CollectionAsset;
  aspect: string;
  sizes: string;
}) {
  return (
    <figure>
      <div
        className={`relative ${aspect} overflow-hidden border border-neutral-200 bg-neutral-50`}
      >
        <Image
          src={asset.url}
          alt={asset.caption ?? asset.name}
          fill
          sizes={sizes}
          className="object-contain"
        />
      </div>
      <Caption text={asset.caption} />
    </figure>
  );
}

/** Curation discipline: any collection shows at most seven artifacts
 *  (meta caption order decides which — the reader sorts by it). */
const MAX_VISIBLE = 7;

function CollectionBody({ collection }: { collection: SectionCollection }) {
  const images = collection.assets
    .filter((a) => a.kind === "image")
    .slice(0, MAX_VISIBLE);

  switch (collection.presentation) {
    case "video-wall":
      return <VideoWall assets={collection.assets} />;

    case "strip":
      return (
        <div className="flex flex-col gap-12">
          {images.map((asset) => (
            <figure key={asset.url}>
              <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
                <Image
                  src={asset.url}
                  alt={asset.caption ?? asset.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
              <Caption text={asset.caption} />
            </figure>
          ))}
        </div>
      );

    case "publication":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {images.map((asset) => (
            <Plate
              key={asset.url}
              asset={asset}
              aspect="aspect-[4/3]"
              sizes="(max-width: 640px) 100vw, 440px"
            />
          ))}
        </div>
      );

    case "showcase":
      return (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {images.map((asset) => (
              <Plate
                key={asset.url}
                asset={asset}
                aspect="aspect-[3/4]"
                sizes="448px"
              />
            ))}
          </div>
        </div>
      );

    case "pairs":
      return (
        <div className="grid max-w-2xl grid-cols-2 gap-4 sm:gap-5">
          {images.map((asset) => (
            <Plate
              key={asset.url}
              asset={asset}
              aspect="aspect-[9/16]"
              sizes="(max-width: 640px) 50vw, 320px"
            />
          ))}
        </div>
      );

    case "row":
      return (
        <div className="flex flex-wrap gap-3">
          {images.map((asset) => (
            <figure key={asset.url} className="w-64">
              <div className="relative aspect-video overflow-hidden border border-neutral-200 bg-neutral-50">
                <Image
                  src={asset.url}
                  alt={asset.caption ?? asset.name}
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </div>
              <Caption text={asset.caption} />
            </figure>
          ))}
        </div>
      );

    case "grid":
    default:
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {images.map((asset) => (
            <Plate
              key={asset.url}
              asset={asset}
              aspect="aspect-[3/4]"
              sizes="(max-width: 640px) 50vw, 300px"
            />
          ))}
        </div>
      );
  }
}

interface CollectionsSectionProps {
  collections: SectionCollection[];
}

export function CollectionsSection({ collections }: CollectionsSectionProps) {
  if (collections.length === 0) {
    return (
      <p className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}>
        Collection forthcoming
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-20">
      {collections.map((collection, i) => (
        <Reveal key={collection.id} delay={i === 0 ? 0 : 0.05}>
          <div className="mb-6 max-w-xl">
            <h3 className="flex items-baseline gap-3">
              <span
                className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-300`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`${typeVoiceClass("logic", "display")} text-sm font-medium text-neutral-900`}
              >
                {collection.name}
              </span>
            </h3>
            {collection.description && (
              <p className="mt-2.5 text-sm leading-relaxed text-neutral-500">
                {collection.description}
              </p>
            )}
          </div>
          <CollectionBody collection={collection} />
        </Reveal>
      ))}
    </div>
  );
}
