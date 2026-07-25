/**
 * Azoth Biotech — bespoke full-experience configuration.
 *
 * Azoth Biotech was the parent client (complete branding, collateral, social
 * and web design). Beneath it we built a family of brands; Mycoveda was a
 * separate client, still in development (logo only). This file holds the copy,
 * the derived palette and the brand taxonomy; assets come from
 * `scripts/prepare-azoth-experience.mjs`.
 */

const BASE = "/content/clients/azoth-biotech";
const BRAND = `${BASE}/brand`;

export const AZOTH = {
  logo: `${BRAND}/logo.png`,
  /** The ecosystem colour — a deep mycelial teal-green. */
  accent: "#147d6e",
  ink: "#1c2b28",
  tagline:
    "A biotech house growing medicine, materials and market-ready brands out of mushrooms.",
  scope:
    "Azoth Biotech was the parent client — the full remit: brand identity, print & packaging collateral, a running social-media system, and website design. Under that umbrella we grew a family of brands, each with its own voice.",
};

/** Design foundations — derived from the built identity. */
export const AZOTH_FOUNDATIONS = {
  colours: [
    { hex: "#147d6e", name: "Mycelial Teal" },
    { hex: "#4eb8af", name: "Spore" },
    { hex: "#1c2b28", name: "Ink" },
    { hex: "#f2971e", name: "Fruiting Orange" },
  ],
  type: {
    display: "Geometric grotesque",
    displayNote:
      "A confident geometric sans carries the wordmarks — even strokes, circular bowls, engineered like the lab it speaks for.",
    text: "Neutral humanist sans",
    textNote: "Body and captions stay in a quiet humanist sans for long-form legibility.",
  },
};

export interface AzothBrand {
  id: string;
  name: string;
  descriptor: string;
  accent: string;
  logo: string;
  blurb: string;
  /** Folder under work/ holding this brand's social posts (if any). */
  work?: string;
}

/** The family of brands grown under Azoth. */
export const AZOTH_BRANDS: AzothBrand[] = [
  {
    id: "naturalist",
    name: "Naturalist Nootropics",
    descriptor: "Functional-mushroom nutraceuticals",
    accent: "#f2971e",
    logo: `${BRAND}/brands/naturalist.png`,
    blurb:
      "Cordyceps and lion's mane, reframed as everyday performance — an editorial social system that teaches the science while it sells.",
    work: "naturalist",
  },
  {
    id: "mushroomworks",
    name: "Mushroomworks",
    descriptor: "Mycelium materials — packaging & vegan leather",
    accent: "#147d6e",
    logo: `${BRAND}/brands/mushroomworks.png`,
    blurb:
      "Growing packaging and leather from mycelium — a brand for a material that replaces plastic and hide, told with hard numbers and clean product frames.",
    work: "mushroomworks",
  },
  {
    id: "mycoactive",
    name: "MycoActive",
    descriptor: "Active mushroom supplements",
    accent: "#2f9e44",
    logo: `${BRAND}/brands/mycoactive.png`,
    blurb: "The supplement line of the family — identity set, social system in progress.",
  },
];

/** Mycoveda — a separate client, not part of the Azoth family. */
export const AZOTH_MYCOVEDA = {
  name: "Mycoveda",
  logo: `${BRAND}/brands/mycoveda.png`,
  note:
    "Mycoveda sits apart — a separate client, for whom the brand is still in development. So far the identity is where the story starts and stops: the logo below is the finished piece; the rest of the world is still being built.",
};

/** The Azoth parent's own collateral (a curated glimpse). */
export const AZOTH_PARENT_WORK = {
  training: `${BASE}/work/azoth/training.webp`,
};

/** The rejected-logo exploration sheets — "there were a lot." */
export const AZOTH_REJECTED = [
  { name: "Azoth Biotech", src: `${BRAND}/rejected/azoth.webp` },
  { name: "Mushroomworks", src: `${BRAND}/rejected/mushroomworks.webp` },
  { name: "Mycoveda", src: `${BRAND}/rejected/mycoveda.webp` },
];

export const AZOTH_NATURALIST_ARTWORK = `${BRAND}/naturalist-artwork.webp`;
