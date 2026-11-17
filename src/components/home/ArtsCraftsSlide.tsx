"use client";

/**
 * ArtsCraftsSlide — Arts & Crafts, the right side's fourth slide since
 * 2026-11-17 (owner: "right to Arts and Crafts section (new) copy the ABS
 * slider for showing the my art and crafts section pics"). The ABS slide's
 * slider (Originkit's Depth Gallery) with the art in it — the slide-size
 * copies the Arts & Crafts slider played (content/art/_slides.json), the
 * collections dealt in turn so they mix — in the right side's own frame: a
 * rim in its rainbow, the ground near-black so the pieces stand out. Beside
 * it, the collections and the way to the whole of it.
 *
 * Like ABS's, the slider is built a step ahead (`soon`), moves only while the
 * slide is the camera's (`live`), and takes the wheel and a swipe inside its
 * frame; outside it they turn the slides.
 */

import { useContext } from "react";
import { NearContext } from "@/components/home/nearness";
import { DepthGallery, type GalleryImage } from "@/components/originkit/DepthGallery";
import { PixelButton } from "@/components/home/PixelButton";
import type { ArtThumb } from "@/components/home/ArtSlide";
import type { Showcase } from "@/constants/showcase";
import { typeVoiceClass } from "@/constants/typography";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const META = `${typeVoiceClass("logic", "meta")} text-[0.55rem] tracking-[0.26em] text-neutral-500`;

/** The collections dealt in turn, so one doesn't run on for nine pieces. */
function deal(thumbs: ArtThumb[]): GalleryImage[] {
  const by = new Map<string, ArtThumb[]>();
  for (const t of thumbs) by.set(t.collection, [...(by.get(t.collection) ?? []), t]);
  const lists = [...by.values()];
  const out: GalleryImage[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push({ src: l[i].src, a: l[i].w / l[i].h });
  return out;
}

export function ArtsCraftsSlide({ item, thumbs, live, soon, reduceMotion }: { item: Showcase; thumbs: ArtThumb[]; live: boolean; soon: boolean; reduceMotion: boolean }) {
  const near = useContext(NearContext);
  const tall = useMediaQuery("(orientation: portrait)");
  const images = deal(thumbs);
  const counts = [...thumbs.reduce((m, t) => m.set(t.collection, (m.get(t.collection) ?? 0) + 1), new Map<string, number>())];
  return (
    <section aria-label={item.name} data-side="creative" className="absolute inset-0 overflow-hidden">
      <div className="slide-frame absolute inset-0 flex items-stretch gap-[clamp(0.75rem,2.6vw,2.75rem)] !pb-[calc(7svh+0.75rem)] portrait:flex-col">
        {/* The words, left; held upright, along the top. */}
        <div className="flex w-[clamp(9rem,21vw,17rem)] shrink-0 flex-col justify-between gap-4 portrait:w-full portrait:gap-2">
          <div>
            <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>AI Design · 04 / 04</p>
            <h2 className="face-creative mt-1.5 text-[clamp(1.6rem,3.6vw,3.4rem)] font-bold leading-none text-neutral-900">Arts &amp; Crafts</h2>
            <p className="font-helv mt-3 text-[clamp(0.72rem,0.86vw,0.84rem)] leading-snug text-neutral-600 portrait:mt-1.5">{item.sector}.</p>
          </div>
          <div className="[@media(max-height:31.25rem)]:hidden">
            <p className={`${META} mb-2 portrait:sr-only`}>Collections</p>
            <ul className="flex flex-col gap-1.5 portrait:flex-row portrait:flex-wrap portrait:gap-x-3 portrait:gap-y-1">
              {counts.map(([name, n]) => (
                <li key={name} className="flex items-baseline justify-between gap-3 border-b border-neutral-900/10 pb-1 portrait:border-0 portrait:pb-0">
                  <span className="face-creative text-[clamp(0.8rem,1vw,0.95rem)] font-bold leading-tight text-neutral-900">{name}</span>
                  <span className={`${META} tabular-nums portrait:hidden`}>{String(n).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          <div className="relative min-h-0 flex-1">
            {/* The rim: the right side's rainbow; the ground near-black. */}
            <div className="h-full rounded-[clamp(1.25rem,2.4vw,2.25rem)] bg-[linear-gradient(135deg,#ff2e8b_0%,#ff8a00_20%,#f5c518_36%,#7fbf2e_52%,#00a6a6_68%,#3f6ad8_84%,#7a3fb0_100%)] p-[clamp(4px,0.5vw,8px)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)]">
              <div className="relative h-full overflow-hidden rounded-[calc(clamp(1.25rem,2.4vw,2.25rem)-clamp(4px,0.5vw,8px))] bg-[radial-gradient(ellipse_at_28%_18%,#2a2a2a_0%,#161616_55%,#0b0b0b_100%)]">
                <p className="sr-only">Arts &amp; Crafts — {images.length} pieces.</p>
                {near && (soon || live) && (
                  <DepthGallery images={images} spread={tall ? 0 : 5} pointer={tall ? 0 : 5} mat="#1c1c1c" active={live} reduceMotion={reduceMotion} />
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 justify-end">
            <PixelButton side="creative" href={item.report.href}>
              {item.report.label} <span aria-hidden>→</span>
            </PixelButton>
          </div>
        </div>
      </div>
    </section>
  );
}
