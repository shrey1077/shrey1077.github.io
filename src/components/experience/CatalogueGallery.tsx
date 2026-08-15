"use client";

/**
 * CatalogueGallery — a category page's image gallery, viewer-wired.
 *
 * The immersive step past AssetGrid for catalogue routes: artifacts sit as
 * contained plates on the quiet sheet with their captions beneath; choosing
 * one opens it in the white MediaViewer. Client component only for the
 * viewing state — data arrives from the server route.
 *
 * Robustness: the first row is eager + priority (never lazy behind a reveal),
 * so a category page can't land on blank space while images defer. The plates
 * keep a shared 4:3 window (contain) so wildly different artifacts — tall
 * posters, wide billboards — read as one honest wall rather than uniform
 * portrait slots that turn a landscape into a thin strip.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ContentAsset } from "@/content/catalogue";
import type { CollectionAsset } from "@/types/experience";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { typeVoiceClass } from "@/constants/typography";

/** Curation discipline: a section shows at most seven artifacts. The meta's
 *  caption order decides WHICH seven (readCatalogueCategory sorts by it). */
const MAX_VISIBLE = 7;
/** How many load eagerly (above the fold on a category page). */
const EAGER = 3;

interface CatalogueGalleryProps {
  assets: CollectionAsset[];
  /** Overrides MAX_VISIBLE — see the `maxVisible` note in catalogue.ts. */
  maxVisible?: number;
  /** Keeps every asset and reveals them this many at a time as the reader
   *  reaches the end. Overrides `maxVisible` when set. */
  revealStep?: number;
  /** false drops the caption line under each plate. */
  showCaptions?: boolean;
}

export function CatalogueGallery({
  assets,
  maxVisible = MAX_VISIBLE,
  revealStep,
  showCaptions = true,
}: CatalogueGalleryProps) {
  // Index rather than the asset itself, so the viewer can walk the set.
  const [at, setAt] = useState<number | null>(null);
  const [shown, setShown] = useState(revealStep ?? Number.MAX_SAFE_INTEGER);
  const sentinel = useRef<HTMLDivElement>(null);

  // `images` is the WHOLE collection when revealStep is set — the cap only
  // applies to curated selections. `visible` is the scroll window over it, and
  // the viewer walks `images`, so opening the last plate and pressing Next
  // continues into pages the grid has not drawn yet.
  const images = assets
    .filter((a) => a.kind === "image")
    .slice(0, revealStep ? undefined : maxVisible);
  const visible = images.slice(0, shown);
  const more = visible.length < images.length;

  // Reveal the next batch when the end of the grid comes into view. The
  // observer's callback is not effect-body state, which this repo lints as an
  // error — it fires from the browser, the way a resize handler does.
  useEffect(() => {
    if (!more) return;
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown((n) => Math.min(n + (revealStep ?? 9), images.length));
        }
      },
      // Deliberately small. At 400px the tripwire was already inside the
      // viewport on first paint — three rows are shorter than that — so the
      // second batch arrived before the reader had scrolled at all, and
      // eighteen plates rendered where nine were asked for.
      { rootMargin: "100px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [more, revealStep, images.length]);

  if (images.length === 0) return null;

  const viewing = at === null ? null : (images[at] as ContentAsset);
  const step = (d: number) =>
    setAt((i) => (i === null ? i : (i + d + images.length) % images.length));

  return (
    <div>
      {/* Three across from `sm` up — the deck rooms are built as 3x3. */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
        {visible.map((image, i) => (
          <li key={image.url}>
            <button
              type="button"
              onClick={() => setAt(i)}
              aria-label={`View ${image.caption ?? image.name}`}
              className="group block w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/50 focus-visible:ring-offset-2"
            >
              <span className="relative block aspect-[4/3] overflow-hidden border border-neutral-200 bg-neutral-50 transition-colors duration-300 group-hover:border-neutral-500 group-focus-visible:border-neutral-900">
                <Image
                  src={image.url}
                  alt={image.caption ?? image.name}
                  fill
                  priority={i < EAGER}
                  loading={i < EAGER ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 50vw, 320px"
                  className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </span>
              {showCaptions && image.caption && (
                <span
                  className={`${typeVoiceClass("logic", "meta")} mt-2 block text-left text-[0.6rem] leading-relaxed text-neutral-500 transition-colors duration-300 group-hover:text-neutral-800`}
                >
                  {image.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* The tripwire — the next batch arrives when this reaches the fold. */}
      {more && (
        <div ref={sentinel} aria-hidden className="h-px w-full" />
      )}
      {revealStep && (
        <p
          className={`${typeVoiceClass("logic", "meta")} mt-8 text-center text-[0.55rem] tabular-nums text-neutral-400`}
          aria-live="polite"
        >
          {visible.length} / {images.length}
        </p>
      )}

      <MediaViewer
        asset={viewing}
        onClose={() => setAt(null)}
        // Only a set worth walking gets arrows; a single plate stays a lightbox.
        onPrev={images.length > 1 ? () => step(-1) : undefined}
        onNext={images.length > 1 ? () => step(1) : undefined}
        position={at === null ? undefined : { at: at + 1, of: images.length }}
      />
    </div>
  );
}
