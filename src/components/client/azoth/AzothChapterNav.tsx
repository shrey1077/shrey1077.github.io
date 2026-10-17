"use client";

/**
 * AzothChapterNav — the page's chapters as a bar that stays at the top once
 * the masthead has gone by (2026-10-17, the page's redesign): the way back
 * on the left, the seven chapters across, the one being read marked in teal
 * as the page scrolls. On a narrow screen the chapters scroll sideways, the
 * one being read kept in view.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TEAL = "#28A898";

export function AzothChapterNav({ chapters, shell }: { chapters: readonly { id: string; n: string; label: string }[]; shell: string }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  // The chapter being read: the last whose top has passed a third of the way
  // down the screen.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const line = window.innerHeight * 0.33;
      let now: string | null = null;
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= line) now = c.id;
      }
      setActive(now);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters]);

  // Keep the one being read in view along a sideways-scrolling bar — by the
  // bar's own scroll, never the page's.
  useEffect(() => {
    const list = listRef.current;
    const a = active && list?.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    if (!list || !a) return;
    const left = a.offsetLeft - list.clientWidth / 2 + a.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Chapters" className="sticky top-0 z-30 border-b border-[#283078]/10 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className={`${shell} flex items-center gap-5`}>
        <Link
          href="/"
          className="az-mono group flex shrink-0 items-center gap-2 py-3.5 text-[0.7rem] uppercase tracking-[0.16em] text-neutral-500 outline-none transition-colors hover:text-[#283078] focus-visible:text-[#283078]"
        >
          <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span className="max-sm:sr-only">Back</span>
        </Link>
        <span aria-hidden className="h-5 w-px shrink-0 bg-[#283078]/15" />
        <ol ref={listRef} className="-mx-1 flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] xl:justify-between [&::-webkit-scrollbar]:hidden">
          {chapters.map((c) => {
            const on = c.id === active;
            return (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#${c.id}`}
                  data-chapter={c.id}
                  aria-current={on ? "location" : undefined}
                  className={`az-wide relative flex items-baseline gap-2 whitespace-nowrap px-2.5 py-3.5 text-[0.62rem] uppercase tracking-[0.16em] outline-none xl:px-2 xl:tracking-[0.12em] transition-colors duration-200 focus-visible:text-[#283078] sm:px-3 ${
                    on ? "text-[#283078]" : "text-neutral-500 hover:text-[#283078]"
                  }`}
                >
                  <span style={{ color: TEAL }}>{c.n}</span>
                  {c.label}
                  <span aria-hidden className={`absolute inset-x-2.5 -bottom-px h-[2px] origin-left transition-transform duration-300 ease-out sm:inset-x-3 ${on ? "scale-x-100" : "scale-x-0"}`} style={{ backgroundColor: TEAL }} />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
