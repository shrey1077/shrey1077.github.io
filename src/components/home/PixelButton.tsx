"use client";

/**
 * PixelButton — every button on the home page's rooms (owner, 2026-10-15:
 * "all buttons should be pixel blinking, change to dark version on hover,
 * decide for left or right side and then use black and white or rainbow
 * colors").
 *
 * The button's ground is a field of small squares, each flashing on its own
 * random beat (the .pixel-blink of globals.css, drawn on one canvas since
 * 2026-11-10 — PixelGround). Two sides, two inks:
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
 * hold still, at 0.55, as .pixel-blink's do.
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
import { useEffect, useRef } from "react";
import { RAINBOW } from "@/components/home/MoodField";
import { hash } from "@/components/home/pixelDissolve";

export type PixelSide = "logic" | "creative";

/** A square and the gap after it, px. */
const SQ = 5;
const PITCH = SQ + 2;

type Rgba = readonly [number, number, number, number];

/** The squares' inks, light (at rest) and dark (hovered). */
function inks(side: PixelSide, i: number, j: number): { light: Rgba; dark: Rgba } {
  if (side === "logic") return { light: [23, 23, 23, 0.17], dark: [255, 255, 255, 0.26] };
  const c = RAINBOW[Math.floor(hash(i + 7, j + 3) * RAINBOW.length)];
  const rgb = [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16)) as unknown as [number, number, number];
  return { light: [...rgb, 0x59 / 255], dark: [...rgb, 0xd9 / 255] };
}

/** The blink (.pixel-blink, globals.css) at `t`, 0–1 through its beat: lit
 *  up and down again in three steps each over the first third, faint the
 *  rest — the keyframes 0% 0.2 · 12% 1 · 34% 0.2, steps(3, jump-both). */
function blink(t: number): number {
  if (t < 0.12) return 0.2 + (0.8 * (Math.floor((t / 0.12) * 3) + 1)) / 4;
  if (t < 0.34) return 1 - (0.8 * (Math.floor(((t - 0.12) / 0.22) * 3) + 1)) / 4;
  return 0.2;
}

// ── ONE CLOCK, ONE CANVAS A GROUND (speed fix, 2026-11-10) ───────────────
// The squares were a span each, each blinking on its own CSS animation: some
// eleven hundred in the buttons on screen at once, and the page restyled
// every one of them every frame — on every slide, the whole while (measured:
// the main thread went from ~40% busy to ~100%, a phone's frame rate to ~20).
// Now each ground is one canvas, and one clock for the whole page redraws
// those on show twenty times a second — the blink's steps are no finer.

/** The blink's quickest step is ~50 ms (a third of 12% of 1.3 s). */
const DRAW_MS = 48;
/** Hover's change of ink, as the spans' transition-colors had it. */
const HOVER_MS = 200;

interface Ground {
  /** Draws, if it can be seen. */
  draw(now: number): void;
}

const grounds = new Set<Ground>();
let raf = 0;
let drawn = 0;

function tick(now: number) {
  raf = 0;
  if (document.hidden || !grounds.size) return;
  if (now - drawn >= DRAW_MS) {
    drawn = now;
    for (const g of grounds) g.draw(now);
  }
  raf = requestAnimationFrame(tick);
}
function wake() {
  if (!raf && !document.hidden && grounds.size) raf = requestAnimationFrame(tick);
}
if (typeof document !== "undefined") document.addEventListener("visibilitychange", wake);

/** The field of squares. `tone` "dark" keeps them in their hovered inks
 *  for good — the black pills in the band (ShowcaseStrip). */
export function PixelGround({ side, tone = "light" }: { side: PixelSide; tone?: "light" | "dark" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef(tone);
  useEffect(() => {
    toneRef.current = tone;
  }, [tone]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The squares, laid out off the ground's own size.
    let squares: { x: number; y: number; light: Rgba; dark: Rgba; beat: number; lead: number }[] = [];
    let dpr = 1;
    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      squares = [];
      for (let i = 0; i < Math.ceil(w / PITCH); i++) {
        for (let j = 0; j < Math.ceil(h / PITCH); j++) {
          squares.push({
            x: i * PITCH + 1,
            y: j * PITCH + 1,
            ...inks(side, i, j),
            beat: 1.3 + hash(i + 11, j + 29) * 2.6,
            lead: hash(j + 5, i + 13) * 4,
          });
        }
      }
      paint(performance.now());
    };

    // Hover or keyboard focus on the button turns the inks dark.
    const button = canvas.closest(".group");
    let hover = { from: 0, to: 0, at: 0 };
    const mix = (now: number) => hover.from + (hover.to - hover.from) * Math.min(1, (now - hover.at) / HOVER_MS);
    const turn = (on: boolean) => {
      const now = performance.now();
      hover = { from: mix(now), to: on ? 1 : 0, at: now };
      paint(now);
    };
    const enter = () => turn(true);
    const leave = () => turn(button?.matches(":focus-visible") ?? false);
    const focus = () => turn(button?.matches(":focus-visible") || button?.matches(":hover") || false);
    button?.addEventListener("pointerenter", enter);
    button?.addEventListener("pointerleave", leave);
    button?.addEventListener("focusin", focus);
    button?.addEventListener("focusout", leave);

    // Drawn only where it can be seen: not on a slide out of view (inert), a
    // hidden pop-up or a pixel-faded panel (.invisible), nor off screen.
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) paint(performance.now());
    });
    io.observe(canvas);
    const seen = () => onScreen && !canvas.closest("[inert], .invisible");

    function paint(now: number) {
      if (!ctx || !canvas) return;
      const h = toneRef.current === "dark" ? 1 : mix(now);
      const s = now / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const size = Math.max(1, Math.round(SQ * dpr));
      for (const q of squares) {
        const o = still.matches ? 0.55 : blink((((s + q.lead) % q.beat) + q.beat) % q.beat / q.beat);
        const c = h === 0 ? q.light : h === 1 ? q.dark : q.light.map((v, k) => v + (q.dark[k] - v) * h);
        ctx.fillStyle = `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${(c[3] * o).toFixed(3)})`;
        ctx.fillRect(Math.round(q.x * dpr), Math.round(q.y * dpr), size, size);
      }
    }

    const ground: Ground = {
      draw(now) {
        if (seen() && (!still.matches || now - hover.at < HOVER_MS + DRAW_MS)) paint(now);
      },
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    grounds.add(ground);
    wake();
    return () => {
      grounds.delete(ground);
      ro.disconnect();
      io.disconnect();
      button?.removeEventListener("pointerenter", enter);
      button?.removeEventListener("pointerleave", leave);
      button?.removeEventListener("focusin", focus);
      button?.removeEventListener("focusout", leave);
    };
  }, [side]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 block h-full w-full" />;
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
