/**
 * Showcase — the home page's rooms, one slide each (owner, 2026-10-15).
 *
 * Until then each side had three section rooms (Clients · Projects · My Stack
 * on the left; AI Videos · Arts & Crafts · The Extincts Project on the
 * right), each a board of cards. Now every slide is ONE thing, split into four
 * quadrants (ShowcaseRoom):
 *
 *     LEFT (logic)                      RIGHT (creative) — the mirror
 *     ┌──────────────┬──────────────┐   ┌──────────────┬──────────────┐
 *     │ the brands,  │ the page     │   │ the page     │ what it      │
 *     │ in hierarchy │ (a still)    │   │ (a still)    │ holds        │
 *     ├──────────────┼──────────────┤   ├──────────────┼──────────────┤
 *     │ my role,     │ the button,  │   │ the button,  │ my role,     │
 *     │ what I did   │ the company  │   │ the facts    │ what I did   │
 *     └──────────────┴──────────────┘   └──────────────┴──────────────┘
 *
 * and a strip along the top (ShowcaseStrip) names every room on that side —
 * the logos on the left, ending in "See all" (the All Works page).
 *
 * THE ORDER IS THE OWNER'S. Left (2026-10-15, second pass): Tata IIS, Azoth
 * Biotech, ABS Wholesale (USA) with Luzid and Kartpipe on the same slide,
 * Zabraku, Vivid ProTech, NewsMobile — and Post Grad. UID after them, where
 * the owner's list left it.
 * Right: The Extincts Project ("1st and topmost", owner 2026-10-15), Arts &
 * Crafts, AI Projects, Writings & Publications. Everything else that stood
 * on the old boards is on /all-works.
 *
 * ⚠ THE WORDS ARE THE SITE'S OWN, condensed: every role, year and bullet comes
 * from the case pages' configs (tataExperience, azothExperience,
 * absExperience, clientExperiences, newsmobileExperience, uidExperience,
 * freelanceExperience) and CareerTimeline — except Tata IIS's role, which the
 * owner gave ("Lead Manager — Graphic Designer"). Nothing is invented; edit
 * here and the slide follows.
 * ⚠ NO PHONE NUMBERS (owner). An email shows only where one is on record
 * (Tata IIS, UID); the others have none in the repo.
 *
 * `preview` is a still of the page "View Full Report" opens, taken from the
 * built site by scripts/make-showcase-previews.mjs — re-run it when a page's
 * first screen changes.
 */

import type { NavSectionId } from "@/types/navigation";

export type ShowcaseSide = "logic" | "creative";

/** One node of the hierarchy quadrant: a mark, or just a name set in type. */
export interface ShowNode {
  name: string;
  /** The mark. Absent → the name in type. */
  logo?: string;
  /** "light" artwork needs a dark plate. */
  tone?: "light" | "dark";
  /** A heading over a group of brands, not a brand of its own. */
  group?: boolean;
  /** This slide's own brand, where the tree is wider than it (Luzid inside
   *  ABS) — drawn a little stronger. */
  focus?: boolean;
  /** Small thumbnail instead of a mark (the creative rooms' collections). */
  thumb?: string;
  children?: ShowNode[];
}

export interface ShowFact {
  label: string;
  value: string;
  href?: string;
}

export interface Showcase {
  /** Stable id — the strip, the menu and `flythrough:go` use it. */
  id: string;
  side: ShowcaseSide;
  /** In full: the slide's heading, the band along the foot. */
  name: string;
  /** In the strip and the menu. */
  short: string;
  /** The strip's mark (left side). Absent → the short name in type. */
  mark?: string;
  /** The pin on the brain slide that flies here (right side). */
  sectionId?: NavSectionId;
  /** What it is, in a line. */
  sector: string;
  /** The hierarchy quadrant: its label and its tree. */
  treeLabel: string;
  tree: ShowNode;
  /** The page quadrant: a still of the page, and the address in its frame.
   *  Absent → "coming soon". */
  preview?: { src: string; url: string };
  role: string;
  years?: string;
  points: string[];
  facts: ShowFact[];
  /** The button. No href → not yet (AI Projects). */
  report: { label: string; href?: string };
}

const LOGO = "/content/logofolio";
const PREVIEW = "/content/previews";

/** The left side — the owner's nine, in order. */
export const LOGIC_SHOWCASE: readonly Showcase[] = [
  {
    id: "tata-iis",
    side: "logic",
    name: "Tata IIS",
    short: "Tata IIS",
    mark: `${LOGO}/tata-iis.png`,
    sector: "Skill education · A Tata initiative",
    treeLabel: "Brand family",
    tree: {
      name: "Tata Indian Institute of Skills",
      logo: `${LOGO}/tata-iis.png`,
      children: [
        { name: "IIS Ahmedabad", logo: `${LOGO}/iis-ahmedabad.png` },
        { name: "IIS Mumbai", logo: `${LOGO}/iis-mumbai.png` },
      ],
    },
    preview: { src: `${PREVIEW}/tata-iis.webp`, url: "shrey107.com/clients/tata-iis" },
    role: "Lead Manager — Graphic Designer",
    years: "2024 — 2026",
    points: [
      "Built the identity on a strict construction grid — proportion, spacing and type all derive from it.",
      "Drew the logo system for the institute and its two campuses, Ahmedabad and Mumbai.",
      "Delivered 180+ artifacts across 13 categories, and 5 films.",
      "Set the brand guidelines for the parent mark and each campus.",
    ],
    facts: [
      { label: "Website", value: "tataiis.org", href: "https://tataiis.org" },
      { label: "Email", value: "admissions@tataiis.org", href: "mailto:admissions@tataiis.org" },
      { label: "Based", value: "Ahmedabad · Mumbai, India" },
    ],
    report: { label: "View Full Project", href: "/clients/tata-iis" },
  },
  {
    id: "azoth-biotech",
    side: "logic",
    name: "Azoth Biotech",
    short: "Azoth Biotech",
    mark: "/content/clients/azoth-biotech/brand/logo-azoth.png",
    sector: "Biotechnology · Mushrooms",
    treeLabel: "Brand family",
    tree: {
      name: "Azoth Biotech",
      logo: "/content/clients/azoth-biotech/brand/logo-azoth.png",
      children: [
        { name: "Mycoveda", logo: "/content/clients/azoth-biotech/brand/brands/mycoveda.png" },
        { name: "MycoActive", logo: "/content/clients/azoth-biotech/brand/brands/mycoactive.png" },
        { name: "Kavaka", logo: "/content/clients/azoth-biotech/brand/brands/kavaka.png" },
        { name: "Naturalist Nootropics", logo: "/content/clients/azoth-biotech/brand/brands/naturalist.png" },
        { name: "Mushroomworks", logo: "/content/clients/azoth-biotech/brand/brands/mushroomworks.png" },
      ],
    },
    preview: { src: `${PREVIEW}/azoth-biotech.webp`, url: "shrey107.com/clients/azoth-biotech" },
    role: "Web & Graphic Designer",
    years: "2020 — 2023",
    points: [
      "The identity — a mycelial monogram clipped by a perfect circle, found after twelve directions.",
      "Print and packaging collateral, and a running social-media system.",
      "Website design for azothbiotech.com.",
      "Grew a family of brands under the umbrella, each with its own voice.",
    ],
    facts: [
      { label: "Website", value: "azothbiotech.com", href: "https://azothbiotech.com" },
      { label: "Based", value: "Noida, Uttar Pradesh" },
    ],
    report: { label: "View Full Project", href: "/clients/azoth-biotech" },
  },
  {
    id: "abs",
    side: "logic",
    name: "ABS Wholesale (USA)",
    short: "ABS Wholesale",
    mark: "/content/career/abs.png",
    sector: "Wholesale · Distribution",
    treeLabel: "Brand family",
    tree: {
      name: "ABS Wholesale",
      logo: "/content/career/abs.png",
      children: [
        {
          name: "Built in-house",
          group: true,
          children: [
            { name: "Luzid", logo: `${LOGO}/luzid.png`, children: [{ name: "Kartpipe" }] },
            { name: "Himax Distro" },
          ],
        },
        {
          name: "Carried",
          group: true,
          children: [{ name: "Tyson 2.0" }, { name: "Deathrow Vapes" }, { name: "Puffco" }, { name: "Stiiizy" }],
        },
      ],
    },
    preview: { src: `${PREVIEW}/abs.webp`, url: "shrey107.com/clients/abs" },
    role: "Web & Graphic Designer",
    years: "2020 — 2024",
    points: [
      "The house identity — the infinity monogram in gold on oxblood.",
      "Built three brands from nothing: Luzid, its Kartpipe spin-off, and Himax Distro.",
      "Retail and social creative for the brands ABS carries — Tyson 2.0, Deathrow Vapes, Puffco, Stiiizy.",
      "A trade booth, seasonal pieces and hiring material in the same voice.",
    ],
    facts: [
      { label: "Website", value: "abscali.com", href: "https://abscali.com" },
      { label: "Based", value: "Santa Fe Springs, California" },
    ],
    report: { label: "View Full Project", href: "/clients/abs" },
  },
  {
    id: "zabraku",
    side: "logic",
    name: "Zabraku",
    short: "Zabraku",
    mark: "/content/clients/zabraku-media/zabraku-logo-dark.png",
    sector: "Media · Content",
    treeLabel: "Brand family",
    tree: {
      name: "Zabraku Media",
      logo: "/content/clients/zabraku-media/zabraku-logo-dark.png",
      children: [{ name: "RKB Entertainment", logo: "/content/clients/zabraku-media/rkb-logo.png", tone: "light" }],
    },
    preview: { src: `${PREVIEW}/zabraku.webp`, url: "shrey107.com/clients/zabraku-media" },
    role: "Graphic Designer",
    years: "2020 — 2024",
    points: [
      "The Zabraku identity — the wordmark cut into a radial line field, built to move.",
      "A second identity, for RKB Entertainment.",
      "Four waves of event campaigns across a year-long party calendar.",
      "The 2021 company portfolio, page by page.",
    ],
    facts: [{ label: "Based", value: "Malviya Nagar, Delhi" }],
    report: { label: "View Full Project", href: "/clients/zabraku-media" },
  },
  {
    id: "vivid",
    side: "logic",
    name: "Vivid ProTech",
    short: "Vivid ProTech",
    mark: "/content/clients/vivid/vivid-mark.png",
    sector: "Filtration & containment · Pharma",
    treeLabel: "Brand family",
    tree: {
      name: "Vivid Process Technology",
      logo: "/content/clients/vivid/vivid-mark.png",
      children: [
        { name: "Process maps", group: true, children: [{ name: "API" }, { name: "Biopharma" }, { name: "Formulation" }] },
      ],
    },
    preview: { src: `${PREVIEW}/vivid-site.webp`, url: "vividprotech.com" },
    role: "Brand & Web Designer · Freelance",
    points: [
      "A full identity and website for a filtration and containment supplier to pharma.",
      "Process maps placing every Vivid product inside the API, biopharma and formulation lines a plant runs.",
      "A catalogue of stainless housings, turned into a story a process engineer already believes.",
    ],
    facts: [{ label: "Website", value: "vividprotech.com", href: "https://vividprotech.com" }],
    report: { label: "View Full Project", href: "/clients/vivid" },
  },
  {
    id: "newsmobile",
    side: "logic",
    name: "NewsMobile",
    short: "NewsMobile",
    mark: "/content/career/newsmobile.png",
    sector: "Digital news",
    treeLabel: "Brand family",
    tree: {
      name: "NewsMobile",
      logo: "/content/career/newsmobile.png",
      children: [{ name: "newsmobile.in" }, { name: "newsmobile.asia" }],
    },
    preview: { src: `${PREVIEW}/newsmobile.webp`, url: "shrey107.com/clients/newsmobile" },
    role: "Graphic Designer · Video Editor · Copy Editor",
    years: "2017 — 2018",
    points: [
      "Data infographics that made the numbers shareable.",
      "News and quote cards — the soundbite, framed.",
      "Explainers and listicles built to land before the thumb moves on.",
      "Wrote as well as designed — the bylines are in Writings & Publications.",
    ],
    facts: [
      { label: "Website", value: "newsmobile.in", href: "https://newsmobile.in" },
      { label: "Based", value: "Gurugram, Haryana" },
    ],
    report: { label: "View Full Project", href: "/clients/newsmobile" },
  },
  {
    id: "uid",
    side: "logic",
    name: "Post Grad. — UID",
    short: "Post Grad. UID",
    mark: "/content/clients/uid/brand/uid-logo.png",
    sector: "Unitedworld Institute of Design",
    treeLabel: "Projects",
    tree: {
      name: "Unitedworld Institute of Design",
      logo: "/content/clients/uid/brand/uid-logo.png",
      children: [
        { name: "Puran Studios", logo: `${LOGO}/puran-studios.png` },
        { name: "Farm Stacks" },
        { name: "Nirvaan" },
        { name: "The Trip" },
      ],
    },
    preview: { src: `${PREVIEW}/uid.webp`, url: "shrey107.com/clients/uid" },
    role: "M.Des — Visual Communication",
    years: "2018 — 2020",
    points: [
      "Puran Studios — an identity worked through to production.",
      "Farm Stacks — packaging for a hydroponics brand.",
      "Nirvaan — a performance identity; posters, and The Trip.",
      "Fieldwork and writing — the block printers of Pethapur.",
    ],
    facts: [
      { label: "Website", value: "uid.edu.in", href: "https://uid.edu.in" },
      { label: "Email", value: "admissions@uid.edu.in", href: "mailto:admissions@uid.edu.in" },
      { label: "Campuses", value: "Ahmedabad · NCR · Bengaluru" },
    ],
    report: { label: "View Full Project", href: "/clients/uid" },
  },
];

/** The two brands built at ABS that share its slide (owner, 2026-10-15:
 *  "ABS in top half, and Luzid and Kartpipe in lower half of slide, yes 3 in
 *  one slide"). They had slides of their own for a day. */
export const ABS_BRANDS: readonly Showcase[] = [
  {
    id: "luzid",
    side: "logic",
    name: "Luzid",
    short: "Luzid",
    mark: `${LOGO}/luzid.png`,
    sector: "Device brand · Built at ABS",
    treeLabel: "Where it sits",
    tree: {
      name: "ABS Wholesale",
      logo: "/content/career/abs.png",
      children: [
        {
          name: "Luzid",
          logo: `${LOGO}/luzid.png`,
          focus: true,
          children: [{ name: "Sikret 2.0" }, { name: "Kartpipe" }],
        },
      ],
    },
    preview: { src: `${PREVIEW}/luzid.webp`, url: "shrey107.com/clients/abs#luzid" },
    role: "Web & Graphic Designer · ABS Wholesale",
    years: "2020 — 2024",
    points: [
      "The Luzid identity — an angular wordmark and saturated gradients.",
      "Launched the Sikret 2.0 line: the 650mAh device, its touch-sensitive surface, the colourway drops.",
      "The “What’s your Sikret?” campaign the range hangs on.",
      "The product photographed as the hero.",
    ],
    facts: [
      { label: "Parent", value: "ABS Wholesale" },
      { label: "Based", value: "Santa Fe Springs, California" },
    ],
    report: { label: "View Full Project", href: "/clients/abs#luzid" },
  },
  {
    id: "kartpipe",
    side: "logic",
    name: "Kartpipe",
    short: "Kartpipe",
    sector: "Product identity · Launched under Luzid",
    treeLabel: "Where it sits",
    tree: {
      name: "ABS Wholesale",
      logo: "/content/career/abs.png",
      children: [
        {
          name: "Luzid",
          logo: `${LOGO}/luzid.png`,
          children: [{ name: "Kartpipe", focus: true }],
        },
      ],
    },
    preview: { src: `${PREVIEW}/kartpipe.webp`, url: "shrey107.com/clients/abs#kartpipe" },
    role: "Web & Graphic Designer · ABS Wholesale",
    years: "2020 — 2024",
    points: [
      "A product identity for a vape shaped like a classic briar pipe.",
      "Launched under Luzid on one idea, said three ways: classic meets modern, performance in your palm, the classic rejuvenated.",
      "Dark, product-forward frames that let the silhouette do the arguing.",
    ],
    facts: [
      { label: "Parent", value: "Luzid · ABS Wholesale" },
      { label: "Based", value: "Santa Fe Springs, California" },
    ],
    report: { label: "View Full Project", href: "/clients/abs#kartpipe" },
  },
];

/** The six writings on the Writings & Publications slide (owner's pick,
 *  2026-10-15): the documents with pages of their own, in the shelf's order.
 *  Here, not in the slide, so the server page can read their covers. */
export const SIX_WRITINGS = ["ethnography", "food-distribution", "design-for-print", "packaging-zine", "mycoveda-app", "nirvaan"];

/** Where "See all", after the last logo, goes. */
export const ALL_WORKS_HREF = "/all-works";

/** The right side — mirrored. The trees of Arts & Crafts are filled in from
 *  the art folders at build time (app/page.tsx), so they can't drift. */
export const CREATIVE_SHOWCASE: readonly Showcase[] = [
  {
    id: "the-extincts-project",
    side: "creative",
    name: "The Extincts Project",
    short: "The Extincts Project",
    sectionId: "the-extincts-project",
    sector: "An ongoing personal series on what we've lost",
    treeLabel: "The project",
    tree: {
      name: "The Extincts Project",
      children: [
        { name: "Initial Research", group: true, children: [{ name: "3 reports" }] },
        { name: "Stories", group: true, children: [{ name: "6 stories" }] },
        { name: "Script", group: true, children: [{ name: "To come" }] },
        { name: "Character Sheets", group: true, children: [{ name: "To come" }] },
      ],
    },
    preview: { src: `${PREVIEW}/the-extincts-project.webp`, url: "shrey107.com/extincts" },
    role: "Researcher & Storyteller",
    years: "2020 —",
    points: [
      "Three reports — identifying the problem, approaching the story, and the final report.",
      "Field trips to Pradhyuman Zoo, Gir and Fudam.",
      "Six stories, from The Last Dodo to The First Meeting.",
      "A script and character sheets, still to come.",
    ],
    facts: [
      { label: "Reports", value: "3" },
      { label: "Stories", value: "6" },
    ],
    report: { label: "View Full Project", href: "/extincts" },
  },
  {
    id: "arts-and-crafts",
    side: "creative",
    name: "Arts & Crafts",
    short: "Arts & Crafts",
    sectionId: "art",
    sector: "By hand, away from the screen",
    treeLabel: "Collections",
    tree: { name: "Arts & Crafts", children: [] },
    preview: { src: `${PREVIEW}/arts-and-crafts.webp`, url: "shrey107.com/arts-and-crafts" },
    role: "Artist",
    points: [
      "Drawing studies, portraits and sketchbooks — observational work.",
      "Painting, ink and pattern, and type studies drawn by hand.",
      "Model making, and field photographs.",
    ],
    facts: [],
    report: { label: "View Full Collection", href: "/arts-and-crafts" },
  },
  {
    id: "ai-projects",
    side: "creative",
    name: "AI Projects",
    short: "AI Projects",
    sectionId: "ai-videos",
    sector: "Films and motion, made with AI",
    treeLabel: "The tools",
    tree: {
      name: "AI Projects",
      children: [
        {
          name: "Film",
          group: true,
          children: [
            { name: "Google Flow · Veo", logo: "/content/tools/google-flow.svg" },
            { name: "Hailuo" },
            { name: "Seedance" },
            { name: "Lemonpeel", logo: "/content/tools/lemonpeel.png" },
          ],
        },
        {
          name: "Image & motion",
          group: true,
          children: [{ name: "Leonardo AI", logo: "/content/tools/leonardo.png" }, { name: "OpenArt" }],
        },
      ],
    },
    role: "AI Filmmaker",
    points: [
      "Films and motion made with AI — the reel is on its way.",
      "Shot-by-shot prompts, with characters and scenes held consistent across clips.",
      "Image and motion studies to build each film from.",
    ],
    facts: [{ label: "Status", value: "Coming soon" }],
    report: { label: "Coming Soon" },
  },
  {
    id: "writings",
    side: "creative",
    name: "Writings & Publications",
    short: "Writings & Publications",
    sectionId: "publications",
    sector: "Field studies, essays, process books, bylines",
    treeLabel: "On the shelf",
    tree: {
      name: "Writings & Publications",
      children: [
        {
          name: "M.Des — UID",
          group: true,
          children: [{ name: "Ethnography" }, { name: "Design for Print" }, { name: "Packaging" }, { name: "Mycoveda" }, { name: "Nirvaan" }],
        },
        { name: "Essays", group: true, children: [{ name: "Are There Any Takers?" }, { name: "Food Distribution" }] },
        { name: "Newsroom", group: true, children: [{ name: "NewsMobile" }] },
      ],
    },
    preview: { src: `${PREVIEW}/writings.webp`, url: "shrey107.com/writings" },
    role: "Writer & Researcher",
    years: "2019 — 2022",
    points: [
      "Field study and ethnography — the block printers of Pethapur.",
      "Essays, from a craft economy to food distribution in a disaster.",
      "Process books for print, packaging and performance work.",
      "Bylines and explainers from the NewsMobile newsroom.",
    ],
    facts: [{ label: "Documents", value: "8" }],
    report: { label: "Read Them All", href: "/writings" },
  },
];

export const SHOWCASE: readonly Showcase[] = [...LOGIC_SHOWCASE, ...CREATIVE_SHOWCASE];

export function showcaseById(id: string): Showcase | undefined {
  return SHOWCASE.find((s) => s.id === id);
}
