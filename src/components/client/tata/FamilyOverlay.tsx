"use client";

/**
 * FamilyOverlay — the full-screen takeover for one work family.
 *
 * Clicking a CategoryAccordion row opens this: a black panel that grows from
 * the row's band up and down to fill the screen, then fades in white type over
 * it. The grow layer and the content layer are separate so the panel can
 * animate its height without distorting the text. Inside: the family title +
 * description, sub-category chips, and a three-up TripleSlider of the active
 * sub-category's work. Escape / ✕ / the backdrop close it; scroll is locked and
 * focus is trapped to the close control while open (mirrors MediaViewer).
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CollectionAsset } from "@/types/experience";
import type { ContentAsset } from "@/content/catalogue";
import type { AccordionGroup } from "@/components/client/tata/CategoryAccordion";
import { TripleSlider } from "@/components/client/tata/TripleSlider";
import { MediaViewer } from "@/components/experience/MediaViewer";
import { EASE_OUT, EASE_IN_OUT } from "@/constants/motion";
import { Z_INDEX } from "@/constants/design";

export function FamilyOverlay({
  group,
  rect,
  index,
  onClose,
}: {
  group: AccordionGroup | null;
  rect: { top: number; height: number } | null;
  index: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewingRef = useRef<ContentAsset | null>(null);
  const [vh, setVh] = useState<number>(() => (typeof window !== "undefined" ? window.innerHeight : 0));
  const [subId, setSubId] = useState<string | undefined>(undefined);
  const [viewing, setViewing] = useState<ContentAsset | null>(null);

  const openViewer = (a: CollectionAsset) => {
    viewingRef.current = a as ContentAsset;
    setViewing(a as ContentAsset);
  };
  const closeViewer = () => {
    viewingRef.current = null;
    setViewing(null);
  };

  // While open: lock background scroll, focus the close control once the panel
  // has grown, and wire Escape (which closes the media viewer first, if open).
  useEffect(() => {
    if (!group) return;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 360);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !viewingRef.current) onClose();
    };
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [group, onClose]);

  // subId may hold a previous family's choice; the fallback lands on the new
  // family's first sub-category (ids are unique across families).
  const activeSub =
    group?.subcategories.find((s) => s.id === subId) ?? group?.subcategories[0];

  return (
    <AnimatePresence>
      {group && rect && (
        <>
          {/* The black panel — grows from the row band to the full screen. */}
          <motion.div
            key="grow"
            aria-hidden
            className="fixed inset-x-0 bg-neutral-950"
            style={{ zIndex: Z_INDEX.overlay }}
            initial={{ top: rect.top, height: rect.height }}
            animate={{ top: 0, height: vh || "100dvh" }}
            exit={{ top: rect.top, height: rect.height }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          />

          {/* The white type + slider — fades in once the panel has opened. */}
          <motion.div
            key="content"
            role="dialog"
            aria-modal="true"
            aria-label={group.title}
            className="fixed inset-0 flex flex-col overflow-y-auto text-white"
            style={{ zIndex: Z_INDEX.overlay }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.32, duration: 0.4, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_IN_OUT } }}
          >
            {/* Header. */}
            <div className="flex items-start justify-between gap-6 px-6 pt-8 sm:px-12 sm:pt-12">
              <div className="min-w-0">
                <span className="tata-subhead flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.16em] text-white/45">
                  <span className="tabular-nums" style={{ color: group.accent }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  The work
                </span>
                <h2 className="tata-heading mt-3 text-3xl leading-[1.05] text-white sm:text-5xl">
                  {group.title}
                </h2>
                <p className="tata-body mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  {group.blurb}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="tata-body shrink-0 rounded-full border border-white/25 px-4 py-2 text-[0.7rem] text-white/80 outline-none transition-colors duration-300 hover:border-white hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
              >
                Close ✕
              </button>
            </div>

            {/* Sub-category chips. */}
            <div className="mt-9 flex flex-wrap gap-2.5 px-6 sm:px-12">
              {group.subcategories.map((s) => {
                const on = s.id === activeSub?.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubId(s.id)}
                    className={`tata-subhead rounded-full border px-4 py-2 text-[0.62rem] uppercase tracking-[0.08em] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/50 ${
                      on
                        ? "border-transparent bg-white text-neutral-950"
                        : "border-white/25 text-white/65 hover:border-white hover:text-white"
                    }`}
                  >
                    {s.title}
                    <span className="ml-2 opacity-60">{s.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Three-up slider of the active sub-category. */}
            <div className="flex flex-1 items-center px-4 py-10 sm:px-8">
              {activeSub && (
                <TripleSlider
                  key={activeSub.id}
                  items={activeSub.assets as CollectionAsset[]}
                  onOpen={openViewer}
                />
              )}
            </div>
          </motion.div>

          <MediaViewer asset={viewing} onClose={closeViewer} />
        </>
      )}
    </AnimatePresence>
  );
}
