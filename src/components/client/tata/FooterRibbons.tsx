"use client";

/**
 * FooterRibbons — the blue & teal light ribbons from the 16:9 hero film,
 * reprised as a looping horizontal flow along the bottom of the Tata IIS
 * footer. Two glowing trails weave left → right; the blue ribbon is twice the
 * stroke width of the teal one, per the brief.
 *
 * Seamless loop: the artwork is drawn across two identical tiles (even wave
 * periods over 2×TILE), so translating the whole SVG by exactly one tile
 * (translateX -50% → 0) repeats with no visible seam. Decorative and
 * pointer-inert; the animation is disabled under prefers-reduced-motion.
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

const BLUE = wave({ periods: 4, amp: 30, base: 138, phase: 0 });
const TEAL = wave({ periods: 6, amp: 26, base: 116, phase: Math.PI * 0.65 });

const CSS = `
@keyframes tata-ribbon-flow { from { transform: translateX(-50%); } to { transform: translateX(0); } }
.tata-ribbon-flow { animation: tata-ribbon-flow 24s linear infinite; will-change: transform; }
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
        <defs>
          <linearGradient id="tata-ribbon-blue" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#1e40af" />
            <stop offset="0.5" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="tata-ribbon-teal" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#0d9488" />
            <stop offset="0.5" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
          <filter id="tata-ribbon-glow" x="-10%" y="-80%" width="120%" height="260%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Teal ribbon — the thinner trail (half the blue width). */}
        <path d={TEAL} stroke="url(#tata-ribbon-teal)" strokeWidth="13" strokeLinecap="round" filter="url(#tata-ribbon-glow)" opacity="0.9" />
        <path d={TEAL} stroke="#ccfbf1" strokeWidth="3" strokeLinecap="round" opacity="0.75" />

        {/* Blue ribbon — double the teal width. */}
        <path d={BLUE} stroke="url(#tata-ribbon-blue)" strokeWidth="26" strokeLinecap="round" filter="url(#tata-ribbon-glow)" opacity="0.92" />
        <path d={BLUE} stroke="#dbeafe" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  );
}
