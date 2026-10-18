/**
 * BrandPlate — the plate a left-side slide's things stand on, between the
 * field of falling nodes and them, so they read clearly (owner, 2026-10-18,
 * Zabraku: "a 50 % transclucent rounded rectangle … for better visiblity";
 * 2026-10-19: "should be 80 % visible, and the top left and bottom right
 * corners, will not be rounded but pointed corners, rest two corners will
 * have max roundedness, and i want it to have double border of yellow inside
 * and black outside. take colors from zabraku logo. Similarly put behind
 * Newsmobile elements with red inside and blue outside on border").
 *
 * White at 80%; the top-left and bottom-right corners square, the other two
 * on a large radius; a double rim in the brand's two colours, `inner` within
 * `outer`, two bands of one width. It spans the slide from the sections
 * button's row to the band — or, with `clearCorner`, to above the row of
 * corner buttons, where a slide keeps its way in.
 *
 * ⚠ A slide on a plate sets its things in by PLATE_INSET (owner, 2026-10-19:
 * "need more left margin between text and border") — the plate stands 0.5rem
 * from the screen's edge on a phone and 1rem on a small tablet, so the usual
 * 1rem / 2rem left the words 8–16px off its rim — and from its top by
 * PLATE_TOP, where the words start at the top (a portrait screen).
 */

/** Where a slide on a plate sets its things from the left edge. */
export const PLATE_INSET = "left-[1.875rem] sm:left-11 lg:left-[5vw]";
/** The same, as a slide frame's left padding. */
export const PLATE_PAD = "!pl-[1.875rem] sm:!pl-11 lg:!pl-[5vw]";
/** A slide frame's top padding on a plate: its top, and a clear 1.6rem. */
export const PLATE_TOP = "!pt-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem)+1.85rem)]";

/** The two round corners' radius: large, kept within the plate's height. */
const RADIUS = "min(12vw, 30svh)";
/** Each band of the rim. */
const BAND = "clamp(2px, 0.28vw, 4px)";

export function BrandPlate({ inner, outer, clearCorner = false }: { inner: string; outer: string; clearCorner?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-2 top-[calc(max(2vh,0.75rem)+var(--strip-h,3.75rem)+0.25rem)] bg-white/80 sm:inset-x-4 lg:inset-x-[2.5vw] ${
        clearCorner ? "bottom-[calc(7svh+0.75rem+2.75rem+0.6rem)]" : "bottom-[calc(7svh+0.75rem)]"
      }`}
      style={{ borderRadius: `0 ${RADIUS} 0 ${RADIUS}`, border: `${BAND} solid ${inner}`, boxShadow: `0 0 0 ${BAND} ${outer}` }}
    />
  );
}
