/**
 * Navigation configuration — the single source of truth for the homepage nav.
 *
 * This one list drives everything: the DOM labels placed around each hemisphere
 * (BrainNavigation), which preview body renders when a section is selected
 * (PreviewPane), and the section titles. Adding/reordering a section is a
 * one-line change here; no component needs editing.
 *
 * Left hemisphere = logic. Right hemisphere = creativity. Four sections each.
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
  },
  {
    id: "projects",
    label: "Projects",
    hemisphere: "left",
    order: 1,
    kind: "clients",
    description:
      "Self-directed and academic work — where the brief was my own, end to end.",
  },
  {
    id: "logofolio",
    label: "Logofolio",
    hemisphere: "left",
    order: 2,
    kind: "coming-soon",
    description: "Marks, monograms, and identity systems in one place.",
  },
  {
    id: "career-path",
    label: "Career Path",
    hemisphere: "left",
    order: 3,
    kind: "coming-soon",
    description: "The route so far — roles, milestones, and turns.",
  },

  // Right — creativity / art.
  {
    id: "art",
    label: "Art",
    hemisphere: "right",
    order: 0,
    kind: "coming-soon",
    description: "Drawings, paintings, and studies away from the screen.",
  },
  {
    id: "publications",
    label: "Publications",
    hemisphere: "right",
    order: 1,
    kind: "coming-soon",
    description: "Writing, features, and published work.",
  },
  {
    id: "the-extincts-project",
    label: "The Extincts Project",
    hemisphere: "right",
    order: 2,
    kind: "coming-soon",
    description: "An ongoing personal series on what we've lost.",
  },
  {
    id: "ai-generations",
    label: "AI Generations & Ideas",
    hemisphere: "right",
    order: 3,
    kind: "coming-soon",
    description: "Experiments, prompts, and machine-made sketches.",
  },
] as const;

/** Two-digit index of a section within the full list ("01" … "08"). */
export function navSectionIndex(id: NavSectionId): string {
  const i = NAV_SECTIONS.findIndex((s) => s.id === id);
  return String(i + 1).padStart(2, "0");
}

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
