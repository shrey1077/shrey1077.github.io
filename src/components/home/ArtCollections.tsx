"use client";

/**
 * ArtCollections — the Art room's body.
 *
 * The room opens on its collections (Painting, Craft, …), each a tile fronted
 * by its own first piece. Choosing one swaps the panel for that collection's
 * plates, with a way back. Everything sits on the painted panel, so the tiles
 * carry a hairline rather than a card.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ArtCollection } from "@/content/catalogue";
import { WorkGallery } from "@/components/client/WorkGallery";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

export function ArtCollections({ collections }: { collections: ArtCollection[] }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);

  if (collections.length === 0) return null;

  const current = collections.find((c) => c.name === open);

  if (current) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(null)}
            className={`${typeVoiceClass("logic", "meta")} group inline-flex cursor-pointer items-center gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/60 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white`}
          >
            <span aria-hidden className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
            All collections
          </button>
          <span className={`${typeVoiceClass("creative", "display")} text-lg text-white`}>
            {current.name}
          </span>
          <span className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] uppercase tracking-[0.14em] text-white/40`}>
            {current.images.length} pieces
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <WorkGallery posts={current.images} accent="#ffffff" aspect="1/1" />
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
          // Opaque plate, not a wash: the panel's ground is the paint film now,
          // and a translucent tile let high-contrast footage read straight
          // through the artwork. The gradient it used to sit on was smooth
          // enough that bleed-through never showed.
          className="group relative min-h-0 cursor-pointer overflow-hidden border border-white/25 bg-neutral-950 text-left outline-none transition-colors duration-200 hover:border-white/70 focus-visible:border-white"
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
            <span className={`${typeVoiceClass("creative", "display")} text-sm leading-tight text-white sm:text-base`}>
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
