/**
 * Clients data — the single source of truth for the Clients section.
 *
 * Drives the preview grid (ClientsPreview / ClientCard) AND the per-client
 * routes (`/clients/[slug]` via generateStaticParams). Add a client here and it
 * appears in the grid and gets a statically-generated page automatically.
 *
 * `sector` is intentionally minimal, typography-first supporting text — no stock
 * imagery, per the brief.
 */

export interface Client {
  /** URL slug — the `[slug]` segment of `/clients/[slug]`. Must be unique. */
  slug: string;
  /** Display name. */
  name: string;
  /** Short descriptor shown under the name on the card and detail page. */
  sector: string;
  /** Brand accent hue — tints the placeholder page's monogram, plaque dot and
   *  selection details so every client room feels its own. */
  accent: string;
  /** One quiet positioning line for the placeholder page. */
  essence: string;
  /** Optional logo under /public (e.g. "/content/clients/<slug>/brand/logo.svg").
   *  Cards fall back to the typographic mark until real logo assets land. */
  logoSrc?: string;
}

export const CLIENTS: readonly Client[] = [
  {
    slug: "tata-iis",
    name: "Tata IIS",
    sector: "Enterprise · Systems",
    accent: "#14279B",
    essence: "An identity system for an institution that teaches systems.",
  },
  {
    slug: "azoth-biotech",
    name: "Azoth Biotech",
    sector: "Biotechnology",
    accent: "#0E7C66",
    essence: "Identity for a lab rewriting its own formula.",
  },
  {
    slug: "abs",
    name: "ABS Wholesale",
    sector: "Wholesale · Distribution",
    accent: "#C4690F",
    essence: "A brand built to move at warehouse scale.",
  },
  {
    slug: "zabraku-media",
    name: "Zabraku",
    sector: "Media · Content",
    accent: "#B3264A",
    essence: "A media house with a story-first spine.",
  },
  {
    slug: "uid",
    name: "UID",
    sector: "Design · Education",
    accent: "#3B4CC0",
    essence: "Design education, given its own design language.",
  },
  {
    slug: "mycoveda",
    name: "Mycoveda",
    sector: "Wellness · Nutrition",
    accent: "#5C7C3A",
    essence: "Wellness rooted in quiet, potent nature.",
  },
  {
    slug: "newsmobile",
    name: "NewsMobile",
    sector: "Digital News",
    accent: "#C0392B",
    essence: "A news identity moving at the speed of the feed.",
  },
  {
    slug: "early-works",
    name: "Early Works",
    sector: "Archive · Beginnings",
    accent: "#6B6B6B",
    essence: "Where the hand learned before the system did.",
  },
] as const;

/** Look up a client by slug (used by the detail route). */
export function clientBySlug(slug: string): Client | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
