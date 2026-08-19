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
  /** Sends the card somewhere other than `/clients/<slug>`, for an entry whose
   *  page is not a React route at all. Setting it means NO `/clients/<slug>`
   *  page is generated — `generateStaticParams` skips these — so the card is
   *  the only way in and the destination has to exist on its own. Currently
   *  only the chess site, which ships verbatim out of `public/chess/`. */
  href?: string;
  /** Basic company facts for the section card (from the client's own
   *  material / the 2024 resume). All optional — a card shows what it has. */
  location?: string;
  site?: string;
  /** Public contact for the organisation, where one is on record. */
  contact?: string;
  /** Logo shown in the card's top band. */
  cardLogo?: string;
  /** Linear multiplier on the board's centred logo box. The box is one size for
   *  everything, which evens out bounding boxes but not ink — a mark that is
   *  mostly whitespace, or a small device beside a long wordmark, still reads
   *  small. This is the per-logo correction for those. 1 = the common size. */
  logoScale?: number;
  /** "light" when the artwork is white or pale, so the card gives it a dark
   *  plate instead of the default white one. Without it a white mark on
   *  transparent lands on white and disappears. */
  logoTone?: "light" | "dark";
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
    // The owner's own AVIF, converted to PNG with its alpha intact (512x256,
    // pure black art on transparent). Replaces the resume-sourced mark.
    cardLogo: "/content/clients/azoth-biotech/brand/logo-azoth.png",
    logoScale: 2,
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
    logoScale: 3,
  },
  {
    slug: "zabraku-media",
    name: "Zabraku",
    sector: "Media · Content",
    accent: "#B3264A",
    essence: "A media house with a story-first spine.",
    location: "Malviya Nagar, Delhi",
    // Lifted off the cover of the 2021 company portfolio: the wordmark is white
    // and yellow on black, so it is cut out onto transparency and flagged
    // `light` — on the default white plate it would be an empty card.
    cardLogo: "/content/clients/zabraku-media/zabraku-logo.png",
    logoTone: "light",
    // A 7.8:1 wordmark is width-limited at the common box and lands at less
    // than half the ink of the others; this brings it back in line.
    logoScale: 1.5,
  },
  {
    slug: "uid",
    name: "UID",
    sector: "Design · Education",
    accent: "#3B4CC0",
    essence: "Design education, given its own design language.",
    section: "projects",
    location: "Ahmedabad, Gujarat",
    // The institute's own mark. NOT `/content/career/uid.png` — that one is
    // white artwork on transparent, which vanishes on the card's white plate.
    cardLogo: "/content/clients/uid/brand/uid-logo.png",
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
    slug: "freelance",
    name: "Freelance",
    sector: "Independent · Multi-brand",
    accent: "#B5533B",
    essence: "Small brands, each taken from problem to finished thing.",
    location: "India · Remote",
  },
  {
    // The 2022 chess site, shipped verbatim rather than retold — see
    // scripts/copy-chess-site.mjs. `href` points at the static copy, so this
    // entry deliberately has no `/clients/chess` page behind it.
    slug: "chess",
    name: "Three Steps Ahead",
    sector: "Chess · Website",
    accent: "#1f7a4d",
    essence: "A chess site that argues the board teaches the day.",
    section: "projects",
    // ⚠ `/chess/index.html`, not `/chess/`. GitHub Pages resolves a directory
    // to its index, but `next dev` does NOT serve one for a public/ folder —
    // `/chess/` 404s locally while every file under it is fine. Naming the file
    // makes the link correct in both, so this can be checked before it deploys.
    href: "/chess/index.html",
    // The site's own mark, straight out of the copied folder. ⚠ NOT
    // `logoTone: "light"` — measured, the artwork is 100% pure black ink on
    // transparent, so a dark plate erases it completely. It takes the default
    // white plate. Square lockup (knight over a blackletter wordmark), so it
    // fits the common box by HEIGHT and lands small without the scale.
    cardLogo: "/chess/images/logo.png",
    logoScale: 1.7,
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

/** The clients that own a generated `/clients/<slug>` page. An entry with its
 *  own `href` lives outside the app router and must not get an empty one. */
export function routedClients(): Client[] {
  return CLIENTS.filter((c) => !c.href);
}

/** The entries listed under one homepage section (see `Client.section`). */
export function clientsInSection(section: "clients" | "projects"): Client[] {
  return CLIENTS.filter((c) => (c.section ?? "clients") === section);
}
