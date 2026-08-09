/**
 * ExperienceLayout — the page shell every experience renders inside.
 *
 * Owns the frame (page surface, gutters, max width), the way back (the quiet
 * Back link at top), the way onward (FooterNavigation between memories at the
 * bottom), and the arrival gesture (children render inside
 * ExperienceTransition — the future memory-dive orchestrator, a calm settle
 * today).
 *
 * Server Component; the transition wrapper carries the client boundary.
 */

import Link from "next/link";
import { ExperienceTransition } from "@/components/transition/ExperienceTransition";
import { FooterNavigation } from "@/components/experience/FooterNavigation";
import { typeVoiceClass } from "@/constants/typography";

interface ExperienceLayoutProps {
  /** Where Back leads (default: the mind — the homepage). */
  backHref?: string;
  backLabel?: string;
  /** Enables prev/next memory navigation when the experience is a client. */
  currentSlug?: string;
  children: React.ReactNode;
}

export function ExperienceLayout({
  backHref = "/",
  backLabel = "Back",
  currentSlug,
  children,
}: ExperienceLayoutProps) {
  return (
    <main className="min-h-dvh w-full bg-gallery px-6 py-14 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href={backHref}
          className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 text-[0.65rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
        >
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          {backLabel}
        </Link>

        <ExperienceTransition>
          {children}
          {currentSlug && <FooterNavigation currentSlug={currentSlug} />}
        </ExperienceTransition>
      </div>
    </main>
  );
}
