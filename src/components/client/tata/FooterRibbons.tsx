"use client";

/**
 * FooterRibbons — the two Tata IIS ribbons flowing like flags along the bottom
 * of the footer. Blue is the IISA mark colour (#0d3857), teal the IISM mark
 * colour (#00a2b4), painted as exact flat colours (no sheen or gradient); the
 * blue ribbon is twice the teal's width, per the brief. They wave left → right
 * in a seamless loop.
 *
 * Seamless loop: the artwork spans two identical tiles (even wave periods over
 * 2×TILE), so translating by exactly one tile (translateX -50% → 0) repeats
 * with no seam. Decorative, pointer-inert, still under prefers-reduced-motion.
 */

const TILE = 1600; // one seamless tile, in viewBox units
const W = TILE * 2; // two tiles → translateX(-50%) is exactly one tile
const H = 200;

/** A sine trail sampled across the full 2-tile width. Even `periods` keeps the
 *  two halves identical, so the tiled loop is seamless. */
function wave({ periods, amp, base, phase }: { periods: number; amp: number; base: number; phase: number }): string {
  const n = 264;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * W;
    const y = base + amp * Math.sin(phase + (i / n) * periods * 2 * Math.PI);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

const BLUE = wave({ periods: 4, amp: 32, base: 140, phase: 0 });
const TEAL = wave({ periods: 6, amp: 27, base: 116, phase: Math.PI * 0.6 });

const CSS = `
@keyframes tata-ribbon-flow { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.tata-ribbon-flow { animation: tata-ribbon-flow 26s linear infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) { .tata-ribbon-flow { animation: none; } }
`;

export function FooterRibbons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <svg
        className="tata-ribbon-flow absolute bottom-0 left-0 h-full w-auto max-w-none"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMinYMax meet"
        fill="none"
      >
        {/* Teal ribbon — IISM colour, the thinner one (half the blue width). */}
        <path d={TEAL} stroke="#00a2b4" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Blue ribbon — IISA colour, double the teal width. */}
        <path d={BLUE} stroke="#0d3857" strokeWidth="30" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
