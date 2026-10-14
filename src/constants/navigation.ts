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
 * ⚠ THE PINS SINCE 2026-10-15 (owner): ONE on the left — Projects, "a single
 * Projects menu at the bottom of second slide" — and four on the right:
 *   left   Projects                 (Clients and Projects merged; My Stack
 *                                      became the bottom-left pop-up, KitButton)
 *   right  The Extincts Project · Arts & Crafts · AI Projects ·
 *          Writings & Publications     (AI Videos renamed AI Projects; Writings
 *                                      & Publications back in, the shelf)
 * The pins fly to the rooms, which are no longer one per section: every
 * project and creative body of work has a slide of its own (constants/
 * showcase.ts). Projects flies to the first of them.
 * Until 2026-10-15 it was three a side — Clients · Projects · My Stack, and
 * AI Videos · Arts & Crafts · The Extincts Project — and four before
 * 2026-10-10. The sections that went keep their entries in RETIRED_SECTIONS,
 * so pages that quote them (/clients) still can.
 */

import type { NavSection, NavSectionId } from "@/types/navigation";

export const NAV_SECTIONS: readonly NavSection[] = [
  // Left — logic / engineering: the one way in to the projects.
  {
    id: "projects",
    label: "Projects",
    hemisphere: "left",
    order: 0,
    kind: "clients",
    description:
      "Brands and organizations I've collaborated with to build meaningful identities and impactful experiences.",
    tagline: "People / Brands / Impact",
  },

  // Right — creativity / art.
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
    id: "ai-videos",
    label: "AI Projects",
    hemisphere: "right",
    order: 2,
    kind: "coming-soon",
    description: "Films and motion made with AI. The reel is on its way.",
  },
  {
    id: "publications",
    label: "Writings & Publications",
    hemisphere: "right",
    order: 3,
    kind: "gallery",
    description: "Field studies, essays, process books and bylines — the work that can be read.",
  },
  {
    id: "the-extincts-project",
    label: "The Extincts Project",
    hemisphere: "right",
    order: 0,
    kind: "gallery",
    description: "An ongoing personal series on what we've lost.",
  },
] as const;

/** Sections no longer on the landing, kept for the pages that quote them. */
const RETIRED_SECTIONS: readonly NavSection[] = [
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
    id: "my-stack",
    label: "My Stack",
    hemisphere: "left",
    order: 2,
    kind: "gallery",
    description: "The tools behind the work — for design, for generating images and film, and for building.",
    tagline: "Design / Generate / Build",
  },
];

/** Sections for one hemisphere, sorted top → bottom. */
export function navSectionsFor(hemisphere: "left" | "right"): NavSection[] {
  return NAV_SECTIONS.filter((s) => s.hemisphere === hemisphere).sort(
    (a, b) => a.order - b.order,
  );
}

/** Look up a section by id (e.g. to title the open preview pane). */
export function navSectionById(id: NavSectionId): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.id === id) ?? RETIRED_SECTIONS.find((s) => s.id === id);
}
