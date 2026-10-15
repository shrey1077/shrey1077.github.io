"use client";

/**
 * AzothSlide — Azoth Biotech on the left side: the Azoth page's own opening,
 * the rocky ridge with the mushrooms found by the spotlight under the cursor
 * (owner, 2026-10-15: "i want the users to experience the rocky artwork with
 * mushroom on hover, on the slide itself, so copy paste that part only from
 * the azoth page"). It is the same component as the page's (AzothHero,
 * variant "slide"), so the two never drift apart; "View Full Project" opens
 * the rest of the page.
 */

import { AzothHero } from "@/components/client/azoth/AzothHero";
import { PixelButton } from "@/components/home/PixelButton";
import type { Showcase } from "@/constants/showcase";

export function AzothSlide({ item }: { item: Showcase }) {
  const href = item.report.href ?? "/clients/azoth-biotech";
  return (
    <section aria-label={item.name} data-side="logic" className="absolute inset-0 overflow-hidden bg-black">
      <h2 className="sr-only">{item.name}</h2>
      <AzothHero variant="slide" />
      <div className="absolute bottom-[calc(7svh+0.75rem)] right-4 z-[60] sm:right-8 lg:right-[5vw]">
        <PixelButton side="logic" href={href}>
          {item.report.label} <span aria-hidden>→</span>
        </PixelButton>
      </div>
    </section>
  );
}
