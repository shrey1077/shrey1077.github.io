/**
 * The homepage's face policy (owner, 2026-10-04).
 *
 * `page.tsx` puts HOME_TYPE on the home page's <main>, and globals.css (search
 * `.type-home`) sets the page in three faces from there:
 *
 *   · Helvetica for everything — subheadings, body, labels;
 *   · Digibra only on `.face-logic`: the PORTFOLIO 2026 mark and the LEFT
 *     section names (the logic pins and their rooms' titles);
 *   · Syne only on `.face-creative`: the RIGHT section names (the creative
 *     pins and their rooms' titles) and "Right".
 *
 * Scoped to the home page: the Tata page and every other page keep their own
 * faces.
 *
 * ⚠ It replaced UNIFY_FACES_ON_HOME (2026-08-25), which turned every
 * `font-graff` on the landing into Digibra — Digibra had become the landing's
 * everything-face. git has it.
 */
export const HOME_TYPE = "type-home";
