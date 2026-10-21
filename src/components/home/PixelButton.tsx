"use client";

/**
 * PixelButton — every button on the home page's rooms (owner, 2026-10-15:
 * "all buttons should be pixel blinking, change to dark version on hover,
 * decide for left or right side and then use black and white or rainbow
 * colors").
 *
 * The button's ground is a field of small squares, each flashing on its own
 * random beat (.pixel-blink, globals.css). Two sides, two inks:
 *   · LOGIC (left)     graphite squares on white, a black edge;
 *   · CREATIVE (right) the rainbow of the creative ground (MoodField's
 *                      RAINBOW) on white, a rainbow edge.
 * On hover or keyboard focus it turns DARK: the ground goes near-black, the
 * type white, and the squares light up stronger over it — white on the left,
 * full paint on the right.
 *
 * The squares are counted off the button's own size (a ResizeObserver), so a
 * long label and a short one have the same pitch. Pointer-inert, hidden from
 * assistive tech; the label is the button's name. Reduced motion: the squares
 * hold still (globals.css).
 *
 * A pill, round at both ends, like every button on the site (owner,
 * 2026-10-18: "all buttons will be having the pill shapes, ie semicircular at
 * ends"); the squares are clipped to it.
 *
 * Renders a Link for an app route, an <a> for anything else, a <button>
 * without an href — and, with neither href nor onClick, a dead label
 * (AI Projects' "Coming Soon").
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";

export type PixelSide = "logic" | "creative";

/** A square and the gap after it, px. */
const SQ = 5;
const PITCH = SQ + 2;

/** The squares' inks, light (at rest) and dark (hovered). */
function inks(side: PixelSide, i: number, j: number) {
  if (side === "logic") return { light: "rgba(23, 23, 23, 0.17)", dark: "rgba(255, 255, 255, 0.26)" };
  const c = RAINBOW[Math.floor(hash(i + 7, j + 3) * RAINBOW.length)];
  return { light: `${c}59`, dark: `${c}d9` };
}

/** The field of squares. `tone` "dark" keeps them in their hovered inks
 *  for good — the black pills in the band (ShowcaseStrip). */
export function PixelGround({ side, tone = "light" }: { side: PixelSide; tone?: "light" | "dark" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const cols = Math.ceil(el.offsetWidth / PITCH);
      const rows = Math.ceil(el.offsetHeight / PITCH);
      setGrid((g) => (g.cols === cols && g.rows === rows ? g : { cols, rows }));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const squares: React.ReactNode[] = [];
  for (let i = 0; i < grid.cols; i++) {
    for (let j = 0; j < grid.rows; j++) {
      const r = hash(i + 11, j + 29);
      const { light, dark } = inks(side, i, j);
      squares.push(
        <span
          key={`${i}-${j}`}
          className="pixel-blink absolute block bg-[var(--lt)] transition-colors duration-200 group-hover:bg-[var(--dk)] group-focus-visible:bg-[var(--dk)]"
          style={
            {
              width: SQ,
              height: SQ,
              left: i * PITCH + 1,
              top: j * PITCH + 1,
              "--lt": tone === "dark" ? dark : light,
              "--dk": dark,
              "--blink": `${(1.3 + r * 2.6).toFixed(2)}s`,
              "--delay": `${(-hash(j + 5, i + 13) * 4).toFixed(2)}s`,
            } as unknown as React.CSSProperties
          }
        />,
      );
    }
  }
  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {squares}
    </span>
  );
}

export function PixelButton({
  side,
  href,
  onClick,
  children,
  size = "md",
  className = "",
  ariaLabel,
  ariaExpanded,
  ariaControls,
  ariaHaspopup,
  download,
}: {
  side: PixelSide;
  href?: string;
  /** With `href`: the file is saved, under this name, not opened. */
  download?: string;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaHaspopup?: "menu" | "dialog" | true;
}) {
  const dead = !href && !onClick;
  const edge =
    side === "logic"
      ? "bg-neutral-900"
      : "bg-[linear-gradient(90deg,#ff2e8b,#ff8a00,#f5c518,#7fbf2e,#00a6a6,#3f6ad8,#7a3fb0)]";
  const pad = size === "sm" ? "h-9 px-4 text-[0.6rem]" : "h-11 px-4 text-[0.68rem] sm:px-5";
  const face =
    side === "logic"
      ? "font-graff uppercase tracking-[0.2em]"
      : "face-creative font-bold tracking-[0.02em] text-[0.8rem]";
  const inner = (
    <span
      className={`relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-neutral-900 transition-colors duration-200 ${
        dead ? "" : "group-hover:bg-neutral-950 group-hover:text-white group-focus-visible:bg-neutral-950 group-focus-visible:text-white"
      } ${pad}`}
    >
      <PixelGround side={side} />
      <span className={`relative flex items-center gap-2 whitespace-nowrap leading-none ${face} ${size === "sm" && side === "creative" ? "!text-[0.72rem]" : ""}`}>
        {children}
      </span>
    </span>
  );
  const shell = `group relative inline-block rounded-full p-[1.5px] outline-none ${edge} ${
    dead ? "cursor-default opacity-80" : "cursor-pointer"
  } focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2 ${className}`;

  if (href && download) {
    return (
      <a href={href} download={download} className={shell} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }
  if (href) {
    const internal = href.startsWith("/") && !href.startsWith("//");
    return internal ? (
      <Link href={href} prefetch={false} className={shell} aria-label={ariaLabel}>
        {inner}
      </Link>
    ) : (
      <a href={href} className={shell} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  if (dead) {
    return (
      <span className={shell} aria-label={ariaLabel}>
        {inner}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={shell}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHaspopup}
    >
      {inner}
    </button>
  );
}
