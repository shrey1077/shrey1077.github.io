"use client";

/**
 * VideoWall — a dark-less video wall (framework, storyboard Scene 7).
 *
 * Posters first; one player at a time. The first (curated) film sits
 * featured at full width; the rest hold a quiet grid beneath. Choosing a
 * tile swaps its poster for a native player and returns any other tile to
 * rest. Captions are mono meta beneath each film.
 *
 * Data: a collection's `CollectionAsset[]` — videos paired with poster
 * images by shared basename (the pipeline emits `<film>.mp4` + `<film>.jpg`).
 */

import { useState } from "react";
import Image from "next/image";
import type { CollectionAsset } from "@/types/experience";
import { typeVoiceClass } from "@/constants/typography";

interface VideoWallProps {
  assets: CollectionAsset[];
}

function Tile({
  video,
  poster,
  active,
  featured,
  onPlay,
}: {
  video: CollectionAsset;
  poster?: string;
  active: boolean;
  featured: boolean;
  onPlay: () => void;
}) {
  const aspect = video.portrait ? "aspect-[9/16]" : "aspect-video";
  return (
    <figure className={featured ? "" : video.portrait ? "max-w-xs" : ""}>
      <div
        className={`relative ${aspect} overflow-hidden border border-neutral-200 bg-neutral-50`}
      >
        {active ? (
          <video
            src={video.url}
            poster={poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full bg-white object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${video.caption ?? video.name}`}
            className="group absolute inset-0 block outline-none"
          >
            {poster && (
              <Image
                src={poster}
                alt=""
                fill
                sizes={featured ? "(max-width: 1024px) 100vw, 896px" : "440px"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.015]"
              />
            )}
            <span
              className={`${typeVoiceClass("logic", "meta")} absolute bottom-3 right-3 border border-neutral-300 bg-white/90 px-2.5 py-1.5 text-[0.6rem] text-neutral-900 transition-colors duration-300 group-hover:border-neutral-900 group-focus-visible:border-neutral-900`}
            >
              Play ▸
            </span>
          </button>
        )}
      </div>
      <figcaption
        className={`${typeVoiceClass("logic", "meta")} mt-2.5 text-[0.6rem] leading-relaxed text-neutral-400`}
      >
        {video.caption ?? video.name}
      </figcaption>
    </figure>
  );
}

export function VideoWall({ assets }: VideoWallProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const videos = assets.filter((a) => a.kind === "video");
  const posterFor = (video: CollectionAsset) =>
    assets.find((a) => a.kind === "image" && a.name === video.name)?.url;

  if (videos.length === 0) return null;

  const [featured, ...rest] = videos;

  return (
    <div className="flex flex-col gap-8">
      <Tile
        video={featured}
        poster={posterFor(featured)}
        active={activeUrl === featured.url}
        featured
        onPlay={() => setActiveUrl(featured.url)}
      />
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {rest.map((video) => (
            <Tile
              key={video.url}
              video={video}
              poster={posterFor(video)}
              active={activeUrl === video.url}
              featured={false}
              onPlay={() => setActiveUrl(video.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
