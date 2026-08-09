/**
 * Azoth Biotech — the hero the client supplied as a Bolt export.
 *
 * Copy and species data lifted verbatim from their `App.tsx`; only the imagery
 * changed hands. The original pulled its two backdrops from a Higgs CDN and its
 * species photographs from Pexels hotlinks, which this site cannot rely on —
 * it is a static export to GitHub Pages, so a third-party outage or a moved
 * asset would leave the hero blank. All six are downloaded and served locally.
 *
 * `leftPct` places each pin along the forest floor, so the order here is the
 * order they read left to right.
 */

const HERO = "/content/clients/azoth-biotech/hero";

export const AZOTH_HERO = {
  /** The scene as it reads by default. */
  base: `${HERO}/bg-day.webp`,
  /** The second exposure, shown only inside the cursor's spotlight. */
  reveal: `${HERO}/bg-reveal.webp`,
  headline: "Inspired by Nature",
  leftNote:
    "Every fungal species is a living archive of biological intelligence — refined over hundreds of millions of years beneath our feet.",
  rightNote:
    "Our bioactive formulations harness the power of medicinal fungi — backed by science, rooted in tradition, crafted for modern performance.",
  cta: "Explore Formulas",
};

export interface AzothSpecies {
  id: string;
  name: string;
  /** The short form used on the floor label, where space is tight. */
  short: string;
  subtitle: string;
  /** Horizontal position along the forest floor, in percent. */
  leftPct: number;
  color: string;
  accent: string;
  image: string;
  qualities: string[];
  bestFor: string;
}

export const AZOTH_SPECIES: AzothSpecies[] = [
  {
    id: "cordyceps",
    name: "Cordyceps Militaris",
    short: "Cordyceps",
    subtitle: "Energy • Endurance • Vitality",
    leftPct: 16,
    color: "#d4620a",
    accent: "#f59e4a",
    image: `${HERO}/cordyceps.webp`,
    qualities: [
      "Supports ATP production",
      "Enhances athletic performance",
      "Boosts energy & stamina",
      "Supports lung & kidney health",
    ],
    bestFor: "Energy, Stamina, Recovery",
  },
  {
    id: "lionsmane",
    name: "Lion's Mane",
    short: "Lion's Mane",
    subtitle: "Focus • Nerve Support • Memory",
    leftPct: 36,
    color: "#b0a090",
    accent: "#e8ddd0",
    image: `${HERO}/lionsmane.webp`,
    qualities: [
      "Supports cognitive function",
      "Promotes nerve regeneration",
      "Enhances focus & clarity",
      "Supports gut & digestive health",
    ],
    bestFor: "Brain Health, Focus, Mood",
  },
  {
    id: "turkeystail",
    name: "Turkey's Tail",
    short: "Turkey's Tail",
    subtitle: "Immunity • Gut Health • Balance",
    leftPct: 58,
    color: "#4a7a38",
    accent: "#86b868",
    image: `${HERO}/turkeystail.webp`,
    qualities: [
      "Supports immune system",
      "Rich in antioxidants",
      "Promotes gut microbiome balance",
      "Supports overall wellness",
    ],
    bestFor: "Immunity, Gut Health",
  },
  {
    id: "ganoderma",
    name: "Ganoderma (Reishi)",
    short: "Ganoderma",
    subtitle: "Calm • Longevity • Stress Support",
    leftPct: 78,
    color: "#8b3a2a",
    accent: "#c47050",
    image: `${HERO}/ganoderma.webp`,
    qualities: [
      "Supports stress relief & relaxation",
      "Promotes restful sleep",
      "Supports heart & liver health",
      "Adaptogen for overall balance",
    ],
    bestFor: "Stress, Sleep, Longevity",
  },
];
