"use client";

/**
 * PreviewPane — the single, reusable preview container.
 *
 * There is exactly ONE of these (per the brief: "Do NOT create separate preview
 * systems"). It reads `activeSection` from the store and renders that section's
 * body inside a container that:
 *   • is height 0 / hidden when nothing is selected (no empty whitespace),
 *   • expands (height 0 → auto) and smooth-scrolls itself into view when a
 *     section is selected — the "cinematic" reveal,
 *   • crossfades its content in place when the selected section changes, and
 *   • collapses back to 0 via the chevron control (scrolls to the top FIRST,
 *     then collapses on arrival — collapsing mid-scroll would thrash layout and
 *     stall the smooth scroll).
 *
 * Visual language (per the design mockup): a light sheet with rounded top
 * corners rising over the white gallery page; a centered chevron as the close
 * affordance; a left rail carrying the section's two-digit index, its title (in
 * its hemisphere's voice), and a one-line description; the body to the right.
 *
 * Respects `prefers-reduced-motion` for scrolling.
 */

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navSectionById, navSectionIndex } from "@/constants/navigation";
import { DURATION, EASE_OUT } from "@/constants/motion";
import { useSceneStore } from "@/state/useSceneStore";
import { ClientsPreview } from "@/components/preview/ClientsPreview";
import { ComingSoonPreview } from "@/components/preview/ComingSoonPreview";
import { TypeReveal } from "@/components/typography/TypeReveal";
import { typeVoiceClass } from "@/constants/typography";

/** Smooth unless the user asked for reduced motion. */
function scrollBehavior(): ScrollBehavior {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return reduce ? "auto" : "smooth";
}

export function PreviewPane() {
  const activeSection = useSceneStore((s) => s.activeSection);
  const setActiveSection = useSceneStore((s) => s.setActiveSection);
  const paneRef = useRef<HTMLElement>(null);

  const section = activeSection ? navSectionById(activeSection) : undefined;

  // Reveal: whenever a section opens, bring the pane's top to the viewport top.
  useEffect(() => {
    if (!activeSection) return;
    const id = requestAnimationFrame(() => {
      paneRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [activeSection]);

  // Close = return to the brain. Scroll up first (stable layout), collapse on
  // arrival; `scrollend` with a timeout fallback for browsers without it.
  const handleClose = () => {
    if (scrollBehavior() === "auto" || window.scrollY === 0) {
      window.scrollTo({ top: 0 });
      setActiveSection(null);
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener("scrollend", finish);
      // If the smooth scroll never arrived (throttled tab, interrupted
      // animation), jump the rest of the way — closing must always return
      // to the brain.
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "auto" });
      setActiveSection(null);
    };
    window.addEventListener("scrollend", finish, { once: true });
    window.setTimeout(finish, 800);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="preview" ref={paneRef} aria-hidden={!section} className="w-full">
      <AnimatePresence initial={false}>
        {section && (
          <motion.div
            key="pane"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: DURATION.slow, ease: EASE_OUT },
              opacity: { duration: DURATION.medium, ease: EASE_OUT },
            }}
            className="overflow-hidden"
          >
            {/* The sheet: a light panel rising over the white page — Apple
                Photos softness. The whisper of top shadow is the system's one
                sanctioned elevation besides the brain's contact shadow
                (docs/DESIGN_SYSTEM.md). */}
            <div className="rounded-t-[2.5rem] border-t border-neutral-200/60 bg-neutral-50 shadow-[0_-16px_48px_-24px_rgba(0,0,0,0.12)]">
              {/* Chevron — the single close affordance, centered on the sheet's lip. */}
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close preview"
                  className="group rounded-full p-2 outline-none"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4 stroke-neutral-400 transition-colors duration-500 group-hover:stroke-neutral-900 group-focus-visible:stroke-neutral-900"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M4 9 L12 16 L20 9" />
                  </svg>
                </button>
              </div>

              <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 sm:px-10 sm:pb-20">
                {/* Rail + body crossfade together when the section changes. */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                    className="grid min-h-[70vh] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-16"
                  >
                    {/* Rail — index, title (hemisphere voice), description. */}
                    <div>
                      <span
                        className={`${typeVoiceClass("logic", "meta")} text-xs text-neutral-400`}
                      >
                        {navSectionIndex(section.id)}
                      </span>
                      <TypeReveal
                        text={section.label}
                        voice={section.hemisphere === "left" ? "logic" : "creative"}
                        variant="display"
                        as="h2"
                        reveal="none"
                        className={[
                          "mt-3 block text-neutral-900",
                          section.hemisphere === "left"
                            ? "text-2xl font-medium sm:text-3xl"
                            : "text-3xl sm:text-4xl",
                        ].join(" ")}
                      />
                      <p className="mt-5 max-w-[16rem] text-sm leading-relaxed text-neutral-500">
                        {section.description}
                      </p>
                    </div>

                    {/* Body. */}
                    <div className="min-w-0">
                      {section.kind === "clients" ? (
                        <ClientsPreview />
                      ) : (
                        <ComingSoonPreview label={section.label} />
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
