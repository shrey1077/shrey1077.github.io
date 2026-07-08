/**
 * ClientExperience — a client page composed on the experience framework
 * (docs/CLIENT_ARCHITECTURE.md).
 *
 * A Server Component: reads the client's content from the filesystem and
 * composes framework pieces (components/experience/) with the client-specific
 * sections (BrandOpening, InstituteStructure). Tata IIS is the reference
 * implementation; any client becomes an experience with one config entry +
 * one content directory — no new page code.
 *
 *   ExperienceLayout            shell: back, transition, next-memory footer
 *    └─ ExperienceHero          eyebrow · name · tagline
 *    └─ ExperienceNavigation    01 Brand · 02 Structure · …
 *    └─ ExperienceSection ×N    rail + body per numbered section
 */

import type { Client } from "@/constants/clients";
import type { ClientExperienceConfig } from "@/types/client";
import type { ExperienceAnchor } from "@/types/experience";
import { readCatalogue, readPhotography } from "@/content/catalogue";
import { ExperienceLayout } from "@/components/experience/ExperienceLayout";
import { ExperienceHero } from "@/components/experience/ExperienceHero";
import { ExperienceNavigation } from "@/components/experience/ExperienceNavigation";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { CatalogueSection } from "@/components/experience/CatalogueSection";
import { PhotographySection } from "@/components/experience/PhotographySection";
import { BrandOpening } from "@/components/client/BrandOpening";
import { InstituteStructure } from "@/components/client/InstituteStructure";

interface ClientExperienceProps {
  client: Client;
  config: ClientExperienceConfig;
}

export function ClientExperience({ client, config }: ClientExperienceProps) {
  const catalogue = readCatalogue(client.slug);
  const photography = readPhotography(client.slug);

  // The section plan — drives both the in-page navigation and the numbering,
  // so adding/removing a section can never desynchronize them.
  const sections: (ExperienceAnchor & { render: () => React.ReactNode })[] = [];

  sections.push({
    index: "01",
    title: "Brand",
    anchor: "brand",
    render: () => (
      <BrandOpening markText={config.brand.markText} note={config.brand.note} />
    ),
  });

  if (config.institute) {
    sections.push({
      index: "02",
      title: "Structure",
      anchor: "structure",
      render: () => <InstituteStructure institute={config.institute!} />,
    });
  }

  sections.push({
    index: String(sections.length + 1).padStart(2, "0"),
    title: "Catalogue",
    anchor: "catalogue",
    render: () => (
      <CatalogueSection clientSlug={client.slug} categories={catalogue} />
    ),
  });

  sections.push({
    index: String(sections.length + 1).padStart(2, "0"),
    title: "Photography",
    anchor: "photography",
    render: () => <PhotographySection collections={photography} />,
  });

  const DESCRIPTIONS: Record<string, string> = {
    brand:
      "The identity's opening moment — soon animated from the official construction guidelines.",
    structure: "The parent institute and the campuses that grew from it.",
    catalogue:
      "Every asset family in one place. Each card is generated from a content folder — new folders appear here automatically.",
    photography:
      "Collections from campuses, labs, and events — an immersive gallery in a future phase.",
  };

  return (
    <ExperienceLayout currentSlug={client.slug}>
      <ExperienceHero
        eyebrow={`Client — ${client.sector}`}
        title={client.name}
        tagline={config.tagline}
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
          description={DESCRIPTIONS[section.anchor]}
        >
          {section.render()}
        </ExperienceSection>
      ))}
    </ExperienceLayout>
  );
}
