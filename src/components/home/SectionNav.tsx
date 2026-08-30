"use client";

/**
 * SectionNav — the way into the eight sections below `lg`.
 *
 * `BrainPins` is `hidden lg:block`, because its geometry is not portable: the
 * connectors are drawn in a 0–100 viewBox stretched over the whole stage, the
 * columns sit at fixed viewport fractions (6vw / 3vw), and the rows are as wide
 * as their labels. None of that survives a 375px viewport. So below `lg` the
 * pins simply were not there — and since they are the ONLY route into the
 * sections, a phone visitor reached nothing at all: the eight sections, and
 * every `/clients/[slug]` page behind Clients and Projects, were unreachable.
 * The four footer links were the entire interactive surface of the homepage.
 *
 * This is the compact route in. It is deliberately NOT a shrunken diagram — no
 * connectors, no measured anchors, no absolute placement. It is the same eight
 * sections as a plain board, keeping the two things that carry the site's idea:
 *   • the hemispheres stay split (logic left, creative right), rather than
 *     flattening into one undifferentiated list;
 *   • the pin treatments are held exactly — logic fills flat black in
 *     `font-digibra`, creative is a white pill inside a rainbow border in
 *     `font-graff`, and open inverts each, which is what the pins do.
 *
 * State: the pins own `open` above `lg` and this owns it below, and they never
 * both operate at one width. Both talk to `SectionPanel` over the same
 * `PIN_OPEN_EVENT` bus, so the panel needed no change and there is still only
 * one open section on the page.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { PIN_OPEN_EVENT, SECTION_ICONS } from "@/components/home/BrainPins";
import { navSectionsFor } from "@/constants/navigation";
import type { NavSection, NavSectionId } from "@/types/navigation";
import { useIsCompact } from "@/hooks/useMediaQuery";

/** Matches the pins' trailing circle, so the two navs read as one family. */
const CIRCLE = 16;
const RING_STROKE = 2;
const RING = `radial-gradient(closest-side, transparent calc(100% - ${RING_STROKE}px), #000 calc(100% - ${RING_STROKE}px))`;
const RING_MASK = { WebkitMaskImage: RING, maskImage: RING } as const;

function NavPill({
  section,
  open,
  onToggle,
}: {
  section: NavSection;
  open: boolean;
  onToggle: () => void;
}) {
  const logic = section.hemisphere === "left";
  const icon = SECTION_ICONS[section.id];

  // `group` so the paint quickens on press the way it does on the pins' hover —
  // globals.css drops `.brain-paint`'s drift from 24s to 9s under `.group:hover`.
  // `min-h-11` is 44px: the touch target the pins never had to think about.
  const shell =
    "group flex min-h-11 w-full items-center gap-3 rounded-full px-4 py-2.5 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-neutral-900/40";

  return (
    <button type="button" aria-expanded={open} onClick={onToggle} className={shell}>
      {/* The section's own mark, as on the logic pins. Renders only where
          SECTION_ICONS has a file for the id, so a section without artwork is
          correct rather than broken. */}
      {logic && icon && (
        <span
          aria-hidden
          className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full"
        >
          <Image src={icon} alt="" fill sizes="24px" className="object-contain" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        {!logic ? (
          // Rainbow border, white pill — a CSS border cannot hold a gradient, so
          // the paint is a 2px wrapper with the pill inside it. Open flips the
          // inner fill to paint and the type to white.
          <span className="brain-paint inline-grid max-w-full place-items-center rounded-full p-[2px]">
            <span
              className={`font-graff block truncate rounded-full px-3.5 py-1.5 text-[1.05rem] font-bold leading-none transition-colors duration-300 ${
                open ? "brain-paint text-white" : "bg-white text-neutral-900"
              }`}
            >
              {section.label}
            </span>
          </span>
        ) : (
          <span
            className={`font-digibra block truncate rounded-full px-3.5 py-1.5 text-[1.05rem] leading-none transition-colors duration-300 ${
              open
                ? "border-2 border-neutral-950 bg-transparent text-neutral-950"
                : "bg-neutral-950 text-white"
            }`}
          >
            {section.label}
          </span>
        )}
      </span>

      {/* The trailing circle, held from the pins: stroked and empty at rest, a
          flat disc dropping inside when open. */}
      <span
        aria-hidden
        className={`relative grid shrink-0 place-items-center rounded-full ${
          logic ? "border-2 border-neutral-950" : ""
        }`}
        style={{ width: CIRCLE, height: CIRCLE }}
      >
        {!logic && (
          <span
            className="brain-paint absolute inset-0 rounded-full"
            style={open ? undefined : RING_MASK}
          />
        )}
        <span
          className={`relative block rounded-full transition-transform duration-200 ${
            logic ? "bg-neutral-950" : "brain-paint"
          } ${open ? "scale-100" : "scale-0"}`}
          style={{ width: CIRCLE * 0.42, height: CIRCLE * 0.42 }}
        />
      </span>
    </button>
  );
}

function Column({
  title,
  sections,
  open,
  onToggle,
}: {
  title: string;
  sections: NavSection[];
  open: NavSectionId | null;
  onToggle: (id: NavSectionId) => void;
}) {
  return (
    <div>
      <h2 className="font-helv mb-3 px-4 text-[0.6rem] uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {sections.map((s) => (
          <li key={s.id}>
            <NavPill section={s} open={open === s.id} onToggle={() => onToggle(s.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SectionNav() {
  const isCompact = useIsCompact();
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState<NavSectionId | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Above `lg` the pins are the live nav, so this one yields rather than
  // leaving a stale section open behind a list nobody can see. Derived, not
  // synced in an effect — this repo lints `react-hooks/set-state-in-effect` as
  // an error, and gating here means crossing the breakpoint dispatches `null`
  // on its own.
  const active = isCompact ? open : null;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PIN_OPEN_EVENT, { detail: active }));
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const toggle = (id: NavSectionId) => {
    const next = open === id ? null : id;
    setOpen(next);
    // The panel opens BELOW this band, which on a phone is below the fold —
    // without this a tap reads as "nothing happened". Bring the band to the top
    // of the viewport so the panel fills the screen under it. After a frame, so
    // the panel has mounted and the scroll lands on the taller document.
    if (!next) return;
    requestAnimationFrame(() =>
      rootRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      }),
    );
  };

  return (
    <nav
      ref={rootRef}
      aria-label="Sections"
      className="w-full bg-gallery px-4 pb-10 pt-8 lg:hidden"
    >
      <div className="mx-auto grid w-full max-w-2xl gap-8 sm:grid-cols-2">
        <Column
          title="Logic"
          sections={navSectionsFor("left")}
          open={active}
          onToggle={toggle}
        />
        <Column
          title="Creative"
          sections={navSectionsFor("right")}
          open={active}
          onToggle={toggle}
        />
      </div>
    </nav>
  );
}
