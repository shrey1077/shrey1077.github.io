/**
 * The companies, a paragraph each, on their home slides (owner, 2026-10-20:
 * "write short descriptions about the company on Azoth, zabraku, ABS and
 * newsmobile slides. 50 words, only company info").
 *
 * About the company alone — not the owner's role there. Every fact is the
 * repo's own: clients.ts (cities, sectors), the Azoth / ABS / NewsMobile
 * experience configs and clientExperiences (Zabraku's clients). None is new;
 * a fact added here should be one of those files' first.
 */

export const COMPANY_ABOUT = {
  "azoth-biotech":
    "Azoth Biotech is a Noida-based biotech house growing medicine, materials and market-ready brands out of mushrooms. Its family spans Naturalist Nootropics’ functional-mushroom nutraceuticals and MycoActives supplements to Mushroomworks, which grows packaging and vegan leather from mycelium. It also runs its own programme of research, training and certification.",
  abs:
    "ABS Wholesale is a distributor in Santa Fe Springs, California, moving vape, smoke-shop and convenience product into thousands of storefronts across six states. It carries names like Tyson 2.0, Puffco and Stiiizy, and has house brands of its own — Luzid, Kartpipe and Himax Distro — all sold through one catalogue.",
  zabraku:
    "Zabraku Media is a content and media house in Malviya Nagar, New Delhi, with a story-first spine. It builds brand identities, social media, print and event campaigns for its clients — among them Casa Playa, a luxury resort in Goa, and RKB Entertainment, a nightlife and events company with parties across Goa.",
  newsmobile:
    "NewsMobile is a digital news platform in Gurugram, Haryana, publishing at newsmobile.in and newsmobile.asia for readers who follow the news on their phones. It covers politics, sports, the environment and more, telling its stories in formats built for the feed — news cards, data infographics, explainers and lists.",
} as const;
