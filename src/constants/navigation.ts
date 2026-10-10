/**
 * Navigation configuration — the single source of truth for the homepage nav.
 *
 * This one list drives everything: the DOM labels placed around each hemisphere
 * (BrainNavigation), which preview body renders when a section is selected
 * (PreviewPane), and the section titles. Adding/reordering a section is a
 * one-line change here; no component needs editing.
 *
 * Left hemisphere = logic. Right hemisphere = creativity.
 *
 * ⚠ THREE SECTIONS A SIDE since 2026-10-10 (owner). It was four:
 *   left   Clients · Projects · My Stack          (Logofolio and Career Path out;
 *                                                   My Stack in — the tools that
 *                                                   stood on the landing's first
 *                                                   slide moved into it)
 *   right  AI Videos · Arts & Crafts · The Extincts Project
 *                                                  (Publications and AI
 *                                                   Generations & Ideas out; AI
 *                                                   Videos in, its films to come)
 * The rooms that went keep their renderers (LogofolioWall, CareerTimeline,
 * PublicationShelf) and their ids in NavSectionId; git has their entries.
 */

import type { NavSection, NavSectionId } from "@/types/navigation";

export const NAV_SECTIONS: readonly NavSection[] = [
  // Left — logic / engineering.
  {
    id: "clients",
    label: "Clients",
    hemisphere: "left",
    order: 0,
    kind: "clients",
    description:
      "Brands and organizations I've collaborated with to build meaningful identities and impactful experiences.",
    tagline: "People / Brands / Impact",
  },
  {
    id: "projects",
    label: "Projects",
    hemisphere: "left",
    order: 1,
    kind: "clients",
    description:
      "Self-directed and academic work — where the brief was my own, end to end.",
    tagline: "Ideas / Execution / Outcomes",
  },
  {
    id: "my-stack",
    label: "My Stack",
    hemisphere: "left",
    order: 2,
    kind: "gallery",
    description: "The tools behind the work — for design, for generating images and film, and for building.",
    tagline: "Design / Generate / Build",
  },

  // Right — creativity / art.
  // ⚠ Arts & Crafts (id `art`) and the Extincts draw their own bodies
  // (SectionBody's OWN_RENDERER), so `kind` never reaches `cellsFor` for them.
  {
    id: "ai-videos",
    label: "AI Videos",
    hemisphere: "right",
    order: 0,
    kind: "coming-soon",
    description: "Films and motion made with AI. The reel is on its way.",
  },
  {
    id: "art",
    label: "Arts & Crafts",
    hemisphere: "right",
    order: 1,
    kind: "gallery",
    description:
      "Drawings, paintings and studies away from the screen — sketchbooks, observational work, and things made by hand.",
  },
  {
    id: "the-extincts-project",
    label: "The Extincts Project",
    hemisphere: "right",
    order: 2,
    kind: "gallery",
    description: "An ongoing personal series on what we've lost.",
  },
] as const;

/** Sections for one hemisphere, sorted top → bottom. */
export function navSectionsFor(hemisphere: "left" | "right"): NavSection[] {
  return NAV_SECTIONS.filter((s) => s.hemisphere === hemisphere).sort(
    (a, b) => a.order - b.order,
  );
}

/** Look up a section by id (e.g. to title the open preview pane). */
export function navSectionById(id: NavSectionId): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.id === id);
}
