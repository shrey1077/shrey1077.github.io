"use client";

/**
 * GuidelineSlider — the Tata IIS guideline plates as a stage and a tray.
 *
 * One plate held large, four thumbnails beneath it, advancing on its own every
 * five seconds. Choosing a thumbnail jumps to it; choosing the stage opens the
 * plate full size in the white MediaViewer.
 *
 * ⚠ Replaces GuidelinePlates on this page, and is a separate component rather
 * than a rewrite of it: GuidelinePlates is still what LogoSystem uses, and its
 * one-long-snap-scrolling-strip is exactly the thing that broke this band. As a
 * flex row of twelve 256px plates it has no intrinsic width cap, so sharing a
 * grid row with the copy blew the row out and squeezed the text to one word per
 * line. This one is width-contained: the stage is a plain block and the tray is
 * a four-column grid, so neither can push its container wider.
 *
 * The tray is a WINDOW of four, not the first four — with twelve plates a fixed
 * window would leave the auto-advance highlighting nothing most of the time.
 * It slides to keep the live plate inside it, and clamps at the end so the last
 * window is still four wide rather than trailing off.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import { MediaViewer } from "@/components/experience/MediaViewer";

/** Plates visible in the tray at once. */
const TRAY = 4;
/** Auto-advance cadence. */
const HOLD_MS = 5000;

export function GuidelineSlider({ plates }: { plates: ContentAsset[] }) {
  const [i, setI] = useState(0);
  const [viewing, setViewing] = useState<ContentAsset | null>(null);
  const n = plates.length;

  // Paused while a plate is open full size — advancing underneath the viewer
  // would change what you come back to.
  useEffect(() => {
    if (n < 2 || viewing) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % n), HOLD_MS);
    return () => window.clearInterval(id);
  }, [n, viewing]);

  if (n === 0) return null;

  const current = plates[i];
  // Window start: keep `i` inside, and never run past the end.
  const start = Math.max(0, Math.min(i - Math.floor((TRAY - 1) / 2), n - TRAY));
  const window_ = plates.slice(start, start + TRAY);

  return (
    <div className="w-full min-w-0">
      {/* The stage. */}
      <button
        type="button"
        onClick={() => setViewing(current)}
        aria-label={`Open guideline plate ${i + 1} of ${n}`}
        className="group block w-full outline-none"
      >
        <span className="relative block aspect-[1405/1000] w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors duration-300 group-hover:border-neutral-400 group-focus-visible:border-neutral-900">
          {plates.map((p, k) => (
            <Image
              key={p.url}
              src={p.url}
              alt={k === i ? p.name : ""}
              fill
              sizes="(max-width: 1024px) 92vw, 62vw"
              priority={k === 0}
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
        {window_.map((p, k) => {
          const idx = start + k;
          const live = idx === i;
          return (
            <li key={p.url}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show guideline plate ${idx + 1}`}
                aria-current={live}
                className="group block w-full outline-none"
              >
                <span
                  className={`relative block aspect-[1405/1000] w-full overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                    live
                      ? "border-neutral-900"
                      : "border-neutral-200 opacity-70 group-hover:border-neutral-400 group-hover:opacity-100"
                  }`}
                >
                  <Image src={p.url} alt="" fill sizes="180px" className="object-contain" />
                </span>
                <span
                  className={`tata-body mt-1.5 block text-left text-[0.55rem] tabular-nums transition-colors duration-300 ${
                    live ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
