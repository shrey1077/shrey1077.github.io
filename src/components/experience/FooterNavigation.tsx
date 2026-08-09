/**
 * FooterNavigation — the "next memory" navigation at the end of an experience.
 *
 * Instead of dead-ending, every client experience closes with quiet previous/
 * next links through the client list (wrapping), so the visitor drifts from
 * memory to memory without surfacing. Data-driven from `CLIENTS` order.
 */

import Link from "next/link";
import { CLIENTS } from "@/constants/clients";
import { typeVoiceClass } from "@/constants/typography";

const META = typeVoiceClass("logic", "meta");

interface FooterNavigationProps {
  /** The experience currently being viewed. */
  currentSlug: string;
}

export function FooterNavigation({ currentSlug }: FooterNavigationProps) {
  const index = CLIENTS.findIndex((c) => c.slug === currentSlug);
  if (index === -1 || CLIENTS.length < 2) return null;

  const prev = CLIENTS[(index - 1 + CLIENTS.length) % CLIENTS.length];
  const next = CLIENTS[(index + 1) % CLIENTS.length];

  return (
    <nav
      aria-label="Between memories"
      className="flex items-center justify-between gap-6 border-t border-neutral-200 py-10"
    >
      <Link
        href={`/clients/${prev.slug}`}
        className="group flex flex-col gap-2 outline-none"
      >
        <span className={`${META} text-[0.6rem] text-neutral-500`}>
          <span
            aria-hidden
            className="mr-1.5 inline-block transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          Previous
        </span>
        <span
          className={`${typeVoiceClass("creative", "display")} text-lg text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900 group-focus-visible:text-neutral-900`}
        >
          {prev.name}
        </span>
      </Link>

      <Link
        href={`/clients/${next.slug}`}
        className="group flex flex-col items-end gap-2 text-right outline-none"
      >
        <span className={`${META} text-[0.6rem] text-neutral-500`}>
          Next
          <span
            aria-hidden
            className="ml-1.5 inline-block transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
        <span
          className={`${typeVoiceClass("creative", "display")} text-lg text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900 group-focus-visible:text-neutral-900`}
        >
          {next.name}
        </span>
      </Link>
    </nav>
  );
}
