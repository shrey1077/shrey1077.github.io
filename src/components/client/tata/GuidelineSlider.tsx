"use client";

/**
 * GuidelineSlider — the guideline plates as a stage, a tray, and a brand switch.
 *
 * One plate held large on its brand's own ground, four thumbnails beneath it,
 * advancing on its own every five seconds. Below that, the three brands: Tata
 * IIS (the default), IIS Ahmedabad, IIS Mumbai. Choosing one swaps the whole
 * deck and the stage's colour with it.
 *
 * ⚠ This replaced GuidelinePlates on this page rather than rewriting it —
 * LogoSystem still uses that one, and its unbounded snap-scrolling strip is
 * exactly what broke this band: a flex row of twelve 256px plates has no
 * intrinsic width cap, so sharing a grid row with the copy squeezed the text to
 * one word per line. This is width-contained by construction: the stage is a
 * plain block and the tray a four-column grid, so neither can push its
 * container wider.
 *
 * ⚠ The tray is a WINDOW of four, not the first four. The decks run to twelve
 * plates, so a fixed window would leave the auto-advance highlighting nothing
 * most of the time; it slides to keep the live plate inside and clamps at the
 * end so the last window is still four wide.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import { MediaViewer } from "@/components/experience/MediaViewer";

export interface GuidelineBrand {
  id: string;
  label: string;
  plates: ContentAsset[];
  /** The stage's ground while this brand is showing. */
  bg: string;
}

/** Plates visible in the tray at once. */
const TRAY = 4;
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
  const start = Math.max(0, Math.min(i - Math.floor((TRAY - 1) / 2), n - TRAY));
  const shown = plates.slice(start, start + TRAY);

  return (
    <div className="w-full min-w-0">
      {/* The stage, on the selected brand's ground. */}
      <button
        type="button"
        onClick={() => setViewing(current)}
        aria-label={`Open ${brand.label} guideline plate ${i + 1} of ${n}`}
        className="group block w-full outline-none"
      >
        <span
          className="relative block aspect-[1405/1000] w-full overflow-hidden rounded-2xl border border-neutral-200 transition-colors duration-500 group-focus-visible:border-neutral-900"
          style={{ backgroundColor: brand.bg }}
        >
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

      <div className="mt-3 flex items-center justify-between">
        <span className="tata-body text-[0.6rem] tabular-nums text-neutral-500">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <span className="tata-body text-[0.6rem] text-neutral-400">
          Tap a plate to open it full size
        </span>
      </div>

      {/* The tray. A grid, so four thumbs always share the width evenly and the
          row can never grow past its container. */}
      <ul className="mt-3 grid grid-cols-4 gap-3">
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
                  className={`relative block aspect-[1405/1000] w-full overflow-hidden rounded-xl border transition-all duration-300 ${
                    live ? "border-neutral-900" : "border-neutral-200 opacity-70 group-hover:opacity-100"
                  }`}
                  style={{ backgroundColor: brand.bg }}
                >
                  <Image src={p.url} alt="" fill sizes="180px" className="object-contain" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* The brand switch. Each pill wears its own colour when live, so the
          choice and the stage's ground say the same thing. */}
      <div role="tablist" aria-label="Brand" className="mt-6 flex flex-wrap justify-center gap-3">
        {brands.map((b) => {
          const live = b.id === brand.id;
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={live}
              onClick={() => {
                setBrandId(b.id);
                setI(0);
              }}
              className={`tata-subhead rounded-full border px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.14em] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                live
                  ? "border-transparent text-white"
                  : "border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
              }`}
              style={live ? { backgroundColor: b.bg } : undefined}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
