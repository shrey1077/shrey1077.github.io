"use client";

/**
 * UidCircles — the page's index, as one circle per project.
 *
 * A circle carries the project's number, its title and its discipline; the ring
 * is drawn in the project's own accent and fills on hover, so the row reads as
 * a set of doors rather than a list. Choosing one scrolls its section into
 * view. Micro-interaction only: colour and ring weight change, never size, so
 * nothing in the row shifts under the cursor.
 */

import type { UidProject } from "@/constants/uidExperience";
import { typeVoiceClass } from "@/constants/typography";

export function UidCircles({ projects }: { projects: UidProject[] }) {
  return (
    <nav aria-label="Projects" className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10">
      {projects.map((p, i) => (
        <a
          key={p.id}
          href={`#${p.id}`}
          className="group flex w-[7.5rem] cursor-pointer flex-col items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-4 sm:w-[8.5rem]"
        >
          <span
            aria-hidden
            className="relative grid size-24 place-items-center rounded-full border-2 transition-colors duration-200 sm:size-28"
            style={{ borderColor: p.accent }}
          >
            {/* The fill arrives behind the numeral on hover. */}
            <span
              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ backgroundColor: p.accent }}
            />
            <span
              className={`${typeVoiceClass("logic", "meta")} relative text-lg tabular-nums transition-colors duration-200 group-hover:text-white group-focus-visible:text-white`}
              style={{ color: p.accent }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </span>

          <span className="flex flex-col items-center gap-1 text-center">
            <span className="text-[0.82rem] font-semibold leading-tight text-neutral-900">
              {p.title}
            </span>
            <span
              className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] uppercase tracking-[0.14em] text-neutral-400`}
            >
              {p.kind}
            </span>
          </span>
        </a>
      ))}
    </nav>
  );
}
