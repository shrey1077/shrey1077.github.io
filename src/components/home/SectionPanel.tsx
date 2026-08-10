"use client";

/**
 * SectionPanel — what a brain pin opens.
 *
 * Replaces the two-column Designer/Artist showcase that used to sit below the
 * hero. That was a second, parallel way to reach the same eight sections; now
 * the pins are the only way in and this is the one thing they open.
 *
 * A full-width band beneath the stage holding the section's contents as a 3x3
 * grid of rounded squares — squares, not pills, so a grid of them reads as a
 * board rather than a list of buttons. Only one section is ever open, and the
 * pins own that state: this component follows `brainpin:open` and never sets it.
 *
 * The two sides are grounded differently. Logic sits on the circuit-board film
 * in black and white; creative sits on the paint the right hemisphere throws.
 * White type on both.
 *
 * Marked `data-section-panel` so the pins' outside-click handler knows clicks
 * in here are not "outside".
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PIN_OPEN_EVENT } from "@/components/home/BrainPins";
import { CAREER_STOP_COUNT, CareerTimeline } from "@/components/home/CareerTimeline";
import { ArtCollections } from "@/components/home/ArtCollections";
import { NAV_SECTIONS } from "@/constants/navigation";
import { clientsInSection } from "@/constants/clients";
import type { NavSectionId } from "@/types/navigation";
import type { ArtCollection, LogoMark } from "@/content/catalogue";
import { EASE_OUT } from "@/constants/motion";

/** One cell of the board. */
interface Cell {
  key: string;
  label: string;
  sub?: string;
  href?: string;
  image?: string;
  /** Light artwork needs a dark plate behind it. */
  tone?: "light" | "dark";
}

function cellsFor(id: NavSectionId, logos: LogoMark[], extinctsSlides: string[]): Cell[] {
  if (id === "clients" || id === "projects") {
    return clientsInSection(id).map((c) => ({
      key: c.slug,
      label: c.name,
      sub: c.sector,
      href: `/clients/${c.slug}`,
      image: c.logoSrc,
    }));
  }
  if (id === "logofolio") {
    return logos.map((m) => ({ key: m.slug, label: m.name, image: m.url, tone: m.tone }));
  }
  if (id === "the-extincts-project") {
    return extinctsSlides.map((src, i) => ({
      key: src,
      label: `Slide ${i + 1}`,
      image: src,
    }));
  }
  return [];
}

/**
 * Two sections don't fit the board. Career Path is a sequence — 10 stops on one
 * rail, newest first — and a 3-col grid both reflows that into rows and, at the
 * 9-cell cap, would silently drop the oldest. Art's collections drill in to
 * their plates, which a cell can only do with an `href`, and there is no /art
 * route. Both already have renderers that were orphaned when SidesShowcase was
 * retired; the panel hands over to them instead of flattening them into cells.
 */
const OWN_RENDERER: ReadonlySet<NavSectionId> = new Set([
  "career-path",
  "art",
] satisfies NavSectionId[]);

export function SectionPanel({
  logos,
  extinctsSlides,
  artCollections,
}: {
  logos: LogoMark[];
  extinctsSlides: string[];
  artCollections: ArtCollection[];
}) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<NavSectionId | null>(null);

  useEffect(() => {
    const onPin = (e: Event) => setOpenId((e as CustomEvent<NavSectionId | null>).detail);
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);

  const section = NAV_SECTIONS.find((s) => s.id === openId) ?? null;
  const logic = section?.hemisphere === "left";
  const cells = section ? cellsFor(section.id, logos, extinctsSlides) : [];
  // Nine to a screen — the rest stay a scroll away rather than shrinking.
  const board = cells.slice(0, 9);

  // A section with its own renderer counts its own entries, and falls back to
  // the empty note if its content folder turned out to be bare.
  const ownCount =
    section?.id === "career-path"
      ? CAREER_STOP_COUNT
      : section?.id === "art"
        ? artCollections.length
        : 0;
  const ownRenderer = !!section && OWN_RENDERER.has(section.id) && ownCount > 0;
  const entryCount = ownRenderer ? ownCount : cells.length;

  return (
    <AnimatePresence initial={false}>
      {section && (
        <motion.section
          data-section-panel
          key={section.id}
          aria-label={section.label}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: EASE_OUT }}
          className="relative w-full overflow-hidden bg-neutral-950"
        >
          {/* The ground. Circuit board for logic, thrown paint for creative. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {logic ? (
              <>
                <Image
                  src="/videos/circuit-bg-poster.jpg"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-40 grayscale"
                />
                <div className="absolute inset-0 bg-neutral-950/55" />
              </>
            ) : (
              <>
                <div className="brain-paint absolute inset-0 opacity-70" />
                <div className="absolute inset-0 bg-neutral-950/45" />
              </>
            )}
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-12">
            <header className="mb-8">
              <span className="font-helv block text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </span>
              <h2
                className={`mt-2 text-[clamp(1.6rem,3vw,2.6rem)] leading-none text-white ${
                  logic ? "font-digibra" : "font-graff"
                }`}
              >
                {section.label}
              </h2>
              <p className="font-helv mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                {section.description}
              </p>
            </header>

            {ownRenderer ? (
              /* Both renderers size to their parent (`h-full min-h-0`), and the
                 panel itself animates to `height: auto` — so they need a real
                 height here or they collapse to nothing. */
              <div className="h-[clamp(22rem,56svh,34rem)] min-h-0">
                {section.id === "career-path" ? (
                  // Ten stops sharing the width crush below ~832px; let the
                  // rail scroll sideways rather than shrink past legibility.
                  <div className="h-full min-h-0 overflow-x-auto">
                    <div className="h-full min-w-[52rem]">
                      <CareerTimeline />
                    </div>
                  </div>
                ) : (
                  <ArtCollections collections={artCollections} />
                )}
              </div>
            ) : board.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {board.map((c) => {
                  const inner = (
                    <>
                      <span
                        className={`relative mb-4 block aspect-[4/3] w-full overflow-hidden rounded-xl ${
                          c.tone === "light" ? "bg-neutral-900" : "bg-white/90"
                        }`}
                      >
                        {c.image ? (
                          <Image src={c.image} alt="" fill sizes="30vw" className="object-contain p-4" />
                        ) : (
                          <span
                            className={`flex h-full items-center justify-center px-3 text-center text-lg text-neutral-800 ${
                              logic ? "font-digibra" : "font-graff"
                            }`}
                          >
                            {c.label}
                          </span>
                        )}
                      </span>
                      <span
                        className={`block text-base leading-tight text-white ${
                          logic ? "font-digibra" : "font-graff"
                        }`}
                      >
                        {c.label}
                      </span>
                      {c.sub && (
                        <span className="font-helv mt-1 block text-[0.68rem] leading-snug text-white/55">
                          {c.sub}
                        </span>
                      )}
                    </>
                  );

                  // Squares, not pills — a grid of these reads as a board.
                  const shell =
                    "group block rounded-2xl border border-white/15 bg-white/[0.06] p-4 outline-none transition-colors duration-300 hover:border-white/45 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60";

                  return (
                    <li key={c.key}>
                      {c.href ? (
                        <Link href={c.href} className={shell}>
                          {inner}
                        </Link>
                      ) : (
                        <div className={shell}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="font-helv text-sm text-white/55">
                Nothing to show here yet — this section is still being put together.
              </p>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
