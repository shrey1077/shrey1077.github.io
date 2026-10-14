/**
 * Vivid Process Technology — its own case page, `/clients/vivid` (owner,
 * 2026-10-15: Vivid ProTech is one of the nine project slides, and its "View
 * Full Report" needs a page to open).
 *
 * The generic CaseStudyExperience, one category: Vivid's entry in
 * FREELANCE_EXPERIENCE, which stays the source of its words. Its plates still
 * live in the `freelance` content folder (constants/projectStudies.ts), so
 * this config names THAT slug — CaseStudyExperience reads plates by it.
 */

import type { CaseStudyConfig } from "@/types/caseStudy";
import { FREELANCE_EXPERIENCE } from "@/constants/freelanceExperience";

const vivid = FREELANCE_EXPERIENCE.categories.find((c) => c.id === "vivid")!;

export const VIVID_EXPERIENCE: CaseStudyConfig = {
  slug: "freelance",
  eyebrow: "Selected — Independent practice",
  title: "Vivid Process Technology",
  showIndex: false,
  tagline: vivid.headline,
  intro: `${vivid.challenge} ${vivid.description}`,
  metaLines: [vivid.kind, "Pharma manufacturing · India", vivid.site ?? "vividprotech.com"],
  logo: "/content/clients/vivid/vivid-mark.png",
  footerNote: "Vivid Process Technology — independent commission, shown as portfolio record",
  categories: [vivid],
};
