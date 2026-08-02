"use client";

/**
 * ProfileNav — the top-right profile card.
 *
 * A large black rounded rectangle: the circular profile picture, the name
 * (sans-serif), a phone number and a row of social icons. Navigation now lives
 * in the scroll-revealed showcase, so this is a photo-forward identity card.
 *
 * The photo loads from /public/profile.jpg; until it's added, the circle falls
 * back to the monogram. PHONE and the non-Gmail social URLs are PLACEHOLDERS.
 */

import { useState } from "react";
import Image from "next/image";
import { SITE } from "@/constants/site";

/** PLACEHOLDER — replace with the real number. */
const PHONE = "+91 00000 00000";

type SocialName = "facebook" | "instagram" | "gmail" | "github" | "chess";

/** PLACEHOLDER hrefs (except Gmail) — swap in the real profiles. */
const SOCIALS: { label: string; href: string; icon: SocialName }[] = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "Gmail", href: `mailto:${SITE.email}`, icon: "gmail" },
  { label: "GitHub", href: "https://github.com/shrey1077", icon: "github" },
  { label: "Chess.com", href: "#", icon: "chess" },
];

function SocialIcon({ name, size = 34 }: { name: SocialName; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (name) {
    case "github":
      return (
        <svg {...p} fill="currentColor">
          <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...p} fill="currentColor">
          <path d="M13.2 22v-8h2.6l.4-3h-3V9c0-.9.3-1.5 1.6-1.5h1.5V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7.5v3h2.2v8h3.5z" />
        </svg>
      );
    case "gmail":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      );
    case "chess":
      return (
        <svg {...p} fill="currentColor">
          <path d="M12 2.5a2.6 2.6 0 0 0-1.9 4.4c-1.1.6-1.8 1.7-1.8 3.1h7.4c0-1.4-.7-2.5-1.8-3.1A2.6 2.6 0 0 0 12 2.5zM9 11.2c0 1.8-.7 3.5-1.6 4.8h9.2c-.9-1.3-1.6-3-1.6-4.8H9zM6.5 17.4c-.4.7-.6 1.4-.6 2.1h12.2c0-.7-.2-1.4-.6-2.1H6.5z" />
        </svg>
      );
  }
}

export function ProfileNav() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="pointer-events-auto flex items-center gap-5 rounded-3xl bg-neutral-950 p-4 text-white ring-1 ring-white/10">
      <div className="relative size-32 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
        {imgOk ? (
          <Image
            src="/profile.jpg"
            alt={SITE.name}
            fill
            sizes="128px"
            className="object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-neutral-800 text-white/35">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-8 2.6-8 6v2h16v-2c0-3.4-3-6-8-6z" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 pr-3">
        <span className="font-sans text-[30px] font-semibold leading-none tracking-tight">
          {SITE.name}
        </span>
        <span className="font-sans text-[16px] leading-tight text-white/45">{PHONE}</span>
        <div className="mt-3 flex items-center gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="text-white/55 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white"
            >
              <SocialIcon name={s.icon} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
