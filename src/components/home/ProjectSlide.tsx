"use client";

/**
 * ProjectSlide — a slide on the left side: the project's own page, as it
 * opens, on the whole slide (owner, 2026-10-15: "instead of quad system use
 * the preview of the main page of that section, on the whole slide, dont
 * show the page address" — the four quadrants, ShowcaseRoom, are unlinked).
 *
 * The preview is a still of the page's first screen, taken in the screen's
 * own shape — a laptop's for a landscape screen, a phone's (9:16) for a
 * portrait one — by scripts/make-showcase-previews.mjs, so it looks like the
 * page itself at any size and never needs a scroll. A click anywhere on it,
 * or the "View Full Project" button in the bottom-right corner, opens the
 * page. The strip runs over its top, the band over its foot. Vivid's is a
 * still of the company's own website (owner: "full screen Vivid ProTech
 * website preview"), with a second button to the live site.
 *
 * It waits for its room like every picture here (nearness).
 */

import Link from "next/link";
import { useContext } from "react";
import { NearContext } from "@/components/home/nearness";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";

export function ProjectSlide({ item, extra }: { item: Showcase; extra?: { label: string; href: string } }) {
  const near = useContext(NearContext);
  const href = item.report.href ?? "/";
  const src = item.preview?.src;
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden bg-white">
      <h2 className="sr-only">{item.name}</h2>
      <Link href={href} prefetch={false} tabIndex={-1} aria-hidden className="absolute inset-0 block">
        {near && src && (
          <picture>
            <source media="(orientation: portrait)" srcSet={src.replace(/\.webp$/, "-portrait.webp")} />
            <img
              src={src}
              alt=""
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover object-top"
            />
          </picture>
        )}
      </Link>
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-10 flex flex-col items-end gap-2 sm:right-8 sm:flex-row sm:items-center lg:right-[5vw]">
        {extra && (
          <PixelButton side="logic" size="sm" href={extra.href}>
            {extra.label} <span aria-hidden>↗</span>
          </PixelButton>
        )}
        <PixelButton side="logic" href={href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
