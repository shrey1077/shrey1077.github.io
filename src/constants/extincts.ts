/**
 * extincts — what the Extincts Project room holds (owner, 2026-10-03): four
 * sections, in this order.
 *
 *   01 Initial Research   the three research reports, read page by page
 *                         (pages: extinctsReportPages, rendered by
 *                         scripts/prepare-extincts-reports.mjs)
 *   02 Stories            six stories — titles only for now
 *   03 Script             to be supplied by the owner
 *   04 Character Sheets   to be supplied by the owner
 *
 * The reports' titles are their own: report 2 is subtitled "Part 2 —
 * Approaching the story" on its cover, and reports 1 and 3 are summed up from
 * their contents pages. Dates are the files' own (2020).
 */

export interface ExtinctsReport {
  /** Folder under public/content/extincts/reports, and the key into
   *  EXTINCTS_REPORT_PAGES. */
  id: string;
  title: string;
  /** What it covers, from its contents page. */
  about: string;
  date: string;
}

export const EXTINCTS_REPORTS: ExtinctsReport[] = [
  {
    id: "report-1",
    title: "Identifying the problem",
    about: "The literature, the field trips — Pradhyuman Zoo, Gir, Fudam — and the analysis.",
    date: "February 2020",
  },
  {
    id: "report-2",
    title: "Approaching the story",
    about: "Stakeholder mapping, the rules of script writing, the story brief and the first pages.",
    date: "April 2020",
  },
  {
    id: "report-3",
    title: "The final report",
    about: "The graduation document: the research, the ideation, the script and the design, end to end.",
    date: "May 2020",
  },
];

/** The six stories, in the owner's order. Each is split where the title
 *  turns — "The Last" / "Dodo" — so the cards can set the two halves apart. */
export const EXTINCTS_STORIES: { lead: string; name: string }[] = [
  { lead: "The Last", name: "Family" },
  { lead: "The Last", name: "King of Tasmania" },
  { lead: "The Last", name: "Horn of Africa" },
  { lead: "The Last", name: "Dodo" },
  { lead: "The Last", name: "Passenger" },
  { lead: "The First", name: "Meeting" },
];

export type ExtinctsSectionId = "research" | "stories" | "script" | "characters";

export const EXTINCTS_SECTIONS: { id: ExtinctsSectionId; label: string }[] = [
  { id: "research", label: "Initial Research" },
  { id: "stories", label: "Stories" },
  { id: "script", label: "Script" },
  { id: "characters", label: "Character Sheets" },
];
