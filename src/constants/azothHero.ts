/**
 * Azoth Biotech — the hero the client supplied as a Bolt export.
 *
 * Copy and species data lifted verbatim from their `App.tsx`; only the imagery
 * changed hands. The original pulled its two backdrops from a Higgs CDN and its
 * species photographs from Pexels hotlinks, which this site cannot rely on —
 * it is a static export to GitHub Pages, so a third-party outage or a moved
 * asset would leave the hero blank. All six are downloaded and served locally.
 *
 * ⚠ THE PINS AND CARDS ARE GONE (2026-10-02). The owner replaced them with the
 * four species standing ON the ridge of the flowering exposure (`reveal`) —
 * so a mushroom only exists inside the cursor's spotlight — and with one
 * full-width info strip along the foot of the hero for whichever is hovered.
 * The species images are now the owner's own renders (cut out of black by
 * scripts/prepare-azoth-mushrooms.mjs), not the client's Pexels photographs.
 *
 * `at` places each mushroom on the ARTWORK, in percent of the 1280×720 frame,
 * by the middle of its foot — where its stone meets the ridge — so the
 * positions hold however `object-cover` crops the scene. Order is left to right.
 */

const HERO = "/content/clients/azoth-biotech/hero";

export const AZOTH_HERO = {
  /** The scene as it reads by default. */
  base: `${HERO}/bg-day.webp`,
  /** The second exposure, shown only inside the cursor's spotlight. */
  reveal: `${HERO}/bg-reveal.webp`,
  /** The same exposure with its sky cut away (scripts/prepare-azoth-hero-cut.mjs)
   *  — laid over the headline so the ridge passes in front of it. */
  revealCut: `${HERO}/bg-reveal-cut.webp`,
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
  subtitle: string;
  /** Foot of the mushroom on the artwork, in percent of the frame (x, y), and
   *  its width in percent of the frame's width. */
  at: { x: number; y: number; w: number };
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
    subtitle: "Energy • Endurance • Vitality",
    at: { x: 17, y: 63, w: 13 },
    color: "#d4620a",
    accent: "#f59e4a",
    image: `${HERO}/mushrooms/cordyceps.webp`,
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
    subtitle: "Focus • Nerve Support • Memory",
    at: { x: 39, y: 55, w: 12.5 },
    color: "#b0a090",
    accent: "#e8ddd0",
    image: `${HERO}/mushrooms/lionsmane.webp`,
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
    subtitle: "Immunity • Gut Health • Balance",
    at: { x: 62, y: 41, w: 14 },
    color: "#4a7a38",
    accent: "#86b868",
    image: `${HERO}/mushrooms/turkeystail.webp`,
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
    subtitle: "Calm • Longevity • Stress Support",
    at: { x: 86, y: 38, w: 12.5 },
    color: "#8b3a2a",
    accent: "#c47050",
    image: `${HERO}/mushrooms/ganoderma.webp`,
    qualities: [
      "Supports stress relief & relaxation",
      "Promotes restful sleep",
      "Supports heart & liver health",
      "Adaptogen for overall balance",
    ],
    bestFor: "Stress, Sleep, Longevity",
  },
];
