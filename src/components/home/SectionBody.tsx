"use client";

/**
 * SectionBody — a section's contents, drawn the same way wherever it opens.
 *
 * Lifted out of SectionPanel on 2026-10-02, when the sections moved into the
 * scroll flythrough's full-screen slides; the panel itself was deleted the
 * same day, so the slides are the only caller now.
 *
 * `variant` only changes the board's grid: "panel" (the old band's four to a
 * row, growing downward) is kept for any future in-flow use; a slide has
 * exactly one screen, so it runs five to a row on shallower plates.
 */

import Image from "next/image";
import Link from "next/link";
import { CAREER_STOP_COUNT, CareerTimeline } from "@/components/home/CareerTimeline";
import { ArtCollections } from "@/components/home/ArtCollections";
import { PublicationShelf } from "@/components/home/PublicationShelf";
import { LogofolioWall } from "@/components/home/LogofolioWall";
import type { StudyPlate } from "@/components/home/ProjectPreview";
import { PUBLICATIONS } from "@/constants/publications";
import { PROJECT_STUDIES } from "@/constants/projectStudies";
import { FILM_PLATE } from "@/constants/design";
import { clientsInSection } from "@/constants/clients";
import type { NavSection, NavSectionId } from "@/types/navigation";
import type { ArtCollection, LogoMark, MarkPlate } from "@/content/catalogue";

/** Everything the sections draw from, read server-side in app/page.tsx. */
export interface SectionData {
  logos: LogoMark[];
  extinctsSlides: string[];
  artCollections: ArtCollection[];
  /** slug → first rendered page. */
  publicationCovers: Record<string, string | undefined>;
  /** study id → its plates. */
  studyPlates: Record<string, StudyPlate[]>;
  /** original mark url → trimmed art + the scale that matches its ink area to
   *  every other mark's. Empty falls back to the untrimmed files. */
  markPlates: Record<string, MarkPlate>;
}

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

function ownCount(id: NavSectionId, data: SectionData): number {
  if (id === "career-path") return CAREER_STOP_COUNT;
  if (id === "art") return data.artCollections.length;
  if (id === "publications") return PUBLICATIONS.length;
  if (id === "logofolio") return data.logos.length;
  return 0;
}

/** How many entries a section holds — the "N entries" line over each room. */
export function sectionEntryCount(section: NavSection, data: SectionData): number {
  const own = ownCount(section.id, data);
  if (OWN_RENDERER.has(section.id) && own > 0) return own;
  return cellsFor(section.id, data.logos, data.extinctsSlides, data.studyPlates).length;
}

export function SectionBody({
  section,
  data,
  onStudy,
  variant = "panel",
}: {
  section: NavSection;
  data: SectionData;
  /** Opens a study's preview. The caller owns the dialog. */
  onStudy: (id: string) => void;
  variant?: "panel" | "slide";
}) {
  const logic = section.hemisphere === "left";
  const slide = variant === "slide";
  const ownRenderer = OWN_RENDERER.has(section.id) && ownCount(section.id, data) > 0;

  if (ownRenderer) {
    /* Both renderers size to their parent (`h-full min-h-0`). The panel animates
       to `height: auto`, so it gives them a real height; a slide's body is
       already a flex child with one, so it just fills it. */
    return (
      <div className={slide ? "h-full min-h-0" : "h-[clamp(22rem,56svh,34rem)] min-h-0"}>
        {section.id === "career-path" ? (
          // The rail wraps into rows and carries its own vertical scroll.
          <CareerTimeline />
        ) : section.id === "publications" ? (
          <PublicationShelf publications={PUBLICATIONS} covers={data.publicationCovers} />
        ) : section.id === "logofolio" ? (
          <LogofolioWall logos={data.logos} markPlates={data.markPlates} />
        ) : (
          <ArtCollections collections={data.artCollections} />
        )}
      </div>
    );
  }

  const board = cellsFor(section.id, data.logos, data.extinctsSlides, data.studyPlates).slice(
    0,
    BOARD_CAP,
  );

  if (!board.length) {
    return (
      <p
        className={`font-helv text-sm ${
          logic ? "text-white/55" : `w-fit max-w-xl ${FILM_PLATE} px-5 py-4 text-white/75`
        }`}
      >
        Nothing to show here yet — this section is still being put together.
      </p>
    );
  }

  return (
    <ul
      className={
        slide
          ? // A slide has one screen: past ten cells (the Extincts deck's 12)
            // a third row of five no longer fits, two rows of six do.
            `grid grid-cols-2 gap-4 sm:grid-cols-3 ${board.length > 10 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`
          : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {board.map((cell) => {
        // ⚠ Marks are swapped for their TRIMMED art here, and take the scale
        // that matches their ink area to every other mark's. `object-contain`
        // sizes a logo by its bounding box, so a file that is 97% transparent
        // padding renders tiny however it is scaled — the padding has to be
        // gone before a scale means anything. Both the art and the number come
        // from scripts/prepare_logo_marks.py; see readMarkPlates. `fill` cells
        // are a study's own work plate, never a mark, and are left alone.
        const swap = cell.image && !cell.fill ? data.markPlates[cell.image] : undefined;
        const c: Cell = swap ? { ...cell, image: swap.url, scale: swap.scale } : cell;
        const inner = (
          <>
            {/* ⚠ Logo plates are PURE white (owner, 2026-08-20). `tone ===
                "light"` still buys a dark plate, and it is a SAFETY, not a
                style: artwork that is white on transparent is invisible on
                white — `mycoveda-symbol` in the Logofolio is 100% white ink. */}
            <span
              className={`relative block w-full overflow-hidden rounded-xl ${
                slide ? "mb-3 aspect-[16/10]" : "mb-4 aspect-[4/3]"
              } ${c.fill || c.tone === "light" ? "bg-neutral-900" : "bg-white"}`}
            >
              {c.image && c.fill ? (
                // Artwork, not a mark: it covers the plate.
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : c.image ? (
                // Marks sit in a fixed, centred box rather than filling the
                // plate, so square marks and wordmarks carry similar ink.
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
        // ⚠ On creative the cell IS the text's plate: a 6%-white wash over the
        // un-scrimmed film left the label competing with the footage.
        const shell = logic
          ? `group block rounded-2xl border border-white/15 bg-white/[0.06] ${slide ? "p-3" : "p-4"} outline-none transition-colors duration-300 hover:border-white/45 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-white/60`
          : `group block ${FILM_PLATE} border border-white/15 p-4 outline-none transition-colors duration-300 hover:border-white/45 focus-visible:ring-2 focus-visible:ring-white/60`;

        return (
          <li key={c.key}>
            {c.studyId ? (
              // Opens a dialog, so it is a button.
              <button
                type="button"
                onClick={() => onStudy(c.studyId!)}
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
  );
}
