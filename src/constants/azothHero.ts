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
  /** The same with its sky cut away — laid over the always-visible headline
   *  so the rock passes in front of it (2026-10-03). */
  baseCut: `${HERO}/bg-day-cut.webp`,
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
  /** The same on a PORTRAIT screen below `lg` (2026-10-03). Upright, the
   *  cover crop keeps only the frame's middle strip — ~37–63% across on a
   *  phone, ~29–71% on a tablet — so all four close up along the ridge inside
   *  it, smaller, rather than two of them standing off-screen. The ridge runs
   *  from y≈55 at x 39 to y≈41 at x 62; these sit on that line. */
  atPortrait: { x: number; y: number; w: number };
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
    atPortrait: { x: 40, y: 55, w: 5.4 },
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
    atPortrait: { x: 46, y: 51.5, w: 5.4 },
    // ⚠ Gold since 2026-10-03, when each mushroom and its strip were
    // colour-coded: the old greige (#b0a090) barely read as a colour at all
    // next to orange, green and red. Gold keeps the cream of the real thing.
    color: "#c99a3a",
    accent: "#f0d58c",
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
    atPortrait: { x: 52.5, y: 47.5, w: 5.8 },
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
    atPortrait: { x: 59, y: 43.5, w: 5.4 },
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
