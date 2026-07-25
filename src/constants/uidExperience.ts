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
    "A master's in visual communication is really an argument about how much of design is thinking and how much is making. This is the case for both — identity and packaging worked through to production, a performance identity, print, and the fieldwork that fed all of it.",
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
}

export const UID_PROJECTS: UidProject[] = [
  {
    id: "branding",
    folder: "branding",
    title: "Puran Studios",
    kind: "Identity system",
    blurb:
      "A recording studio's identity, taken from mark exploration through to the things it actually lives on — cards, sleeves, a vinyl label, a billboard. The leaf-and-groove monogram holds at every size.",
    accent: "#2f7d4f",
  },
  {
    id: "packaging",
    folder: "packaging",
    title: "Farmstacks",
    kind: "Packaging & structure",
    blurb:
      "Produce packaging designed as a structure first: a die-line that stacks, ships and opens without waste, then a surface that earns its shelf. Worked through to physical prototypes.",
    accent: "#3f8f3f",
    cols: 3,
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
  {
    id: "documents",
    folder: "documents",
    title: "The Books",
    kind: "Documentation",
    blurb:
      "Every project was written up as well as made: an ethnography study, the packaging documentation, the Nirvaan record, and the branding book.",
    accent: "#1f2937",
    cols: 4,
    aspect: "3/4",
  },
];
