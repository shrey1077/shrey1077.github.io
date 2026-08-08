"use client";

/**
 * GuidelinePlates — the logo-guideline pages as a monograph.
 *
 * A horizontal strip of numbered plates (snap-scrolled, like leafing through
 * a printed guidelines book on a table); choosing a plate opens it in the
 * white MediaViewer. Client component only because viewing needs state —
 * the plate list itself arrives from the server (LogoSystem).
 */

import { useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { typeVoiceClass } from "@/constants/typography";

interface GuidelinePlatesProps {
  plates: ContentAsset[];
}

export function GuidelinePlates({ plates }: GuidelinePlatesProps) {
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  return (
    <div>
      <ul className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
        {plates.map((plate, i) => (
          <li key={plate.url} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setViewing(plate)}
              aria-label={`Open guideline plate ${i + 1}`}
              className="group block outline-none"
            >
              <span className="relative block aspect-[1405/1000] w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors duration-300 group-hover:border-neutral-400 group-focus-visible:border-neutral-900 sm:w-64">
                <Image
                  src={plate.url}
                  alt={plate.name}
                  fill
                  sizes="256px"
                  className="object-contain"
                />
              </span>
              <span
                className={`${typeVoiceClass("logic", "meta")} mt-2 block text-left text-[0.6rem] text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
