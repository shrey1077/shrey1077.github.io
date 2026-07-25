"use client";

/**
 * ClientsPreview — the Clients section body: a responsive grid of ClientCards
 * with a quiet "View all clients" link beneath (→ /clients).
 *
 * Data-driven from `CLIENTS`; each card routes to its own page. This is the only
 * fully-implemented preview body in Phase 2.x (others show ComingSoonPreview).
 */

import Link from "next/link";
import { clientsInSection } from "@/constants/clients";
import { ClientCard } from "@/components/preview/ClientCard";
import { typeVoiceClass } from "@/constants/typography";

export function ClientsPreview() {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {clientsInSection("clients").map((client) => (
          <ClientCard key={client.slug} client={client} />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/clients"
          className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 border-b border-neutral-300 pb-1 text-[0.65rem] text-neutral-500 outline-none transition-colors duration-500 hover:border-neutral-900 hover:text-neutral-900 focus-visible:border-neutral-900 focus-visible:text-neutral-900`}
        >
          View all clients
          <span
            aria-hidden
            className="inline-block transition-transform duration-500 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
