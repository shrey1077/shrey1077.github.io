"use client";

/**
 * CreativeIcons — the marks in the white circles of the right-hand pins
 * (2026-10-03, owner: "colourful icons for the right side sections, in the
 * white circles before the section names").
 *
 * Drawn, not generated: the circle is ~22px across at the pins' size, where a
 * raster illustration turns to mush and a bold vector glyph still reads. Each
 * is filled from the site's paint palette (globals' `.brain-paint` stops) so
 * they belong to the splashes around them rather than to an icon set.
 *
 *   Art                    a paint palette with four colour dots
 *   Publications           an open book, warm page and cool page
 *   The Extincts Project   a rainbow feather — the birds the world lost
 *   AI Generations & Ideas the sparkles that have come to mean "AI"
 *   AI Videos              a play mark in the paint, with the AI sparkle
 *                          (2026-10-10 — the right side's first room now)
 *
 * Gradient ids come from useId, so several icons on one page never collide.
 */

import { useId } from "react";
import type { NavSectionId } from "@/types/navigation";

const P = {
  pink: "#ff2e8b",
  coral: "#ff5a3c",
  orange: "#ff8a00",
  yellow: "#f5c518",
  green: "#7fbf2e",
  teal: "#00a6a6",
  blue: "#3f6ad8",
  purple: "#7a3fb0",
} as const;

function Art({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}a`} x1="3" y1="3" x2="20" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.yellow} />
          <stop offset="1" stopColor={P.orange} />
        </linearGradient>
      </defs>
      <path
        d="M12 3C7 3 3 6.6 3 11.2c0 4 3.1 7.3 7.1 7.3 1.3 0 1.9-.8 1.9-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.7 1.8-1.7h2.1c2.8 0 5.1-2.2 5.1-5C20 5.9 16.5 3 12 3z"
        fill={`url(#${id}a)`}
      />
      <circle cx="7.4" cy="10.6" r="1.6" fill={P.pink} />
      <circle cx="9.6" cy="6.8" r="1.45" fill={P.teal} />
      <circle cx="14" cy="6.3" r="1.45" fill={P.blue} />
      <circle cx="16.9" cy="9.4" r="1.45" fill={P.purple} />
    </>
  );
}

function Publications({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}l`} x1="3" y1="5" x2="11" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.pink} />
          <stop offset="1" stopColor={P.orange} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="13" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.teal} />
          <stop offset="1" stopColor={P.blue} />
        </linearGradient>
      </defs>
      <path d="M2.8 5.3c2.7-1 6-.8 8.6 1v13c-2.6-1.6-5.9-1.8-8.6-.9z" fill={`url(#${id}l)`} />
      <path d="M12.6 6.3c2.6-1.8 5.9-2 8.6-1v13.1c-2.7-.9-6-.7-8.6.9z" fill={`url(#${id}r)`} />
      <g stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.85">
        <path d="M5 8.4c1.5-.2 3 0 4.3.6M5 11.1c1.5-.2 3 0 4.3.6M5 13.8c1.5-.2 3 0 4.3.6" />
        <path d="M14.7 9c1.3-.6 2.8-.8 4.3-.6M14.7 11.7c1.3-.6 2.8-.8 4.3-.6M14.7 14.4c1.3-.6 2.8-.8 4.3-.6" />
      </g>
    </>
  );
}

function Extincts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="20" y1="4" x2="7" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.green} />
          <stop offset="0.45" stopColor={P.teal} />
          <stop offset="1" stopColor={P.purple} />
        </linearGradient>
      </defs>
      <path d="M20.4 3.6C13.6 4 7.8 8.8 6.3 15.8l2.4 2.4c7.1-1.5 11.8-7.4 11.7-14.6z" fill={`url(#${id}f)`} />
      {/* Notches in the vane, so it reads as a feather, not a leaf. */}
      <g stroke="#fff" strokeWidth="1" strokeLinecap="round">
        <path d="M14.6 7.4l1.6 1.4M11.6 10.6l1.6 1.4" />
      </g>
      <path d="M3.4 20.6L17.6 6.4" stroke={P.purple} strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

function AiGenerations({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}s`} x1="3" y1="4" x2="17" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.pink} />
          <stop offset="0.55" stopColor={P.purple} />
          <stop offset="1" stopColor={P.blue} />
        </linearGradient>
      </defs>
      <path d="M10 3.6c.6 4.7 2.4 6.5 7.1 7.1-4.7.6-6.5 2.4-7.1 7.1-.6-4.7-2.4-6.5-7.1-7.1 4.7-.6 6.5-2.4 7.1-7.1z" fill={`url(#${id}s)`} />
      <path d="M18.4 2.6c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3z" fill={P.orange} />
      <circle cx="18.6" cy="17.6" r="1.5" fill={P.teal} />
    </>
  );
}

/** AI Videos (2026-10-10): a play mark in the paint, the AI sparkle on it. */
function AiVideos({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}v`} x1="4" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.coral} />
          <stop offset="0.5" stopColor={P.pink} />
          <stop offset="1" stopColor={P.purple} />
        </linearGradient>
      </defs>
      <path d="M6.2 4.6c0-1.1 1.2-1.8 2.2-1.2l10.7 6.6c.9.6.9 1.9 0 2.5L8.4 19.1c-1 .6-2.2-.1-2.2-1.2V4.6z" fill={`url(#${id}v)`} />
      <path d="M19.2 15.2c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8z" fill={P.yellow} />
      <circle cx="3.6" cy="19.6" r="1.3" fill={P.teal} />
    </>
  );
}

/** AI Agents (2026-10-26): a hub and three nodes on its lines — the tree. */
function AiAgents({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}g`} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.teal} />
          <stop offset="1" stopColor={P.blue} />
        </linearGradient>
      </defs>
      <path d="M8 12c3.5 0 4-6.5 8.4-6.5M8 12h8.4M8 12c3.5 0 4 6.5 8.4 6.5" stroke={`url(#${id}g)`} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="6" cy="12" r="3.4" fill={`url(#${id}g)`} />
      <circle cx="18.2" cy="5.5" r="2.3" fill={P.pink} />
      <circle cx="18.6" cy="12" r="2.3" fill={P.orange} />
      <circle cx="18.2" cy="18.5" r="2.3" fill="none" stroke={P.purple} strokeWidth="1.3" strokeDasharray="1.6 1.4" />
    </>
  );
}

/** AI Apps (2026-10-26): an app window, the AI sparkle in it. */
function AiApps({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}w`} x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.blue} />
          <stop offset="1" stopColor={P.purple} />
        </linearGradient>
      </defs>
      <rect x="2.6" y="4" width="18.8" height="15.6" rx="2.6" fill={`url(#${id}w)`} />
      <rect x="2.6" y="4" width="18.8" height="4" rx="2" fill={P.pink} />
      <circle cx="5.2" cy="6" r="0.8" fill="#fff" />
      <circle cx="7.6" cy="6" r="0.8" fill="#fff" />
      <path d="M12 9.8c.4 2.4 1.3 3.3 3.7 3.7-2.4.4-3.3 1.3-3.7 3.7-.4-2.4-1.3-3.3-3.7-3.7 2.4-.4 3.3-1.3 3.7-3.7z" fill={P.yellow} />
    </>
  );
}

/** Personal Projects (2026-10-26): three cards fanned — the three tabs. */
function PersonalProjects({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}p`} x1="6" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={P.orange} />
          <stop offset="1" stopColor={P.pink} />
        </linearGradient>
      </defs>
      <rect x="3" y="7.5" width="11" height="13" rx="1.8" transform="rotate(-12 8.5 14)" fill={P.green} />
      <rect x="6.5" y="5" width="11" height="13" rx="1.8" fill={P.teal} />
      <rect x="10" y="3" width="11" height="13" rx="1.8" transform="rotate(10 15.5 9.5)" fill={`url(#${id}p)`} />
    </>
  );
}

const ICONS: Partial<Record<NavSectionId, (p: { id: string }) => React.ReactElement>> = {
  "ai-videos": AiVideos,
  "ai-agents": AiAgents,
  "ai-apps": AiApps,
  "personal-projects": PersonalProjects,
  art: Art,
  publications: Publications,
  "the-extincts-project": Extincts,
  "ai-generations": AiGenerations,
};

export function hasCreativeIcon(section: NavSectionId): boolean {
  return section in ICONS;
}

export function CreativeIcon({ section, className = "" }: { section: NavSectionId; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const Icon = ICONS[section];
  if (!Icon) return null;
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <Icon id={uid} />
    </svg>
  );
}
