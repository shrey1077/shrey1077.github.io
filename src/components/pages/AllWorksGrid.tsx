"use client";

/**
 * AllWorksGrid — everything that isn't one of the home page's nine project
 * slides (owner, 2026-10-15: "Keep all Others on one page called All Works
 * with a link to it with a 'See all' text after Vivid").
 *
 * The independent commissions open their preview in place (ProjectPreview —
 * the same dialog the old Projects board opened); the chess site, a static
 * site of its own, opens in the page. A card is fronted by the brand's mark
 * where there is one, by the first plate of the work where there isn't.
 */

import Image from "next/image";
import { useState } from "react";
import { ProjectPreview, type StudyPlate } from "@/components/home/ProjectPreview";
import type { ProjectStudy } from "@/constants/projectStudies";
import { typeVoiceClass } from "@/constants/typography";

export interface WorkCard {
  key: string;
  name: string;
  kind: string;
  image?: string;
  /** The image is a mark (fitted), not artwork (filling the plate). */
  mark?: boolean;
  /** A page to open, or a study to preview. */
  href?: string;
  study?: ProjectStudy;
  plates?: StudyPlate[];
}

const META = `${typeVoiceClass("logic", "meta")} text-[0.58rem] tracking-[0.24em] text-neutral-500`;

export function AllWorksGrid({ cards }: { cards: WorkCard[] }) {
  const [open, setOpen] = useState<WorkCard | null>(null);
  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => {
          const face = (
            <>
              <span className={`relative block aspect-[4/3] overflow-hidden rounded-xl ${c.mark ? "bg-white" : "bg-neutral-900"}`}>
                {c.image && (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    className={`${c.mark ? "object-contain p-8" : "object-cover"} transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
                  />
                )}
              </span>
              <span className="mt-3 block px-1">
                <span className="block text-[1.02rem] leading-tight text-neutral-900">{c.name}</span>
                <span className={`${META} mt-1.5 block`}>{c.kind}</span>
              </span>
            </>
          );
          const card =
            "group block w-full rounded-2xl bg-white/70 p-2.5 text-left ring-1 ring-neutral-200 outline-none transition-shadow duration-300 hover:ring-neutral-900/40 focus-visible:ring-2 focus-visible:ring-neutral-900/50";
          return (
            <li key={c.key}>
              {c.href ? (
                <a href={c.href} className={card}>
                  {face}
                </a>
              ) : (
                <button type="button" className={card} onClick={() => setOpen(c)} aria-haspopup="dialog">
                  {face}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <ProjectPreview study={open?.study ?? null} plates={open?.plates ?? []} onClose={() => setOpen(null)} />
    </>
  );
}
