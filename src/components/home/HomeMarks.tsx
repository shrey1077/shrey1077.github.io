/**
 * HomeMarks — the marks for the two landing corners.
 *
 * AboutFacts (logic, bottom-left) and HobbiesRotator (creative, bottom-right)
 * both label every item with a mark now, so the drawings live here rather than
 * being duplicated in each.
 *
 * ⚠ These are DRAWN, not artwork. `chess.png` is the owner's own supplied file
 * and is the only real art in either corner; nothing comparable exists on the
 * drives for the other ten items. This is the same road the chess knight took
 * in AboutFacts before real art arrived — swap any of them for a file the
 * moment one lands.
 *
 * House rules, so the set reads as one family:
 *   • 24×24 viewBox, rendered at 24px (`size-6`), which is the largest mark the
 *     rotator's fixed 30px line box will take.
 *   • Black on transparency (`text-neutral-950`, `currentColor`), matching
 *     ChessMark — no plate, so they sit on the stage's light ground directly.
 *   • One stroke weight (STROKE) across every outlined part.
 *   • Built from primitives (circle/rect/polygon/short paths) on purpose: they
 *     are authored without being able to see them, and primitives are far
 *     likelier to render as intended than hand-written compound curves.
 */

const STROKE = 1.9;

/** The shared frame. Everything is sized and coloured here, once. */
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 shrink-0 text-neutral-950"
    >
      {children}
    </svg>
  );
}

/** Education — a mortarboard: the board, the cap band under it, and a tassel. */
export function EducationMark() {
  return (
    <Mark>
      <polygon points="12,3.4 22.2,8.2 12,13 1.8,8.2" />
      <path d="M6.4 10.3v3.9c0 1.8 2.5 3.1 5.6 3.1s5.6-1.3 5.6-3.1v-3.9L12 13.9z" />
      <path
        d="M20.6 9.4v4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="20.6" cy="15" r="1.2" />
    </Mark>
  );
}

/** Part-time — a clock. */
export function PartTimeMark() {
  return (
    <Mark>
      <circle cx="12" cy="12" r="8.3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 6.9v5.4l3.6 2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mark>
  );
}

/** Arts — a palette: a solid oval body with the thumb hole and three wells
 *  knocked out of it.
 *
 *  ⚠ This was a stroked circle with dots inside, and it read as a bowling ball.
 *  A palette is legible by its SILHOUETTE plus the thumb hole, not by dots on a
 *  ring — so the body is solid and every well is a real hole (evenodd), which
 *  is also the only way a detail shows on a filled mark sitting on
 *  transparency. */
export function ArtsMark() {
  return (
    <Mark>
      <path
        fillRule="evenodd"
        d="M3 12a9 7.8 0 1 0 18 0a9 7.8 0 1 0 -18 0Z
           M13.6 15.4a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0Z
           M6.9 9.2a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z
           M11.3 8.1a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z
           M15.1 10.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z"
      />
    </Mark>
  );
}

/** Painting — a brush, laid on the diagonal. Thin handle, WIDE ferrule and a
 *  blunt bristle block.
 *
 *  ⚠ Painting and Sketching sit two apart in the rotation and must not be
 *  confusable. The first pass made both a narrow diagonal spike and they read
 *  as the same object. The brush is now the WIDE one: a 5.2-unit head against
 *  a 2-unit handle, cut square at the tip. */
export function PaintingMark() {
  return (
    <Mark>
      <g transform="rotate(45 12 12)">
        <rect x="11" y="2.6" width="2" height="9.8" rx="1" />
        <rect x="9.4" y="12.4" width="5.2" height="2.4" rx="0.4" />
        <path d="M9.4 14.8h5.2l-1.1 5.6h-3z" />
      </g>
    </Mark>
  );
}

/** Sketching — a pencil on the same diagonal, so the two read as a pair
 *  without reading as the same thing.
 *
 *  The pencil is the NARROW one, and it carries two tells the brush does not:
 *  a gap between the band and the barrel (which prints as a bright line across
 *  the shaft — the ferrule) and a long sharp point rather than a square cut. */
export function SketchingMark() {
  return (
    <Mark>
      <g transform="rotate(45 12 12)">
        <rect x="10.4" y="3.2" width="3.2" height="2.4" rx="0.5" />
        <rect x="10.4" y="5.8" width="3.2" height="1" />
        <rect x="10.4" y="7.4" width="3.2" height="8.4" />
        <path d="M10.4 15.8h3.2l-1.6 4.6z" />
      </g>
    </Mark>
  );
}

/** Calligraphy — a nib. The vent hole AND the slit below it are genuine holes
 *  (evenodd), not a light fill, because these marks sit on transparency.
 *
 *  ⚠ The slit is what makes this a nib. Without it the shape read as a gem —
 *  a plain kite with one round hole in the middle says nothing about writing.
 *  It is 0.8 wide and stops at y 19.8, where the kite's own half-width is still
 *  1.16, so it never breaks out through the point. */
export function CalligraphyMark() {
  return (
    <Mark>
      <path
        fillRule="evenodd"
        d="M12 2.8L17.8 14.2L12 21.2L6.2 14.2Z
           M10.4 13a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z
           M11.6 14.6h0.8v5.2h-0.8z"
      />
    </Mark>
  );
}

/** Crafts & Installations — scissors. */
export function CraftsMark() {
  return (
    <Mark>
      <circle cx="6.8" cy="18.6" r="2.7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <circle cx="17.2" cy="18.6" r="2.7" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M8.7 16.6 18.4 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M15.3 16.6 5.6 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Mark>
  );
}

/** Photography — a camera: body, lens, and the viewfinder hump. */
export function PhotographyMark() {
  return (
    <Mark>
      <rect
        x="2.4"
        y="6.6"
        width="19.2"
        height="13.4"
        rx="2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <circle cx="12" cy="13.3" r="3.8" fill="none" stroke="currentColor" strokeWidth={STROKE} />
      <path
        d="M8.4 6.6 9.9 4h4.2l1.5 2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mark>
  );
}

/** Pickleball — a paddle and a ball.
 *
 *  ⚠ The ball sits at cx19/r3.6, not cx18.5/r3.9. The handle's rotated corner
 *  reaches x≈13.41 and the stroked ball used to reach back to x≈13.95 — half a
 *  pixel of daylight at a 24px render. Clearance is ~1.4 units now. */
export function PickleballMark() {
  return (
    <Mark>
      <g transform="rotate(-20 9 10)">
        <ellipse cx="9" cy="7.5" rx="5" ry="5.8" />
        <rect x="7.4" y="12.5" width="3.2" height="6" rx="1.6" />
      </g>
      <circle cx="19" cy="18" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="17.9" cy="16.9" r="0.5" />
      <circle cx="20.2" cy="17.4" r="0.5" />
      <circle cx="18.9" cy="19.8" r="0.5" />
    </Mark>
  );
}

/* ── At a glance (the brain slide's career facts, 2026-10-16). ─────────── */

/** Experience — a briefcase. */
export function ExperienceMark() {
  return (
    <Mark>
      <path d="M8.6 6.2V5a1.8 1.8 0 0 1 1.8-1.8h3.2A1.8 1.8 0 0 1 15.4 5v1.2h3.8A2.3 2.3 0 0 1 21.5 8.5v3.2H2.5V8.5a2.3 2.3 0 0 1 2.3-2.3zm1.9 0h3V5.1h-3z" />
      <path d="M2.5 13.3h7.7v1.3a1 1 0 0 0 1 1h1.6a1 1 0 0 0 1-1v-1.3h7.7v4.4a2.3 2.3 0 0 1-2.3 2.3H4.8a2.3 2.3 0 0 1-2.3-2.3z" />
    </Mark>
  );
}

/** Brands — a seal: a scalloped badge with a star struck through it. */
export function BrandsMark() {
  return (
    <Mark>
      <path
        fillRule="evenodd"
        d="M12 1.8l2.3 1.7 2.8-.3 1.1 2.6 2.6 1.1-.3 2.8 1.7 2.3-1.7 2.3.3 2.8-2.6 1.1-1.1 2.6-2.8-.3L12 22.2l-2.3-1.7-2.8.3-1.1-2.6-2.6-1.1.3-2.8L1.8 12l1.7-2.3-.3-2.8 2.6-1.1 1.1-2.6 2.8.3zm0 5.1l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z"
      />
    </Mark>
  );
}

/** AI film making — a clapperboard, a spark over it. */
export function FilmMark() {
  return (
    <Mark>
      <path d="M3 10.2h16.4v8.3a2.1 2.1 0 0 1-2.1 2.1H5.1A2.1 2.1 0 0 1 3 18.5z" />
      <path d="M2.6 8.6l-.4-1.9a1.3 1.3 0 0 1 1-1.5l11.4-2.4a1.3 1.3 0 0 1 1.5 1l.4 1.9zm3.2-3.8L7.9 7.4l2-.4-2.1-2.6zm4.2-.9 2.1 2.6 2-.4-2.1-2.6z" />
      <path d="M20.3 2.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" />
    </Mark>
  );
}

/** AI agents & products — a chip with a spark at its heart. */
export function AgentMark() {
  return (
    <Mark>
      <path
        fillRule="evenodd"
        d="M8 1.8h1.6v2.4h4.8V1.8H16v2.4h1.5a2.3 2.3 0 0 1 2.3 2.3V8h2.4v1.6h-2.4v4.8h2.4V16h-2.4v1.5a2.3 2.3 0 0 1-2.3 2.3H16v2.4h-1.6v-2.4H9.6v2.4H8v-2.4H6.5a2.3 2.3 0 0 1-2.3-2.3V16H1.8v-1.6h2.4V9.6H1.8V8h2.4V6.5a2.3 2.3 0 0 1 2.3-2.3H8zm4 5.4l1.2 3.6 3.6 1.2-3.6 1.2L12 16.8l-1.2-3.6-3.6-1.2 3.6-1.2z"
      />
    </Mark>
  );
}
