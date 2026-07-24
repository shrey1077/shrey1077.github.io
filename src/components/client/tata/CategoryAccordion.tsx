"use client";

/**
 * CategoryAccordion — the four families of the Tata IIS work, as full-width
 * rows that open on click.
 *
 * Collapsed: four equal rows (Brand & Logo Guidelines · Print Media · Digital
 * Graphics · Photography), each a full-bleed band with an oversized index, a
 * title, and a piece count. Clicking a row expands it (one at a time) to reveal
 * its sub-categories as a quiet chip row; choosing a sub-category unfurls its
 * looped 7-frame PortraitSlider beneath. A second click on the open row closes
 * it. Everything animates with the house EASE_OUT — no bounce.
 */

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CollectionAsset } from "@/types/experience";
import { PortraitSlider } from "@/components/client/tata/PortraitSlider";
import { EASE_OUT } from "@/constants/motion";

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

export function CategoryAccordion({ groups }: { groups: AccordionGroup[] }) {
  const reducedMotion = useReducedMotion();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<Record<string, string>>({});

  return (
    <ul className="border-t border-neutral-200">
      {groups.map((group, gi) => {
        const isOpen = openGroup === group.id;
        const activeSub =
          openSub[group.id] ?? group.subcategories[0]?.id ?? "";
        const sub =
          group.subcategories.find((s) => s.id === activeSub) ??
          group.subcategories[0];
        const total = group.subcategories.reduce((n, s) => n + s.count, 0);

        return (
          <li key={group.id} className="border-b border-neutral-200">
            {/* The row header. */}
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.id)}
              aria-expanded={isOpen}
              className="group relative flex w-full items-center gap-4 px-1 py-9 text-left outline-none transition-colors duration-500 hover:bg-neutral-50/80 focus-visible:bg-neutral-50 sm:gap-6 sm:py-11"
            >
              <span
                aria-hidden
                className="w-9 shrink-0 text-2xl font-extralight tabular-nums sm:w-14 sm:text-3xl"
                style={{ color: isOpen ? group.accent : "#d4d4d4" }}
              >
                {String(gi + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
                {group.mockup && (
                  <span
                    aria-hidden
                    className="relative h-11 w-11 shrink-0 sm:h-16 sm:w-16"
                  >
                    <Image
                      src={group.mockup}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </span>
                )}
                <span className="tata-heading min-w-0 text-2xl text-neutral-900 sm:text-4xl">
                  {group.title}
                </span>
              </span>
              <span className="tata-body hidden max-w-xs flex-1 text-sm leading-relaxed text-neutral-500 lg:block">
                {group.blurb}
              </span>
              <span className="tata-body shrink-0 text-[0.62rem] uppercase tracking-[0.1em] text-neutral-500">
                {total} pieces
              </span>
              <span
                aria-hidden
                className="shrink-0 text-xl text-neutral-400 transition-transform duration-500"
                style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
              >
                +
              </span>
            </button>

            {/* The expanded body. */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="px-1 pb-14 pt-2">
                    {/* Sub-category chips. */}
                    <div className="mb-10 flex flex-wrap gap-2.5">
                      {group.subcategories.map((s) => {
                        const on = s.id === activeSub;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setOpenSub((m) => ({ ...m, [group.id]: s.id }))
                            }
                            className={`tata-subhead inline-flex items-center gap-2 rounded-full border py-1.5 pr-4 text-[0.62rem] uppercase tracking-[0.08em] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40 ${
                              s.mockup ? "pl-1.5" : "pl-4"
                            } ${
                              on
                                ? "border-transparent text-white"
                                : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
                            }`}
                            style={on ? { backgroundColor: group.accent } : undefined}
                          >
                            {s.mockup && (
                              <span
                                aria-hidden
                                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                              >
                                <span className="relative h-[18px] w-[18px]">
                                  <Image
                                    src={s.mockup}
                                    alt=""
                                    fill
                                    sizes="24px"
                                    className="object-contain"
                                  />
                                </span>
                              </span>
                            )}
                            {s.title}
                            <span className="opacity-60">{s.count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* The active sub-category's portrait slider. */}
                    {sub && (
                      <motion.div
                        key={sub.id}
                        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                      >
                        <PortraitSlider assets={sub.assets} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
