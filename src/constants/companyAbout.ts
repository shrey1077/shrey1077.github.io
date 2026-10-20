/**
 * The companies, a paragraph each, on their home slides (owner, 2026-10-20:
 * "write short descriptions about the company on Azoth, zabraku, ABS and
 * newsmobile slides. 50 words, only company info"; then, the same day,
 * "reduce text in all descriptions except tata iis" — cut to about half).
 *
 * About the company alone — not the owner's role there — and not repeating
 * what the slide already says beside it: Zabraku's and NewsMobile's cities
 * stand over their paragraphs, Zabraku's clients and NewsMobile's beats under
 * them. Every fact is the repo's own: clients.ts (cities, sectors), the
 * Azoth / ABS / NewsMobile experience configs and clientExperiences
 * (Zabraku's clients). None is new; a fact added here should be one of those
 * files' first.
 */

export const COMPANY_ABOUT = {
  "azoth-biotech":
    "Azoth Biotech is a Noida-based biotech house growing medicine, materials and market-ready brands out of mushrooms — from nootropics and supplements to mycelium packaging and vegan leather.",
  abs:
    "ABS Wholesale, of Santa Fe Springs, California, distributes vape, smoke-shop and convenience product to thousands of storefronts across six states, and builds house brands of its own.",
  zabraku:
    "Zabraku Media is a content and media house with a story-first spine, building identities, social media, print and event campaigns for hospitality and nightlife brands.",
  newsmobile:
    "NewsMobile is a digital news platform, at newsmobile.in and newsmobile.asia, telling the day’s stories in formats built for the feed — news cards, data infographics and explainers.",
} as const;
