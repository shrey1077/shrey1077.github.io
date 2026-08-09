/**
 * Experience-framework type definitions.
 *
 * Client experiences are composed from reusable sections
 * (src/components/experience/ — see docs/CLIENT_ARCHITECTURE.md). These are
 * the data contracts those sections render from. Convention: `*Section`
 * components are section BODIES; the page composes them inside
 * `ExperienceSection` (the rail+body shell).
 */

/** One step in a ProcessSection (research → concept → system → delivery…). */
export interface ProcessStep {
  title: string;
  description: string;
}

/** One entry in a TimelineSection. */
export interface TimelineEntry {
  /** Display date — a year ("2024") or range ("2023–24"). */
  when: string;
  title: string;
  note?: string;
}

/** An anchor entry for ExperienceNavigation (built by the composing page). */
export interface ExperienceAnchor {
  /** Two-digit index ("01"). */
  index: string;
  title: string;
  /** The DOM id of the target ExperienceSection. */
  anchor: string;
}

/* ── Folder-driven sections (Tata IIS build — docs/TATA_IIS_BUILD_PROMPT.md)
 * A client's `sections/<Section>/<Collection>/` content tree renders through
 * CollectionsSection. Each collection declares its presentation voice in
 * `_meta.json`; the framework supplies the layout per voice. */

import type { ContentAsset } from "@/content/catalogue";

/** How a collection presents. */
export type CollectionPresentation =
  | "strip" // wide, one artifact per beat (environmental scale)
  | "grid" // quiet 3-col plates
  | "publication" // 2-col spreads
  | "showcase" // one artifact, large and centered
  | "pairs" // 2-up portrait pairs (question/answer)
  | "row" // small supporting row
  | "video-wall"; // posters first, one player at a time

/** A content asset enriched with curation data from `_meta.json`. */
export interface CollectionAsset extends ContentAsset {
  /** One-line caption (from meta `captions`, keyed by filename). */
  caption?: string;
  /** Portrait-orientation hint (video-wall tiles). */
  portrait?: boolean;
}

/** One curated collection (= one folder under a section). */
export interface SectionCollection {
  id: string;
  name: string;
  description?: string;
  presentation: CollectionPresentation;
  assets: CollectionAsset[];
}

/** One folder-driven section (= one folder under `sections/`). */
export interface FolderSection {
  id: string;
  name: string;
  description?: string;
  collections: SectionCollection[];
}
