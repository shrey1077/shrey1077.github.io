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

export interface ResolvedItem {
  /** Unique across the page (a folder can back two subsections). */
  key: string;
  label: string;
  /** Set when the subsection has no assets yet. */
  note?: string;
  count: number;
  assets: CollectionAsset[];
  mockup?: string;
}

export interface ResolvedSection {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  items: ResolvedItem[];
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

/** Tiles per row at the current width — mirrors the grid's own breakpoints. */
function colsFor(width: number): number {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
}

/* ── one subsection tile ──────────────────────────────────────────────── */

function Tile({
  item,
  accent,
  lane,
  open,
  onToggle,
}: {
  item: ResolvedItem;
  accent: string;
  lane: TataBrand;
  open: boolean;
  onToggle: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [live, setLive] = useState(false);
  const [step, setStep] = useState(0);

  // At rest a tile previews only its own lane. Subsections with nothing from
  // that campus fall back to the whole set rather than showing an empty slot.
  const images = item.assets.filter((a) => a.kind === "image");
  const laneImages = images.filter((a) => brandOf(a.name) === lane);
  const frames = (laneImages.length > 0 ? laneImages : images).slice(0, MAX_FRAMES);
  const still = frames[0];

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

  const active = frames[step % frames.length];
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
          <span className="tata-heading block text-base leading-[1.15] text-neutral-900">{item.label}</span>
          {/* The three columns ARE the lane label on desktop. Stacked to one
              column on a phone that reading is gone, so name it there. */}
          {laneImages.length > 0 && (
            <span className="tata-subhead mt-1 block text-[0.55rem] uppercase tracking-[0.14em] text-neutral-400 lg:hidden">
              {LANE_LABEL[lane]}
            </span>
          )}
        </span>
        <span className="tata-body shrink-0 pt-1 text-[0.6rem] tabular-nums text-neutral-500">{item.count}</span>
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
  const ordered = [...item.assets].sort(
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
  const [cols, setCols] = useState(3);

  // Read the column count from the element itself; the panel has to land at the
  // end of the opened tile's ROW, which only the live width can tell us.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCols(colsFor(window.innerWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openIndex = section.items.findIndex((i) => i.key === openKey);
  const openItem = openIndex === -1 ? null : section.items[openIndex];
  // START of the opened tile's row → the panel sits ON TOP of that row of
  // three, pushing it down; whole rows above it keep their place.
  const splitAt = openItem ? Math.floor(openIndex / cols) * cols : section.items.length;

  const before = section.items.slice(0, splitAt);
  const after = section.items.slice(splitAt);

  // Lane is fixed to the item's own index so a tile previews the same campus at
  // every width, even where the grid folds to two columns or one.
  const grid = (items: ResolvedItem[], offset: number) => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Tile
          key={item.key}
          item={item}
          accent={section.accent}
          lane={BRAND_LANES[(offset + i) % BRAND_LANES.length]}
          open={item.key === openKey}
          onToggle={() => onToggle(item.key)}
        />
      ))}
    </div>
  );

  return (
    <section className="pt-14 first:pt-0">
      <div className="border-t border-neutral-200 pb-8 pt-6">
        <span
          className="tata-subhead block text-[0.58rem] uppercase tracking-[0.16em]"
          style={{ color: section.accent }}
        >
          {section.items.length} subsections
        </span>
        <h3 className="tata-heading mt-3 text-2xl leading-[1.05] text-neutral-900 sm:text-3xl">
          {section.title}
        </h3>
        <p className="tata-body mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">{section.blurb}</p>
      </div>

      <div ref={gridRef}>
        {before.length > 0 && grid(before, 0)}
        <AnimatePresence initial={false} mode="wait">
          {openItem && (
            <Panel
              key={openItem.key}
              item={openItem}
              accent={section.accent}
              onClose={() => onToggle(openItem.key)}
              onOpenAsset={onOpenAsset}
            />
          )}
        </AnimatePresence>
        {after.length > 0 && grid(after, splitAt)}
      </div>
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
