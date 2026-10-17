"use client";

/**
 * AzothPosts — a brand's whole social system, every post on the page at once
 * (owner, 2026-10-16: "show all my posts"; 2026-10-17: "display all my posts
 * as currently visible").
 *
 * Laid out so no row is left half-empty: on a wide screen as many across as
 * divides the set into full rows (18 → six, 14 → seven); narrower, two or
 * three across with any last short row centred. Square-cornered hairline
 * frames, the page's rule. A post opens large in the shared viewer, which
 * walks the whole set.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";

/** The columns that leave the fewest empty places, five to seven preferred. */
function fullRows(n: number) {
  let best = 6;
  let waste = Infinity;
  for (const c of [6, 5, 7, 4]) {
    const w = (c - (n % c)) % c;
    if (w < waste) {
      best = c;
      waste = w;
    }
  }
  return best;
}

export function AzothPosts({ posts, brand, accent }: { posts: string[]; brand: string; accent: string }) {
  const reduced = useReducedMotion();
  const [at, setAt] = useState<number | null>(null);
  if (posts.length === 0) return null;
  const n = posts.length;
  const name = (i: number) => `${brand} — post ${i + 1} of ${n}`;

  return (
    <>
      <ul
        className="flex flex-wrap justify-center gap-[var(--g)] [--c:2] [--g:0.625rem] sm:[--c:3] sm:[--g:1rem] lg:[--c:var(--c-lg)]"
        style={{ ["--c-lg" as string]: fullRows(n) }}
      >
        {posts.map((src, i) => (
          <motion.li
            key={src}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 6) * 0.04 }}
            className="shrink-0 grow-0 basis-[calc((100%-(var(--c)-1)*var(--g))/var(--c))]"
          >
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={`${name(i)} — open large`}
              className="group relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 outline-none ring-1 ring-[#283078]/10 transition-shadow duration-300 hover:ring-[#283078]/30 focus-visible:ring-2 focus-visible:ring-[#28A898] focus-visible:ring-offset-2"
            >
              <Image
                src={src}
                alt={name(i)}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 31vw, 48vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              {/* The brand's colour, a hairline at the foot, under the pointer. */}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" style={{ backgroundColor: accent }} />
            </button>
          </motion.li>
        ))}
      </ul>
      <MediaViewer
        asset={at === null ? null : { name: name(at), url: posts[at], kind: "image" }}
        onClose={() => setAt(null)}
        onPrev={() => setAt((v) => (v === null ? v : (v - 1 + n) % n))}
        onNext={() => setAt((v) => (v === null ? v : (v + 1) % n))}
        position={at === null ? undefined : { at: at + 1, of: n }}
      />
    </>
  );
}
