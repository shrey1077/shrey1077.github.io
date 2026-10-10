/**
 * FactsTab — the landing's facts (Chess, Education, Part-time, Hobbies) on a
 * black tab rising out of the band at the foot of the brain slide (owner,
 * 2026-10-05: "a black shape under the centre chess info element… in exact
 * centre of screen, just above the black band, with its rounded edges ending
 * inside the lower black bar").
 *
 * The shape is geometric: a flat top with rounded shoulders, sides that lean
 * out as they fall, and feet that curve OUT into the band's own top edge —
 * concave fillets, so the tab reads as part of the band rising, not a block
 * set on it. It sinks SINK px into the band below, in the band's own colour,
 * so the join never shows.
 *
 * The facts on it are WHITE. They are all black art and grey type (the chess
 * board, the drawn marks, the greys), so one filter turns them over — inverted
 * and lifted — rather than recolouring each part.
 *
 * Desktop only, like the facts themselves: below `lg` the footer carries them.
 */

import { AboutFacts } from "@/components/home/AboutFacts";

/** px — the flat top, the height above the band, each side's lean, the two
 *  radii, and how far the tab sinks into the band. */
const TOP = 228;
const RISE = 88;
const LEAN = 22;
const R_TOP = 14;
const R_FOOT = 14;
const SINK = 16;
/** The band's colour (HeroStage: bg-neutral-950). */
const INK = "#0a0a0a";

const WIDTH = 2 * (R_FOOT + LEAN) + TOP;

/** The outline: in from the band on the left, up the leaning side round the
 *  shoulder, across, and down the other side out into the band. */
function tabPath() {
  const H = RISE;
  const len = Math.hypot(LEAN, H);
  const ux = LEAN / len;
  const uy = -H / len;
  const foot = { x: R_FOOT, y: H }; // where the left side meets the band's edge
  const shoulder = { x: R_FOOT + LEAN, y: 0 }; // the left side's top corner
  const mx = (x: number) => WIDTH - x; // mirror across the middle
  const f = (n: number) => n.toFixed(2);
  return [
    `M 0 ${H + SINK}`,
    `L 0 ${H}`,
    // The foot: a concave curve from the band's edge into the side.
    `Q ${f(foot.x)} ${H} ${f(foot.x + ux * R_FOOT)} ${f(H + uy * R_FOOT)}`,
    `L ${f(shoulder.x - ux * R_TOP)} ${f(shoulder.y - uy * R_TOP)}`,
    // The shoulder: a convex curve onto the flat top.
    `Q ${f(shoulder.x)} 0 ${f(shoulder.x + R_TOP)} 0`,
    `L ${f(mx(shoulder.x + R_TOP))} 0`,
    `Q ${f(mx(shoulder.x))} 0 ${f(mx(shoulder.x - ux * R_TOP))} ${f(shoulder.y - uy * R_TOP)}`,
    `L ${f(mx(foot.x + ux * R_FOOT))} ${f(H + uy * R_FOOT)}`,
    `Q ${f(mx(foot.x))} ${H} ${WIDTH} ${H}`,
    `L ${WIDTH} ${H + SINK}`,
    "Z",
  ].join(" ");
}

export function FactsTab() {
  return (
    <div
      aria-hidden
      // Its foot on the band's top edge (the band is the stage's bottom 7%),
      // centred on the screen.
      className="pointer-events-none absolute bottom-[7%] left-1/2 hidden -translate-x-1/2 lg:block"
      style={{ width: WIDTH, height: RISE }}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${RISE + SINK}`}
        width={WIDTH}
        height={RISE + SINK}
        className="absolute left-0 top-0 block"
      >
        <path d={tabPath()} fill={INK} />
      </svg>
      {/* The facts, standing on the tab's floor, turned white. ⚠ Smaller by ONE
          transform, origin bottom, so every size inside comes down together and
          the block stays on the floor as its height changes from fact to fact. */}
      <div className="absolute bottom-3 left-1/2 w-[28rem] -translate-x-1/2">
        <div className="origin-bottom scale-[0.6] [filter:invert(1)_brightness(1.5)]">
          <AboutFacts align="center" />
        </div>
      </div>
    </div>
  );
}
