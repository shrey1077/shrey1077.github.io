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
  /** A hosted Spline scene to run behind this room's hero.
   *
   *  ⚠ THIS IS A REMOTE URL, NOT AN ASSET. Whatever it points at is fetched
   *  from someone's Spline account at view time — see SplineScene's header for
   *  the licensing, availability and third-party-request consequences. Setting
   *  it is a deliberate act; leaving it unset is the norm. */
  splineScene?: string;
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
  /** What the catalogue section is called for this client. "Catalogue" is the
   *  generic word and fits an archive of loose work; a client whose material is
   *  one bound document wants its own name for it. Used by both the client
   *  page's section rail and the category page's breadcrumb, so they agree. */
  catalogueLabel?: string;
  /** Circular marks closing the page, each linking to a room elsewhere on the
   *  site that this client's work touches. Rendered by RelatedLinks. */
  relatedLinks?: {
    href: string;
    label: string;
    logo: string;
    scale?: number;
    plate?: "light" | "dark";
  }[];
  /** Closing company-info block (ExperienceFooter). */
  footer?: {
    /** The client's formal name for the record line. */
    clientName: string;
    /** Short factual lines about the engagement. */
    facts: string[];
  };
  /** The client's own typographic voice + accent, applied to display moments
   *  (hero name, category titles) across the experience and its catalogue
   *  routes. `fontVar` is a CSS variable defined in app/layout.tsx. */
  brandTheme?: {
    /** e.g. "--font-cinzel". Falls back to the site serif when absent. */
    fontVar: string;
    /** Brand accent for quiet emphasis (eyebrows, indices, hovers). */
    accent: string;
    /** Extra letter-spacing for faces that want air (em units, optional). */
    tracking?: string;
    /** Uppercase the brand's display moments (engraved-caps faces like Cinzel). */
    uppercase?: boolean;
  };
  /** Engagement facts rendered as a mono stats row under the hero
   *  ("180+ artifacts · 13 categories · 2 campuses"). */
  stats?: { value: string; label: string }[];
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
