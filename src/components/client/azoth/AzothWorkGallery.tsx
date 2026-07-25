"use client";

/**
 * AzothWorkGallery — a responsive grid of a brand's social posts. Posts are
 * portrait; choosing one opens it in the shared MediaViewer lightbox. Quiet
 * hairline frames, a soft lift on hover — the work does the talking.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ContentAsset } from "@/content/catalogue";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";

export function AzothWorkGallery({ posts, accent }: { posts: string[]; accent: string }) {
  const reduced = useReducedMotion();
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  if (posts.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {posts.map((url, i) => (
          <motion.button
            key={url}
            type="button"
            onClick={() => setViewing({ name: `Post ${i + 1}`, url, kind: "image" })}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 4) * 0.05 }}
            className="group relative aspect-[4/5] overflow-hidden border border-neutral-200 bg-neutral-50 outline-none transition-colors duration-300 hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ ["--tw-ring-color" as string]: `${accent}66` }}
          >
            <Image
              src={url}
              alt={`Social post ${i + 1}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </motion.button>
        ))}
      </div>

      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
