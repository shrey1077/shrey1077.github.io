"use client";

/**
 * GuidelineSlider — the guideline plates as a switch, a stage and a tray.
 *
 * The three brands sit on top as circular pills carrying their own marks;
 * beneath them one rounded panel in the live brand's colour holds the plate
 * being shown and the whole tray, so the ground reads as the deck's own field
 * rather than a backdrop behind one image. Ten thumbnails at a time, the live
 * one picked out. Advances on its own every five seconds.
 *
 * ⚠ The pills are ELONGATED, not circles, and that is what lets all three wear
 * their real logo. Tata's only asset is the horizontal lockup at 3.97:1, which
 * inside a circle drew 52x13px — two lines of type in thirteen pixels, so it
 * had to be replaced with stacked type. A wide pill fits it at its own aspect,
 * so the genuine mark is back and the type fallback is gone.
 *
 * ⚠ The selected pill is NOT filled with its brand colour. Each mark is drawn
 * in its own palette — IISM's is teal, IISA's navy — so a teal mark on a teal
 * fill disappears. The pills stay white and the selection is carried by a ring
 * in the brand colour instead, which holds for all three.
 *
 * ⚠ The tray is a WINDOW, not the first ten. Tata IIS runs to twelve plates, so
 * a fixed window would leave the auto-advance highlighting nothing once it
 * passed the tenth; it slides to keep the live plate inside and clamps at the
 * end. The campus decks are shorter than the window, so the column count is
 * `min(TRAY, n)` — a hard `grid-cols-10` would strand three empty cells.
 *
 * ⚠ This replaced GuidelinePlates on this page rather than rewriting it —
 * LogoSystem still uses that one, and its unbounded snap-scrolling strip is
 * what broke this band originally: a flex row of twelve 256px plates has no
 * intrinsic width cap, so sharing a grid row with the copy squeezed the text to
 * one word per line. Everything here is width-contained by construction.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import { MediaViewer } from "@/components/experience/MediaViewer";

export interface GuidelineBrand {
  id: string;
  label: string;
  /** The mark shown in this brand's pill. */
  logo: string;
  plates: ContentAsset[];
  /** The panel's ground while this brand is showing. */
  bg: string;
}

/** Plates visible in the tray at once. */
const TRAY = 10;
/** Auto-advance cadence. */
const HOLD_MS = 5000;

export function GuidelineSlider({ brands }: { brands: GuidelineBrand[] }) {
  const [brandId, setBrandId] = useState(brands[0]?.id);
  const [i, setI] = useState(0);
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  const brand = brands.find((b) => b.id === brandId) ?? brands[0];
  const plates = brand?.plates ?? [];
  const n = plates.length;

  // Paused while a plate is open full size — advancing underneath the viewer
  // would change what you come back to. Keyed on the brand too, so switching
  // decks restarts the clock rather than firing mid-interval.
  useEffect(() => {
    if (n < 2 || viewing) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % n), HOLD_MS);
    return () => window.clearInterval(id);
  }, [n, viewing, brandId]);

  if (!brand || n === 0) return null;

  const current = plates[i];
  const cols = Math.min(TRAY, n);
  const start = Math.max(0, Math.min(i - Math.floor((cols - 1) / 2), n - cols));
  const shown = plates.slice(start, start + cols);

  return (
    <div className="w-full min-w-0">
      {/* The switch, on top. */}
      <div role="tablist" aria-label="Brand" className="flex flex-wrap items-center justify-center gap-5">
        {brands.map((b) => {
          const live = b.id === brand.id;
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={live}
              aria-label={b.label}
              title={b.label}
              onClick={() => {
                setBrandId(b.id);
                setI(0);
              }}
              className="group outline-none"
            >
              <span
                className={`grid h-24 w-52 place-items-center overflow-hidden rounded-full bg-white px-6 py-4 transition-all duration-300 sm:h-28 sm:w-64 ${
                  live
                    ? "shadow-[0_12px_34px_-14px_rgba(0,0,0,0.45)]"
                    : "opacity-55 group-hover:opacity-100"
                }`}
                style={{
                  boxShadow: live ? `0 0 0 3px ${b.bg}` : undefined,
                  outline: live ? "none" : "1px solid rgb(229 229 229)",
                }}
              >
                <span className="relative block size-full">
                  <Image src={b.logo} alt="" fill sizes="256px" className="object-contain" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* One panel in the brand's colour, holding the stage AND the tray. */}
      <div
        className="mt-6 rounded-3xl p-4 transition-colors duration-500 sm:p-6"
        style={{ backgroundColor: brand.bg }}
      >
        <button
          type="button"
          onClick={() => setViewing(current)}
          aria-label={`Open ${brand.label} guideline plate ${i + 1} of ${n}`}
          className="group block w-full outline-none"
        >
          <span className="relative block aspect-[1405/1000] w-full overflow-hidden rounded-2xl">
            {plates.map((p, k) => (
              <Image
                key={p.url}
                src={p.url}
                alt={k === i ? p.name : ""}
                fill
                sizes="(max-width: 1024px) 92vw, 62vw"
                className={`object-contain transition-opacity duration-700 ${
                  k === i ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </span>
        </button>

        <div className="mt-4 flex items-center justify-between">
          <span className="tata-body text-[0.6rem] tabular-nums text-white/70">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="tata-body text-[0.6rem] text-white/50">Tap a plate to open it full size</span>
        </div>

        {/* The tray, on the same ground. Columns are counted, not hard-coded —
            see the header. */}
        <ul
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {shown.map((p, k) => {
            const idx = start + k;
            const live = idx === i;
            return (
              <li key={p.url}>
                <button
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Show plate ${idx + 1}`}
                  aria-current={live}
                  className="group block w-full outline-none"
                >
                  <span
                    className={`relative block aspect-[1405/1000] w-full overflow-hidden rounded-md bg-white/95 transition-all duration-300 ${
                      live
                        ? "opacity-100 ring-2 ring-white"
                        : "opacity-45 group-hover:opacity-80"
                    }`}
                  >
                    <Image src={p.url} alt="" fill sizes="90px" className="object-contain" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
