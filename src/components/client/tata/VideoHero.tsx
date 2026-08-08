"use client";

/**
 * VideoHero — the 16:9 opening film of the Tata IIS experience.
 *
 * Plays once on first load and freezes on its last frame (no loop, no
 * controls chrome beyond a quiet mute toggle). Until the real hero film is
 * uploaded, a branded 16:9 placeholder (the wordmark poster) stands in with a
 * "film forthcoming" note — drop an mp4 at `src` and it takes over untouched.
 *
 * Autoplay needs muted; a small control lets the viewer unmute and replay.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { typeVoiceClass } from "@/constants/typography";

interface VideoHeroProps {
  /** The hero film. Absent → branded placeholder. */
  src?: string;
  /** 16:9 poster / placeholder still. */
  poster: string;
}

export function VideoHero({ src, poster }: VideoHeroProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (src) ref.current?.play?.().catch(() => {});
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-neutral-100">
      {src ? (
        <>
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted={muted}
            autoPlay
            playsInline
            onEnded={() => setEnded(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {ended && (
              <button
                type="button"
                onClick={() => {
                  const v = ref.current;
                  if (!v) return;
                  v.currentTime = 0;
                  setEnded(false);
                  v.play().catch(() => {});
                }}
                className={`${typeVoiceClass("logic", "meta")} rounded border border-white/40 bg-black/40 px-2.5 py-1.5 text-[0.6rem] text-white backdrop-blur transition-colors hover:border-white`}
              >
                Replay ↺
              </button>
            )}
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className={`${typeVoiceClass("logic", "meta")} rounded border border-white/40 bg-black/40 px-2.5 py-1.5 text-[0.6rem] text-white backdrop-blur transition-colors hover:border-white`}
            >
              {muted ? "Sound ►" : "Muted ►"}
            </button>
          </div>
        </>
      ) : (
        <>
          <Image
            src={poster}
            alt="Tata IIS"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
          <span
            className={`${typeVoiceClass("logic", "meta")} absolute bottom-4 right-4 rounded border border-neutral-300 bg-white/80 px-2.5 py-1.5 text-[0.6rem] text-neutral-500 backdrop-blur`}
          >
            Hero film — forthcoming
          </span>
        </>
      )}
    </div>
  );
}
