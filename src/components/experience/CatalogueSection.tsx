/**
 * CatalogueSection — the client's asset navigation hub.
 *
 * Fully data-driven: renders one CatalogueCard per category the filesystem
 * reader found (one per folder under `public/content/clients/<slug>/catalogue/`).
 * Dropping a new folder there adds a card with no code changes — see
 * docs/CONTENT_GUIDE.md. Shows a quiet empty state if no content exists yet.
 *
 * ⚠ ONE CATEGORY CAN BE EXPANDED IN PLACE rather than being a card you click
 * through. The owner asked on 2026-08-25 for Zabraku's "Portfolio 2021" — a
 * 35-page company deck — to open here, with the two smaller categories after
 * it. `expandId` does that:
 *   · the named category renders as a full gallery, FIRST;
 *   · every other category keeps its card and is pushed AFTER it.
 * Numbering follows the new order, so the expanded deck is 01 and the cards
 * that used to be 01 and 02 renumber rather than leaving a gap.
 *
 * ⚠ The expanded category KEEPS its route as a "see all" link, so the
 * standalone page is still reachable and nothing pointing at it breaks.
 *
 * ⚠ It stays a Server Component. The gallery is the only client part and it
 * brings its own boundary; the assets are read by the caller, which is already
 * on the server.
 */

import Link from "next/link";
import type { CatalogueCategory } from "@/content/catalogue";
import type { CollectionAsset } from "@/types/experience";
import { CatalogueCard } from "@/components/experience/CatalogueCard";
import { CatalogueGallery } from "@/components/experience/CatalogueGallery";
import { Reveal } from "@/components/experience/Reveal";
import { typeVoiceClass } from "@/constants/typography";

interface CatalogueSectionProps {
  clientSlug: string;
  categories: CatalogueCategory[];
  /** Category id to open in place. Everything else follows as cards. */
  expandId?: string;
  /** That category's assets, read server-side by the caller. */
  expandAssets?: CollectionAsset[];
  /** How many plates to add each time the reader reaches the end — keeps a long
   *  deck from laying every image out at once. */
  expandRevealStep?: number;
}

export function CatalogueSection({
  clientSlug,
  categories,
  expandId,
  expandAssets,
  expandRevealStep = 8,
}: CatalogueSectionProps) {
  if (categories.length === 0) {
    return (
      <p className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}>
        Catalogue forthcoming
      </p>
    );
  }

  const expanded =
    expandId && expandAssets?.length
      ? categories.find((c) => c.id === expandId)
      : undefined;
  // The rest keep their original order — only the expanded one is lifted out.
  const rest = expanded ? categories.filter((c) => c.id !== expanded.id) : categories;

  return (
    <div className="flex flex-col gap-14">
      {expanded && expandAssets ? (
        <section aria-label={expanded.name}>
          <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span
                className={`${typeVoiceClass("logic", "meta")} block text-[0.62rem] tracking-[0.2em] text-neutral-400`}
              >
                01
              </span>
              <h3 className="mt-1 text-[1.35rem] font-medium tracking-[-0.01em] text-neutral-900">
                {expanded.name}
              </h3>
              {expanded.description ? (
                <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-neutral-600">
                  {expanded.description}
                </p>
              ) : null}
            </div>
            <Link
              // ⚠ `/catalogue/` is part of the route — CatalogueCard links the
              //   same way. Without it this 404s, which is easy to miss because
              //   the link still looks right.
              href={`/clients/${clientSlug}/catalogue/${expanded.id}`}
              className={`${typeVoiceClass("logic", "meta")} shrink-0 text-[0.62rem] tracking-[0.16em] text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline`}
            >
              {expandAssets.length} ASSETS ↗
            </Link>
          </header>
          <CatalogueGallery assets={expandAssets} revealStep={expandRevealStep} />
        </section>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-6">
          {rest.map((category, i) => (
            // Capped linear stagger — breakpoint-agnostic, so it reads the same
            // at 1/2/3 columns rather than assuming a fixed column count.
            <Reveal key={category.id} delay={Math.min(i, 6) * 0.05}>
              <CatalogueCard
                clientSlug={clientSlug}
                category={category}
                // ⚠ Numbering continues PAST the expanded block, so the cards
                //   read 02, 03… under an expanded 01 rather than restarting.
                position={i + 1 + (expanded ? 1 : 0)}
              />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
