/**
 * UID — bespoke page configuration.
 *
 * The Unitedworld Institute of Design, Ahmedabad: the M.Des in Visual
 * Communication (2018–2020). Copy and taxonomy live here; the plates come from
 * `scripts/prepare-uid-experience.mjs`.
 */

const BASE = "/content/clients/uid";

export const UID = {
  institute: "Unitedworld Institute of Design",
  degree: "M.Des — Visual Communication",
  years: "2018–2020",
  tagline: "Two years of briefs I set myself, and the craft they left behind.",
  intro:
    "A master's in visual communication is really an argument about how much of design is thinking and how much is making. This is the case for both — identity systems and packaging worked through to production, a performance identity, posters, and the drawing, model-making and photography that fed all of it.",
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
    title: "Nirvaan — Body & Space",
    kind: "Performance identity",
    blurb:
      "Identity and campaign for a movement performance — a poster system built on the warmth of the body against the geometry of the space it moves through.",
    accent: "#d1642a",
    cols: 3,
    aspect: "3/4",
  },
  {
    id: "posters",
    folder: "posters",
    title: "Posters & Illustration",
    kind: "Print · Illustration",
    blurb:
      "Warli-form Himalaya posters, a public-health campaign, and a run of mandala and anatomy plates — the drawing practice that ran alongside the degree.",
    accent: "#8b3fb0",
  },
  {
    id: "sketches",
    folder: "sketches",
    title: "Making",
    kind: "Models & process",
    blurb:
      "The stepped model and the studio table it was built on. Proof that the flat work was tested in three dimensions before it was called finished.",
    accent: "#6b6b6b",
    cols: 3,
    aspect: "4/3",
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
