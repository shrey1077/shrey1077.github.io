"use client";

/**
 * ClientCard — a reusable client tile (per the design mockup).
 *
 * A clean white card on the preview sheet: the client's mark centered (real
 * logo when `logoSrc` exists; a typographic serif mark until then) with the
 * sector as quiet mono meta beneath. The whole card is a `<Link>` to the
 * client's page. Hover: hairline darkens, card lifts a breath — nothing flashy.
 */

import Link from "next/link";
import Image from "next/image";
import type { Client } from "@/constants/clients";
import { typeVoiceClass } from "@/constants/typography";
import { useSceneStore } from "@/state/useSceneStore";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const setPendingMemory = useSceneStore((s) => s.setPendingMemory);

  /** Choosing a memory is not a page load — hand the moment to the
   *  MemoryTransitionHost (thread → brain response → veil → dive). The href
   *  stays real for middle-click/new-tab/crawlers. */
  const beginRetrieval = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (useSceneStore.getState().pendingMemory) return; // one dive at a time
    // Keyboard activation reports (0,0) — use the card's center instead.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    setPendingMemory({ slug: client.slug, x, y });
  };

  return (
    <Link
      href={`/clients/${client.slug}`}
      onClick={beginRetrieval}
      className={[
        "group flex aspect-[4/5] flex-col items-center justify-center gap-4 px-4 text-center",
        "border border-neutral-200 bg-white outline-none",
        "transition-all duration-500",
        "hover:-translate-y-0.5 hover:border-neutral-400",
        "focus-visible:-translate-y-0.5 focus-visible:border-neutral-900",
      ].join(" ")}
    >
      {client.logoSrc ? (
        <span className="relative block h-14 w-full">
          <Image
            src={client.logoSrc}
            alt={`${client.name} logo`}
            fill
            sizes="200px"
            className="object-contain"
          />
        </span>
      ) : (
        <span
          className={`${typeVoiceClass("creative", "display")} text-xl leading-tight text-neutral-900 sm:text-2xl`}
        >
          {client.name}
        </span>
      )}

      <span
        className={`${typeVoiceClass("logic", "meta")} text-[0.55rem] leading-relaxed text-neutral-400 transition-colors duration-500 group-hover:text-neutral-600`}
      >
        {client.sector}
      </span>
    </Link>
  );
}
