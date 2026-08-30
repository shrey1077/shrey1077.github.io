/**
 * The homepage's face policy — one switch.
 *
 * The site's Typography Constitution gives the two hemispheres their own faces:
 * Digibra for the logic side, Juturu (`font-graff`) for the creative one. The
 * owner asked on 2026-08-25 to try the landing with EVERYTHING in Digibra, and
 * to keep the revert cheap.
 *
 * ⚠ FLIP THIS ONE BOOLEAN TO GO BACK. It drives all three moving parts:
 *   · `page.tsx` puts `.faces-unified` on <main>, which globals.css uses to
 *     override every `.font-graff` on the landing to Digibra;
 *   · `HeroName` picks the matching ink metrics — they are per-FACE and per-
 *     STRING, so they cannot be shared between the two states;
 *   · nothing else needs touching. Client pages, the section panels' own faces
 *     and the rest of the site are unaffected, because the override is scoped
 *     to that one class on the landing.
 *
 * ⚠ COLOUR IS NOT PART OF THIS. The owner was explicit: the faces change, the
 * colours do not. `imagine` keeps its rainbow, the paint gradient stays, and
 * `.font-graff` elements keep whatever colour they already had — the override
 * sets `font-family` and nothing else.
 */
export const UNIFY_FACES_ON_HOME = true;
