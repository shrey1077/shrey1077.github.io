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
  /** Optional logo under /public (e.g. "/content/clients/<slug>/brand/logo.svg").
   *  Cards fall back to the typographic mark until real logo assets land. */
  logoSrc?: string;
}

export const CLIENTS: readonly Client[] = [
  { slug: "tata-iis", name: "Tata IIS", sector: "Enterprise · Systems" },
  {
    slug: "abs",
    name: "ABS Wholesale & Distribution",
    sector: "Wholesale · Distribution",
  },
  { slug: "zabraku-media", name: "Zabraku Media", sector: "Media · Content" },
  { slug: "azoth-biotech", name: "Azoth Biotech", sector: "Biotechnology" },
  { slug: "mycoveda", name: "Mycoveda", sector: "Wellness · Nutrition" },
  { slug: "newsmobile", name: "NewsMobile", sector: "Digital News" },
] as const;

/** Look up a client by slug (used by the detail route). */
export function clientBySlug(slug: string): Client | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
