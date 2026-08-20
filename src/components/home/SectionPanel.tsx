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
import { PublicationShelf } from "@/components/home/PublicationShelf";
import { LogofolioWall } from "@/components/home/LogofolioWall";
import { PaintBurst } from "@/components/home/PaintBurst";
import { ProjectPreview, type StudyPlate } from "@/components/home/ProjectPreview";
import { PUBLICATIONS } from "@/constants/publications";
import { PROJECT_STUDIES, projectStudyById } from "@/constants/projectStudies";
import { FILM_PLATE } from "@/constants/design";
import { NAV_SECTIONS } from "@/constants/navigation";
import { clientsInSection } from "@/constants/clients";
import type { NavSectionId } from "@/types/navigation";
import type { ArtCollection, LogoMark, MarkPlate } from "@/content/catalogue";
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
  /** True when `href` is a static file rather than an app route (see cellsFor). */
  external?: boolean;
  /** Linear multiplier on the centred logo box, for marks that read small at
   *  the common size. */
  scale?: number;
  /** A study id instead of a destination: this cell opens ProjectPreview in
   *  place rather than navigating anywhere. Mutually exclusive with `href`. */
  studyId?: string;
  /** `image` is ARTWORK, not a mark: fill the plate edge to edge instead of
   *  fitting it into the centred logo box. Six of the eight studies have no
   *  mark, so their cell is fronted by the first plate of the work itself. */
  fill?: boolean;
}

/** The centred box every mark is fitted into, as a percentage of the plate, and
 *  the ceiling a scaled one may not pass so nothing touches the card's edge. */
const LOGO_BOX = { w: 62, h: 31, max: 94 };

/** Cells to a screenful. Four to a row since 2026-08-20, so this is three full
 *  rows — the rest stay a scroll away rather than shrinking. Projects sits at
 *  exactly 10 now, so the cap must clear that or the board would silently drop
 *  the last brands. */
const BOARD_CAP = 12;

function cellsFor(
  id: NavSectionId,
  logos: LogoMark[],
  extinctsSlides: string[],
  studyPlates: Record<string, StudyPlate[]>,
): Cell[] {
  if (id === "clients" || id === "projects") {
    const clients: Cell[] = clientsInSection(id).map((c) => ({
      key: c.slug,
      label: c.name,
      sub: c.sector,
      href: c.href ?? `/clients/${c.slug}`,
      // A `href` client is a plain file under public/, not an app route, so the
      // client router cannot navigate to it — that cell needs a real anchor.
      external: !!c.href,
      // `cardLogo` is where the real marks live; `logoSrc` is the older field
      // and is set on no client, which is why every cell fell back to its name
      // in type. Kept as the fallback so anything that does set it still works.
      image: c.cardLogo ?? c.logoSrc,
      tone: c.logoTone,
      scale: c.logoScale,
    }));
    if (id !== "projects") return clients;
    // The eight independent commissions, promoted out of the old Freelance
    // room on 2026-08-20. They have no page — they open ProjectPreview.
    return [
      ...clients,
      ...PROJECT_STUDIES.map((s) => {
        // A mark where one exists; otherwise the first plate of the work.
        // ⚠ Without this the six mark-less studies printed their name INSIDE
        // the empty plate and again as the caption under it — "Leder Warren
        // Leder Warren". Fronting them with the work fixes the stutter and
        // says more about the project than its name set twice would.
        const first = studyPlates[s.id]?.[0]?.url;
        return {
          key: s.id,
          label: s.name,
          sub: s.kind,
          studyId: s.id,
          image: s.logo ?? first,
          tone: s.logoTone,
          fill: !s.logo && !!first,
        };
      }),
    ];
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
 * Three sections don't fit the board. Career Path is a sequence — 10 stops on
 * one rail, newest first — and a 3-col grid both reflows that into rows and, at
 * the 9-cell cap, would silently drop the oldest. Art's collections drill in to
 * their plates, which a cell can only do with an `href`, and there is no /art
 * route. Publications is a shelf: its entries are documents, whose covers say
 * almost nothing at cell size, so it leads with words and wants a row.
 */
const OWN_RENDERER: ReadonlySet<NavSectionId> = new Set([
  "career-path",
  "art",
  "publications",
  // Logofolio moved off the board on 2026-08-20: 25 marks at the board's
  // 12-cell cap meant thirteen were simply not shown, and a wall of marks
  // wants to be a wall rather than a page of cards.
  "logofolio",
] satisfies NavSectionId[]);

export function SectionPanel({
  logos,
  extinctsSlides,
  artCollections,
  publicationCovers,
  studyPlates,
  markPlates,
}: {
  logos: LogoMark[];
  extinctsSlides: string[];
  artCollections: ArtCollection[];
  /** slug → first rendered page, read server-side (see app/page.tsx). */
  publicationCovers: Record<string, string | undefined>;
  /** study id → its plates, read server-side for the same reason. */
  studyPlates: Record<string, StudyPlate[]>;
  /** original mark url → trimmed art + the scale that matches its ink area to
   *  every other mark's. Empty falls back to the untrimmed files. */
  markPlates: Record<string, MarkPlate>;
}) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<NavSectionId | null>(null);
  // Which independent commission is being previewed, if any. Held here rather
  // than in the board so that closing a section closes its preview too.
  const [studyId, setStudyId] = useState<string | null>(null);

  useEffect(() => {
    const onPin = (e: Event) => {
      setOpenId((e as CustomEvent<NavSectionId | null>).detail);
      // A preview belongs to the section that opened it; leaving the section
      // while a dialog is still up would strand it over the wrong room.
      setStudyId(null);
    };
    window.addEventListener(PIN_OPEN_EVENT, onPin);
    return () => window.removeEventListener(PIN_OPEN_EVENT, onPin);
  }, []);

  const section = NAV_SECTIONS.find((s) => s.id === openId) ?? null;
  const logic = section?.hemisphere === "left";
  const cells = section ? cellsFor(section.id, logos, extinctsSlides, studyPlates) : [];
  const board = cells.slice(0, BOARD_CAP);

  // A section with its own renderer counts its own entries, and falls back to
  // the empty note if its content folder turned out to be bare.
  const ownCount =
    section?.id === "career-path"
      ? CAREER_STOP_COUNT
      : section?.id === "art"
        ? artCollections.length
        : section?.id === "publications"
          ? PUBLICATIONS.length
          : section?.id === "logofolio"
            ? logos.length
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
          {/* The ground. Circuit board for logic, the paint film for creative.
              ⚠ The film is the ground for EVERY creative room now, and it runs
              at FULL strength — no scrim over it, by the owner's instruction on
              2026-08-20. Art used to be the only room on the footage while the
              others sat on the `.brain-paint` gradient; that split is gone.
              Legibility is bought back by FILM_PLATE behind each block of text
              instead, which keeps the footage readable between them. Anything
              added to a creative room from here needs its own plate — there is
              no longer a scrim to fall back on. */}
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
              <PaintBurst />
            )}
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-12">
            {/* On creative the header sits on its own plate, sized to the copy
                rather than the panel — a full-width bar would read as the scrim
                that was just removed. Logic keeps its scrim and needs none. */}
            <header
              className={
                logic
                  ? "mb-8"
                  : `mb-8 w-fit max-w-2xl ${FILM_PLATE} px-6 py-5 sm:px-7 sm:py-6`
              }
            >
              <span
                className={`font-helv block text-[0.6rem] uppercase tracking-[0.18em] ${
                  logic ? "text-white/50" : "text-white/60"
                }`}
              >
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </span>
              <h2
                className={`mt-2 text-[clamp(1.6rem,3vw,2.6rem)] leading-none text-white ${
                  logic ? "font-digibra" : "font-graff font-bold"
                }`}
              >
                {section.label}
              </h2>
              <p
                className={`font-helv mt-3 max-w-xl text-sm leading-relaxed ${
                  logic ? "text-white/65" : "text-white/75"
                }`}
              >
                {section.description}
              </p>
            </header>

            {ownRenderer ? (
              /* Both renderers size to their parent (`h-full min-h-0`), and the
                 panel itself animates to `height: auto` — so they need a real
                 height here or they collapse to nothing. */
              <div className="h-[clamp(22rem,56svh,34rem)] min-h-0">
                {section.id === "career-path" ? (
                  // The rail wraps into rows now and carries its own vertical
                  // scroll, so the sideways scroller it used to need — ten stops
                  // crushed below ~832px — is gone.
                  <CareerTimeline />
                ) : section.id === "publications" ? (
                  <PublicationShelf publications={PUBLICATIONS} covers={publicationCovers} />
                ) : section.id === "logofolio" ? (
                  <LogofolioWall logos={logos} markPlates={markPlates} />
                ) : (
                  <ArtCollections collections={artCollections} />
                )}
              </div>
            ) : board.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {board.map((cell) => {
                  // ⚠ Marks are swapped for their TRIMMED art here, and take the
                  // scale that matches their ink area to every other mark's.
                  // `object-contain` sizes a logo by its bounding box, so a file
                  // that is 97% transparent padding renders tiny however it is
                  // scaled — the padding has to be gone before a scale means
                  // anything. Both the art and the number come from
                  // scripts/prepare_logo_marks.py; see readMarkPlates.
                  // `fill` cells are a study's own work plate, never a mark, and
                  // are deliberately left alone.
                  const swap = cell.image && !cell.fill ? markPlates[cell.image] : undefined;
                  const c: Cell = swap
                    ? { ...cell, image: swap.url, scale: swap.scale }
                    : cell;
                  const inner = (
                    <>
                      {/* ⚠ Logo plates are PURE white — `bg-white`, not the
                          `bg-white/90` they were. At 90% the panel's ground
                          bled through, so the plates sat at slightly different
                          greys depending on what was behind them; the owner
                          asked for one flat white on 2026-08-20.

                          `tone === "light"` still buys a dark plate, and it is
                          now a SAFETY, not a style: artwork that is white on
                          transparent is invisible on white. Zabraku used to
                          need it and no longer does (its white characters were
                          recoloured — see clients.ts). Exactly one mark still
                          does: `mycoveda-symbol` in the Logofolio, measured at
                          100% white ink. Do not drop this branch without
                          recolouring that file too. */}
                      <span
                        className={`relative mb-4 block aspect-[4/3] w-full overflow-hidden rounded-xl ${
                          c.fill || c.tone === "light" ? "bg-neutral-900" : "bg-white"
                        }`}
                      >
                        {c.image && c.fill ? (
                          // Artwork, not a mark: it covers the plate. The logo
                          // box would shrink a whole poster to the size of a
                          // wordmark and leave three-quarters of the cell blank.
                          <Image
                            src={c.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 22vw, 45vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : c.image ? (
                          // Marks sit in a fixed, centred box rather than filling
                          // the plate. `object-contain` across the whole plate
                          // sizes each logo by its own aspect, so a square mark
                          // read roughly twice the ink of a wordmark; capping
                          // both dimensions evens that out and drops them all
                          // well inside the card.
                          <span className="absolute inset-0 grid place-items-center">
                            <span
                              className="relative block"
                              style={{
                                width: `${Math.min(LOGO_BOX.w * (c.scale ?? 1), LOGO_BOX.max)}%`,
                                height: `${Math.min(LOGO_BOX.h * (c.scale ?? 1), LOGO_BOX.max)}%`,
                              }}
                            >
                              <Image src={c.image} alt="" fill sizes="16vw" className="object-contain" />
                            </span>
                          </span>
                        ) : (
                          <span
                            className={`flex h-full items-center justify-center px-3 text-center text-lg text-neutral-800 ${
                              logic ? "font-digibra" : "font-graff font-bold"
                            }`}
                          >
                            {c.label}
                          </span>
                        )}
                      </span>
                      <span
                        className={`block text-base leading-tight text-white ${
                          logic ? "font-digibra" : "font-graff font-bold"
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
                  // ⚠ On creative the cell IS the text's plate: a 6%-white wash
                  // over the un-scrimmed film left the label competing with
                  // whatever the footage was doing behind it.
                  const shell = logic
                    ? "group block rounded-2xl border border-white/15 bg-white/[0.06] p-4 outline-none transition-colors duration-300 hover:border-white/45 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60"
                    : `group block ${FILM_PLATE} border border-white/15 p-4 outline-none transition-colors duration-300 hover:border-white/45 focus-visible:ring-2 focus-visible:ring-white/60`;

                  return (
                    <li key={c.key}>
                      {c.studyId ? (
                        // Opens a dialog, so it is a button. A link that opens
                        // a dialog lies to anyone middle-clicking it, and these
                        // eight have no page to middle-click to.
                        <button
                          type="button"
                          onClick={() => setStudyId(c.studyId!)}
                          className={`${shell} w-full cursor-pointer text-left`}
                        >
                          {inner}
                        </button>
                      ) : c.href && c.external ? (
                        <a href={c.href} className={shell}>
                          {inner}
                        </a>
                      ) : c.href ? (
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
              <p
                className={`font-helv text-sm ${
                  logic
                    ? "text-white/55"
                    : `w-fit max-w-xl ${FILM_PLATE} px-5 py-4 text-white/75`
                }`}
              >
                Nothing to show here yet — this section is still being put together.
              </p>
            )}
          </div>

          {/* The preview is mounted INSIDE the panel so it inherits the
              `data-section-panel` marker — the pins treat a click in here as
              inside, and dismissing the dialog does not also close the room
              behind it. It is `position: fixed`, so the panel's
              `overflow-hidden` never clips it. */}
          <ProjectPreview
            study={studyId ? (projectStudyById(studyId) ?? null) : null}
            plates={studyId ? (studyPlates[studyId] ?? []) : []}
            onClose={() => setStudyId(null)}
          />
        </motion.section>
      )}
    </AnimatePresence>
  );
}
