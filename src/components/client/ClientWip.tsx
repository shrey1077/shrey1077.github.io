/**
 * ClientWip — the minimal fallback page for clients WITHOUT a configured
 * experience yet (extracted unchanged from the Phase 2 route; every client
 * graduates from this to a ClientExperience by adding a config entry — see
 * docs/CLIENT_ARCHITECTURE.md).
 */

import Link from "next/link";
import type { Client } from "@/constants/clients";
import { typeVoiceClass } from "@/constants/typography";

export function ClientWip({ client }: { client: Client }) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <Link
          href="/"
          className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 text-[0.65rem] text-neutral-400 transition-colors duration-300 hover:text-neutral-900`}
        >
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          Back
        </Link>

        <div className="flex flex-1 flex-col justify-center py-20">
          <span
            className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
          >
            {client.sector}
          </span>
          <h1
            className={`${typeVoiceClass("creative", "display")} mt-4 text-4xl tracking-tight text-neutral-900 sm:text-6xl`}
          >
            {client.name}
          </h1>
          <p className="mt-6 text-lg font-light text-neutral-500">Work in Progress</p>
        </div>
      </div>
    </main>
  );
}
