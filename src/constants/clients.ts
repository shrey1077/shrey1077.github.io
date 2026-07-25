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
  /** Which homepage section lists this entry. Commissioned client work sits
   *  under "clients"; self-directed and academic work under "projects". Both
   *  keep their `/clients/<slug>` route — this only changes where it's listed.
   *  Absent = "clients". */
  section?: "clients" | "projects";
  /** Basic company facts for the section card (from the client's own
   *  material / the 2024 resume). All optional — a card shows what it has. */
  location?: string;
  site?: string;
  /** Public contact for the organisation, where one is on record. */
  contact?: string;
  /** Logo shown in the card's top band. */
  cardLogo?: string;
}

export const CLIENTS: readonly Client[] = [
  {
    slug: "tata-iis",
    name: "Tata IIS",
    sector: "Enterprise · Systems",
    accent: "#14279B",
    essence: "An identity system for an institution that teaches systems.",
    location: "Ahmedabad · Mumbai, India",
    site: "tataiis.org",
    contact: "admissions@tataiis.org",
    cardLogo: "/content/career/tata-iis.png",
  },
  {
    slug: "azoth-biotech",
    name: "Azoth Biotech",
    sector: "Biotechnology",
    accent: "#0E7C66",
    essence: "Identity for a lab rewriting its own formula.",
    location: "Noida, Uttar Pradesh",
    site: "azothbiotech.com",
    cardLogo: "/content/career/azoth.png",
  },
  {
    slug: "abs",
    name: "ABS Wholesale",
    sector: "Wholesale · Distribution",
    accent: "#C4690F",
    essence: "A brand built to move at warehouse scale.",
    location: "Santa Fe Springs, California",
    site: "abscali.com",
    cardLogo: "/content/career/abs.png",
  },
  {
    slug: "zabraku-media",
    name: "Zabraku",
    sector: "Media · Content",
    accent: "#B3264A",
    essence: "A media house with a story-first spine.",
    location: "Malviya Nagar, Delhi",
    cardLogo: "/content/career/zabraku.png",
  },
  {
    slug: "uid",
    name: "UID",
    sector: "Design · Education",
    accent: "#3B4CC0",
    essence: "Design education, given its own design language.",
    section: "projects",
    location: "Ahmedabad, Gujarat",
  },
  {
    slug: "mycoveda",
    name: "Mycoveda",
    sector: "Wellness · Nutrition",
    accent: "#5C7C3A",
    essence: "Wellness rooted in quiet, potent nature.",
    section: "projects",
    cardLogo: "/content/clients/azoth-biotech/brand/brands/mycoveda.png",
  },
  {
    slug: "newsmobile",
    name: "NewsMobile",
    sector: "Digital News",
    accent: "#C0392B",
    essence: "A news identity moving at the speed of the feed.",
    location: "Gurugram, Haryana",
    site: "newsmobile.in",
    cardLogo: "/content/career/newsmobile.png",
  },
  {
    slug: "early-works",
    name: "Early Works",
    sector: "Archive · Beginnings",
    accent: "#6B6B6B",
    essence: "Where the hand learned before the system did.",
    section: "projects",
  },
] as const;

/** Look up a client by slug (used by the detail route). */
export function clientBySlug(slug: string): Client | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}

/** The entries listed under one homepage section (see `Client.section`). */
export function clientsInSection(section: "clients" | "projects"): Client[] {
  return CLIENTS.filter((c) => (c.section ?? "clients") === section);
}
