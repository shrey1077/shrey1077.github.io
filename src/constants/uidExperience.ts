/**
 * UID — bespoke page configuration.
 *
 * The Unitedworld Institute of Design: the M.Des in Visual Communication
 * (2018–2020). Institute facts and the mark come from uid.edu.in; the plates
 * come from `scripts/prepare-uid-experience.mjs`.
 *
 * The painting and craft that ran alongside the degree deliberately live in the
 * homepage's Art room instead of here — this page is the design work.
 */

const BASE = "/content/clients/uid";

export const UID = {
  institute: "Unitedworld Institute of Design",
  short: "UID",
  degree: "M.Des — Visual Communication",
  years: "2018–2020",
  logo: `${BASE}/brand/uid-logo.png`,
  /** From uid.edu.in. */
  about:
    "UID is one of India's most sought-after design institutes, teaching across communication, product, interior, fashion and mobility design from campuses in Ahmedabad, the NCR and Bengaluru.",
  campuses: "Ahmedabad · NCR · Bengaluru",
  site: "uid.edu.in",
  email: "admissions@uid.edu.in",
  phone: "+91 92666 63225",
  tagline: "Two years of briefs I set myself, and the craft they left behind.",
  intro:
    "A master's in visual communication is really an argument about how much of design is thinking and how much is making. This is the case for both — identity and packaging worked through to production, a performance identity, print, and the fieldwork that fed all of it. What was written rather than made is in Publications; what was drawn by hand is in Art.",
};

export interface UidProject {
  id: string;
  /** Folder under work/ holding its plates. */
  folder: string;
  title: string;
  kind: string;
  blurb: string;
  accent: string;
  cols?: 3 | 4;
  aspect?: string;
  /** An optional way further in — the full document behind an excerpt. */
  link?: { href: string; label: string };
}

export const UID_PROJECTS: UidProject[] = [
  {
    id: "branding",
    folder: "branding",
    title: "Puran Studios",
    kind: "Identity system",
    // A sustainability-minded film studio, not a recording studio: the mark is a
    // leaf whose midrib is a strip of film, and the work it sleeves is
    // documentary (the Cowspiracy record). Greens are the studio's own —
    // #00945E and #225D38 against #443635 — off the colour page in the book.
    blurb:
      "A film studio that makes its case for the planet, given a mark that says so: a leaf with a strip of film for a midrib. Taken from the exploration sheet through language, type and colour, then out onto cards, a record sleeve, a hardcover, signage and a billboard.",
    accent: "#00945E",
  },
  {
    id: "packaging",
    folder: "packaging",
    title: "Farm Stacks",
    kind: "Packaging & structure",
    blurb:
      "Hydroponic produce packaged as a structure first — a net that stacks, ships and opens without waste, printed, folded and built by hand before any surface was drawn. The zine that documents it runs through to a second brief, the Griffin Muffin Co.",
    accent: "#3f8f3f",
    cols: 3,
    link: { href: "/publications/packaging-zine", label: "Read the full zine" },
  },
  {
    id: "nirvaan",
    folder: "nirvaan",
    title: "Nirvaan",
    kind: "Performance identity",
    blurb:
      "Identity and campaign for a movement performance — built on the warmth of the body against the geometry of the space it moves through.",
    accent: "#d1642a",
    cols: 3,
    aspect: "3/4",
  },
  {
    id: "posters",
    folder: "posters",
    title: "Posters",
    kind: "Print campaign",
    blurb:
      "Warli-form Himalaya posters and a public-health campaign — folk vocabulary put to work on contemporary print.",
    accent: "#8b3fb0",
    cols: 3,
  },
  {
    id: "trip",
    folder: "trip",
    title: "The Trip",
    kind: "Photo essay",
    blurb:
      "Fieldwork, and the photographs that came back with it — backwaters, boats and long light. The reference library everything else borrowed from.",
    accent: "#2f7d9e",
    cols: 3,
    aspect: "3/2",
  },
  // ⚠ "The Books" used to close this page — four documentation covers. On
  // 2026-08-20 the owner moved them to the homepage's Publications room, where
  // they can be read page by page instead of shown as a cover. A project here
  // would only duplicate that. The retired plates were `work/documents/`.
];
