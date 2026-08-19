/**
 * Project studies — the independent commissions, as individual Projects entries.
 *
 * Until 2026-08-20 these were EIGHT categories inside one "Freelance" client
 * room: the Clients board carried a single Freelance card, and the eight brands
 * only appeared once you were inside `/clients/freelance`. The owner moved them
 * up — the Freelance card is gone from Clients, and each brand now stands on
 * the Projects board in its own right.
 *
 * ⚠ `FREELANCE_EXPERIENCE` is still the SOURCE OF TRUTH for their copy. It is
 * no longer rendered as a page (no client owns the `freelance` slug any more),
 * but every headline, challenge and description below comes from it, so edit it
 * there and this list follows. What is added here is only what a board cell and
 * a preview need and a case-study category never had: a mark, and its tone.
 *
 * ⚠ Plates are NOT here. They live on the filesystem under
 * `public/content/clients/freelance/work/<folder>/` and are read server-side
 * (`readCasePlates`), because a client component cannot touch `node:fs`.
 * The `freelance` slug therefore still names a CONTENT folder even though it no
 * longer names a client — do not "tidy" that folder away.
 */

import { FREELANCE_EXPERIENCE } from "@/constants/freelanceExperience";
import type { CaseCategory } from "@/types/caseStudy";

export interface ProjectStudy extends CaseCategory {
  /** The brand's mark, where one exists. Six of the eight have none — the
   *  preview and the board cell both fall back to the name set in type. */
  logo?: string;
  /** "dark" artwork needs a pale plate behind it, "light" a dark one. */
  logoTone?: "light" | "dark";
}

/** Marks that exist for these brands. Only two of the eight are in the
 *  logofolio; the rest were never drawn as a standalone mark, or the work was
 *  layout and information design rather than identity. */
const MARKS: Record<string, { logo: string; logoTone: "light" | "dark" }> = {
  "first-divine": { logo: "/content/logofolio/first-divine.png", logoTone: "dark" },
  komono: { logo: "/content/logofolio/komono.png", logoTone: "dark" },
};

/** The content slug these studies' plates still live under. */
export const STUDY_CONTENT_SLUG = "freelance";

export const PROJECT_STUDIES: readonly ProjectStudy[] = FREELANCE_EXPERIENCE.categories.map(
  (c) => ({ ...c, ...(MARKS[c.id] ?? {}) }),
);

export function projectStudyById(id: string): ProjectStudy | undefined {
  return PROJECT_STUDIES.find((s) => s.id === id);
}
