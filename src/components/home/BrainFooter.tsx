"use client";

/**
 * BrainFooter — the full-width row along the foot of the brain slide, just
 * above the band (owner, 2026-10-15: "below brain artwork, remove sections,
 * and include the My Stack logos and info at bottom (full width) … replaced
 * in 10 seconds with the education and chess and all that group of info, and
 * remove it from the black band").
 *
 * AT A GLANCE stands on top, always (2026-10-16; owner: "I want facts (with
 * icons) about me like 14+ years Experience. Worked with 50+ Brands
 * (developed 7+). Upskilled: AI film Making (click to view certificate,
 * display in popup) add my certificate, AI agents and products", then "will
 * always be visible just below brain artwork, and above My stack and other
 * elements") — the years, the brands, and the two new skills: the
 * certificate opens over the page (CertificateDialog; on the first slide
 * instead from 2026-10-22 to 2026-10-26). Since 2026-10-19
 * (owner: "put education in at a glance section 3rd point, move 3 to 4, and
 * move 4 ie AI agents to off the clock section"): the years, the brands, the
 * degrees — one line, the widest column — and AI film making. Under it, two
 * faces take turns every TURN_MS, each arriving in
 * squares (usePixelPresence) as the other leaves:
 *   · MY STACK — the tools behind the work, each mark with its name and what
 *     it is (MyStack's own TOOLS and lines; the pop-up it was is gone);
 *   · LIFE & LEARNING — AI Agents & Products (which flies to AI Projects),
 *     Chess, Part-time, Hobbies, the words of the last two turning over in
 *     place (AboutFacts, HobbiesRotator), as they did in the band's corners
 *     until now. Renamed from "Off the clock" on 2026-10-19 (owner: "rename
 *     off the clock to something more appropriate") — the agents are work as
 *     much as play. (Education stood among them on 2026-10-15, then under the
 *     orb on the first slide until 2026-10-19; it is in the glance now.)
 * The section pins that stood here (BrainPins, and their wires, BrainTraces)
 * are unlinked; the band below is the way into either side now.
 *
 * Graphite on the slide's light ground. It fits any screen: on a phone the
 * tools lose their lines and stand in two rows, the glance in a 2 × 2.
 * Reduced motion: the faces still take turns, without the squares.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { CertificateDialog } from "@/components/home/CertificateDialog";
import { GROUPS, ROLE } from "@/components/home/MyStack";
import { AgentMark, BrandsMark, EducationMark, ExperienceMark, FilmMark, PartTimeMark } from "@/components/home/HomeMarks";
import { CHESS_RATING, PART_TIME, WORD_MS } from "@/components/home/AboutFacts";
import { CYCLE_MS, HOBBIES } from "@/components/home/HobbiesRotator";
import { TOOLS, type Tool } from "@/constants/tools";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

/** How long each face holds, ms. */
const TURN_MS = 10000;

/** The degrees, each with its field written out — the field light, in
 *  brackets, the two on one line with a bar between (owner, 2026-10-17 and
 *  2026-10-18, when it stood on the first slide). */
const EDUCATION_FULL = [
  ["B.Tech.", "Information Technology"],
  ["M.Des.", "Visual Communication"],
] as const;

const META = `${typeVoiceClass("logic", "meta")} text-[0.52rem] tracking-[0.26em] text-neutral-500`;

/** The tools in MyStack's order: design, generate, think & build, capture. */
const ORDERED: Tool[] = GROUPS.flatMap((g) => g.ids)
  .map((id) => TOOLS.find((t) => t.id === id))
  .filter((t): t is Tool => !!t);

function StackRow() {
  return (
    <div className="flex h-full flex-col justify-end gap-2">
      <p className={META}>My Stack</p>
      <ul className="grid grid-cols-5 gap-x-3 gap-y-2.5 lg:grid-cols-9 lg:gap-x-4 [@media(max-height:31.25rem)]:grid-cols-9">
        {ORDERED.map((t) => {
          const h = Math.round(24 * (t.scale ?? 1));
          return (
            <li key={t.id} className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-10 shrink-0 place-items-center">
                <Image src={t.src} alt="" width={Math.round(h * t.aspect)} height={h} style={{ height: h, width: "auto" }} />
              </span>
              <span className="min-w-0 max-sm:hidden [@media(max-height:31.25rem)]:hidden">
                <span className="block truncate text-[0.78rem] leading-tight text-neutral-900">{t.name}</span>
                <span className="block truncate text-[0.64rem] leading-snug text-neutral-500 [@media(max-height:40rem)]:hidden">
                  {ROLE[t.id]}
                </span>
              </span>
              <span className="sr-only sm:hidden">{t.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A word that changes in place — the facts' small rise. */
function Turning({ items, ms }: { items: { label: string; mark?: React.ReactNode }[]; ms: number }) {
  const reduceMotion = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((v) => v + 1), ms);
    return () => window.clearInterval(id);
  }, [ms, reduceMotion]);
  const item = items[i % items.length];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={item.label}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="flex min-w-0 items-center gap-[0.4em]"
      >
        {item.mark && <span className="flex shrink-0 [&_svg]:size-[1.15em]">{item.mark}</span>}
        <span className="truncate">{item.label}</span>
      </motion.span>
    </AnimatePresence>
  );
}

const MARK = "flex shrink-0 [&_svg]:size-[1.15em] [&_svg]:text-neutral-900";

/** A small action inside a fact — an ink-outlined pill, filled on hover. */
const CHIP =
  "pointer-events-auto inline-flex items-center gap-1 rounded-full border border-neutral-900/80 px-2 py-[0.22rem] font-graff text-[0.54rem] uppercase leading-none tracking-[0.16em] text-neutral-900 outline-none transition-colors hover:bg-neutral-950 hover:text-white focus-visible:bg-neutral-950 focus-visible:text-white";

function GlanceRow({ onCertificate }: { onCertificate: () => void }) {
  const facts: { key: string; mark: React.ReactNode; heading: string; value: React.ReactNode; wide?: boolean }[] = [
    { key: "years", mark: <ExperienceMark />, heading: "14+ Years", value: "of experience" },
    {
      key: "brands",
      mark: <BrandsMark />,
      heading: "50+ Brands",
      value: (
        <>
          worked with <span aria-hidden>·</span> <span className="font-bold text-neutral-900">7+</span> developed
        </>
      ),
    },
    {
      key: "education",
      mark: <EducationMark />,
      heading: "Education",
      // One line, about 30.5em long: on a narrow phone the type comes down so
      // it keeps to the row.
      value: (
        <span className="whitespace-nowrap text-[min(0.8rem,(100vw-2rem)/30.5)]">
          {EDUCATION_FULL.map(([degree, field], i) => (
            <span key={degree}>
              {i > 0 && (
                <span aria-hidden className="type-light px-[0.55em] text-neutral-400">
                  |
                </span>
              )}
              <span className="font-bold text-neutral-900">{degree}</span> <span className="type-light">({field})</span>
            </span>
          ))}
        </span>
      ),
      wide: true,
    },
    {
      key: "film",
      mark: <FilmMark />,
      heading: "AI Film Making",
      value: (
        <>
          Upskilled <span aria-hidden>·</span>
          <button type="button" onClick={onCertificate} aria-haspopup="dialog" className={CHIP}>
            Certificate <span aria-hidden>↗</span>
          </button>
        </>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>At a glance</p>
      {/* The degrees take the widest column; below `lg` a row of their own. */}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,2fr)_minmax(0,1fr)] [@media(max-height:31.25rem)]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,2fr)_minmax(0,1fr)]">
        {facts.map((f) => (
          <li key={f.key} className={`flex min-w-0 flex-col gap-1 ${f.wide ? "col-span-2 lg:col-span-1 [@media(max-height:31.25rem)]:col-span-1" : ""}`}>
            <span className="font-graff flex min-w-0 items-center gap-[0.45em] text-[0.82rem] font-extrabold leading-none text-neutral-900">
              <span className={MARK}>{f.mark}</span>
              <span className="truncate">{f.heading}</span>
            </span>
            <span className="font-graff flex min-w-0 items-center gap-[0.4em] whitespace-nowrap text-[0.8rem] leading-tight text-neutral-600 max-sm:text-[0.72rem]">
              {f.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FactsRow() {
  const facts: { key: string; heading: string; mark?: React.ReactNode; value: React.ReactNode }[] = [
    {
      key: "agents",
      heading: "AI Agents & Products",
      mark: <AgentMark />,
      value: (
        <>
          Upskilled <span aria-hidden>·</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("flythrough:go", { detail: { id: "ai-projects" } }))}
            className={CHIP}
          >
            See them <span aria-hidden>→</span>
          </button>
        </>
      ),
    },
    {
      key: "chess",
      heading: "Chess",
      value: (
        <>
          <span className="relative block size-[1.15em] shrink-0">
            <Image src="/content/icons/chess.png" alt="" fill sizes="24px" className="object-contain" />
          </span>
          <span className="font-bold text-neutral-900">{CHESS_RATING}</span>
          <span className="text-neutral-500">rapid</span>
        </>
      ),
    },
    {
      key: "parttime",
      heading: "Part-time",
      value: (
        <>
          <span className={MARK}>
            <PartTimeMark />
          </span>
          <Turning items={PART_TIME.map((label) => ({ label }))} ms={WORD_MS} />
        </>
      ),
    },
    { key: "hobbies", heading: "Hobbies", value: <Turning items={HOBBIES} ms={CYCLE_MS} /> },
  ];
  return (
    <div className="flex h-full flex-col justify-end gap-2">
      <p className={META}>Life &amp; Learning</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 lg:grid-cols-4 [@media(max-height:31.25rem)]:grid-cols-4">
        {facts.map((f) => (
          <li key={f.key} className="flex min-w-0 flex-col gap-1">
            <span className="font-graff flex items-center gap-[0.45em] text-[0.82rem] font-extrabold leading-none text-neutral-900">
              {f.mark && <span className={MARK}>{f.mark}</span>}
              {f.heading}
            </span>
            <span className="font-graff flex min-w-0 items-center gap-[0.4em] text-[0.8rem] leading-tight text-neutral-600">
              {f.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrainFooter({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion() ?? false;
  // Which face is up under the glance: the stack first, then life & learning.
  // It turns only while the brain slide is on screen, and holds while the
  // certificate is open.
  const [face, setFace] = useState<"stack" | "facts">("stack");
  const [certificate, setCertificate] = useState(false);
  useEffect(() => {
    if (!active || certificate) return;
    const id = window.setInterval(() => setFace((f) => (f === "stack" ? "facts" : "stack")), TURN_MS);
    return () => window.clearInterval(id);
  }, [active, certificate]);
  // Its whole height, published as --brain-foot on the page, so what stands
  // above it on a phone (LeftRightBrain's hint) clears it at any size.
  const footRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = footRef.current;
    if (!el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty("--brain-foot", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--brain-foot");
    };
  }, []);
  const stackRef = usePixelPresence<HTMLDivElement>(face === "stack", { cell: 8, duration: 0.7, reduceMotion });
  const factsRef = usePixelPresence<HTMLDivElement>(face === "facts", { cell: 8, duration: 0.7, reduceMotion });

  return (
    <div ref={footRef} className="pointer-events-none absolute inset-x-0 bottom-[calc(7%+0.9rem)] z-20 px-4 sm:px-8 lg:px-[5vw]">
      {/* At a glance — always, just under the brain. */}
      {/* The line under the glance stands as far from the rows below as
          from the glance above (owner, 2026-10-26: "keep the current
          distance between line and text above it, equal to its distance
          from lower elements"). */}
      <div className="mb-[clamp(0.5rem,1.6vh,0.9rem)] border-b border-neutral-900/10 pb-[clamp(0.5rem,1.6vh,0.9rem)] [@media(max-height:31.25rem)]:mb-1 [@media(max-height:31.25rem)]:pb-1">
        <GlanceRow onCertificate={() => setCertificate(true)} />
      </div>
      {/* The two faces in one grid cell: the cell is as tall as the taller
          (a box of fixed height stood here until 2026-10-26, some 3rem
          taller than either — the gap under the line). */}
      <div className="relative grid">
        <div ref={stackRef} className={`[grid-area:1/1] ${face === "stack" ? "" : "invisible"}`} aria-hidden={face !== "stack"}>
          <StackRow />
        </div>
        <div ref={factsRef} className={`[grid-area:1/1] ${face === "facts" ? "" : "invisible"}`} aria-hidden={face !== "facts"}>
          <FactsRow />
        </div>
      </div>
      <CertificateDialog open={certificate} onClose={() => setCertificate(false)} reduceMotion={reduceMotion} />
    </div>
  );
}
