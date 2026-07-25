"use client";

/**
 * SectionPanels — the hero's lower-half navigation (Phase 5 v4).
 *
 * Once a hemisphere is chosen the brain zooms out to the upper half and this
 * system rises over the lower half:
 *
 *   pose "logic"    → the LEFT hemisphere's four sections as horizontal
 *                     black-and-white rows (Clients / Projects / Logofolio /
 *                     Career Path).
 *   pose "creative" → the RIGHT hemisphere's four sections as painted rows
 *                     (Art / Publications / The Extincts Project / AI
 *                     Generations).
 *
 * Both use the FULL width — the old centre column and 5% flip strips were
 * replaced by PoseSwitch, which floats above the panels' top edge.
 *
 * Clicking a row no longer compresses its siblings — the section GROWS from
 * that row's own band to cover the whole stack, so Clients (the top row) opens
 * downward while the rows beneath it also reach up over the rows above. The
 * panel lands graphite (painted on the creative side) and holds the section's
 * body: a portrait card slider, the Logofolio wall, or the career timeline.
 * Choosing a card replaces the panel area with the inline client detail —
 * company information on the left, the work on the painted right, no
 * navigation, everything on this page. Every piece of text animates in (masked
 * rises, letter settles, staggered fades). Reduced motion renders in place.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clientBySlug } from "@/constants/clients";
import { TATA_DESCRIPTION, TATA_CIRCLES } from "@/constants/tataExperience";
import { navSectionIndex, navSectionsFor } from "@/constants/navigation";
import type { LogoMark } from "@/content/catalogue";
import { SectionBody } from "@/components/home/SectionBody";
import type { ArtPreview } from "@/components/home/SectionBody";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { TypeReveal } from "@/components/typography/TypeReveal";
import { useSceneStore } from "@/state/useSceneStore";
import type { NavSectionId } from "@/types/navigation";

/* ── data contract (filled by the server page from the content folders) ── */

export interface WorkCategory {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
}

export interface ClientWork {
  tagline?: string;
  categories: WorkCategory[];
}

/** slug → work summary; only clients with a full experience appear here. */
export type ClientWorkMap = Record<string, ClientWork>;

export type { ArtPreview };

/* ── palette ──────────────────────────────────────────────────────────── */

/** Painted row surfaces for the creative sections (NavItem's hues, v4 home). */
const PAINTED_ROWS: Record<string, string> = {
  art: "linear-gradient(115deg,#ff2e8b,#ff5a3c,#ff2e8b)",
  publications: "linear-gradient(115deg,#ff8a00,#f5c518,#ff8a00)",
  "the-extincts-project": "linear-gradient(115deg,#00a6a6,#7fbf2e,#00a6a6)",
  "ai-generations": "linear-gradient(115deg,#7a3fb0,#3f6ad8,#7a3fb0)",
};

/** Category-card accent chips (cycled by index) on the detail's painted side. */
const CARD_GRADIENTS = [
  "linear-gradient(115deg,#ff2e8b,#ff5a3c)",
  "linear-gradient(115deg,#ff8a00,#f5c518)",
  "linear-gradient(115deg,#00a6a6,#7fbf2e)",
  "linear-gradient(115deg,#7a3fb0,#3f6ad8)",
] as const;

type PanelPose = "logic" | "creative";

/* ── small shared bits ────────────────────────────────────────────────── */

const riseIn = (reduce: boolean, delay = 0) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DURATION.medium, ease: EASE_OUT, delay },
      };

/* -- one section header row ------------------------------------------- */

/** A section's header strip. Rows no longer expand in place — clicking one
 *  hands its geometry up so the panel layer can grow a full-area overlay from
 *  exactly that band. */
function PanelRow({
  id,
  label,
  description,
  pose,
  order,
  onOpen,
}: {
  id: NavSectionId;
  label: string;
  description: string;
  pose: PanelPose;
  order: number;
  onOpen: (geom: { top: number; height: number; containerH: number }) => void;
}) {
  const reduceMotion = useReducedMotion();
  const logic = pose === "logic";

  return (
    <div
      style={{ flexGrow: 1, flexBasis: 0 }}
      className={[
        "relative flex min-h-0 flex-col overflow-hidden",
        logic ? "border-t border-neutral-200 bg-gallery" : "",
      ].join(" ")}
    >
      {!logic && (
        <span
          aria-hidden
          className="brain-paint absolute inset-0"
          style={{ backgroundImage: PAINTED_ROWS[id] }}
        />
      )}

      <button
        type="button"
        onClick={(e) => {
          const row = e.currentTarget.parentElement as HTMLElement | null;
          const stack = row?.parentElement as HTMLElement | null;
          if (!row || !stack) return;
          onOpen({ top: row.offsetTop, height: row.offsetHeight, containerH: stack.clientHeight });
        }}
        className="group relative z-10 flex h-full w-full items-center gap-5 overflow-hidden px-6 py-3 text-left outline-none lg:gap-8 lg:px-[4vw]"
      >
        {logic && (
          <span
            aria-hidden
            className="absolute inset-x-3 inset-y-1 translate-y-[101%] rounded-2xl bg-neutral-900 transition-transform duration-500 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 lg:inset-x-[3vw]"
          />
        )}

        <span
          className={[
            typeVoiceClass("logic", "meta"),
            "relative text-[0.6rem]",
            logic
              ? "text-neutral-400 transition-colors duration-500 group-hover:text-white/60"
              : "text-white/70",
          ].join(" ")}
        >
          {navSectionIndex(id)}
        </span>

        <TypeReveal
          text={label}
          voice={logic ? "logic" : "creative"}
          variant="display"
          as="span"
          reveal={reduceMotion ? "none" : "settle"}
          delay={0.35 + order * 0.09}
          className={[
            "relative text-[clamp(1.15rem,2.2vw,2.1rem)] leading-none",
            logic
              ? "font-medium text-neutral-900 transition-colors duration-500 group-hover:text-white"
              : "italic text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        />

        <span className="relative flex-1" />

        <motion.span
          aria-hidden
          {...riseIn(!!reduceMotion, 0.6 + order * 0.09)}
          className={[
            "relative hidden max-w-[24rem] text-xs leading-relaxed lg:block",
            logic
              ? "text-neutral-400 transition-colors duration-500 group-hover:text-white/70"
              : "text-white/80",
          ].join(" ")}
        >
          {description}
        </motion.span>

        <span
          aria-hidden
          className={[
            "relative text-xl leading-none transition-transform duration-500 group-hover:rotate-90",
            logic ? "text-neutral-400 group-hover:text-white" : "text-white/90",
          ].join(" ")}
        >
          +
        </span>
      </button>
    </div>
  );
}

/* ── the inline client detail (info left · painted work right) ───────── */

function ClientDetail({
  slug,
  work,
  onBack,
}: {
  slug: string;
  work?: ClientWork;
  onBack: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const setPendingMemory = useSceneStore((s) => s.setPendingMemory);
  const client = clientBySlug(slug);
  if (!client) return null;

  /** The full experience is a memory dive, not a page load (ClientCard's
   *  pattern) — the href stays real for middle-click / new tab. */
  const beginRetrieval = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (useSceneStore.getState().pendingMemory) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    setPendingMemory({ slug, x, y });
  };

  // Tata IIS gets a bespoke detail panel: the official wordmark, the
  // institute's own description (Helvetica), and the four work families as
  // white circular sections — each a doorway into the full experience.
  if (slug === "tata-iis") {
    return (
      <div className="grid h-full min-h-0 grid-cols-1 border-t border-neutral-200 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* LEFT — logo + description. */}
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto bg-gallery px-6 py-5 lg:px-[4vw]">
          <motion.button
            type="button"
            onClick={onBack}
            {...riseIn(!!reduceMotion, 0.05)}
            className={`${typeVoiceClass("logic", "meta")} group self-start text-[0.6rem] text-neutral-500 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
          >
            <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>{" "}
            all clients
          </motion.button>

          <motion.div {...riseIn(!!reduceMotion, 0.15)} className="relative mt-2 h-16 w-[min(20rem,60%)] self-start sm:h-20">
            <Image
              src="/content/clients/tata-iis/brand/wordmark-black.png"
              alt="Tata IIS — Tata Indian Institute of Skills"
              fill
              sizes="320px"
              className="object-contain object-left"
            />
          </motion.div>

          <motion.p
            {...riseIn(!!reduceMotion, 0.3)}
            className="max-w-md text-[0.92rem] leading-relaxed text-neutral-700"
            style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
          >
            {TATA_DESCRIPTION}
          </motion.p>

          <motion.span {...riseIn(!!reduceMotion, 0.5)} className="mt-auto pt-3">
            <Link
              href={`/clients/${slug}`}
              onClick={beginRetrieval}
              className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 border-b border-neutral-300 pb-1 text-[0.65rem] text-neutral-600 outline-none transition-colors duration-500 hover:border-neutral-900 hover:text-neutral-900 focus-visible:border-neutral-900 focus-visible:text-neutral-900`}
            >
              Enter the full experience
              <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.span>
        </div>

        {/* RIGHT — the four families as white circular doorways. */}
        <div className="relative flex min-h-0 flex-col overflow-y-auto bg-white px-6 py-6 lg:px-10">
          <motion.span
            {...riseIn(!!reduceMotion, 0.25)}
            className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-500`}
          >
            The work
          </motion.span>
          <div className="grid flex-1 grid-cols-2 place-items-center gap-4 py-4 sm:gap-6">
            {TATA_CIRCLES.map((c, i) => (
              <motion.div key={c.id} {...riseIn(!!reduceMotion, 0.32 + i * 0.08)} className="w-full">
                <Link
                  href={`/clients/${slug}`}
                  onClick={beginRetrieval}
                  aria-label={`${c.title} — enter the full experience`}
                  className="group/circle mx-auto flex aspect-square w-full max-w-[13rem] flex-col items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white p-6 text-center outline-none transition-all duration-500 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_28px_60px_-32px_rgba(0,0,0,0.25)] focus-visible:ring-2 focus-visible:ring-neutral-900/40 focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden
                    className="h-1 w-8 rounded-full transition-[width] duration-500 group-hover/circle:w-12"
                    style={{ backgroundColor: c.accent }}
                  />
                  <span className="text-sm font-medium leading-tight text-neutral-900 sm:text-base">
                    {c.title}
                  </span>
                  <span className={`${typeVoiceClass("logic", "meta")} text-[0.5rem] text-neutral-400`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 border-t border-neutral-200 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT — the company, in the logic voice. */}
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto bg-gallery px-6 py-4 lg:px-[4vw]">
        <motion.button
          type="button"
          onClick={onBack}
          {...riseIn(!!reduceMotion, 0.05)}
          className={`${typeVoiceClass("logic", "meta")} group self-start text-[0.6rem] text-neutral-400 outline-none transition-colors duration-300 hover:text-neutral-900 focus-visible:text-neutral-900`}
        >
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>{" "}
          all clients
        </motion.button>

        <motion.span
          {...riseIn(!!reduceMotion, 0.12)}
          className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-neutral-400`}
        >
          {client.sector}
        </motion.span>

        <TypeReveal
          text={client.name}
          voice="creative"
          variant="display"
          as="h3"
          reveal={reduceMotion ? "none" : "settle"}
          delay={0.2}
          className="text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.05] text-neutral-900"
        />

        <motion.p
          {...riseIn(!!reduceMotion, 0.42)}
          className="max-w-md text-sm leading-relaxed text-neutral-600"
        >
          {client.essence}
        </motion.p>

        {work?.tagline && (
          <motion.p
            {...riseIn(!!reduceMotion, 0.52)}
            className={`${typeVoiceClass("creative", "meta")} max-w-md text-base text-neutral-500`}
          >
            {work.tagline}
          </motion.p>
        )}

        <motion.span {...riseIn(!!reduceMotion, 0.62)} className="mt-auto pt-3">
          <Link
            href={`/clients/${slug}`}
            onClick={beginRetrieval}
            className={`${typeVoiceClass("logic", "meta")} group inline-flex items-center gap-2 border-b border-neutral-300 pb-1 text-[0.65rem] text-neutral-500 outline-none transition-colors duration-500 hover:border-neutral-900 hover:text-neutral-900 focus-visible:border-neutral-900 focus-visible:text-neutral-900`}
          >
            Enter the full experience
            <span aria-hidden className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </motion.span>
      </div>

      {/* RIGHT — the work, on the painted surface. */}
      <div className="relative flex min-h-0 flex-col overflow-hidden bg-neutral-950">
        <span aria-hidden className="brain-paint absolute inset-0 opacity-[0.16]" />
        <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-4 lg:px-8">
          <motion.span
            {...riseIn(!!reduceMotion, 0.25)}
            className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-white/60`}
          >
            The work
          </motion.span>

          {work && work.categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {work.categories.map((cat, i) => (
                <motion.span key={cat.id} {...riseIn(!!reduceMotion, 0.3 + i * 0.06)}>
                  <Link
                    href={`/clients/${slug}/catalogue/${cat.id}`}
                    className="group/cat flex h-full flex-col gap-1.5 border border-white/15 bg-white/[0.04] px-4 py-3 outline-none backdrop-blur-[2px] transition-all duration-500 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.08] focus-visible:border-white focus-visible:bg-white/[0.08]"
                  >
                    <span
                      aria-hidden
                      className="h-1 w-8 rounded-full transition-[width] duration-500 group-hover/cat:w-14"
                      style={{ backgroundImage: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}
                    />
                    <span
                      className={`${typeVoiceClass("creative", "display")} text-base leading-tight text-white`}
                    >
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="line-clamp-2 text-[0.7rem] leading-relaxed text-white/60">
                        {cat.description}
                      </span>
                    )}
                    <span
                      className={`${typeVoiceClass("logic", "meta")} mt-auto pt-1 text-[0.5rem] text-white/50`}
                    >
                      {cat.assetCount > 0 ? `${cat.assetCount} pieces` : "curating"}
                    </span>
                  </Link>
                </motion.span>
              ))}
            </div>
          ) : (
            <motion.p
              {...riseIn(!!reduceMotion, 0.35)}
              className={`${typeVoiceClass("creative", "meta")} max-w-md text-lg text-white/90`}
            >
              The paint is still wet — this client&apos;s work is being hung.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

/* -- one hemisphere's panel layer -------------------------------------- */

/** Owns the open-section state. Rendered with `key={pose}`, so flipping
 *  hemispheres REMOUNTS it — each side starts calm.
 *
 *  A section no longer expands in place: clicking a row grows a panel from that
 *  row's exact band to cover the whole stack — so Clients (the top row) opens
 *  downward, while Projects and the rest also reach up over the rows above
 *  them. The panel is graphite on the logic side (its slider's cards read as
 *  lit plates against it) and painted on the creative side.
 */
function PoseLayer({
  pose,
  workMap,
  artPreviews,
  logos,
}: {
  pose: PanelPose;
  workMap: ClientWorkMap;
  artPreviews: ArtPreview[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState<
    { id: NavSectionId; top: number; height: number; containerH: number } | null
  >(null);
  const [activeClient, setActiveClient] = useState<string | null>(null);

  const sections = navSectionsFor(pose === "logic" ? "left" : "right");
  const openSection = open ? sections.find((s) => s.id === open.id) : undefined;
  const logic = pose === "logic";

  return (
    <>
      <div className="relative min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {activeClient ? (
            <motion.div
              key={`detail-${activeClient}`}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
              transition={{ duration: DURATION.medium, ease: EASE_OUT }}
              className="h-full"
            >
              <ClientDetail
                slug={activeClient}
                work={workMap[activeClient]}
                onBack={() => setActiveClient(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="rows"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: DURATION.medium, ease: EASE_OUT }}
              className="relative flex h-full flex-col"
            >
              {sections.map((section, i) => (
                <PanelRow
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  description={section.description}
                  pose={pose}
                  order={i}
                  onOpen={(geom) => setOpen({ id: section.id, ...geom })}
                />
              ))}

              <AnimatePresence>
                {open && openSection && (
                  <motion.section
                    key={open.id}
                    aria-label={openSection.label}
                    initial={
                      reduceMotion
                        ? { opacity: 0, top: 0, height: open.containerH }
                        : { top: open.top, height: open.height, opacity: 0.6 }
                    }
                    animate={{ top: 0, height: open.containerH, opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { top: open.top, height: open.height, opacity: 0 }
                    }
                    transition={{ duration: DURATION.slow, ease: EASE_OUT }}
                    className={`absolute inset-x-0 z-30 flex flex-col overflow-hidden ${
                      logic ? "bg-neutral-900" : "bg-neutral-950"
                    }`}
                  >
                    {!logic && (
                      <span
                        aria-hidden
                        className="brain-paint absolute inset-0 opacity-25"
                        style={{ backgroundImage: PAINTED_ROWS[open.id] }}
                      />
                    )}

                    <div className="relative z-10 flex shrink-0 items-center gap-5 px-6 pt-4 lg:gap-8 lg:px-[4vw]">
                      <span className={`${typeVoiceClass("logic", "meta")} text-[0.6rem] text-white/45`}>
                        {navSectionIndex(open.id)}
                      </span>
                      <span
                        className={[
                          logic
                            ? `${typeVoiceClass("logic", "display")} font-medium`
                            : `${typeVoiceClass("creative", "display")} italic`,
                          "text-[clamp(1.15rem,2.2vw,2.1rem)] leading-none text-white",
                        ].join(" ")}
                      >
                        {openSection.label}
                      </span>
                      <span className="flex-1" />
                      <span className="hidden max-w-[24rem] text-xs leading-relaxed text-white/50 lg:block">
                        {openSection.description}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        aria-label={`Close ${openSection.label}`}
                        className="text-xl leading-none text-white/60 outline-none transition-colors duration-300 hover:text-white focus-visible:text-white"
                      >
                        &times;
                      </button>
                    </div>

                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.4 } }}
                      className="relative z-10 min-h-0 flex-1 px-6 pb-5 pt-4 lg:px-[4vw]"
                    >
                      <SectionBody
                        id={open.id}
                        onClientPick={(slug) => {
                          setOpen(null);
                          setActiveClient(slug);
                        }}
                        artPreviews={artPreviews}
                        logos={logos}
                      />
                    </motion.div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── the panel system ─────────────────────────────────────────────────── */

export function SectionPanels({
  workMap,
  artPreviews,
  logos,
}: {
  workMap: ClientWorkMap;
  artPreviews: ArtPreview[];
  logos: LogoMark[];
}) {
  const reduceMotion = useReducedMotion();
  const heroPose = useSceneStore((s) => s.heroPose);
  const pose: PanelPose = heroPose === "creative" ? "creative" : "logic";

  return (
    <motion.div
      data-panels
      initial={reduceMotion ? false : { y: "104%" }}
      animate={{ y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { y: "104%" }}
      transition={{ duration: DURATION.slow, ease: EASE_OUT }}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 h-1/2"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pose}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: DURATION.medium, ease: EASE_OUT }}
          className="flex h-full w-full"
        >
          <PoseLayer pose={pose} workMap={workMap} artPreviews={artPreviews} logos={logos} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
