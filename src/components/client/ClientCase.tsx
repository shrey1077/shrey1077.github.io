"use client";

/**
 * ClientCase — one of an agency's own clients, as a section of the agency's
 * page (owner, 2026-10-17: the Zabraku page's Casa Playa and RKB
 * Entertainment). The client's mark in dark grey beside a short account of
 * the work, then the work itself in groups — each a row of pieces at their
 * own shape, any one opening large in the shared viewer, which walks the
 * whole section.
 *
 *   ┌───────────┬───────────────────────────────────────┐
 *   │  (mark)   │  What the client is, what was made.    │
 *   │           │  POSTERS · 5                            │
 *   ├───────────┴───────────────────────────────────────┤
 *   │  ▢ ▢ ▢ ▢ ▢                                         │
 *   │  SOCIAL & SCREENS · 2                               │
 *   │  ▭▭▭  ▭▭▭▭                                         │
 *   └────────────────────────────────────────────────────┘
 */

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";
import type { ClientCaseConfig } from "@/types/client";

const LABEL = "text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-neutral-500";

export function ClientCase({ client }: { client: ClientCaseConfig }) {
  const reduced = useReducedMotion();
  const all = client.groups.flatMap((g) => g.pieces);
  const [at, setAt] = useState<number | null>(null);
  const piece = at === null ? null : all[at];
  let k = 0;

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <div className="grid gap-6 sm:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)] sm:items-center sm:gap-10">
        <span className="relative block h-28 w-full max-w-[11rem] sm:h-36">
          <Image src={client.logo} alt={`${client.name} logo`} fill sizes="11rem" className="object-contain object-left sm:object-center" />
        </span>
        {/* (`kind` is the section's own line, beside its title.) */}
        <p className="max-w-[38rem] text-[1.02rem] leading-relaxed text-neutral-700 sm:text-[1.08rem]">{client.text}</p>
      </div>

      {client.groups.map((g) => (
        <section key={g.title} aria-label={`${client.name} — ${g.title}`} className="flex flex-col gap-4">
          <p className={LABEL}>
            {g.title} <span className="tabular-nums text-neutral-400">· {g.pieces.length}</span>
          </p>
          {/* Pieces at their own shape, in rows that share one height: each
              takes a share of the row as wide as it is (flex-grow = w/h). */}
          <ul className="flex flex-wrap gap-3 sm:gap-4">
            {g.pieces.map((p) => {
              const i = k++;
              const r = p.w / p.h;
              return (
                <motion.li
                  key={p.src}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 5) * 0.05 }}
                  className="min-w-0"
                  style={{ flex: `${r} 1 ${(r * (g.rowRem ?? 14)).toFixed(2)}rem` }}
                >
                  <button
                    type="button"
                    onClick={() => setAt(i)}
                    aria-label={`${p.name} — open large`}
                    className="group relative block w-full overflow-hidden border border-neutral-200 bg-neutral-50 outline-none transition-colors duration-300 hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
                    style={{ aspectRatio: `${p.w} / ${p.h}` }}
                  >
                    <Image
                      src={p.src}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, 60vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}

      <MediaViewer
        asset={piece ? { name: piece.name, url: piece.src, kind: "image" } : null}
        onClose={() => setAt(null)}
        onPrev={all.length > 1 ? () => setAt((v) => (v === null ? v : (v - 1 + all.length) % all.length)) : undefined}
        onNext={all.length > 1 ? () => setAt((v) => (v === null ? v : (v + 1) % all.length)) : undefined}
        position={at === null ? undefined : { at: at + 1, of: all.length }}
      />
    </div>
  );
}
