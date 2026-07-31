"use client";

/**
 * CaseGallery — the plate grid for a categorised case study.
 *
 * Unlike WorkGallery (uniform portrait social posts, cover-cropped), a case
 * study's plates are wildly mixed in shape — a wordmark, a wide banner, a tall
 * infographic, a square render. So this lays them out as a natural-aspect
 * masonry: every plate shown whole, never cropped, in curated order. Choosing
 * one opens it large in the shared MediaViewer.
 *
 * A lone plate gets the full column; everything else flows two-up.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ContentAsset } from "@/content/catalogue";
import type { CasePlate } from "@/types/caseStudy";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";

export function CaseGallery({
  plates,
  accent,
}: {
  plates: CasePlate[];
  accent: string;
}) {
  const reduced = useReducedMotion();
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  if (plates.length === 0) return null;

  const single = plates.length === 1;

  return (
    <>
      <div
        className={
          single
            ? "mx-auto max-w-2xl"
            : "gap-4 [column-fill:_balance] sm:columns-2"
        }
      >
        {plates.map((p, i) => (
          <motion.button
            key={p.url}
            type="button"
            onClick={() =>
              setViewing({ name: p.name, url: p.url, kind: "image" })
            }
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              ease: EASE_OUT,
              delay: (i % 2) * 0.06,
            }}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden border border-neutral-200 bg-white outline-none transition-colors duration-300 hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ ["--tw-ring-color" as string]: `${accent}66` }}
          >
            <Image
              src={p.url}
              alt={p.name}
              width={p.w}
              height={p.h}
              sizes={single ? "(max-width: 768px) 92vw, 42rem" : "(max-width: 640px) 92vw, 44vw"}
              className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </motion.button>
        ))}
      </div>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
