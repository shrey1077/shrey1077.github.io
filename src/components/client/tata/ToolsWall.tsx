"use client";

/**
 * ToolsWall — band 08's AI Solutions, shown (owner, 2026-10-05): the two
 * tools built for the institute, Cerci and H3LEN, each in an app frame that
 * turns through its screenshots, with a line on what it does. The same
 * language as ScreenWall's banner and deck frames above it — a bare window
 * bar, a cross-fade, a dash per shot — and any shot opens full size in the
 * page's viewer and walks the rest. H3LEN also opens itself, live.
 *
 * Each frame turns only while on screen, holds under the pointer, and stands
 * still for reduced motion.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TataFader } from "@/components/client/tata/TataFader";
import { TataViewer, type ViewerState } from "@/components/client/tata/TataViewer";
import { SIDE_LINK } from "@/components/client/tata/SideBand";
import { TATA_TOOL_SHOTS } from "@/constants/tataTools";
import { TATA_TOOLS } from "@/constants/tataStory";

/** ms between a frame's turns. */
const TURN_MS = 3600;
const LABEL = "tata-body text-[0.6rem] uppercase tracking-[0.2em] text-neutral-500";

export function ToolsWall({ blurb, also }: { blurb: string; also: readonly string[] }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [at, setAt] = useState<Record<string, number>>({ cerci: 0, h3len: 0 });
  const [hold, setHold] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ViewerState>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = window.setInterval(
      () =>
        setAt((a) => {
          const next = { ...a };
          for (const tool of TATA_TOOLS)
            if (hold !== tool.id) next[tool.id] = (a[tool.id] + 1) % TATA_TOOL_SHOTS[tool.id].length;
          return next;
        }),
      TURN_MS,
    );
    return () => window.clearInterval(t);
  }, [inView, reduceMotion, hold]);

  return (
    <div ref={ref}>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-neutral-300/80 pt-5">
        <p className={LABEL}>AI Solutions</p>
        <p className="tata-body text-[0.8rem] text-neutral-600">{blurb}</p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
        {TATA_TOOLS.map((tool) => {
          const shots = TATA_TOOL_SHOTS[tool.id];
          const i = at[tool.id] ?? 0;
          const shot = shots[i];
          return (
            <div key={tool.id} onMouseEnter={() => setHold(tool.id)} onMouseLeave={() => setHold(null)}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <p className="tata-body text-[0.8rem] text-neutral-900">{tool.label}</p>
                {"href" in tool && (
                  <a href={tool.href} target="_blank" rel="noopener noreferrer" className={`${SIDE_LINK} shrink-0 text-[0.58rem]`}>
                    Explore in 3D <span aria-hidden>↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewing({ plates: shots, at: i })}
                aria-label={`${tool.label}: ${shot.name} — open full size`}
                className="group block w-full cursor-zoom-in overflow-hidden bg-white text-left outline-none ring-1 ring-neutral-300 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] focus-visible:ring-2 focus-visible:ring-neutral-900/40"
              >
                {/* A bare app window bar — three dots, nothing claimed. */}
                <span aria-hidden className="flex h-5 items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-2.5">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="block size-1.5 rounded-full bg-neutral-300" />
                  ))}
                </span>
                <span className="relative block aspect-video w-full">
                  <TataFader
                    src={shot.thumb}
                    sizes="(max-width: 768px) 92vw, 480px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </span>
              </button>
              <div className="mt-2.5 flex items-center gap-3">
                <span aria-hidden className="flex flex-1 gap-1.5">
                  {shots.map((s, k) => (
                    <span
                      key={s.url}
                      className={`block h-[3px] flex-1 rounded-full transition-colors duration-500 ${k === i ? "bg-neutral-800" : "bg-neutral-300"}`}
                    />
                  ))}
                </span>
                <span className="tata-body shrink-0 text-[0.62rem] text-neutral-500" aria-live="polite">
                  {shot.name}
                </span>
              </div>
              <p className="tata-body mt-3 text-[0.82rem] leading-relaxed text-neutral-700">{tool.text}</p>
            </div>
          );
        })}
      </div>

      {also.length > 0 && (
        <p className="tata-body mt-6 text-[0.72rem] text-neutral-500">
          Also: {also.join(", ")} <span className="text-neutral-400">· files to follow</span>
        </p>
      )}

      <TataViewer state={viewing} onChange={setViewing} />
    </div>
  );
}
