"use client";

/**
 * AzothStrip — a brand's social posts as one strip, side by side, that
 * scrolls sideways (2026-10-06). It replaced WorkGallery's grid on this page:
 * eighteen 4:5 posts in a grid were four rows — over a screen of scrolling
 * for one brand — where a strip is a single row you swipe, drag-scroll or
 * step with the arrows. Any post opens full size and walks the rest.
 *
 * Square corners and a hairline, like every plate on the page: the lab's
 * precision, not a card deck.
 */

import { useRef, useState } from "react";
import Image from "next/image";
import { MediaViewer } from "@/components/experience/MediaViewer";

export function AzothStrip({
  posts,
  label,
  accent,
}: {
  posts: readonly string[];
  /** The brand — said in the viewer and to a screen reader. */
  label: string;
  /** The brand's own colour, on the arrows and the count. */
  accent: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const n = posts.length;
  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + n) % n));
  /** A page of the strip — most of what is in view. */
  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="az-mono text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
          The social system <span style={{ color: accent }}>· {n} posts</span>
        </p>
        <div className="flex gap-1.5">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => page(dir)}
              aria-label={dir < 0 ? "Earlier posts" : "Later posts"}
              className="grid size-8 cursor-pointer place-items-center border border-neutral-300 text-sm text-neutral-600 outline-none transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-[#28A898]"
            >
              {dir < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={track}
        aria-label={`${label} — social posts`}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]"
      >
        {posts.map((src, i) => (
          <li key={src} className="w-[min(46vw,13.5rem)] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`${label}, post ${i + 1} of ${n} — open full size`}
              className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-neutral-100 outline-none ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-[#28A898]"
            >
              <Image
                src={src}
                alt={`${label}, post ${i + 1}`}
                fill
                sizes="216px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      <MediaViewer
        asset={open === null ? null : { name: `${label} — post ${open + 1}`, url: posts[open], kind: "image" }}
        onClose={() => setOpen(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        position={open !== null ? { at: open + 1, of: n } : undefined}
      />
    </div>
  );
}
