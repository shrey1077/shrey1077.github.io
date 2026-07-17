/**
 * Client-experience type definitions.
 *
 * A client either has a full "experience" (a configured, sectioned page — Tata
 * IIS is the reference implementation) or falls back to the minimal
 * work-in-progress page. The experience is driven entirely by:
 *
 *   1. a `ClientExperienceConfig` (constants/clientExperiences.ts) — copy and
 *      structural data that belongs in code, and
 *   2. content folders on disk (public/content/clients/<slug>/…) — assets that
 *      belong to the filesystem (see src/content/catalogue.ts and
 *      docs/CONTENT_GUIDE.md).
 *
 * Adding a future client page = one config entry + one content directory.
 */

/** A branch/sub-entity of a client organization (e.g. IIS Ahmedabad). */
export interface ClientBranch {
  id: string;
  name: string;
  /** Short locator/descriptor rendered as meta ("Ahmedabad", "Mumbai"). */
  city: string;
  /** Optional logo path under /public. Falls back to a typographic monogram. */
  logoSrc?: string;
}

/** Config for a client's dedicated experience page. */
export interface ClientExperienceConfig {
  /** Must match the client's slug in constants/clients.ts. */
  slug: string;
  /** Short positioning line under the client name. */
  tagline: string;
  /** Plays the client's Legacy intro overlay on first visit (LegacyIntro). */
  legacyIntro?: boolean;
  /** Section 01 renders the full logo system (guideline plates, campus
   *  identities, partner wall) instead of the BrandOpening placeholder. */
  logoSystem?: boolean;
  /** Optional per-anchor rail-description overrides ("logos", "photography"…). */
  sectionDescriptions?: Record<string, string>;
  /** Closing company-info block (ExperienceFooter). */
  footer?: {
    /** The client's formal name for the record line. */
    clientName: string;
    /** Short factual lines about the engagement. */
    facts: string[];
  };
  /** Section 01 — opening brand experience. */
  brand: {
    /** The text mark shown in the construction frame until real logo assets land. */
    markText: string;
    /** One quiet line about the brand/logo work. */
    note: string;
  };
  /** Section 02 — institute/organization structure (optional per client). */
  institute?: {
    parentName: string;
    parentNote: string;
    branches: ClientBranch[];
  };
}
