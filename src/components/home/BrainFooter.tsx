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
 * certificate opens over the page (CertificateDialog), the agents fly to AI
 * Projects. Under it, two faces take turns every TURN_MS, each arriving in
 * squares (usePixelPresence) as the other leaves:
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
 * tools lose their lines and stand in two rows, the glance in a 2 × 2.
 * Reduced motion: the faces still take turns, without the squares.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RoomImage as Image } from "@/components/home/nearness";
import { usePixelPresence } from "@/components/home/pixelReveal";
import { GROUPS, ROLE } from "@/components/home/MyStack";
import { AgentMark, BrandsMark, ExperienceMark, FilmMark, PartTimeMark } from "@/components/home/HomeMarks";
import { PixelButton } from "@/components/home/PixelButton";
import { CHESS_RATING, PART_TIME, WORD_MS } from "@/components/home/AboutFacts";
import { CYCLE_MS, HOBBIES } from "@/components/home/HobbiesRotator";
import { TOOLS, type Tool } from "@/constants/tools";
import { EASE_OUT } from "@/constants/motion";
import { typeVoiceClass } from "@/constants/typography";
import { HOME_TYPE } from "@/constants/faces";

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

/** The certificate the owner supplied (scripts/prepare-certificate.mjs). */
const CERTIFICATE = {
  src: "/content/about/ai-film-making-certificate.webp",
  pdf: "/content/about/ai-film-making-certificate.pdf",
  w: 1800,
  h: 1013,
  alt: "Certificate of completion: Shrey Singh, the 8-Week AI Film Making Program, Videopreneur Studios",
};

/** A small action inside a fact — an ink-outlined pill, filled on hover. */
const CHIP =
  "pointer-events-auto inline-flex items-center gap-1 rounded-full border border-neutral-900/80 px-2 py-[0.22rem] font-graff text-[0.54rem] uppercase leading-none tracking-[0.16em] text-neutral-900 outline-none transition-colors hover:bg-neutral-950 hover:text-white focus-visible:bg-neutral-950 focus-visible:text-white";

function GlanceRow({ onCertificate }: { onCertificate: () => void }) {
  const facts: { key: string; mark: React.ReactNode; heading: string; value: React.ReactNode }[] = [
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
    {
      key: "agents",
      mark: <AgentMark />,
      heading: "AI Agents & Products",
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
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className={`${META} [@media(max-height:31.25rem)]:hidden`}>At a glance</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-4 [@media(max-height:31.25rem)]:grid-cols-4">
        {facts.map((f) => (
          <li key={f.key} className="flex min-w-0 flex-col gap-1">
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

/**
 * The certificate, over the page. Portalled to <body>: the footer lives in
 * the Flythrough's transformed stage, which would make a `position: fixed`
 * box fixed to IT. While open it marks the root `data-modal`, which the
 * Flythrough reads to leave the wheel and the keys alone; Escape, the close
 * button or a click outside shuts it, and the focus goes back.
 */
function CertificateDialog({ open, onClose, reduceMotion }: { open: boolean; onClose: () => void; reduceMotion: boolean }) {
  const ref = usePixelPresence<HTMLDivElement>(open, { cell: 12, duration: 0.55, reduceMotion });
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  const [ever, setEver] = useState(open);
  if (open && !ever) setEver(true);
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const opener = document.activeElement as HTMLElement | null;
    root.dataset.modal = "certificate";
    // The page behind stays put: no wheel or swipe scrolls it while open.
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (root.dataset.modal === "certificate") delete root.dataset.modal;
      root.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);
  // Nothing until first asked for — the page is built ahead of time, and a
  // portal there would not match it when the page comes alive.
  if (!ever) return null;
  return createPortal(
    <div
      ref={ref}
      className={`${HOME_TYPE} fixed inset-0 z-[300] grid place-items-center bg-neutral-950/70 p-4 backdrop-blur-sm ${open ? "" : "invisible"}`}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Film Making — certificate of completion"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex w-[min(92vw,64rem,calc((100svh-9rem)*16/9))] flex-col gap-3 outline-none"
      >
        <div
          className="relative w-full overflow-hidden rounded-lg shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
          style={{ aspectRatio: `${CERTIFICATE.w} / ${CERTIFICATE.h}` }}
        >
          {ever && (
            // eslint-disable-next-line @next/next/no-img-element -- loaded only once asked for
            <img src={CERTIFICATE.src} alt={CERTIFICATE.alt} className="absolute inset-0 h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-helv text-[0.78rem] leading-snug text-white/80">
            Certificate of completion · 8-Week AI Film Making Program · Videopreneur Studios
          </p>
          <div className="flex items-center gap-2">
            <PixelButton side="logic" size="sm" href={CERTIFICATE.pdf}>
              Open PDF <span aria-hidden>↗</span>
            </PixelButton>
            <PixelButton side="logic" size="sm" onClick={onClose} ariaLabel="Close the certificate">
              Close ✕
            </PixelButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
  // Which face is up under the glance: the stack first, then off the clock.
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
      <div className="mb-[clamp(0.5rem,1.8vh,1rem)] border-b border-neutral-900/10 pb-[clamp(0.5rem,1.6vh,0.9rem)] [@media(max-height:31.25rem)]:mb-1 [@media(max-height:31.25rem)]:pb-1">
        <GlanceRow onCertificate={() => setCertificate(true)} />
      </div>
      <div className="relative h-[clamp(4.5rem,13vh,6.5rem)] max-sm:h-[6.25rem] [@media(max-height:31.25rem)]:h-[3.4rem]">
        <div ref={stackRef} className={`absolute inset-0 ${face === "stack" ? "" : "invisible"}`} aria-hidden={face !== "stack"}>
          <StackRow />
        </div>
        <div ref={factsRef} className={`absolute inset-0 ${face === "facts" ? "" : "invisible"}`} aria-hidden={face !== "facts"}>
          <FactsRow />
        </div>
      </div>
      <CertificateDialog open={certificate} onClose={() => setCertificate(false)} reduceMotion={reduceMotion} />
    </div>
  );
}
