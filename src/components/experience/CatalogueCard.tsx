/**
 * CatalogueCard — one auto-generated card per catalogue folder.
 *
 * Rendered from `CatalogueCategory` data (read from the filesystem — see
 * src/content/catalogue.ts). The card never knows about specific categories:
 * whatever folder exists becomes a card, so new content requires no code.
 * A cover image (meta `cover`, else the folder's first image) fronts the
 * card; folders without images stay typographic.
 */

import Image from "next/image";
import Link from "next/link";
import type { CatalogueCategory } from "@/content/catalogue";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface CatalogueCardProps {
  clientSlug: string;
  category: CatalogueCategory;
  /** 1-based position for the card index. */
  position: number;
}

export function CatalogueCard({ clientSlug, category, position }: CatalogueCardProps) {
  return (
    <Link
      href={`/clients/${clientSlug}/catalogue/${category.id}`}
      className={[
        "group flex flex-col overflow-hidden",
        "border border-neutral-200 bg-white outline-none",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:border-neutral-400 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.22)]",
        "focus-visible:-translate-y-1 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {category.coverUrl && (
        <span className="relative block aspect-[3/2] overflow-hidden bg-neutral-100">
          <Image
            src={category.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </span>
      )}

      <span className="flex flex-1 flex-col justify-between gap-4 p-5">
        <span className="block">
          <span className={`${META} block text-[0.55rem] tabular-nums text-neutral-500`}>
            {String(position).padStart(2, "0")}
          </span>
          <span className="mt-2 block text-base font-medium leading-snug text-neutral-900">
            {category.name}
          </span>
          {category.description && (
            <span className="mt-1.5 block text-xs leading-relaxed text-neutral-500">
              {category.description}
            </span>
          )}
        </span>

        <span className={`${META} flex items-center justify-between text-[0.55rem] text-neutral-500`}>
          {category.assetCount > 0
            ? `${category.assetCount} asset${category.assetCount === 1 ? "" : "s"}`
            : "Coming soon"}
          <span
            aria-hidden
            className="inline-block transition-transform duration-500 group-hover:translate-x-1"
          >
            ↗
          </span>
        </span>
      </span>
    </Link>
  );
}
