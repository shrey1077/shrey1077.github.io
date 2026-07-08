/**
 * Clients index — `/clients`.
 *
 * The permanent, linkable home of the full client list (the homepage preview
 * pane shows the same grid in-context). Server Component; reuses the same
 * data-driven ClientCard grid.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { CLIENTS } from "@/constants/clients";
import { navSectionById } from "@/constants/navigation";
import { ClientCard } from "@/components/preview/ClientCard";
import { typeVoiceClass } from "@/constants/typography";

export const metadata: Metadata = { title: "Clients — Shrey Singh" };

export default function ClientsIndexPage() {
  const section = navSectionById("clients");

  return (
    <main className="min-h-dvh w-full bg-neutral-50 px-6 py-14 sm:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 text-[0.65rem] text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
        >
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          Back
        </Link>

        <header className="mt-10 max-w-xl">
          <h1
            className={`${typeVoiceClass("logic", "display")} text-3xl font-medium text-neutral-900 sm:text-4xl`}
          >
            Clients
          </h1>
          {section && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              {section.description}
            </p>
          )}
        </header>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
          {CLIENTS.map((client) => (
            <ClientCard key={client.slug} client={client} />
          ))}
        </div>
      </div>
    </main>
  );
}
