/**
 * CatalogueCard — one auto-generated card per catalogue folder.
 *
 * Rendered from `CatalogueCategory` data (read from the filesystem — see
 * src/content/catalogue.ts). The card never knows about specific categories:
 * whatever folder exists becomes a card, so new content requires no code.
 */

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
        "group flex min-h-36 flex-col justify-between gap-4 p-5",
        "border border-neutral-200 bg-white outline-none",
        "transition-all duration-500",
        "hover:-translate-y-0.5 hover:border-neutral-400",
        "focus-visible:-translate-y-0.5 focus-visible:border-neutral-900",
      ].join(" ")}
    >
      <div>
        <span className={`${META} block text-[0.55rem] tabular-nums text-neutral-400`}>
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
      </div>

      <span className={`${META} flex items-center justify-between text-[0.55rem] text-neutral-400`}>
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
    </Link>
  );
}
