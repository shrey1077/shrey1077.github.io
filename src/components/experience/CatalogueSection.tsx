/**
 * CatalogueSection — section 03: the client's asset navigation hub.
 *
 * Fully data-driven: renders one CatalogueCard per category the filesystem
 * reader found (one per folder under `public/content/clients/<slug>/catalogue/`).
 * Dropping a new folder there adds a card with no code changes — see
 * docs/CONTENT_GUIDE.md. Shows a quiet empty state if no content exists yet.
 */

import type { CatalogueCategory } from "@/content/catalogue";
import { CatalogueCard } from "@/components/experience/CatalogueCard";
import { Reveal } from "@/components/experience/Reveal";
import { typeVoiceClass } from "@/constants/typography";

interface CatalogueSectionProps {
  clientSlug: string;
  categories: CatalogueCategory[];
}

export function CatalogueSection({ clientSlug, categories }: CatalogueSectionProps) {
  if (categories.length === 0) {
    return (
      <p className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}>
        Catalogue forthcoming
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 xl:gap-6">
      {categories.map((category, i) => (
        // Capped linear stagger — breakpoint-agnostic, so it reads the same at
        // 1/2/3 columns rather than assuming a fixed column count.
        <Reveal key={category.id} delay={Math.min(i, 6) * 0.05}>
          <CatalogueCard
            clientSlug={clientSlug}
            category={category}
            position={i + 1}
          />
        </Reveal>
      ))}
    </div>
  );
}
