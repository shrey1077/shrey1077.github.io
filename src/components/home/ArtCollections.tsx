"use client";

/**
 * ArtCollections — the Art room's body.
 *
 * The room opens on its collections (Painting, Craft, …), each a tile fronted
 * by its own first piece. Choosing one swaps the panel for that collection's
 * plates, with a way back. Everything sits on the painted panel, so the tiles
 * carry a hairline rather than a card.
 *
 * Collection names are set in Juturu bold — the creative hemisphere's face —
 * rather than the `creative` typography voice, which resolves to Fraunces and
 * belongs to the older three-voice constitution. This room hangs off the
 * landing, so it follows the landing's faces. The counts and the back control
 * still take their `logic` voice from there.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ArtCollection } from "@/content/catalogue";
import { WorkGallery } from "@/components/client/WorkGallery";
import { EASE_OUT } from "@/constants/motion";
import { PAPER_PLATE_TIGHT } from "@/constants/design";
import { typeVoiceClass } from "@/constants/typography";

export function ArtCollections({ collections }: { collections: ArtCollection[] }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);

  if (collections.length === 0) return null;

  const current = collections.find((c) => c.name === open);

  if (current) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        {/* The row of controls on its own paper plate. `w-fit` so it hugs
            the controls rather than banding the panel. */}
        <div className={`flex w-fit shrink-0 items-center gap-4 ${PAPER_PLATE_TIGHT} px-4 py-2.5`}>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className={`${typeVoiceClass("logic", "meta")} group inline-flex cursor-pointer items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500 outline-none transition-colors duration-200 hover:text-neutral-900 focus-visible:text-neutral-900`}
          >
            <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
            All collections
          </button>
          <span className="font-graff text-lg font-bold text-neutral-900">
            {current.name}
          </span>
          <span className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] uppercase tracking-[0.14em] text-neutral-500`}>
            {current.images.length} pieces
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <WorkGallery posts={current.images} accent="#171717" aspect="1/1" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {collections.map((c, i) => (
        <motion.button
          key={c.name}
          type="button"
          onClick={() => setOpen(c.name)}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.1 + i * 0.07 }}
          // A dark tile on the light ground — the work is the picture, and
          // the caption needs the dark gradient under it either way.
          className="group relative min-h-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-950 text-left shadow-[0_8px_24px_-14px_rgba(0,0,0,0.5)] outline-none ring-1 ring-neutral-200 transition-shadow duration-200 hover:shadow-[0_14px_34px_-14px_rgba(0,0,0,0.55)] focus-visible:ring-2 focus-visible:ring-neutral-900/50"
        >
          <Image
            src={c.images[0]}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, 45vw"
            className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3">
            <span className="font-graff text-sm font-bold leading-tight text-white sm:text-base">
              {c.name}
            </span>
            <span className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] uppercase tracking-[0.14em] text-white/70`}>
              {c.images.length} pieces
            </span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
