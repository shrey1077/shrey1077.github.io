"use client";

/**
 * WorkSections — the Tata IIS work under four permanent headlines.
 *
 * Each headline (Digital · Print · Photo/Videography · Proposals · AI Solutions)
 * is fixed furniture: it never collapses. Under it sit its subsections as
 * rounded tiles, three to a row, and the three columns are brand lanes —
 * Tata IIS, then IIS Ahmedabad, then IIS Mumbai. At rest a tile previews only
 * its own lane; on hover or focus it runs a fly-through of that lane.
 *
 * Choosing a tile opens it in place rather than taking over the screen: a panel
 * drops in directly ABOVE the tile's own row, two rows deep, and that row plus
 * everything after it flows on below. Whole rows above stay where they are. An
 * open panel drops the lane filter and shows the entire subsection, ordered
 * Tata IIS → IISA → IISM. Only one subsection is open at a time.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CollectionAsset } from "@/types/experience";
import type { ContentAsset } from "@/content/catalogue";
import { TripleSlider } from "@/components/client/tata/TripleSlider";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT } from "@/constants/motion";
import { BRAND_LANES, brandOf, type TataBrand } from "@/constants/tataSections";
import { GuidelineSlider, type GuidelineBrand } from "@/components/client/tata/GuidelineSlider";
import { Reveal } from "@/components/experience/Reveal";
import { ScrollRows } from "@/components/client/tata/ScrollRows";

export interface ResolvedItem {
  /** Unique across the page (a folder can back two subsections). */
  key: string;
  label: string;
  /** Set when the subsection has no assets yet. */
  note?: string;
  count: number;
  assets: CollectionAsset[];
  mockup?: string;
  /** The folder's meta names a caption order, so that order is deliberate and
   *  outranks the automatic brand grouping. */
  curated?: boolean;
}

export interface ResolvedSection {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  items: ResolvedItem[];
  /** The theme decks this section opens with. Empty = no slider. */
  themes?: GuidelineBrand[];
  /** Alternating ground: dark sections run on near-black, light ones on the
   *  page's own texture. */
  dark?: boolean;
  /** Tiles per row at the widest breakpoint. Print reads four across. */
  cols?: number;
}

/** Hold per piece in the hover fly-through. Deliberately quicker than the
 *  5s slider cadence — nobody hovers a tile for half a minute. */
const FLY_MS = 1500;
/** House rule: at most seven artworks on any surface, tile or slider. */
const MAX_FRAMES = 7;

/** Named only where the three columns collapse to one and stop saying it. */
const LANE_LABEL: Record<TataBrand, string> = {
  tata: "Tata IIS",
  iisa: "IIS Ahmedabad",
  iism: "IIS Mumbai",
};

const FLY = {
  enter: { opacity: 0, scale: 0.86, x: "18%" },
  center: { opacity: 1, scale: 1, x: "0%" },
  exit: { opacity: 0, scale: 1.14, x: "-14%" },
};
const FADE = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/** Tiles per row at the current width — mirrors the grid's own breakpoints.
 *  ⚠ Must agree with `gridClass` below, because the opened panel is inserted at
 *  the START of the opened tile's row and that index is computed from this. Let
 *  them drift and the panel lands mid-row. */
function colsFor(width: number, wide: number): number {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1280) return Math.min(3, wide);
  return wide;
}

const gridClass = (wide: number) =>
  wide >= 4
    ? "grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    : "grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3";

/* ── one subsection tile ──────────────────────────────────────────────── */

function Tile({
  item,
  accent,
  lane,
  open,
  onToggle,
  dark = false,
}: {
  item: ResolvedItem;
  accent: string;
  lane: TataBrand;
  open: boolean;
  onToggle: () => void;
  /** ⚠ The PLATE stays paper-white on a dark section — much of this catalogue
   *  is transparent artwork with dark ink and would vanish otherwise. Only the
   *  caption under it inverts. */
  dark?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [live, setLive] = useState(false);
  const [step, setStep] = useState(0);

  // A tile rests on a MOCKUP — the work staged as an object on white — and only
  // shows flat artwork once you hover it. `installed-` wins over `mockup-`:
  // a photograph of the thing actually mounted on a campus wall beats a
  // composite. Subsections with neither rest on their first piece.
  const images = item.assets.filter((a) => a.kind === "image");
  // The marker is the FIRST segment, after an optional theme prefix, so
  // `mockup-studio`, `iisa-mockup-gate` and `installed-dsc-2609` all count.
  // It is anchored on purpose: an unanchored /(^|-)(mockup|installed)-/ also
  // matched real artwork whose own filename happens to contain the word —
  // `iisa-billboards-and-signages-iisa-exterior-mockup-2` — which pulled a
  // dozen genuine pieces out of every fly-through and made one of them the
  // resting image.
  const STAGED = /^(?:(?:tata|iisa|iism)-)?(?:mockup|installed)-/;
  const isStaged = (n: string) => STAGED.test(n);
  // Same anchoring as STAGED — a bare `.includes()` here matched
  // `...exterior-mockup-2` too, which is why real artwork kept turning up as
  // the resting image.
  const marker = (kind: string) => new RegExp(`^(?:(?:tata|iisa|iism)-)?${kind}-`);
  const stagedInLane = (kind: string) => {
    const re = marker(kind);
    return (
      images.find((a) => re.test(a.name) && brandOf(a.name) === lane) ??
      images.find((a) => re.test(a.name))
    );
  };
  const staged = stagedInLane("installed") ?? stagedInLane("mockup");

  // The fly-through is the real work, so mockups are kept out of it. At rest a
  // tile previews only its own lane; subsections with nothing from that campus
  // fall back to the whole set rather than showing an empty slot.
  const artwork = images.filter((a) => !isStaged(a.name));
  const laneArtwork = artwork.filter((a) => brandOf(a.name) === lane);
  // A hand-written caption order outranks the lane filter, exactly as it does
  // in the open panel. Without this a curated lead frame could be filtered
  // straight back out — Mockups sits in the Tata lane, so the two signage shots
  // chosen to lead it (both IISA) would never have surfaced.
  const frames = (
    item.curated ? artwork : laneArtwork.length > 0 ? laneArtwork : artwork
  ).slice(0, MAX_FRAMES);
  const still = staged ?? frames[0];

  useEffect(() => {
    if (!live || frames.length < 2) return;
    const id = window.setInterval(() => setStep((s) => s + 1), FLY_MS);
    return () => window.clearInterval(id);
  }, [live, frames.length]);

  // Nothing shot or designed yet — hold the slot so the taxonomy stays legible.
  if (!still) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6">
          <span className="tata-body text-center text-[0.68rem] leading-relaxed text-neutral-500">
            {item.note ?? "In progress"}
          </span>
        </div>
        <div className="flex items-start gap-3 py-4">
          <span className="min-w-0 flex-1">
            <span className="tata-heading block text-base leading-[1.15] text-neutral-400">{item.label}</span>
          </span>
          <span className="tata-body shrink-0 pt-1 text-[0.55rem] uppercase tracking-[0.14em] text-neutral-400">
            Soon
          </span>
        </div>
      </div>
    );
  }

  const active = frames.length > 0 ? frames[step % frames.length] : still;
  const variants = reducedMotion ? FADE : FLY;

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      onMouseEnter={() => setLive(true)}
      onMouseLeave={() => {
        setLive(false);
        setStep(0);
      }}
      onFocus={() => setLive(true)}
      onBlur={() => {
        setLive(false);
        setStep(0);
      }}
      className="group flex h-full w-full flex-col text-left outline-none"
    >
      {/* Paper-white stage: part of this catalogue is transparent artwork with
          dark ink (letterheads, stickers), which vanishes on a dark ground. */}
      <div
        className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white outline-none transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-neutral-900 ${
          open
            ? "border-neutral-400 shadow-[0_18px_44px_-24px_rgba(0,0,0,0.4)]"
            : "border-neutral-200 group-hover:border-neutral-300 group-hover:shadow-[0_18px_44px_-24px_rgba(0,0,0,0.35)]"
        }`}
        style={{ perspective: 1200 }}
      >
        <Image
          src={still.url}
          alt={still.caption ?? still.name}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
          className={`object-contain p-4 transition-opacity duration-500 ${
            live && frames.length > 1 ? "opacity-0" : "opacity-100"
          }`}
        />

        {live && frames.length > 1 && (
          <AnimatePresence initial={false}>
            <motion.div
              key={active.url}
              className="absolute inset-0"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reducedMotion ? 0.3 : 0.85, ease: EASE_OUT }}
            >
              <Image
                src={active.url}
                alt={active.caption ?? active.name}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                className="object-contain p-4"
              />
            </motion.div>
          </AnimatePresence>
        )}

        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-[3px] origin-left transition-transform duration-500 ease-out ${
            open ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
          }`}
          style={{ backgroundColor: accent }}
        />

        <span
          className={`tata-body absolute right-3 top-3 rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1 text-[0.58rem] tabular-nums text-neutral-600 transition-opacity duration-300 ${
            live && frames.length > 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {(step % frames.length) + 1} / {frames.length}
        </span>
      </div>

      <div className="flex items-start gap-3 py-4">
        {item.mockup && (
          <span aria-hidden className="relative mt-0.5 h-7 w-7 shrink-0">
            <Image src={item.mockup} alt="" fill sizes="28px" className="object-contain" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={`tata-heading block text-base leading-[1.15] ${
              dark ? "text-white" : "text-neutral-900"
            }`}
          >
            {item.label}
          </span>
          {/* The three columns ARE the lane label on desktop. Stacked to one
              column on a phone that reading is gone, so name it there. */}
          {!item.curated && laneArtwork.length > 0 && (
            <span className="tata-subhead mt-1 block text-[0.55rem] uppercase tracking-[0.14em] text-neutral-400 lg:hidden">
              {LANE_LABEL[lane]}
            </span>
          )}
        </span>
        <span
          className={`tata-body shrink-0 pt-1 text-[0.6rem] tabular-nums ${
            dark ? "text-white/60" : "text-neutral-500"
          }`}
        >
          {item.count}
        </span>
      </div>
    </button>
  );
}

/* ── the opened panel ─────────────────────────────────────────────────── */

function Panel({
  item,
  accent,
  onClose,
  onOpenAsset,
}: {
  item: ResolvedItem;
  accent: string;
  onClose: () => void;
  onOpenAsset: (a: CollectionAsset) => void;
}) {
  // Staged images are the tile's resting face, not part of the work — they do
  // not belong in the slider.
  const pieces = item.assets.filter((a) => !/(^|-)(mockup|installed)-/.test(a.name));

  // Brand grouping is the default, but a hand-written caption order beats it:
  // ID Cards wants both fronts before both reverses, which cuts across lanes.
  const ordered = item.curated
    ? pieces
    : [...pieces].sort(
        (a, b) => BRAND_LANES.indexOf(brandOf(a.name)) - BRAND_LANES.indexOf(brandOf(b.name)),
      );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="overflow-hidden"
    >
      <div className="mb-4 rounded-2xl bg-neutral-950 px-5 py-8 text-white sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <span
              className="tata-subhead block text-[0.55rem] uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              {item.count} {item.count === 1 ? "piece" : "pieces"}
            </span>
            <h4 className="tata-heading mt-2 text-2xl leading-[1.05] text-white sm:text-3xl">{item.label}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${item.label}`}
            className="tata-body shrink-0 rounded-full border border-white/25 px-4 py-2 text-[0.7rem] text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Close ✕
          </button>
        </div>

        <div className="mt-8">
          {/* Open panels always run the full subsection, ordered by hierarchy:
              Tata IIS first, then Ahmedabad, then Mumbai. */}
          <TripleSlider items={ordered} onOpen={onOpenAsset} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── one headline ─────────────────────────────────────────────────────── */

function Section({
  section,
  openKey,
  onToggle,
  onOpenAsset,
}: {
  section: ResolvedSection;
  openKey: string | null;
  onToggle: (key: string) => void;
  onOpenAsset: (a: CollectionAsset) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const wide = section.cols ?? 3;
  const [cols, setCols] = useState(wide);
  /* ⚠ Collapsed on first load (owner's call). The page is long and the
     headlines are the map; opening one is a deliberate act. Note this is
     what makes the pinned scroll below sensible — a section only takes
     over the scroll once you have asked for it. */
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const dark = !!section.dark;

  // Read the column count from the element itself; the panel has to land at the
  // end of the opened tile's ROW, which only the live width can tell us.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCols(colsFor(window.innerWidth, wide)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  const openIndex = section.items.findIndex((i) => i.key === openKey);
  const openItem = openIndex === -1 ? null : section.items[openIndex];
  // START of the opened tile's row → the panel sits ON TOP of that row of
  // three, pushing it down; whole rows above it keep their place.
  const splitAt = openItem ? Math.floor(openIndex / cols) * cols : section.items.length;

  const before = section.items.slice(0, splitAt);
  const after = section.items.slice(splitAt);

  // Lane is fixed to the item's own index so a tile previews the same campus at
  // every width, even where the grid folds to two columns or one.
  /** One row of tiles. Chunked here rather than in one grid, because the pin
   *  advances the section a ROW at a time and needs them as separate nodes. */
  const rowsOf = (items: ResolvedItem[], offset: number) => {
    const out: React.ReactNode[] = [];
    for (let r = 0; r * cols < items.length; r++) {
      const slice = items.slice(r * cols, r * cols + cols);
      out.push(
        <div key={r} className={gridClass(wide)}>
          {slice.map((item, i) => (
            <Tile
              key={item.key}
              item={item}
              accent={section.accent}
              lane={BRAND_LANES[(offset + r * cols + i) % BRAND_LANES.length]}
              open={item.key === openKey}
              onToggle={() => onToggle(item.key)}
              dark={dark}
            />
          ))}
        </div>,
      );
    }
    return out;
  };

  const grid = (items: ResolvedItem[], offset: number) => (
    <div className={gridClass(wide)}>
      {items.map((item, i) => (
        /* ⚠ `Reveal`, not framer's `whileInView`. The pure-framer form was tried
           here first and never applied its `initial` at all — tiles 7900px below
           the fold rendered with no style attribute and full opacity, so there
           was no reveal to see. Reveal drives its own IntersectionObserver AND
           carries a 1.6s failsafe, so content can never strand hidden; its own
           header documents that trade-off. Stagger runs along the row. */
        <Reveal key={item.key} delay={(i % wide) * 0.07}>
          <Tile
            item={item}
            accent={section.accent}
            lane={BRAND_LANES[(offset + i) % BRAND_LANES.length]}
            open={item.key === openKey}
            onToggle={() => onToggle(item.key)}
            dark={dark}
          />
        </Reveal>
      ))}
    </div>
  );

  return (
    /* ⚠ Alternating ground. A dark section is near-black at 93%, NOT solid: the
       owner wants the page's circuit texture still faintly readable through it.
       It also bleeds the full viewport width via the negative margins, so the
       band spans the page while its contents stay on the same measure as
       everything else. */
    <section
      className={`pt-14 first:pt-0 ${
        dark ? "-mx-6 mt-14 bg-neutral-950/[0.93] px-6 pb-14 sm:-mx-10 sm:px-10" : ""
      }`}
    >
      {/* The headline is the toggle; every section starts closed. */}
      <h3 className={dark ? "border-t border-white/15" : "border-t border-neutral-200"}>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="group flex w-full items-start gap-6 pb-8 pt-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40"
        >
          <span className="min-w-0 flex-1">
            <span
              className="tata-subhead block text-[0.58rem] uppercase tracking-[0.16em]"
              style={{ color: section.accent }}
            >
              {section.items.length} subsections
            </span>
            <span
              className={`tata-heading mt-3 block text-2xl leading-[1.05] sm:text-3xl ${
                dark ? "text-white" : "text-neutral-900"
              }`}
            >
              {section.title}
            </span>
            <span
              className={`tata-body mt-3 block max-w-2xl text-sm leading-relaxed ${
                dark ? "text-white/65" : "text-neutral-600"
              }`}
            >
              {section.blurb}
            </span>
          </span>

          {/* Chevron: down when open, right when closed. */}
          <span
            aria-hidden
            className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
              dark
                ? "border-white/25 text-white/70 group-hover:border-white group-hover:text-white"
                : "border-neutral-200 text-neutral-500 group-hover:border-neutral-400 group-hover:text-neutral-900"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`size-4 transition-transform duration-300 ${expanded ? "rotate-0" : "-rotate-90"}`}
            >
              <path d="M5 9l7 7 7-7" />
            </svg>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            {/* This section's own work, behind the same three-way theme switch
                as the guidelines. Sections with nothing themed render none. */}
            {section.themes && section.themes.length > 0 && (
              <div className="mb-12 lg:mx-auto lg:max-w-4xl">
                <GuidelineSlider brands={[...section.themes]} />
              </div>
            )}

            <div ref={gridRef}>
              {/* ⚠ Two layouts, and the switch is deliberate. With nothing open
                  the rows are PINNED and advanced by scroll. The moment a
                  subsection opens, the pin is dropped and the flat grid returns
                  — the opened panel is inserted between rows, and a panel
                  growing inside a sticky viewport of fixed height either
                  overflows it or scrolls the pin away mid-read. */}
              {openItem ? (
                <>
                  {before.length > 0 && grid(before, 0)}
                  <AnimatePresence initial={false} mode="wait">
                    <Panel
                      key={openItem.key}
                      item={openItem}
                      accent={section.accent}
                      onClose={() => onToggle(openItem.key)}
                      onOpenAsset={onOpenAsset}
                    />
                  </AnimatePresence>
                  {after.length > 0 && grid(after, splitAt)}
                </>
              ) : (
                <ScrollRows rows={Math.ceil(section.items.length / cols)}>
                  {rowsOf(section.items, 0)}
                </ScrollRows>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── the whole work area ──────────────────────────────────────────────── */

export function WorkSections({ sections }: { sections: ResolvedSection[] }) {
  // One subsection open across the entire page — opening another closes it.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  return (
    <>
      {sections.map((section) => (
        <Section
          key={section.id}
          section={section}
          openKey={openKey}
          onToggle={(key) => setOpenKey((k) => (k === key ? null : key))}
          onOpenAsset={(a) => setViewing(a as ContentAsset)}
        />
      ))}
      <MediaViewer asset={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
