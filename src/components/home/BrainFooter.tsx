"use client";

/**
 * BrainFooter — the full-width row along the foot of the brain slide, just
 * above the band (owner, 2026-10-15: "below brain artwork, remove sections,
 * and include the My Stack logos and info at bottom (full width) … replaced
 * in 10 seconds with the education and chess and all that group of info, and
 * remove it from the black band").
 *
 * Two faces, taking turns every TURN_MS, each arriving in squares
 * (usePixelPresence) as the other leaves:
 *   · MY STACK — the tools behind the work, each mark with its name and what
 *     it is (MyStack's own TOOLS and lines; the pop-up it was is gone);
 *   · THE FACTS — Chess, Part-time, Hobbies, the words of the last two still
 *     turning over in place (AboutFacts, HobbiesRotator), as they did in the
 *     band's corners until now. (Education stood among them until the next
 *     round, the same day: it is under the orb on the first slide now —
 *     HeroStage.)
 * The section pins that stood here (BrainPins, and their wires, BrainTraces)
 * are unlinked; the band below is the way into either side now.
 *
 * Graphite on the slide's light ground. It fits any screen: on a phone the
 * tools lose their lines and stand in two rows, the facts in a 2 × 2.
 * Reduced motion: the faces still take turns, without the squares.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { GROUPS, ROLE } from "@/components/home/MyStack";
import { PartTimeMark } from "@/components/home/HomeMarks";
import { CHESS_RATING, PART_TIME, WORD_MS } from "@/components/home/AboutFacts";
import { CYCLE_MS, HOBBIES } from "@/components/home/HobbiesRotator";
import { TOOLS, type Tool } from "@/constants/tools";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";

/** How long each face holds, ms. */
const TURN_MS = 10000;

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

function FactsRow() {
  const facts: { key: string; heading: string; value: React.ReactNode }[] = [
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
      <p className={META}>Off the clock</p>
      <ul className="grid grid-cols-3 gap-x-6 gap-y-2.5">
        {facts.map((f) => (
          <li key={f.key} className="flex min-w-0 flex-col gap-1">
            <span className="font-graff text-[0.82rem] font-extrabold leading-none text-neutral-900">{f.heading}</span>
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
  // Which face is up: the stack first. It turns only while the brain slide
  // is on screen.
  const [face, setFace] = useState<"stack" | "facts">("stack");
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setFace((f) => (f === "stack" ? "facts" : "stack")), TURN_MS);
    return () => window.clearInterval(id);
  }, [active]);
  const stackRef = usePixelPresence<HTMLDivElement>(face === "stack", { cell: 8, duration: 0.7, reduceMotion });
  const factsRef = usePixelPresence<HTMLDivElement>(face === "facts", { cell: 8, duration: 0.7, reduceMotion });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(7%+0.9rem)] z-20 px-4 sm:px-8 lg:px-[5vw]">
      <div className="relative h-[clamp(4.5rem,13vh,6.5rem)] max-sm:h-[6.25rem] [@media(max-height:31.25rem)]:h-[3.4rem]">
        <div ref={stackRef} className={`absolute inset-0 ${face === "stack" ? "" : "invisible"}`} aria-hidden={face !== "stack"}>
          <StackRow />
        </div>
        <div ref={factsRef} className={`absolute inset-0 ${face === "facts" ? "" : "invisible"}`} aria-hidden={face !== "facts"}>
          <FactsRow />
        </div>
      </div>
    </div>
  );
}
