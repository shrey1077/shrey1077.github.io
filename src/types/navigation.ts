/**
 * Navigation type definitions.
 *
 * The homepage navigation is data-driven: a single list of sections
 * (constants/navigation.ts) drives both the DOM labels around the brain and the
 * content the preview pane shows. These types are the contract for that list.
 */

import type { Hemisphere } from "@/types/brain";

/**
 * Stable identifiers for every navigation section. Using a string-literal union
 * (rather than plain `string`) means the store, the preview pane, and any future
 * consumer are all checked against the same closed set.
 */
export type NavSectionId =
  | "clients"
  | "projects"
  | "logofolio"
  | "career-path"
  | "art"
  | "publications"
  | "the-extincts-project"
  | "ai-generations";

/**
 * How the preview pane should render a section's body.
 *   • "clients"     → the real Clients grid (Phase 2).
 *   • "coming-soon" → an elegant placeholder (every other section, for now).
 * New kinds get added here as later phases implement real content.
 */
/** "gallery" = the section has real content of its own to show. */
export type PreviewKind = "clients" | "gallery" | "coming-soon";

/** One navigation section — placed around a hemisphere, opens the preview pane. */
export interface NavSection {
  id: NavSectionId;
  /** The visible label. */
  label: string;
  /** Which hemisphere it flanks (left = logic, right = creativity). */
  hemisphere: Hemisphere;
  /** Ordering within its hemisphere column, top → bottom. */
  order: number;
  /** Which preview body to render when selected. */
  kind: PreviewKind;
  /** One-sentence introduction shown in the preview pane's rail. */
  description: string;
}

/** The brain's live hover target, shared so the 3D brain can acknowledge it. */
export interface NavHoverTarget {
  id: NavSectionId;
  hemisphere: Hemisphere;
}
