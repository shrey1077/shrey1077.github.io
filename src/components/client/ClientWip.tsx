"use client";

/**
 * ClientWip — the placeholder room for clients WITHOUT a configured experience
 * yet (every client graduates from this to a ClientExperience by adding a
 * config entry — see docs/CLIENT_ARCHITECTURE.md).
 *
 * Art direction: an exhibition mid-installation, not an apology. Each client
 * gets a distinct room inside the same white gallery:
 *
 *   • a giant GHOST MONOGRAM in the client's accent hue — outlined serif
 *     letterforms breathing slowly behind the wall text,
 *   • the museum wall label — sector eyebrow, serif display name, one quiet
 *     positioning line (`essence`), a hairline rule ending in the accent dot,
 *   • a bordered plaque: "EXPERIENCE IN PREPARATION" with a softly pulsing
 *     accent dot, annotated by a handwritten margin note,
 *   • prev/next room navigation along the bottom (wraps, gallery-style).
 *
 * Accent + essence live on the client record (constants/clients.ts), so adding
 * a client automatically furnishes its room. Reduced motion renders everything
 * settled and still.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CLIENTS, type Client } from "@/constants/clients";
import { typeVoiceClass } from "@/constants/typography";
import { fadeRiseVariants, staggerContainerVariants } from "@/utils/motion";

const containerVariants = staggerContainerVariants({ stagger: 0.1, delay: 0.1 });
const itemVariants = fadeRiseVariants({ distance: 14 });

/** "Tata IIS" → "TI", "Zabraku" → "Z" — the ghost monogram's letterforms. */
function monogram(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ClientWip({ client }: { client: Client }) {
  const reduceMotion = useReducedMotion();
  const index = CLIENTS.findIndex((c) => c.slug === client.slug);
  const count = CLIENTS.length;
  const prev = CLIENTS[(index - 1 + count) % count];
  const next = CLIENTS[(index + 1) % count];

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-gallery px-6 py-10 sm:px-10 lg:px-16">
      {/* The ghost monogram — the client already inhabits the room. Centered by
          the flex wrapper (no CSS translate) so Framer owns the transform. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -right-[4vw] flex select-none items-center"
      >
        <motion.span
          className="font-serif-brand italic leading-none"
          style={{
            fontSize: "clamp(16rem, 42vw, 46rem)",
            WebkitTextStroke: `1.5px ${client.accent}`,
            color: "transparent",
            opacity: 0.09,
          }}
          animate={reduceMotion ? undefined : { y: [-12, 12, -12] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
          {monogram(client.name)}
        </motion.span>
      </div>

      <motion.div
        className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top bar: back + room index. */}
        <motion.div
          variants={itemVariants}
          className="flex items-baseline justify-between"
        >
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
          <span
            className={`${typeVoiceClass("logic", "meta")} text-[0.65rem] tabular-nums text-neutral-400`}
          >
            {String(index + 1).padStart(2, "0")} · {String(count).padStart(2, "0")}
          </span>
        </motion.div>

        {/* The wall label. */}
        <div className="flex max-w-3xl flex-1 flex-col justify-center py-16">
          <motion.span
            variants={itemVariants}
            className={`${typeVoiceClass("logic", "meta")} text-[0.7rem] uppercase tracking-[0.25em] text-neutral-400`}
          >
            {client.sector}
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="font-serif-brand mt-4 leading-[0.95] tracking-tight text-neutral-900"
            style={{ fontSize: "clamp(3.25rem, 9vw, 7.5rem)" }}
          >
            {client.name}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-[44ch] text-lg font-light leading-relaxed text-neutral-500 sm:text-xl"
          >
            {client.essence}
          </motion.p>

          {/* Hairline rule ending in the client's accent. */}
          <motion.span
            variants={itemVariants}
            aria-hidden
            className="mt-10 flex w-56 items-center gap-3"
          >
            <span className="h-px flex-1 bg-neutral-200" />
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: client.accent }}
            />
          </motion.span>

          {/* The plaque. */}
          <motion.div variants={itemVariants} className="mt-10">
            <div className="inline-flex items-center gap-3.5 rounded-[3px] border border-neutral-200 px-5 py-3">
              <span aria-hidden className="relative flex size-2">
                {!reduceMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: client.accent }}
                    animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span
                  className="relative size-2 rounded-full"
                  style={{ backgroundColor: client.accent }}
                />
              </span>
              <span
                className={`${typeVoiceClass("logic", "meta")} text-[0.625rem] uppercase tracking-[0.28em] text-neutral-500`}
              >
                Experience in preparation
              </span>
            </div>

            <p
              className={`${typeVoiceClass("thought", "label")} mt-5 inline-block origin-left -rotate-2 text-xl text-neutral-400`}
            >
              the first frames are being hung…
            </p>
          </motion.div>
        </div>

        {/* Prev / next rooms. */}
        <motion.nav
          variants={itemVariants}
          aria-label="Neighbouring clients"
          className="flex items-end justify-between border-t border-neutral-100 pt-5"
        >
          <Link href={`/clients/${prev.slug}`} className="group text-left">
            <span
              className={`${typeVoiceClass("logic", "meta")} block text-[0.6rem] uppercase tracking-[0.2em] text-neutral-400`}
            >
              ← Previous
            </span>
            <span className="font-serif-brand mt-1 block text-base italic text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900">
              {prev.name}
            </span>
          </Link>
          <Link href={`/clients/${next.slug}`} className="group text-right">
            <span
              className={`${typeVoiceClass("logic", "meta")} block text-[0.6rem] uppercase tracking-[0.2em] text-neutral-400`}
            >
              Next →
            </span>
            <span className="font-serif-brand mt-1 block text-base italic text-neutral-500 transition-colors duration-300 group-hover:text-neutral-900">
              {next.name}
            </span>
          </Link>
        </motion.nav>
      </motion.div>
    </main>
  );
}
