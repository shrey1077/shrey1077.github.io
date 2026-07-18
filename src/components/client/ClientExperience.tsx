/**
 * ClientExperience — a client page composed on the experience framework
 * (docs/CLIENT_ARCHITECTURE.md, docs/TATA_IIS_BUILD_PROMPT.md).
 *
 * A Server Component: reads the client's content from the filesystem and
 * composes framework pieces with the client-specific sections. Two content
 * shapes are supported, chosen by DATA:
 *
 *   • folder-driven sections (`sections/<Section>/<Collection>/…` exists) —
 *     the Tata IIS shape: LogoSystem (config.logoSystem) → Structure → one
 *     numbered section per content folder → Photography → footer, with the
 *     LegacyIntro overlay when configured;
 *   • the catalogue shape (no sections tree) — BrandOpening → Structure →
 *     Catalogue → Photography, unchanged for future clients.
 *
 *   ExperienceLayout            shell: back, transition, next-memory footer
 *    └─ LegacyIntro             (config.legacyIntro — plays once)
 *    └─ ExperienceHero          eyebrow · name · tagline
 *    └─ ExperienceNavigation    01 … 0N anchors
 *    └─ ExperienceSection ×N    rail + body per numbered section
 *    └─ ExperienceFooter        company info (config.footer)
 */

import type { Client } from "@/constants/clients";
import type { ClientExperienceConfig } from "@/types/client";
import type { ExperienceAnchor } from "@/types/experience";
import { readCatalogue, readPhotography, readSections } from "@/content/catalogue";
import { ExperienceLayout } from "@/components/experience/ExperienceLayout";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ExperienceNavigation } from "@/components/experience/ExperienceNavigation";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { CatalogueSection } from "@/components/experience/CatalogueSection";
import { CollectionsSection } from "@/components/experience/CollectionsSection";
import { PhotographySection } from "@/components/experience/PhotographySection";
import { ExperienceFooter } from "@/components/experience/ExperienceFooter";
import { BrandOpening } from "@/components/client/BrandOpening";
import { InstituteStructure } from "@/components/client/InstituteStructure";
import { LegacyIntro } from "@/components/client/LegacyIntro";
import { LogoSystem } from "@/components/client/LogoSystem";

interface ClientExperienceProps {
  client: Client;
  config: ClientExperienceConfig;
}

/** Default rail descriptions; config.sectionDescriptions overrides by anchor. */
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  brand:
    "The identity's opening moment — soon animated from the official construction guidelines.",
  logos:
    "One wordmark, two campus dialects, and the rulebook that keeps them honest.",
  structure: "The parent institute and the campuses that grew from it.",
  catalogue:
    "Every asset family in one place. Each card is generated from a content folder — new folders appear here automatically.",
  photography:
    "Collections from campuses, labs, and events — an immersive gallery in a future phase.",
};

export function ClientExperience({ client, config }: ClientExperienceProps) {
  const folderSections = readSections(client.slug);
  const photography = readPhotography(client.slug);

  const describe = (anchor: string, fallback?: string) =>
    config.sectionDescriptions?.[anchor] ??
    fallback ??
    DEFAULT_DESCRIPTIONS[anchor];

  // The section plan — drives both the in-page navigation and the numbering,
  // so adding/removing a section can never desynchronize them.
  const sections: (ExperienceAnchor & {
    description?: string;
    render: () => React.ReactNode;
  })[] = [];
  const nextIndex = () => String(sections.length + 1).padStart(2, "0");

  if (config.logoSystem) {
    sections.push({
      index: nextIndex(),
      title: "Logos & Guidelines",
      anchor: "logos",
      description: describe("logos"),
      render: () => <LogoSystem />,
    });
  } else {
    sections.push({
      index: nextIndex(),
      title: "Brand",
      anchor: "brand",
      description: describe("brand"),
      render: () => (
        <BrandOpening markText={config.brand.markText} note={config.brand.note} />
      ),
    });
  }

  if (config.institute) {
    sections.push({
      index: nextIndex(),
      title: "Structure",
      anchor: "structure",
      description: describe("structure"),
      render: () => <InstituteStructure institute={config.institute!} />,
    });
  }

  if (folderSections.length > 0) {
    for (const section of folderSections) {
      sections.push({
        index: nextIndex(),
        title: section.name,
        anchor: section.id,
        description: section.description,
        render: () => <CollectionsSection collections={section.collections} />,
      });
    }
  } else {
    const catalogue = readCatalogue(client.slug);
    sections.push({
      index: nextIndex(),
      title: "Catalogue",
      anchor: "catalogue",
      description: describe("catalogue"),
      render: () => (
        <CatalogueSection clientSlug={client.slug} categories={catalogue} />
      ),
    });
  }

  // Photography only exists as a section when the client actually keeps a
  // photography/ tree — clients whose photos live in the catalogue skip it.
  if (photography.length > 0) {
    sections.push({
      index: nextIndex(),
      title: "Photography",
      anchor: "photography",
      description: describe("photography"),
      render: () => <PhotographySection collections={photography} />,
    });
  }

  // The client's own typographic voice + accent, scoped to this experience
  // via CSS variables (ExperienceHero, category routes, and accent moments
  // read them; absent a theme every var falls back to the site's voices).
  const themeVars = config.brandTheme
    ? ({
        "--brand-font": `var(${config.brandTheme.fontVar})`,
        "--brand-accent": config.brandTheme.accent,
        ...(config.brandTheme.tracking
          ? { "--brand-tracking": config.brandTheme.tracking }
          : {}),
      } as React.CSSProperties)
    : undefined;

  return (
    <ExperienceLayout currentSlug={client.slug}>
      <div style={themeVars}>
      {config.legacyIntro && <LegacyIntro />}

      <ExperienceHero
        eyebrow={`Client — ${client.sector}`}
        title={client.name}
        tagline={config.tagline}
        stats={config.stats}
      />

      <ExperienceNavigation
        anchors={sections.map(({ index, title, anchor }) => ({ index, title, anchor }))}
      />

      {sections.map((section) => (
        <ExperienceSection
          key={section.anchor}
          index={section.index}
          title={section.title}
          anchor={section.anchor}
          description={section.description}
        >
          {section.render()}
        </ExperienceSection>
      ))}

      {config.footer && (
        <ExperienceFooter
          clientName={config.footer.clientName}
          clientFacts={config.footer.facts}
        />
      )}
      </div>
    </ExperienceLayout>
  );
}
