"use client";

/**
 * CategoryAccordion — the four families of the Tata IIS work, as full-width
 * rows.
 *
 * Each row shows an index, its mockup cutout, a title with a short description
 * beneath, and a piece count. Clicking a row no longer expands inline: it opens
 * the FamilyOverlay — a full-screen black takeover that grows from the row,
 * turns the type white, and presents the family's work in a three-up slider.
 */

import { useState } from "react";
import Image from "next/image";
import type { CollectionAsset } from "@/types/experience";
import { FamilyOverlay } from "@/components/client/tata/FamilyOverlay";

export interface AccordionSubcat {
  id: string;
  title: string;
  count: number;
  assets: CollectionAsset[];
  /** Small product-mockup cutout badged onto the sub-category chip. */
  mockup?: string;
}
export interface AccordionGroup {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  subcategories: AccordionSubcat[];
  /** Small product-mockup cutout floated in the family row. */
  mockup?: string;
}

interface OpenState {
  index: number;
  rect: { top: number; height: number };
}

export function CategoryAccordion({ groups }: { groups: AccordionGroup[] }) {
  const [open, setOpen] = useState<OpenState | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 border-t border-neutral-200 sm:grid-cols-2">
        {groups.map((group, gi) => {
          const total = group.subcategories.reduce((n, s) => n + s.count, 0);
          // 2×2 on sm+: a thin cross between the cells (top row gets the
          // horizontal line, left column the vertical line); on mobile the
          // cells stack with a divider under all but the last.
          const isTopRow = gi < 2;
          const isLeftCol = gi % 2 === 0;
          const isLastMobile = gi === groups.length - 1;
          const cell = [
            "relative border-neutral-200",
            isLastMobile ? "" : "max-sm:border-b", // stacked divider on mobile
            isTopRow ? "sm:border-b" : "", // horizontal cross line (top row)
            isLeftCol ? "sm:border-r" : "", // vertical cross line (left column)
          ].join(" ");
          return (
            <div key={group.id} className={cell}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setOpen({ index: gi, rect: { top: r.top, height: r.height } });
                }}
                className="group relative flex h-full w-full items-center gap-4 px-1 py-8 text-left outline-none transition-colors duration-500 hover:bg-neutral-50/80 focus-visible:bg-neutral-50 sm:gap-5 sm:px-7 sm:py-10"
              >
                <span
                  aria-hidden
                  className="w-9 shrink-0 text-2xl font-extralight tabular-nums text-neutral-300 transition-colors duration-500 group-hover:text-neutral-400 sm:w-12 sm:text-3xl"
                >
                  {String(gi + 1).padStart(2, "0")}
                </span>

                {group.mockup && (
                  <span aria-hidden className="relative h-11 w-11 shrink-0 sm:h-14 sm:w-14">
                    <Image
                      src={group.mockup}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </span>
                )}

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="tata-heading text-xl leading-[1.05] text-neutral-900 sm:text-2xl">
                    {group.title}
                  </span>
                  <span className="tata-body mt-1.5 line-clamp-2 max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm">
                    {group.blurb}
                  </span>
                </span>

                <span className="tata-body hidden shrink-0 text-[0.6rem] uppercase tracking-[0.1em] text-neutral-500 lg:block">
                  {total} pieces
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-xl text-neutral-400 transition-transform duration-500 group-hover:rotate-90"
                >
                  +
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <FamilyOverlay
        group={open ? groups[open.index] : null}
        rect={open?.rect ?? null}
        index={open?.index ?? 0}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
