"use client";

/**
 * PublicationShelf — the Publications room's body.
 *
 * The other creative rooms open on artwork, where a plate IS the content. A
 * document is not: its cover tells you almost nothing, and nine identical
 * scanned covers on a dark ground tell you less. So this room leads with the
 * words — kind, year, title — and treats the cover as a spine beside them,
 * narrow and cropped, the way a shelf actually presents a book.
 *
 * Every entry links out of the panel: the documents to their reader at
 * `/publications/<slug>`, and the NewsMobile bylines to the client page they
 * live on, which is why an entry may carry `href` instead of a slug.
 *
 * ⚠ Covers come from the caller, not from `pages[0]` here — this is a client
 * component and cannot touch `node:fs`. An entry with no cover (the text
 * pieces) draws a typographic spine in its own accent instead of a gap.
 */

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Publication } from "@/constants/publications";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

export function PublicationShelf({
  publications,
  covers,
}: {
  publications: readonly Publication[];
  /** slug → first page's URL. Absent for the text-only entries. */
  covers: Record<string, string | undefined>;
}) {
  const reduceMotion = useReducedMotion();

  if (publications.length === 0) return null;

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {publications.map((pub, i) => {
          const cover = covers[pub.slug];
          return (
            <motion.li
              key={pub.slug}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0.2 : 0.45,
                delay: reduceMotion ? 0 : Math.min(i * 0.045, 0.3),
                ease: EASE_OUT,
              }}
            >
              <Link
                href={pub.href ?? `/publications/${pub.slug}`}
                className="group flex h-full items-stretch gap-4 rounded-xl border border-white/12 bg-white/[0.04] p-3 outline-none transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.08] focus-visible:border-white/40"
              >
                {/* The spine. Fixed width, cropped tall — a cover shown whole at
                    this size is unreadable anyway, and a consistent block keeps
                    the rows aligned however varied the page shapes are. */}
                <span
                  className="relative block w-16 shrink-0 overflow-hidden rounded-md sm:w-[4.5rem]"
                  style={{ backgroundColor: cover ? undefined : pub.accent }}
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    /* The year, NOT the kind. A cover-less spine drawn with
                       `kind` reads as a stutter against the meta line directly
                       beside it — "Blog entryBlog entry · 2019". The year is
                       the one fact the row does not already repeat. */
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center px-1 text-center text-[0.66rem] font-semibold uppercase leading-tight tracking-[0.08em] text-white/90"
                    >
                      {pub.year}
                    </span>
                  )}
                </span>

                <span className="flex min-w-0 flex-1 flex-col justify-center py-1">
                  <span className={`${META} block text-white/45`}>
                    {pub.kind} · {pub.year}
                  </span>
                  <span className="font-graff mt-1 block text-[0.98rem] font-bold leading-tight text-white">
                    {pub.title}
                  </span>
                  {pub.subtitle && (
                    <span className="font-helv mt-1 block truncate text-[0.7rem] leading-snug text-white/55">
                      {pub.subtitle}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="mt-2 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-14"
                    style={{ backgroundColor: pub.accent }}
                  />
                </span>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
